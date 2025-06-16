const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Vaccine = require("../Models/VaccineModel");
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const { name, description, stock, expirationDate, dosage, brand } = req.body;

  const missingFields = [];

  if (!name) missingFields.push("Name");
  if (!description) missingFields.push("Description");
  if (stock == null) missingFields.push("Stock");
  if (!expirationDate) missingFields.push("Expiration Date");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  // Find or create vaccine
  let vaccine = await Vaccine.findOne({ name, brand, dosage });

  if (!vaccine) {
    // Create a new vaccine if not found
    vaccine = await Vaccine.create({
      name,
      brand,
      dosage,
      description,
      batches: [{ stock, expirationDate }],
    });
  } else {
    // Make sure batches is always an array
    if (!Array.isArray(vaccine.batches)) {
      vaccine.batches = [];
    }
    vaccine.batches.push({ stock, expirationDate });
    await vaccine.save();
  }

  // Use aggregation to return populated brand
  const displayVaccine = await Vaccine.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(vaccine._id) } },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        dosage: 1,
        "brand._id": 1,
        "brand.name": 1,
        batches: 1,
        createdAt: 1,
      },
    },
  ]);

  // Check if displayVaccine has data
  if (!displayVaccine.length) {
    return res.status(404).json({
      status: "error",
      message: "Vaccine not found after creation or update.",
    });
  }

  res.status(201).json({
    status: "success",
    data: displayVaccine[0],
    message: "Vaccine batch added successfully",
  });
});

exports.DisplayAllData = AsyncErrorHandler(async (req, res) => {
  const matchStage = {}; // Extend with filters if needed

  // 1. Fetch all vaccines with brand populated
  const displayVacine = await Vaccine.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        dosage: 1,
        zone: 1,
        "brand._id": 1,
        "brand.name": 1,
        batches: 1,
        createdAt: 1,
      },
    },
  ]);

  // 2. Count expired vs not expired from Vaccine.batches
  const today = new Date();
  let expired = 0;
  let notExpired = 0;
  let totalStock = 0; // NEW: for counting total stock

  displayVacine.forEach((vaccine) => {
    vaccine.batches?.forEach((batch) => {
      if (batch.expirationDate) {
        const expDate = new Date(batch.expirationDate);
        if (expDate < today) {
          expired++;
        } else {
          notExpired++;
        }
      }

      // Add stock if it's a valid number
      if (typeof batch.stock === "number") {
        totalStock += batch.stock;
      }
    });
  });

  // 3. Final response
  res.status(200).json({
    status: "success",
    data: displayVacine,
    totalVaccine: displayVacine.length,
    totals: {
      expired,
      notExpired,
      totalStock, // Include in response
    },
  });
});

exports.UpdateVaccine = AsyncErrorHandler(async (req, res, next) => {
  const {
    vaccineId,
    batchId,
    name,
    description,
    dosage,
    brand,
    stock,
    expirationDate,
  } = req.body;

  // Step 1: Find the vaccine by ID
  const vaccine = await Vaccine.findById(vaccineId);
  if (!vaccine) {
    return res
      .status(404)
      .json({ status: "fail", message: "Vaccine not found" });
  }

  // Step 2: Update vaccine fields
  if (name) vaccine.name = name;
  if (description) vaccine.description = description;
  if (dosage) vaccine.dosage = dosage;
  if (brand) vaccine.brand = brand;

  // Step 3: Find and update the batch by batchId
  const batchIndex = vaccine.batches.findIndex(
    (batch) => batch._id.toString() === batchId
  );
  if (batchIndex !== -1) {
    if (stock !== undefined) vaccine.batches[batchIndex].stock = stock;
    if (expirationDate)
      vaccine.batches[batchIndex].expirationDate = expirationDate;
  } else {
    return res.status(404).json({ status: "fail", message: "Batch not found" });
  }

  // Step 4: Save updated document
  await vaccine.save();

  // Step 5: Return updated vaccine using aggregation with populated brand
  const updatedVaccine = await Vaccine.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(vaccineId) } },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        description: 1,
        dosage: 1,
        "brand._id": 1,
        "brand.name": 1,
        batches: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: updatedVaccine[0],
  });
});

