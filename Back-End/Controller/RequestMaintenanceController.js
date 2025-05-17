const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const requestmaintenance = require("./../Models/RequestMaintenance");
const Apifeatures = require("./../Utils/ApiFeatures");
const PDFDocument = require('pdfkit');
const path=require('path');
const fs = require('fs');
const CustomError=require('../Utils/CustomError')
require('pdfkit-table');

const mongoose = require('mongoose');

exports.RequestMaintenance = AsyncErrorHandler(async (req, res) => {
  const { Equipments } = req.body;

  // Convert Equipments to ObjectId if it's in string form
  const equipmentId =new mongoose.Types.ObjectId(Equipments); // Assuming only 1 equipment is passed

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check if a request for the same equipment exists within the last 24 hours
  const existing = await requestmaintenance.findOne({
    Equipments: equipmentId,
    createdAt: { $gte: twentyFourHoursAgo }
  });

  if (existing) {
    return res.status(400).json({
      status: "fail",
      message: "Duplicate request: This equipment already has a maintenance request in the last 24 hours."
    });
  }

  if(!Equipments){
    return res.status(400).json({
      status: "fail",
      message: "Description: Please Input Description!"
    });
  }

  // Proceed to create new maintenance request
  const maintenance = await requestmaintenance.create(req.body);

  res.status(201).json({
    status: "success",
    data: maintenance
  });
});



exports.DisplayRequest = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(requestmaintenance.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Declare and await the query result
  const filteredrequest = await features.query;
  const request = await requestmaintenance.aggregate([
    { $match: { _id: { $in: filteredrequest.map((lb) => lb._id) } } },
    {
      $lookup: {
        from: "users",
        localField: "Technician",
        foreignField: "_id",
        as: "TechnicianDetails"
      }
    },
    { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
        as: "DepartmentInfo"
      }
    },
    { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
        as: "LaboratoryInfo"
      }
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
        as: "EquipmentsInfo"
      }
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "EquipmentsInfo.Category",
        foreignField: "_id",
        as: "CategoryInfo"
      }
    },
    { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Ref: 1,
        read: 1,
        Status: 1,
        feedback: 1,
        feedbackread: 1,
        Description: 1,
        EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
        CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        Remarks: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        remarksread: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        UserId: "$TechnicianDetails._id",
          Technician: {
            $concat: [
              "$TechnicianDetails.FirstName",
              " ",
              { $ifNull: ["$TechnicianDetails.Middle", ""] },
              " ",
              "$TechnicianDetails.LastName"
            ]
          }
        ,
        DateTimeAccomplish: 1
      }
    }
  ]);


  res.status(200).json({
    status: "success",
    totalDepartment: request.length, // Fixed typo here
    data: request,
  });
});

exports.DisplayNotifictaionRequest = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(
    requestmaintenance.find({ read: false }), // Only get unread requests
    req.query
  )

    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Declare and await the query result
  const filteredrequest = await features.query;

  const request = await requestmaintenance.aggregate([
    {
      $match: {
        _id: { $in: filteredrequest.map((Req) => Req._id) }, // Match only filtered requests
        read: false, // Only include unread requests
      },
    },
    // Lookup User (Foreign Key)
    {
      $lookup: {
        from: "users", // Collection name of the User model
        localField: "Technician",
        foreignField: "_id",
        as: "TechnicianDetails",
      },
    },
    {
      $unwind: {
        path: "$TechnicianDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
        as: "DepartmentInfo",
      },
    },
    {
      $unwind: {
        path: "$DepartmentInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
        as: "LaboratoryInfo",
      },
    },
    {
      $unwind: {
        path: "$LaboratoryInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Status: 1,
        Ref: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        // Include User Details
        UserId: "$TechnicianDetails._id",
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ", // Space between names
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ", // Space before Last Name
            "$TechnicianDetails.LastName",
          ],
        },
        DateTimeAccomplish:1
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    totalUnreadRequests: request.length, // Count only unread requests
    data: request,
  });
});

exports.DeleteRequest = AsyncErrorHandler(async (req, res) => {
  await requestmaintenance.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.UpdateSenData = AsyncErrorHandler(async (req, res, next) => {
  const updatedata = await requestmaintenance.findByIdAndUpdate(
    req.params.id,
    { ...req.body, read: true },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedata,
  });
});

exports.getRequest = AsyncErrorHandler(async (req, res, next) => {
  const filteredrequest = await requestmaintenance.findById(req.params.id);

  if (!filteredrequest) {
    const error = new CustomError("Request with the ID is not found", 404);
    return next(error);
  }

  const detailedRequest = await requestmaintenance.aggregate([
    { $match: { _id: filteredrequest._id } },
    {
      $lookup: {
        from: "users",
        localField: "Technician",
        foreignField: "_id",
        as: "TechnicianDetails"
      }
    },
    { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
        as: "DepartmentInfo"
      }
    },
    { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
        as: "LaboratoryInfo"
      }
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
        as: "EquipmentsInfo"
      }
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "EquipmentsInfo.Category",
        foreignField: "_id",
        as: "CategoryInfo"
      }
    },
    { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Ref: 1,
        read: 1,
        Status: 1,
        feedback: 1,
        feedbackread: 1,
        Description: 1,
        EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
        CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        Remarks: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        remarksread: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        UserId: "$TechnicianDetails._id",
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ",
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ",
            "$TechnicianDetails.LastName"
          ]
        },
        DateTimeAccomplish: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: detailedRequest,
  });
});


