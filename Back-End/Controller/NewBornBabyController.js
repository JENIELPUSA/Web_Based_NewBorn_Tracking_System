const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const NewBaby = require("../Models/NewBornmodel");
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");
const AuditLog=require("./../Models/LogAndAudit")
const getClientIp = require("./../Utils/getClientIp");
const PDFDocument = require('pdfkit');

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, birthWeight, motherName, birthHeight } = req.body;
  const ipAddress = getClientIp(req); // get client IP
  const userId = req.user._id; // the admin or user creating this record

  const missingFields = [];

  if (!firstName) missingFields.push("First Name");
  if (!lastName) missingFields.push("Last Name");
  if (!birthWeight) missingFields.push("Birth Weight");
  if (!motherName) missingFields.push("Mother Name");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");
  if (!birthHeight) missingFields.push("Birth Height");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  const newData = await NewBaby.create(req.body);

  if (!newData) {
    return res.status(400).json({
      status: "fail",
      message: "Newborn creation failed.",
    });
  }

  const toolWithCategory = await NewBaby.aggregate([
    { $match: { _id: newData._id } },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: "$addedBy" },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        middleName: 1,
        dateOfBirth: {
          $dateToString: { format: "%b %d %Y", date: "$dateOfBirth" },
        },
        gender: 1,
        birthWeight: 1,
        birthHeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        address: {
          $concat: ["$motherName.zone", " ", "$motherName.address"],
        },
        createdAt: 1,
        addedByName: {
          $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"],
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"],
        },
      },
    },
  ]);

  const newbornData = toolWithCategory[0];

  const auditLog = new AuditLog({
    userId: userId,
    action: "Create Newborn Record",
    module: "newborn",
    targetId: newData._id,
    description: `Created newborn record for ${newbornData.fullName}`,
    details: {
      fullName: newbornData.fullName,
      gender: newbornData.gender,
      dateOfBirth: newbornData.dateOfBirth,
      mother: newbornData.motherName,
      birthWeight: newbornData.birthWeight,
      birthHeight: newbornData.birthHeight,
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(201).json({
    status: "success",
    data: newbornData,
  });
});


exports.DisplayAllData = AsyncErrorHandler(async (req, res) => {
  // Apply filters, sorting, limiting, and pagination
  const features = new Apifeatures(NewBaby.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Get IDs after filtering and pagination
  const filteredBabies = await features.query;
  const ids = filteredBabies.map((baby) => baby._id);

  // Perform aggregation with $lookup, $project, and gender counting
  const result = await NewBaby.aggregate([
    {
      $match: { _id: { $in: ids } },
    },
    {
      $lookup: {
        from: "users", // Join with 'users' collection
        localField: "addedBy", // Reference to the 'addedBy' field in NewBaby schema
        foreignField: "_id", // Match with '_id' in 'users'
        as: "addedBy", // Output the matched user data into the 'addedBy' field
      },
    },
    {
      $unwind: {
        path: "$addedBy", // Unwind the 'addedBy' array to access user details
        preserveNullAndEmptyArrays: true, // Preserve documents even if 'addedBy' is missing
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        middleName: 1,
        lastName: 1,
        extensionName:1,
        dateOfBirth: {
          $dateToString: {
            format: "%b %d %Y", // Format date as 'Jan 13 2025'
            date: "$dateOfBirth",
          },
        },
        gender: 1, // Include gender for filtering
        birthWeight: 1,
        birthHeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        motherID:"$motherName._id",
        address: {
          $concat: ["$motherName.address"],
        },
        phoneNumber: {
          $concat: ["$motherName.phoneNumber"],
        },
        zone: {
          $concat: ["$motherName.zone"]
        },
        createdAt: 1,
        addedByName: {
          $cond: {
            if: { $eq: [{ $type: "$addedBy" }, "object"] }, // Check if addedBy exists and is an object
            then: {
              $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"], // Concatenate first name and last name
            },
            else: "Unknown", // If addedBy is missing or invalid, show 'Unknown'
          },
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"], // Concatenate full name
        },
        fullAddress: {
          $concat: ["$address"], // Concatenate zone and address
        },
      },
    },
    {
      $group: {
        _id: null,
        totalMale: {
          $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
        },
        totalFemale: {
          $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
        },
        totalRecords: { $sum: 1 },
        data: { $push: "$$ROOT" }, // Include the full list of babies
      },
    },
  ]);

  // If no data found, return 0 for male and female counts
  const resultData = result.length > 0 ? result[0] : { totalMale: 0, totalFemale: 0, totalRecords: 0, data: [] };

  res.status(200).json({
    status: "success",
    totalMale: resultData.totalMale,
    totalFemale: resultData.totalFemale,
    totalRecords: resultData.totalRecords,
    data: resultData.data,
  });
});


exports.deletedSpecificData = AsyncErrorHandler(async (req, res, next) => {
  const ipAddress = getClientIp(req); // Get client IP
  const userId = req.user._id;        // Authenticated user

  // Find the record before deleting to get details for logging
  const deletedData = await NewBaby.findById(req.params.id);

  if (!deletedData) {
    return res.status(404).json({
      status: "fail",
      message: "Newborn record not found.",
    });
  }

  // Proceed with deletion
  await NewBaby.findByIdAndDelete(req.params.id);

  // Create Audit Log entry
  const auditLog = new AuditLog({
    userId,
    action: "Delete Newborn Record",
    module: "newborn",
    targetId: deletedData._id,
    description: `Deleted newborn record for ${deletedData.firstName} ${deletedData.lastName}`,
    details: {
      fullName: `${deletedData.firstName} ${deletedData.middleName || ""} ${deletedData.lastName}`,
      gender: deletedData.gender,
      dateOfBirth: deletedData.dateOfBirth,
      birthWeight: deletedData.birthWeight,
      birthHeight: deletedData.birthHeight,
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.UpdateBabyData = AsyncErrorHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    birthWeight,
    motherName,
  } = req.body;
  const missingFields = [];

  if (!firstName) missingFields.push("First Name");
  if (!lastName) missingFields.push("Last Name");
  if (!birthWeight) missingFields.push("Birth Weight");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required fields",
      missingFields,
    });
  }

  const ipAddress = getClientIp(req); // Utility function
  const userId = req.user._id;

  // 🔎 Fetch existing data before update for audit comparison
  const existingData = await NewBaby.findById(req.params.id);
  if (!existingData) {
    return res.status(404).json({
      status: "fail",
      message: "Baby data not found",
    });
  }

  // ✏️ Perform the update
  const updateBaby = await NewBaby.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // 🔍 Re-aggregate updated data
  const toolWithCategory = await NewBaby.aggregate([
    { $match: { _id: updateBaby._id } },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        middleName: 1,
        dateOfBirth: {
          $dateToString: {
            format: "%b %d %Y",
            date: "$dateOfBirth",
          },
        },
        gender: 1,
        birthWeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        address: 1,
        zone: 1,
        createdAt: 1,
        addedByName: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$addedBy", null] }, null] },
            then: "N/A",
            else: { $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"] },
          },
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"],
        },
        fullAddress: {
          $concat: ["$zone", ", ", "$address"],
        },
      },
    },
  ]);

  if (!toolWithCategory.length) {
    return res.status(404).json({
      status: "fail",
      message: "No baby data found with related user information",
    });
  }

  // Save audit log
  const auditLog = new AuditLog({
    userId,
    action: "Update Newborn Record",
    module: "newborn",
    targetId: updateBaby._id,
    description: `Updated newborn record for ${updateBaby.firstName} ${updateBaby.lastName}`,
    details: {
      before: {
        firstName: existingData.firstName,
        lastName: existingData.lastName,
        birthWeight: existingData.birthWeight,
        birthHeight: existingData.birthHeight,
        gender: existingData.gender,
        dateOfBirth: existingData.dateOfBirth,
      },
      after: {
        firstName: updateBaby.firstName,
        lastName: updateBaby.lastName,
        birthWeight: updateBaby.birthWeight,
        birthHeight: updateBaby.birthHeight,
        gender: updateBaby.gender,
        dateOfBirth: updateBaby.dateOfBirth,
      },
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(200).json({
    status: "success",
    data: toolWithCategory[0],
  });
});

exports.DisplayGraph = AsyncErrorHandler(async (req, res, next) => {
  const features = new Apifeatures(NewBaby.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const filteredBabies = await features.query;
  const ids = filteredBabies.map((baby) => baby._id);

  if (ids.length === 0) {
    return res.status(200).json({
      status: "success",
      totalMale: 0,
      totalFemale: 0,
      totalRecords: 0,
      topBabies: [],
      message: 'No newborn profile data found for the selected criteria.'
    });
  }

  const result = await NewBaby.aggregate([
    {
      $match: { _id: { $in: ids } },
    },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    {
      $unwind: {
        path: "$addedBy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    {
      $unwind: "$motherName",
    },
    {
      $project: {
        firstName: 1,
        middleName: 1,
        lastName: 1,
        dateOfBirth: {
          $dateToString: {
            format: "%b %d %Y",
            date: "$dateOfBirth",
          },
        },
        gender: 1,
        birthWeight: 1,
        birthHeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        motherID: "$motherName._id",
        address: {
          $concat: ["$motherName.zone", " ", "$motherName.address"],
        },
        phoneNumber: {
          $concat: ["$motherName.phoneNumber"],
        },
        zone: {
          $concat: ["$motherName.zone"],
        },
        createdAt: 1,
        addedByName: {
          $cond: {
            if: { $eq: [{ $type: "$addedBy" }, "object"] },
            then: {
              $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"],
            },
            else: "Unknown",
          },
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"],
        },
        fullAddress: {
          $concat: ["$zone", ", ", "$address"],
        },
      },
    },
    {
      $sort: { birthWeight: -1 },
    },
    {
      $group: {
        _id: null,
        totalMale: {
          $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
        },
        totalFemale: {
          $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
        },
        totalRecords: { $sum: 1 },
        topBabies: { $push: "$$ROOT" },
      },
    },
    {
        $project: {
            totalMale: 1,
            totalFemale: 1,
            totalRecords: 1,
            topBabies: { $slice: ["$topBabies", 10] },
        },
    },
  ]);

  const resultData = result.length > 0 ? result[0] : { totalMale: 0, totalFemale: 0, totalRecords: 0, topBabies: [] };

  const topBabiesFormatted = resultData.topBabies.map((baby, index) => ({
    number: index + 1,
    name: baby.fullName,
    totalWeight: `${baby.birthWeight} kg`,
    birthMonth: baby.dateOfBirth.split(" ")[0],
    zone: baby.zone || "Unknown",
  }));

  res.status(200).json({
    status: "success",
    totalMale: resultData.totalMale,
    totalFemale: resultData.totalFemale,
    totalRecords: resultData.totalRecords,
    topBabies: topBabiesFormatted,
  });
});



exports.getReportsNewborn = AsyncErrorHandler(async (req, res, next) => {
    try {
        const { from, to } = req.query; 
        const fromDate = new Date(from);
        let toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return next(new CustomError('Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).', 400));
        }

        toDate.setHours(23, 59, 59, 999);

        const aggregationResult = await NewBaby.aggregate([
            {
                $match: {
                    dateOfBirth: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "addedBy",
                    foreignField: "_id",
                    as: "addedBy",
                },
            },
            {
                $unwind: {
                    path: "$addedBy",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "motherName", 
                    foreignField: "_id",
                    as: "motherDetails", 
                },
            },
            {
                $unwind: {
                    path: "$motherDetails",
                    preserveNullAndEmptyArrays: true, 
                }
            },
            {
                $project: {
                    firstName: 1,
                    middleName: 1,
                    lastName: 1,
                    newbornName: {
                        $concat: ["$firstName", " ", "$middleName", " ", "$lastName"],
                    },
                    dateOfBirth: {
                        $dateToString: {
                            format: "%b %d, %Y",
                            date: "$dateOfBirth",
                        },
                    },
                    gender: 1,
                    birthWeight: { $concat: [{ $toString: "$birthWeight" }, " kg"] },
                    birthHeight: { $concat: [{ $toString: "$birthHeight" }, " cm"] },
                    motherName: {
                        $cond: {
                            if: { $eq: [{ $type: "$motherDetails" }, "object"] },
                            then: { $concat: ["$motherDetails.FirstName", " ", "$motherDetails.LastName"] }, // Assuming 'firstName' and 'lastName' in User model
                            else: "Unknown",
                        },
                    },
                    motherPhoneNumber: {
                        $cond: {
                            if: { $eq: [{ $type: "$motherDetails" }, "object"] },
                            then: "$motherDetails.phoneNumber",
                            else: "N/A",
                        },
                    },
                    motherAddressZone: {
                        $cond: {
                            if: { $eq: [{ $type: "$motherDetails" }, "object"] },
                            then: { $concat: ["$motherDetails.address", ", ", "$motherDetails.zone"] },
                            else: "N/A",
                        },
                    },
                    addedByName: {
                        $cond: {
                            if: { $eq: [{ $type: "$addedBy" }, "object"] },
                            then: { $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"] }, // Assuming 'firstName' and 'lastName' in User model
                            else: "Unknown",
                        },
                    },
                    createdAt: 1,
                },
            },
            { $sort: { newbornName: 1 } },
            {
                $group: {
                    _id: null,
                    totalMale: {
                        $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
                    },
                    totalFemale: {
                        $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
                    },
                    totalRecords: { $sum: 1 },
                    data: { $push: "$$ROOT" },
                },
            },
        ]);

        const newborns = aggregationResult.length > 0 ? aggregationResult[0].data : [];

        if (!newborns || newborns.length === 0) {
            return next(new CustomError('No newborn profile data found for the selected date range.', 404));
        }

        // --- PDF Document Setup ---
        const doc = new PDFDocument({ layout: 'landscape', margin: 30 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=newborn_profile_report_${from}_to_${to}.pdf`);

        doc.pipe(res);

        // --- Helper Function to Draw Table ---
        function drawTable(doc, data, headers, startY, startX, colWidths, options = {}) {
            let y = startY;
            let x = startX;
            const cellPadding = options.cellPadding || 5;
            const headerFillColor = options.headerFillColor || '#CCCCCC';
            const rowFillColor1 = options.rowFillColor1 || '#F0F0F0';
            const rowFillColor2 = options.rowFillColor2 || '#FFFFFF';
            const textColor = options.textColor || '#000000';
            const headerFontSize = options.headerFontSize || 10;
            const rowFontSize = options.rowFontSize || 9;
            const borderWidth = options.borderWidth || 0.5;

            doc.lineWidth(borderWidth);
            doc.strokeColor(textColor);

            // Draw Headers
            doc.font('Helvetica-Bold').fontSize(headerFontSize);
            doc.fillColor(headerFillColor).rect(x, y, colWidths.reduce((a, b) => a + b, 0), 25).fill();
            doc.fillColor(textColor);

            let currentHeaderX = x;
            headers.forEach((header, i) => {
                doc.text(header, currentHeaderX + cellPadding, y + cellPadding, {
                    width: colWidths[i] - 2 * cellPadding,
                    align: 'left',
                    lineBreak: true
                });
                currentHeaderX += colWidths[i];
            });
            y += 25;

            doc.font('Helvetica').fontSize(rowFontSize);

            // Draw Data Rows
            data.forEach((row, rowIndex) => {
                let maxRowHeight = 0;
                // Calculate max row height based on content
                headers.forEach((header, i) => {
                    const value = row[header] !== undefined && row[header] !== null ? row[header].toString() : 'N/A';
                    const textHeight = doc.heightOfString(value, {
                        width: colWidths[i] - 2 * cellPadding,
                        lineBreak: true
                    });
                    maxRowHeight = Math.max(maxRowHeight, textHeight + 2 * cellPadding);
                });

                // Check for new page before drawing a row
                if (y + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;
                    currentHeaderX = x;
                    doc.font('Helvetica-Bold').fontSize(headerFontSize);
                    doc.fillColor(headerFillColor).rect(x, y, colWidths.reduce((a, b) => a + b, 0), 25).fill();
                    doc.fillColor(textColor);
                    headers.forEach((header, i) => {
                        doc.text(header, currentHeaderX + cellPadding, y + cellPadding, {
                            width: colWidths[i] - 2 * cellPadding,
                            align: 'left',
                            lineBreak: true
                        });
                        currentHeaderX += colWidths[i];
                    });
                    y += 25;
                    doc.font('Helvetica').fontSize(rowFontSize);
                }

                const fillColor = rowIndex % 2 === 0 ? rowFillColor1 : rowFillColor2;
                doc.fillColor(fillColor).rect(x, y, colWidths.reduce((a, b) => a + b, 0), maxRowHeight).fill();
                doc.fillColor(textColor);

                let currentRowX = x;
                headers.forEach((header, i) => {
                    const value = row[header] !== undefined && row[header] !== null ? row[header].toString() : 'N/A';
                    doc.rect(currentRowX, y, colWidths[i], maxRowHeight).stroke();
                    doc.text(value, currentRowX + cellPadding, y + cellPadding, {
                        width: colWidths[i] - 2 * cellPadding,
                        align: 'left',
                        valign: 'top',
                        lineBreak: true
                    });
                    currentRowX += colWidths[i];
                });
                y += maxRowHeight;
            });
            return y;
        }

        // --- Helper Function to Add Page Numbers ---
        function addPageNumbers(doc) {
            let pages = doc.bufferedPageRange(); // Get total pages after content is added
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                let oldBottomMargin = doc.page.margins.bottom;
                doc.page.margins.bottom = 0; // Temporarily remove bottom margin to write in the footer
                doc.font('Helvetica').fontSize(9).text(
                    `Page ${i + 1} of ${pages.count}`,
                    0,
                    doc.page.height - oldBottomMargin / 2, // Position in the center of the original bottom margin
                    { align: 'center' }
                );
                doc.page.margins.bottom = oldBottomMargin; // Restore bottom margin
            }
        }

        // --- PDF Header Content ---
        doc.font('Helvetica-Bold').fontSize(18).text('Newborn Profile Report', { align: 'center' });
        doc.font('Helvetica').fontSize(12).text(`Date Range: ${from} to ${to}`, { align: 'center' });
        doc.moveDown(1.5);

        // --- Main Profile Data Table (Overview) ---
        const mainTableHeaders = [
            'Newborn Name',
            'DoB',
            'Gender',
            'Birth Weight',
            'Birth Height',
            'Mother Name',
            'Mother Phone',
            'Mother Address'
        ];

        const totalPageContentWidth = doc.page.width - 2 * doc.page.margins.left;
        const mainColWidths = [
            totalPageContentWidth * 0.16, // Newborn Name
            totalPageContentWidth * 0.08, // DoB
            totalPageContentWidth * 0.07, // Gender
            totalPageContentWidth * 0.08, // Birth Weight
            totalPageContentWidth * 0.14, // Birth Height
            totalPageContentWidth * 0.15, // Mother Name
            totalPageContentWidth * 0.10, // Mother Phone
            totalPageContentWidth * 0.22, // Mother Address
        ];

        const mainTableData = newborns.map(profile => ({
            'Newborn Name': profile.newbornName || 'N/A',
            'DoB': profile.dateOfBirth || 'N/A',
            'Gender': profile.gender || 'N/A',
            'Birth Weight': profile.birthWeight || 'N/A',
            'Birth Height': profile.birthHeight || 'N/A',
            'Mother Name': profile.motherName || 'N/A',
            'Mother Phone': profile.motherPhoneNumber || 'N/A',
            'Mother Address': profile.motherAddressZone || 'N/A'
        }));

        doc.font('Helvetica-Bold').fontSize(14).text('Newborn Profiles Overview:', { underline: true, align: 'left' });
        doc.font('Helvetica').moveDown(0.5);

        let currentY = drawTable(doc, mainTableData, mainTableHeaders, doc.y, doc.page.margins.left, mainColWidths, {
            headerFillColor: '#ADD8E6',
            rowFillColor1: '#E0FFFF',
            rowFillColor2: '#F5FFFA',
            headerFontSize: 11,
            rowFontSize: 10
        });
        doc.moveDown(1.5);

        // Add page numbers to the document after all content is added
        addPageNumbers(doc);

        // Finalize the PDF document
        doc.end();
    } catch (error) {
        console.error('Error generating newborn profile PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        }
    }
});