exports.deleteVaccine = AsyncErrorHandler(async (req, res, next) => {
  const { id } = req.params; 
  const { batchId } = req.body; 

  if (!batchId) {
    return res.status(400).json({
      status: "fail",
      message: "batchId is required to delete a batch",
    });
  }
  const updatedVaccine = await Vaccine.findByIdAndUpdate(
    id,
    { $pull: { batches: { _id: batchId } } },
    { new: true }
  );

  if (!updatedVaccine) {
    return res.status(404).json({
      status: "fail",
      message: "Vaccine not found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: updatedVaccine,
    message: "Batch deleted successfully",
  });
});

exports.getReportsVaccine = AsyncErrorHandler(async (req, res, next) => {
    try {
        const { from, to } = req.query; // Date range from query params (format:YYYY-MM-DD)
        const fromDate = new Date(from);
        let toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return next(
                new CustomError(
                    "Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).",
                    400
                )
            );
        }

        toDate.setHours(23, 59, 59, 999);

        const aggregationResult = await Vaccine.aggregate([
            { $unwind: "$batches" },

            {
                $match: {
                    "batches.addedAt": { $gte: fromDate, $lte: toDate },
                },
            },

            {
                $lookup: {
                    from: "brands", 
                    localField: "brand",
                    foreignField: "_id",
                    as: "brandInfo", 
                },
            },
            {
                $unwind: {
                    path: "$brandInfo",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Step 4: Group back by the original Vaccine _id
            {
                $group: {
                    _id: "$_id", // Group by the Vaccine document's _id
                    name: { $first: "$name" },
                    description: { $first: "$description" },
                    dosage: { $first: "$dosage" },
                    brand: { $first: "$brandInfo.name" }, // Get the brand name
                    createdAt: { $first: "$createdAt" }, // Keep original vaccine createdAt
                    // Push only the matched batches back into an array
                    batches: { $push: "$batches" },
                },
            },
            // Optional: If you need to sort the final result
            // { $sort: { createdAt: 1 } }
        ]);

        const reportData = aggregationResult;

        if (!reportData || reportData.length === 0) {
            return next(
                new CustomError(
                    "No vaccine inventory data found for the selected date range and batch creation dates.",
                    404
                )
            );
        }

        // --- PDF Document Setup ---
        const doc = new PDFDocument({ layout: "landscape", margin: 30 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=vaccine_inventory_report_${from}_to_${to}_batches.pdf` // More appropriate filename
        );

        doc.pipe(res);

        function addPageNumbers(doc) {
            let pages = doc.bufferedPageRange(); 
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                let oldBottomMargin = doc.page.margins.bottom;
                doc.page.margins.bottom = 0;
                doc.font('Helvetica').fontSize(9).text(
                    `Page ${i + 1} of ${pages.count}`,
                    0,
                    doc.page.height - oldBottomMargin / 2,
                    { align: 'center' }
                );
                doc.page.margins.bottom = oldBottomMargin; 
            }
        }

        function drawTable(
            doc,
            data,
            headers,
            startY,
            startX,
            colWidths,
            options = {}
        ) {
            let y = startY;
            let x = startX;
            const cellPadding = options.cellPadding || 5;
            const headerFillColor = options.headerFillColor || "#CCCCCC";
            const rowFillColor1 = options.rowFillColor1 || "#F0F0F0";
            const rowFillColor2 = options.rowFillColor2 || "#FFFFFF";
            const textColor = options.textColor || "#000000";
            const headerFontSize = options.headerFontSize || 10;
            const rowFontSize = options.rowFontSize || 9;
            const borderWidth = options.borderWidth || 0.5;

            doc.lineWidth(borderWidth);
            doc.strokeColor(textColor);
            doc.font("Helvetica-Bold").fontSize(headerFontSize);
            doc
                .fillColor(headerFillColor)
                .rect(
                    x,
                    y,
                    colWidths.reduce((a, b) => a + b, 0),
                    25
                )
                .fill();
            doc.fillColor(textColor);

            let currentHeaderX = x;
            headers.forEach((header, i) => {
                doc.text(header, currentHeaderX + cellPadding, y + cellPadding, {
                    width: colWidths[i] - 2 * cellPadding,
                    align: "left",
                    lineBreak: true,
                });
                currentHeaderX += colWidths[i];
            });
            y += 25;

            doc.font("Helvetica").fontSize(rowFontSize);

            data.forEach((row, rowIndex) => {
                let maxRowHeight = 0;
                headers.forEach((header, i) => {
                    const value =
                        row[header] !== undefined && row[header] !== null
                            ? row[header].toString()
                            : "N/A";
                    const textHeight = doc.heightOfString(value, {
                        width: colWidths[i] - 2 * cellPadding,
                        lineBreak: true,
                    });
                    maxRowHeight = Math.max(maxRowHeight, textHeight + 2 * cellPadding);
                });

                // Check for new page before drawing a row
                if (y + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;
                    currentHeaderX = x;
                    doc.font("Helvetica-Bold").fontSize(headerFontSize);
                    doc
                        .fillColor(headerFillColor)
                        .rect(
                            x,
                            y,
                            colWidths.reduce((a, b) => a + b, 0),
                            25
                        )
                        .fill();
                    doc.fillColor(textColor);
                    headers.forEach((header, i) => {
                        doc.text(header, currentHeaderX + cellPadding, y + cellPadding, {
                            width: colWidths[i] - 2 * cellPadding,
                            align: "left",
                            lineBreak: true,
                        });
                        currentHeaderX += colWidths[i];
                    });
                    y += 25;
                    doc.font("Helvetica").fontSize(rowFontSize);
                }

                const fillColor = rowIndex % 2 === 0 ? rowFillColor1 : rowFillColor2;
                doc
                    .fillColor(fillColor)
                    .rect(
                        x,
                        y,
                        colWidths.reduce((a, b) => a + b, 0),
                        maxRowHeight
                    )
                    .fill();
                doc.fillColor(textColor);

                let currentRowX = x;
                headers.forEach((header, i) => {
                    const value =
                        row[header] !== undefined && row[header] !== null
                            ? row[header].toString()
                            : "N/A";
                    doc.rect(currentRowX, y, colWidths[i], maxRowHeight).stroke();
                    doc.text(value, currentRowX + cellPadding, y + cellPadding, {
                        width: colWidths[i] - 2 * cellPadding,
                        align: "left",
                        valign: "top",
                        lineBreak: true,
                    });
                    currentRowX += colWidths[i];
                });
                y += maxRowHeight;
            });
            return y;
        }

        // --- PDF Header Content ---
        doc
            .font("Helvetica-Bold")
            .fontSize(18)
            .text("Vaccine Inventory Report (Filtered by Batch Added Date)", { align: "center" }); // Updated title
        doc
            .font("Helvetica")
            .fontSize(12)
            .text(`Batch Added Date Range: ${from} to ${to}`, { align: "center" }); // Updated date range label
        doc.moveDown(1.5);

        // --- Main Table Headers (Overview) ---
        const mainTableHeaders = [
            "Name",
            "Description",
            "Dosage",
            "Brand",
            "Batches (Stock / Expiration / Added At)", // Updated header for batches
            "Vaccine Record Created At", // Clarified for vaccine record
        ];

        const totalPageContentWidth = doc.page.width - 2 * doc.page.margins.left;
        const mainColWidths = [
            totalPageContentWidth * 0.12, // Name
            totalPageContentWidth * 0.18, // Description
            totalPageContentWidth * 0.08, // Dosage
            totalPageContentWidth * 0.12, // Brand
            totalPageContentWidth * 0.35, // Batches (Increased width for details)
            totalPageContentWidth * 0.15, // Vaccine Record Created At
        ];

        const mainTableData = reportData.map((item) => ({
            "Name": item.name || "N/A",
            "Description": item.description || "N/A",
            "Dosage": item.dosage || "N/A",
            "Brand": item.brand || "N/A",
            "Batches (Stock / Expiration / Added At)": item.batches && item.batches.length > 0
                ? item.batches.map(batch =>
                    `Stock: ${batch.stock || 'N/A'}, Exp: ${batch.expirationDate ? new Date(batch.expirationDate).toISOString().split('T')[0] : 'N/A'}, Added: ${batch.addedAt ? new Date(batch.addedAt).toISOString().split('T')[0] : 'N/A'}`
                ).join('\n')
                : 'No Batches Matched Date Range', // Updated message for no matched batches
            "Vaccine Record Created At": item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'N/A', // Format original vaccine createdAt
        }));

        doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .text("Vaccine Inventory Overview (Filtered by Batch Added Date):", { underline: true, align: "left" }); // Updated title
        doc.font("Helvetica").moveDown(0.5);

        let currentY = drawTable(
            doc,
            mainTableData,
            mainTableHeaders,
            doc.y,
            doc.page.margins.left,
            mainColWidths,
            {
                headerFillColor: "#ADD8E6",
                rowFillColor1: "#E0FFFF",
                rowFillColor2: "#F5FFFA",
                headerFontSize: 9,
                rowFontSize: 8,
            }
        );
        doc.moveDown(1.5);

        // Finalize the PDF document
        addPageNumbers(doc); // Call addPageNumbers before doc.end()
        doc.end();
    } catch (error) {
        console.error("Error generating vaccine inventory PDF:", error);
        if (!res.headersSent) {
            res
                .status(500)
                .json({ message: "Failed to generate PDF", error: error.message });
        }
    }
});