exports.getSpecificMaintenance = AsyncErrorHandler(async (req, res, next) => {
  const departmentID = req.query.Department;
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const status = req.query.Status;
  const pageNumber = parseInt(req.query.pageNumber) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

  let startDate = new Date(fromDate);
  let endDate = new Date(toDate);

  if (isNaN(startDate) || isNaN(endDate)) {
    return next(new CustomError('Invalid date format', 400));
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const query = {
    DateTime: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (departmentID && mongoose.Types.ObjectId.isValid(departmentID)) {
    query.Department = departmentID;
  }

  if (status && status !== "All") {
    query.Status = status;
  }

  const totalCount = await requestmaintenance.countDocuments(query); // Get total count for pagination

  const labs = await requestmaintenance.find(query)
    .skip((pageNumber - 1) * pageSize) // Skip records based on page number
    .limit(pageSize); // Limit the records per page

  if (!labs || labs.length === 0) {
    return next(new CustomError('No maintenance found for the given filters', 404));
  }

  const request = await requestmaintenance.aggregate([
    { $match: { _id: { $in: labs.map((lb) => lb._id) } } },
    {
      $lookup: {
        from: "users",
        localField: "Technician",
        foreignField: "_id",
        as: "TechnicianDetails"
      }
    },
    { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "Department",
        foreignField: "_id",
        as: "DepartmentInfo"
      }
    },
    { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "laboratories",
        localField: "Laboratory",
        foreignField: "_id",
        as: "LaboratoryInfo"
      }
    },
    { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "equipment",
        localField: "Equipments",
        foreignField: "_id",
        as: "EquipmentsInfo"
      }
    },
    { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "EquipmentsInfo.Category",
        foreignField: "_id",
        as: "CategoryInfo"
      }
    },
    { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1,
        DateTime: 1,
        Ref: 1,
        read: 1,
        Status: 1,
        feedback: 1,
        feedbackread: 1,
        Description: 1,
        EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
        EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
        CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
        DepartmentId: "$DepartmentInfo._id",
        _id: 1,
        Remarks: 1,
        Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
        remarksread: 1,
        laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
        UserId: "$TechnicianDetails._id",
        Technician: {
          $concat: [
            "$TechnicianDetails.FirstName",
            " ",
            { $ifNull: ["$TechnicianDetails.Middle", ""] },
            " ",
            "$TechnicianDetails.LastName"
          ]
        },
        DateTimeAccomplish: 1
      }
    }
  ]);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Maintenance_History' + Date.now() + '.pdf');
  doc.pipe(res);

  const logoPath = path.join(__dirname, '../public/image/logo.jpg');
  if (fs.existsSync(logoPath)) {
    const logoWidth = 60;
    const centerX = (doc.page.width - logoWidth) / 2;
    doc.image(logoPath, centerX, 30, { width: logoWidth });
  }

  doc.moveDown(6);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Republic of the Philippines', { align: 'center' })
    .moveDown(0.2)
    .text('BILIRAN PROVINCE STATE UNIVERSITY', { align: 'center' })
    .moveDown(0.2)
    .text('6560 Naval, Biliran Province', { align: 'center' })
    .moveDown(1);

  const startX = doc.page.margins.left;
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  doc.font('Helvetica-Bold').fontSize(12).text('Maintenance History Report', { align: 'center' });
  doc.moveDown();
  doc.text(`Total Laboratories: ${request.length}`);
  doc.text(`Date: ${generatedDate}`);
  doc.text(`Page: ${pageNumber} of ${Math.ceil(totalCount / pageSize)}`); // Display page number
  doc.moveDown(2);

  const tableHeaders = ['Date', 'Equipment', 'Description','Remarks', 'Status', 'Technician', 'Laboratory', 'Department', 'Feedback', 'Date Accomplish'];
  const columnWidths = [80, 80,80,80, 60, 80, 80, 80, 80, 80];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startXTable = doc.page.margins.left + (pageWidth - tableWidth) / 2;
  const rowHeight = 30;
  let currentY = doc.y;
  const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

  doc.font('Helvetica-Bold').fontSize(10);
  tableHeaders.forEach((header, index) => {
    doc.text(header, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
      width: columnWidths[index],
      align: 'left',
    });
  });

  currentY += rowHeight;
  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
  currentY += 5;

  doc.font('Helvetica').fontSize(10);

  // Function to check and add a new page
  const checkAndAddPage = () => {
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = doc.y;

      // Redraw headers on new page
      doc.font('Helvetica-Bold').fontSize(10);
      tableHeaders.forEach((header, index) => {
        doc.text(header, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
          width: columnWidths[index],
          align: 'left',
        });
      });

      currentY += rowHeight;
      doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
      currentY += 5;
    }
  };

  request.forEach((lab) => {
    checkAndAddPage();

    const formattedDate = lab.DateTime
      ? new Date(lab.DateTime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    const Accomplish = lab.DateTimeAccomplish
      ? new Date(lab.DateTimeAccomplish).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    const rowData = [
      formattedDate,
      `${lab.EquipmentName || 'N/A'} / ${lab.CategoryName || 'N/A'}`,
      lab.Description || 'N/A',
      lab.Remarks || 'N/A',
      lab.Status || 'N/A',
      lab.Technician || 'N/A',
      lab.laboratoryName || 'N/A',
      lab.Department || 'N/A',
      lab.feedback || 'N/A',
      Accomplish
    ];

    rowData.forEach((text, index) => {
      doc.text(text, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
        width: columnWidths[index],
        align: 'left',
      });
    });

    currentY += rowHeight;
  });

  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();

  // Footer
  doc.moveDown(1);
  const footerText = 'Generated by EPDO';
  const footerX = doc.page.margins.left;

  doc.fontSize(10).text(footerText, footerX, currentY + 10, { align: 'left' });

  doc.end();
});


exports.getMonthlyMaintenanceGraph=AsyncErrorHandler(async(req,res,next)=>{
  try {
    const data = await requestmaintenance.aggregate([
      {
        $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})





