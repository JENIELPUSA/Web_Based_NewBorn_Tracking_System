const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Profile = require("./../Models/ProfillingSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const CustomError = require("../Utils/CustomError");

exports.createProfile = AsyncErrorHandler(async (req, res) => {
  const { newborn_id, blood_type, health_condition, notes } = req.body;
  const missingFields = [];

  if (!newborn_id) missingFields.push("New Born");
  if (!blood_type) missingFields.push("Blood Type");
  if (!health_condition) missingFields.push("Health Condition");
  if (!notes) missingFields.push("Notes");
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  const newProfile = await Profile.create(req.body);
  const profileData = await Profile.aggregate([
    {
      $match: {
        _id: newProfile._id,
      },
    },
    {
      $lookup: {
        from: "newborns",
        localField: "newborn_id",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: "$newborn" },
    {
      $lookup: {
        from: "parents",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "vaccinationrecords",
        localField: "newborn._id",
        foreignField: "newborn",
        as: "vaccinationRecords",
      },
    },
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccinationRecords.vaccine",
        foreignField: "_id",
        as: "vaccineDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "vaccinationRecords.doses.administeredBy",
        foreignField: "_id",
        as: "administeredBy",
      },
    },
    {
      $project: {
        _id: 1,
        blood_type: 1,
        health_condition: 1,
        notes: 1,
        createdAt: 1,

        newbornName: {
          $concat: [
            { $ifNull: ["$newborn.firstName", ""] },
            " ",
            { $ifNull: ["$newborn.lastName", ""] },
          ],
        },
        dateOfBirth: "$newborn.dateOfBirth",
        gender: "$newborn.gender",
        birthWeight: "$newborn.birthWeight",
        birthHeight: "$newborn.birthHeight",

        motherName: {
          $concat: [
            { $ifNull: ["$mother.FirstName", ""] },
            " ",
            { $ifNull: ["$mother.LastName", ""] },
          ],
        },
        motherPhoneNumber: { $ifNull: ["$mother.phoneNumber", ""] },
        motherAddressZone: {
          $concat: [
            { $ifNull: ["$mother.address", ""] },
            " ",
            { $ifNull: ["$newborn.zone", ""] },
          ],
        },

        vaccinationRecords: {
          $map: {
            input: "$vaccinationRecords",
            as: "vaccinationRecord",
            in: {
              vaccine: "$$vaccinationRecord.vaccine",
              vaccineName: {
                $let: {
                  vars: {
                    matchedVaccine: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$vaccineDetails",
                            as: "vd",
                            cond: {
                              $eq: ["$$vd._id", "$$vaccinationRecord.vaccine"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$matchedVaccine.name",
                },
              },
              doses: {
                $map: {
                  input: "$$vaccinationRecord.doses",
                  as: "dose",
                  in: {
                    doseNumber: "$$dose.doseNumber",
                    dateGiven: "$$dose.dateGiven",
                    next_due_date: "$$dose.next_due_date",
                    remarks: "$$dose.remarks",
                    status: "$$dose.status",
                    administeredByName: {
                      $let: {
                        vars: {
                          matchedUser: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$administeredBy",
                                  as: "admin",
                                  cond: {
                                    $eq: [
                                      "$$admin._id",
                                      "$$dose.administeredBy",
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $concat: [
                            { $ifNull: ["$$matchedUser.FirstName", ""] },
                            " ",
                            { $ifNull: ["$$matchedUser.LastName", ""] },
                          ],
                        },
                      },
                    },
                    administeredByRole: {
                      $let: {
                        vars: {
                          matchedUser: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$administeredBy",
                                  as: "admin",
                                  cond: {
                                    $eq: [
                                      "$$admin._id",
                                      "$$dose.administeredBy",
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: "$$matchedUser.role",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  // Step 3: Return the enriched profile data
  res.status(201).json({
    status: "success",
    data: profileData[0],
  });
});

exports.DisplayProfile = AsyncErrorHandler(async (req, res) => {
  const profileData = await Profile.aggregate([
    {
      $lookup: {
        from: "newborns",
        localField: "newborn_id",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: "$newborn" },
    {
      $lookup: {
        from: "parents",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

    // Get latest checkup
    {
      $lookup: {
        from: "checkuprecords",
        let: { newbornId: "$newborn._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$newborn", "$$newbornId"] } } },
          { $sort: { visitDate: -1 } },
          { $limit: 1 },
        ],
        as: "latestCheckup",
      },
    },
    { $unwind: { path: "$latestCheckup", preserveNullAndEmptyArrays: true } },

    // Join with vaccination records
    {
      $lookup: {
        from: "vaccinationrecords",
        localField: "newborn._id",
        foreignField: "newborn",
        as: "vaccinationRecords",
      },
    },

    // Join with vaccines
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccinationRecords.vaccine",
        foreignField: "_id",
        as: "vaccineDetails",
      },
    },

    // Join with users for administeredBy
    {
      $lookup: {
        from: "users",
        localField: "vaccinationRecords.doses.administeredBy",
        foreignField: "_id",
        as: "administeredBy",
      },
    },

    // Final Projection
    {
      $project: {
        _id: 1,
        blood_type: 1,
        createdAt: 1,

        // Dynamic values depending on which is more recent
        latestWeight: {
          $cond: {
            if: { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
            then: "$latestCheckup.weight",
            else: "$newborn.birthWeight",
          },
        },
        latestHeight: {
          $cond: {
            if: { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
            then: "$latestCheckup.height",
            else: "$newborn.birthHeight",
          },
        },
        latestHealthCondition: {
          $cond: {
            if: { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
            then: "$latestCheckup.health_condition",
            else: "$health_condition",
          },
        },
        latestNotes: {
          $cond: {
            if: { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
            then: "$latestCheckup.notes",
            else: "$notes",
          },
        },
        growthSource: {
          $cond: {
            if: { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
            then: "checkup",
            else: "profiling",
          },
        },

        // Newborn
        newbornName: {
          $concat: [
            { $ifNull: ["$newborn.firstName", ""] },
            " ",
            { $ifNull: ["$newborn.lastName", ""] },
          ],
        },
        dateOfBirth: "$newborn.dateOfBirth",
        gender: "$newborn.gender",

        // Mother
        motherName: {
          $concat: [
            { $ifNull: ["$mother.FirstName", ""] },
            " ",
            { $ifNull: ["$mother.LastName", ""] },
          ],
        },
        motherPhoneNumber: { $ifNull: ["$mother.phoneNumber", ""] },

        motherAddressZone: { $ifNull: ["$mother.address", ""] },
        zone: { $ifNull: ["$mother.zone", ""] },
        // Vaccination Data
        vaccinationRecords: {
          $map: {
            input: "$vaccinationRecords",
            as: "vaccinationRecord",
            in: {
              vaccine: "$$vaccinationRecord.vaccine",
              vaccineName: {
                $let: {
                  vars: {
                    matchedVaccine: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$vaccineDetails",
                            as: "vd",
                            cond: {
                              $eq: ["$$vd._id", "$$vaccinationRecord.vaccine"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$matchedVaccine.name",
                },
              },
              doses: {
                $map: {
                  input: "$$vaccinationRecord.doses",
                  as: "dose",
                  in: {
                    doseNumber: "$$dose.doseNumber",
                    dateGiven: "$$dose.dateGiven",
                    next_due_date: "$$dose.next_due_date",
                    remarks: "$$dose.remarks",
                    status: "$$dose.status",
                    administeredByName: {
                      $concat: [
                        { $ifNull: ["$$dose.administeredBy.FirstName", ""] },
                        " ",
                        { $ifNull: ["$$dose.administeredBy.LastName", ""] },
                      ],
                    },
                    administeredByRole: "$$dose.administeredBy.role",
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: profileData,
  });
});

exports.UpdateProfilling = AsyncErrorHandler(async (req, res, next) => {
  const updateProfile = await Profile.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json({
    status: "success",
    data: updateProfile,
  });
});

exports.deleteProfilling = AsyncErrorHandler(async (req, res, next) => {
  await Profile.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getSpecificProfilling = AsyncErrorHandler(async (req, res, next) => {
  try {
    const { from, to } = req.query;

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

    const profileData = await Profile.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $lookup: {
          from: "newborns",
          localField: "newborn_id",
          foreignField: "_id",
          as: "newborn",
        },
      },
      { $unwind: "$newborn" },

      {
        $lookup: {
          from: "parents",
          localField: "newborn.motherName",
          foreignField: "_id",
          as: "mother",
        },
      },
      { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "checkuprecords",
          let: { newbornId: "$newborn._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$newborn", "$$newbornId"] } } },
            { $sort: { visitDate: -1 } },
            { $limit: 1 },
          ],
          as: "latestCheckup",
        },
      },
      { $unwind: { path: "$latestCheckup", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "vaccinationrecords",
          localField: "newborn._id",
          foreignField: "newborn",
          as: "vaccinationRecordsArray",
        },
      },
      {
        $unwind: {
          path: "$vaccinationRecordsArray",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$vaccinationRecordsArray.doses",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "vaccines",
          localField: "vaccinationRecordsArray.vaccine",
          foreignField: "_id",
          as: "vaccineDetails",
        },
      },
      {
        $unwind: { path: "$vaccineDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "users",
          let: {
            administeredById: "$vaccinationRecordsArray.doses.administeredBy",
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$administeredById"] },
              },
            },
          ],
          as: "adminUser",
        },
      },
      { $unwind: { path: "$adminUser", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: "$_id",
          blood_type: { $first: "$blood_type" },
          health_condition: { $first: "$health_condition" },
          notes: { $first: "$notes" },
          createdAt: { $first: "$createdAt" },
          latestCheckup: { $first: "$latestCheckup" },
          newborn: { $first: "$newborn" },
          mother: { $first: "$mother" },
          vaccinationRecords: {
            $push: {
              vaccine: "$vaccinationRecordsArray.vaccine",
              vaccineName: "$vaccineDetails.name",
              doseNumber: "$vaccinationRecordsArray.doses.doseNumber",
              dateGiven: "$vaccinationRecordsArray.doses.dateGiven",
              next_due_date: "$vaccinationRecordsArray.doses.next_due_date",
              status: "$vaccinationRecordsArray.doses.status",
              remarks: "$vaccinationRecordsArray.doses.remarks",
              administeredByName: {
                $concat: [
                  { $ifNull: ["$adminUser.FirstName", ""] },
                  " ",
                  { $ifNull: ["$adminUser.LastName", ""] },
                ],
              },
              administeredByRole: "$adminUser.role",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          blood_type: 1,
          health_condition: {
            $cond: {
              if: {
                $and: [
                  "$latestCheckup",
                  { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
                ],
              },
              then: "$latestCheckup.health_condition",
              else: "$health_condition",
            },
          },
          notes: {
            $cond: {
              if: {
                $and: [
                  "$latestCheckup",
                  { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
                ],
              },
              then: "$latestCheckup.notes",
              else: "$notes",
            },
          },
          weight: {
            $cond: {
              if: {
                $and: [
                  "$latestCheckup",
                  { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
                ],
              },
              then: "$latestCheckup.weight",
              else: "$newborn.birthWeight",
            },
          },
          height: {
            $cond: {
              if: {
                $and: [
                  "$latestCheckup",
                  { $gt: ["$latestCheckup.visitDate", "$createdAt"] },
                ],
              },
              then: "$latestCheckup.height",
              else: "$newborn.birthHeight",
            },
          },
          newbornName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$newborn.firstName", ""] },
                  " ",
                  { $ifNull: ["$newborn.middleName", ""] },
                  " ",
                  { $ifNull: ["$newborn.lastName", ""] },
                  " ",
                  { $ifNull: ["$newborn.extensionName", ""] },
                  {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$newborn.extensionName", null] },
                          { $eq: ["$newborn.extensionName", ""] },
                        ],
                      },
                      then: "",
                      else: { $concat: [" ", "$newborn.extensionName"] },
                    },
                  },
                ],
              },
            },
          },
          gender: "$newborn.gender",
          dateOfBirth: "$newborn.dateOfBirth",
          motherName: {
            $concat: [
              { $ifNull: ["$mother.FirstName", ""] },
              " ",
              { $ifNull: ["$mother.Middle", ""] },
              " ",
              { $ifNull: ["$mother.LastName", ""] },
              " ",
              { $ifNull: ["$mother.extensionName", ""] },
            ],
          },
          motherPhoneNumber: "$mother.phoneNumber",
          motherAddressZone: {
            $concat: [
              { $ifNull: ["$mother.address", ""] },
              " ",
              { $ifNull: ["$newborn.zone", ""] },
            ],
          },
          vaccinationRecords: {
            $filter: {
              input: "$vaccinationRecords",
              as: "record",
              cond: { $ne: ["$$record.doseNumber", null] },
            },
          },
        },
      },
    ]);

    if (!profileData || profileData.length === 0) {
      return next(
        new CustomError(
          "No newborn profile data found for the selected date range.",
          404
        )
      );
    }

    const doc = new PDFDocument({ layout: "landscape", margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=newborn_profile_report.pdf"
    );

    doc.pipe(res);

    const PDF_STYLES = {
      CELL_PADDING: 5,
      HEADER_FILL_COLOR: "#CCCCCC",
      ROW_FILL_COLOR_1: "#F0F0F0",
      ROW_FILL_COLOR_2: "#FFFFFF",
      TEXT_COLOR: "#000000",
      HEADER_FONT_SIZE: 10,
      ROW_FONT_SIZE: 9,
      BORDER_WIDTH: 0.5,
      HEADER_ROW_HEIGHT: 25,
      SECTION_SPACING: 1.5,
      SUBSECTION_SPACING: 0.5,
      LINE_COLOR: "#AAAAAA",
      LINE_WIDTH: 0.5,
    };

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
      const cellPadding = options.cellPadding || PDF_STYLES.CELL_PADDING;
      const headerFillColor =
        options.headerFillColor || PDF_STYLES.HEADER_FILL_COLOR;
      const rowFillColor1 =
        options.rowFillColor1 || PDF_STYLES.ROW_FILL_COLOR_1;
      const rowFillColor2 =
        options.rowFillColor2 || PDF_STYLES.ROW_FILL_COLOR_2;
      const textColor = options.textColor || PDF_STYLES.TEXT_COLOR;
      const headerFontSize =
        options.headerFontSize || PDF_STYLES.HEADER_FONT_SIZE;
      const rowFontSize = options.rowFontSize || PDF_STYLES.ROW_FONT_SIZE;
      const borderWidth = options.borderWidth || PDF_STYLES.BORDER_WIDTH;
      const includeRowNumber = options.includeRowNumber || false;
      const startRowNumber = options.startRowNumber || 1;

      doc.lineWidth(borderWidth);
      doc.strokeColor(textColor);
      doc.font("Helvetica-Bold").fontSize(headerFontSize);
      doc
        .fillColor(headerFillColor)
        .rect(
          x,
          y,
          colWidths.reduce((a, b) => a + b, 0),
          PDF_STYLES.HEADER_ROW_HEIGHT
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
      y += PDF_STYLES.HEADER_ROW_HEIGHT;

      doc.font("Helvetica").fontSize(rowFontSize);
      data.forEach((row, rowIndex) => {
        let maxRowHeight = 0;
        headers.forEach((header, i) => {
          let value = "";
          if (includeRowNumber && header === "Row No.") {
            value = (startRowNumber + rowIndex).toString();
          } else {
            value =
              row[header] !== undefined && row[header] !== null
                ? row[header].toString()
                : "N/A";
          }
          const textHeight = doc.heightOfString(value, {
            width: colWidths[i] - 2 * cellPadding,
            lineBreak: true,
          });
          maxRowHeight = Math.max(maxRowHeight, textHeight + 2 * cellPadding);
        });

        maxRowHeight = Math.max(maxRowHeight, rowFontSize + 2 * cellPadding);

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
              PDF_STYLES.HEADER_ROW_HEIGHT
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
          y += PDF_STYLES.HEADER_ROW_HEIGHT;
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
          let valueToPrint;
          if (includeRowNumber && header === "Row No.") {
            valueToPrint = (startRowNumber + rowIndex).toString();
          } else {
            valueToPrint =
              row[header] !== undefined && row[header] !== null
                ? row[header].toString()
                : "N/A";
          }

          doc.rect(currentRowX, y, colWidths[i], maxRowHeight).stroke();
          doc.text(valueToPrint, currentRowX + cellPadding, y + cellPadding, {
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

    function addPageNumbers(doc) {
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i + 1); // ✅ Fixes the "out of bounds" error

        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        doc
          .font("Helvetica")
          .fontSize(9)
          .text(
            `Page ${i + 1} of ${pages.count}`,
            0,
            doc.page.height - oldBottomMargin / 2,
            { align: "center" }
          );

        doc.page.margins.bottom = oldBottomMargin;
      }
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Newborn Profile Report", { align: "center" });
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Date Range: ${from} to ${to}`, { align: "center" });
    doc.moveDown(PDF_STYLES.SECTION_SPACING);

    const mainTableHeaders = [
      "Row No.",
      "Newborn Name",
      "Date of Birth",
      "Gender",
      "Blood Type",
      "Weight",
      "Height",
      "Health Condition",
      "Notes",
      "Mother Name",
      "Mother Phone",
      "Mother Address",
    ];

    const totalPageContentWidth = doc.page.width - 2 * doc.page.margins.left;
    const mainColWidths = [
      totalPageContentWidth * 0.03, // Row No.
      totalPageContentWidth * 0.1, // Newborn Name
      totalPageContentWidth * 0.08, // Date of Birth
      totalPageContentWidth * 0.05, // Gender
      totalPageContentWidth * 0.06, // Blood Type
      totalPageContentWidth * 0.05, // Weight
      totalPageContentWidth * 0.05, // Height
      totalPageContentWidth * 0.09, // Health Condition
      totalPageContentWidth * 0.12, // Notes
      totalPageContentWidth * 0.13, // Mother Name
      totalPageContentWidth * 0.08, // Mother Phone
      totalPageContentWidth * 0.19, // Mother Address
    ];

    const mainTableData = profileData.map((profile) => ({
      "Newborn Name": profile.newbornName || "N/A",
      "Date of Birth": profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString("en-US")
        : "N/A",
      Gender: profile.gender || "N/A",
      "Blood Type": profile.blood_type || "N/A",
      Weight:
        profile.weight !== undefined && profile.weight !== null
          ? `${profile.weight} kg`
          : "N/A",
      Height:
        profile.height !== undefined && profile.height !== null
          ? `${profile.height} cm`
          : "N/A",
      "Health Condition":
        profile.health_condition && profile.health_condition.length > 60
          ? profile.health_condition.substring(0, 57) + "..."
          : profile.health_condition || "N/A",
      Notes:
        profile.notes && profile.notes.length > 80
          ? profile.notes.substring(0, 77) + "..."
          : profile.notes || "N/A",
      "Mother Name": profile.motherName || "N/A",
      "Mother Phone": profile.motherPhoneNumber || "N/A",
      "Mother Address": profile.motherAddressZone || "N/A",
    }));

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Newborn Profiles Overview:", { underline: true, align: "left" });
    doc.font("Helvetica").moveDown(PDF_STYLES.SUBSECTION_SPACING);

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
        headerFontSize: 9.5,
        rowFontSize: 8.5,
        includeRowNumber: true,
      }
    );
    doc.moveDown(PDF_STYLES.SECTION_SPACING);

    let overallVaccineRecordCount = 1;

    profileData.forEach((profile, index) => {
      const validVaccinationRecords = profile.vaccinationRecords.filter(
        (rec) => rec && rec.vaccineName
      );

      const estimatedVacSectionHeight =
        35 +
        validVaccinationRecords.length *
          (PDF_STYLES.ROW_FONT_SIZE + 2 * PDF_STYLES.CELL_PADDING) +
        10;

      if (
        doc.y + estimatedVacSectionHeight >
          doc.page.height - doc.page.margins.bottom &&
        index > 0
      ) {
        doc.addPage();
        currentY = doc.page.margins.top;
      }

      doc
        .strokeColor(PDF_STYLES.LINE_COLOR)
        .lineWidth(PDF_STYLES.LINE_WIDTH)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(0.7);

      doc.x = doc.page.margins.left;
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Vaccination Records for ${profile.newbornName}`, {
          align: "center",
          width: doc.page.width - 2 * doc.page.margins.left,
        });
      doc.moveDown(PDF_STYLES.SUBSECTION_SPACING);

      if (validVaccinationRecords.length > 0) {
        const vaccinationTableHeaders = [
          "Record No.",
          "Vaccine",
          "Dose #",
          "Date Given",
          "Next Due",
          "Status",
          "Administered By",
          "Role",
          "Remarks",
        ];

        const vacTableWidth = doc.page.width - 2 * doc.page.margins.left;
        const vacColWidths = [
          vacTableWidth * 0.06,
          vacTableWidth * 0.13,
          vacTableWidth * 0.07,
          vacTableWidth * 0.1,
          vacTableWidth * 0.1,
          vacTableWidth * 0.08,
          vacTableWidth * 0.15,
          vacTableWidth * 0.1,
          vacTableWidth * 0.21,
        ];

        const vaccinationRecordsData = validVaccinationRecords.map((dose) => ({
          "Record No.": overallVaccineRecordCount++,
          Vaccine: dose.vaccineName || "N/A",
          "Dose #": dose.doseNumber || "N/A",
          "Date Given": dose.dateGiven
            ? new Date(dose.dateGiven).toLocaleDateString("en-US")
            : "N/A",
          "Next Due": dose.next_due_date
            ? new Date(dose.next_due_date).toLocaleDateString("en-US")
            : "N/A",
          Status: dose.status || "N/A",
          "Administered By": dose.administeredByName || "N/A",
          Role: dose.administeredByRole || "N/A",
          Remarks:
            dose.remarks && dose.remarks.length > 150
              ? dose.remarks.substring(0, 147) + "..."
              : dose.remarks || "N/A",
        }));

        currentY = drawTable(
          doc,
          vaccinationRecordsData,
          vaccinationTableHeaders,
          doc.y,
          doc.page.margins.left,
          vacColWidths,
          {
            headerFillColor: "#D8BFD8",
            rowFillColor1: "#E6E6FA",
            rowFillColor2: "#F0F8FF",
            headerFontSize: 8.5,
            rowFontSize: 7.5,
            includeRowNumber: false,
            startRowNumber:
              overallVaccineRecordCount - vaccinationRecordsData.length,
          }
        );
        doc.moveDown(PDF_STYLES.SUBSECTION_SPACING);
      } else {
        doc
          .fontSize(11)
          .text("No vaccination records found for this newborn.", {
            align: "left",
          });
        doc.moveDown(PDF_STYLES.SUBSECTION_SPACING);
      }
    });

    addPageNumbers(doc);

    doc.end();
  } catch (error) {
    console.error("Error generating profile PDF:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Failed to generate PDF", error: error.message });
    }
  }
});
