const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Profile = require("./../Models/ProfillingSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
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

 
 
 
    // Step 1: Create the new profile
  const newProfile = await Profile.create(req.body);

  // Step 2: Fetch the fully populated profile using aggregation
  const profileData = await Profile.aggregate([
    // Match only the newly created profile
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
        from: "users",
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
    // Join with Newborn collection
    {
      $lookup: {
        from: "newborns",
        localField: "newborn_id",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: "$newborn" },

    // Join with User collection (Mother Info)
    {
      $lookup: {
        from: "users",
        localField: "newborn.motherName", // Match to motherName reference in Newborn schema
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

    // Join with VaccinationRecord based on newborn._id
    {
      $lookup: {
        from: "vaccinationrecords",
        localField: "newborn._id",
        foreignField: "newborn",
        as: "vaccinationRecords",
      },
    },

    // Join with vaccines collection for each vaccine reference
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccinationRecords.vaccine",
        foreignField: "_id",
        as: "vaccineDetails",
      },
    },

    // Join each dose's administeredBy to user
    {
      $lookup: {
        from: "users",
        localField: "vaccinationRecords.doses.administeredBy",
        foreignField: "_id",
        as: "administeredBy",
      },
    },

    // Final projection
    {
      $project: {
        _id: 1,
        blood_type: 1,
        health_condition: 1,
        notes: 1,
        createdAt: 1,

        // Newborn info
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

        // Mother info
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

        // Vaccination Records with vaccineName
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
        const { from, to } = req.query; // Date range from query params (format:YYYY-MM-DD)

        // Ensure that `from` and `to` are valid date strings
        const fromDate = new Date(from);
        let toDate = new Date(to);

        // Validate the dates
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return next(new CustomError('Invalid date format. Please use YYYY-MM-DD.', 400));
        }

        // Adjust toDate to include the entire day
        toDate.setHours(23, 59, 59, 999);

        // Fetch the profile data with date filtering using aggregation
        const profileData = await Profile.aggregate([
            // Stage 1: Match documents by the 'createdAt' field within the specified date range
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate },
                },
            },
            // Stage 2: Join with Newborn collection
            {
                $lookup: {
                    from: "newborns",
                    localField: "newborn_id",
                    foreignField: "_id",
                    as: "newborn",
                },
            },
            // Stage 3: Deconstruct the newborn array (assuming one newborn per profile).
            // Changed to preserveNullAndEmptyArrays to prevent dropping profiles without newborns.
            { $unwind: { path: "$newborn", preserveNullAndEmptyArrays: true } },

            // Stage 4: Join with User collection for Mother Info
            // IMPORTANT: This assumes newborn.motherName stores the User _id of the mother.
            {
                $lookup: {
                    from: "users",
                    localField: "newborn.motherName",
                    foreignField: "_id",
                    as: "mother",
                },
            },
            // Stage 5: Deconstruct the mother array, preserving nulls if no mother found
            { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

            // Stage 6: Join with VaccinationRecord based on newborn._id
            {
                $lookup: {
                    from: "vaccinationrecords",
                    localField: "newborn._id",
                    foreignField: "newborn",
                    as: "vaccinationRecords",
                },
            },
            // Stage 7: Unwind vaccinationRecords to process each record individually.
            // This is crucial for correctly linking vaccine details and administeredBy users to each record.
            { $unwind: { path: "$vaccinationRecords", preserveNullAndEmptyArrays: true } },

            // Stage 8: Lookup vaccine details for the current vaccination record
            {
                $lookup: {
                    from: "vaccines",
                    localField: "vaccinationRecords.vaccine",
                    foreignField: "_id",
                    as: "vaccineDetails",
                },
            },
            // Stage 9: Deconstruct vaccineDetails array (assuming one match per vaccine)
            { $unwind: { path: "$vaccineDetails", preserveNullAndEmptyArrays: true } },

            // Stage 10: Create a temporary array of all administeredBy user IDs from doses.
            // This is needed because 'administeredBy' is nested within 'doses' and we need to lookup users.
            {
                $addFields: {
                    allAdministeredByIds: {
                        $reduce: {
                            input: { $ifNull: ["$vaccinationRecords.doses", []] }, // Handle cases where doses might be null/undefined
                            initialValue: [],
                            in: { $concatArrays: ["$$value", [{ $ifNull: ["$$this.administeredBy", null] }]] }
                        }
                    }
                }
            },
            // Stage 11: Lookup all users who administered any dose within this profile's records
            {
                $lookup: {
                    from: "users",
                    localField: "allAdministeredByIds",
                    foreignField: "_id",
                    as: "administeredByUsers",
                },
            },

            // Stage 12: Final Projection to shape the output document
            {
                $project: {
                    _id: 1,
                    blood_type: 1,
                    health_condition: 1,
                    notes: 1,
                    createdAt: 1,

                    // Newborn info
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

                    // Mother info - Assuming User model has 'firstName' and 'lastName'
                    // IMPORTANT: If your User model uses 'FirstName' and 'LastName' (capitalized),
                    // you must change these fields accordingly.
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

                    // Vaccination Record details
                    vaccinationRecord: {
                        vaccine: "$vaccinationRecords.vaccine",
                        vaccineName: "$vaccineDetails.name",
                        doses: {
                            $map: {
                                input: { $ifNull: ["$vaccinationRecords.doses", []] }, // Handle cases where doses might be null/undefined
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
                                                adminUser: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$administeredByUsers",
                                                                as: "aUser",
                                                                cond: { $eq: ["$$aUser._id", "$$dose.administeredBy"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            // Make sure 'FirstName' and 'LastName' match your User model field names for administeredBy users
                                            in: {
                                                $concat: [
                                                    { $ifNull: ["$$adminUser.FirstName", ""] },
                                                    " ",
                                                    { $ifNull: ["$$adminUser.LastName", ""] },
                                                ],
                                            }
                                        }
                                    },
                                    administeredByRole: {
                                        $let: {
                                            vars: {
                                                adminUser: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$administeredByUsers",
                                                                as: "aUser",
                                                                cond: { $eq: ["$$aUser._id", "$$dose.administeredBy"] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: { $ifNull: ["$$adminUser.role", ""] }
                                        }
                                    },
                                },
                            },
                        },
                    },
                },
            },
            // Stage 13: Group back by profile _id to get all vaccination records in an array
            {
                $group: {
                    _id: "$_id",
                    blood_type: { $first: "$blood_type" },
                    health_condition: { $first: "$health_condition" },
                    notes: { $first: "$notes" },
                    createdAt: { $first: "$createdAt" },
                    newbornName: { $first: "$newbornName" },
                    dateOfBirth: { $first: "$dateOfBirth" },
                    gender: { $first: "$gender" },
                    birthWeight: { $first: "$birthWeight" },
                    birthHeight: { $first: "$birthHeight" },
                    motherName: { $first: "$motherName" },
                    motherPhoneNumber: { $first: "$motherPhoneNumber" },
                    motherAddressZone: { $first: "$motherAddressZone" },
                    vaccinationRecords: { $push: "$vaccinationRecord" }
                }
            }
        ]);

        if (!profileData || profileData.length === 0) {
            return next(new CustomError('No newborn profile data found for the selected date range.', 404));
        }

        // --- PDF Document Setup ---
        const doc = new PDFDocument({ layout: 'landscape', margin: 30 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=newborn_profile_report.pdf');

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
                    align: 'left', // Changed to left alignment
                    lineBreak: true
                });
                currentHeaderX += colWidths[i];
            });
            y += 25;

            doc.font('Helvetica').fontSize(rowFontSize);

            // Draw Data Rows
            data.forEach((row, rowIndex) => {
                let maxRowHeight = 0;
                headers.forEach((header, i) => {
                    const value = row[header] !== undefined && row[header] !== null ? row[header].toString() : 'N/A';
                    const textHeight = doc.heightOfString(value, {
                        width: colWidths[i] - 2 * cellPadding,
                        lineBreak: true
                    });
                    maxRowHeight = Math.max(maxRowHeight, textHeight + 2 * cellPadding);
                });

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
                            align: 'left', // Changed to left alignment
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
                        align: 'left', // Changed to left alignment
                        valign: 'top',
                        lineBreak: true
                    });
                    currentRowX += colWidths[i];
                });
                y += maxRowHeight;
            });
            return y;
        }

        // --- PDF Header Content ---
        doc.font('Helvetica-Bold').fontSize(18).text('Newborn Profile Report', { align: 'center' }); // Made title bold
        doc.font('Helvetica').fontSize(12).text(`Date Range: ${from} to ${to}`, { align: 'center' });
        doc.moveDown(1.5);

        // --- Main Profile Data Table (Overview) ---
        const mainTableHeaders = [
            'Newborn Name',
            'DoB',
            'Gender',
            'Blood Type',
            'Health Condition',
            'Mother Name',
            'Mother Phone',
            'Mother Address'
        ];

        const totalPageContentWidth = doc.page.width - 2 * doc.page.margins.left;
        const mainColWidths = [
            totalPageContentWidth * 0.16, // Newborn Name
            totalPageContentWidth * 0.08, // DoB
            totalPageContentWidth * 0.07, // Gender
            totalPageContentWidth * 0.08, // Blood Type
            totalPageContentWidth * 0.14, // Health Condition
            totalPageContentWidth * 0.15, // Mother Name
            totalPageContentWidth * 0.10, // Mother Phone
            totalPageContentWidth * 0.22, // Mother Address
        ];

        const mainTableData = profileData.map(profile => ({
            'Newborn Name': profile.newbornName || 'N/A',
            'DoB': profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US') : 'N/A',
            'Gender': profile.gender || 'N/A',
            'Blood Type': profile.blood_type || 'N/A',
            'Health Condition': profile.health_condition || 'N/A',
            'Mother Name': profile.motherName || 'N/A',
            'Mother Phone': profile.motherPhoneNumber || 'N/A',
            'Mother Address': profile.motherAddressZone || 'N/A'
        }));

        doc.font('Helvetica-Bold').fontSize(14).text('Newborn Profiles Overview:', { underline: true, align: 'left' }); // Made bold and left aligned
        doc.font('Helvetica').moveDown(0.5); // Reset font after title

        let currentY = drawTable(doc, mainTableData, mainTableHeaders, doc.y, doc.page.margins.left, mainColWidths, {
            headerFillColor: '#ADD8E6',
            rowFillColor1: '#E0FFFF',
            rowFillColor2: '#F5FFFA',
            headerFontSize: 11,
            rowFontSize: 10
        });
        doc.moveDown(1.5);

        // --- Vaccination Records Details for Each Profile ---
        profileData.forEach((profile, index) => {
            const validVaccinationRecords = profile.vaccinationRecords.filter(r => r && r.vaccineName);

            const estimatedVacSectionHeight = 25 + (validVaccinationRecords.length * 30) + 10;

            if (doc.y + estimatedVacSectionHeight > doc.page.height - doc.page.margins.bottom && index > 0) {
                doc.addPage();
                currentY = doc.page.margins.top;
            }
doc.font('Helvetica-Bold').fontSize(14).text(`Vaccination Records for ${profile.newbornName}:`, { underline: true, align: 'right' });

            doc.font('Helvetica').moveDown(0.5); // Reset font after title

            if (validVaccinationRecords.length > 0) {
                const vaccinationTableHeaders = [
                    'Vaccine',
                    'Dose #',
                    'Given Date',
                    'Next Due',
                    'Status',
                    'Administered By',
                    'Role',
                    'Remarks'
                ];

                const vacTableWidth = doc.page.width - 2 * doc.page.margins.left;
                const vacColWidths = [
                    vacTableWidth * 0.15, // Vaccine
                    vacTableWidth * 0.07, // Dose #
                    vacTableWidth * 0.10, // Given Date
                    vacTableWidth * 0.10, // Next Due
                    vacTableWidth * 0.08, // Status
                    vacTableWidth * 0.15, // Administered By
                    vacTableWidth * 0.10, // Role
                    vacTableWidth * 0.25  // Remarks
                ];

                const vaccinationRecordsData = [];
                validVaccinationRecords.forEach(record => {
                    if (record.doses && record.doses.length > 0) {
                        record.doses.forEach(dose => {
                            vaccinationRecordsData.push({
                                'Vaccine': record.vaccineName || 'N/A',
                                'Dose #': dose.doseNumber || 'N/A',
                                'Given Date': dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString('en-US') : 'N/A',
                                'Next Due': dose.next_due_date ? new Date(dose.next_due_date).toLocaleDateString('en-US') : 'N/A',
                                'Status': dose.status || 'N/A',
                                'Administered By': dose.administeredByName || 'N/A',
                                'Role': dose.administeredByRole || 'N/A',
                                'Remarks': dose.remarks || 'N/A'
                            });
                        });
                    } else {
                        // If a vaccine record exists but has no doses, still show vaccine name
                        vaccinationRecordsData.push({
                            'Vaccine': record.vaccineName || 'N/A',
                            'Dose #': 'N/A',
                            'Given Date': 'N/A',
                            'Next Due': 'N/A',
                            'Status': 'N/A',
                            'Administered By': 'N/A',
                            'Role': 'N/A', // Include Role even if no doses
                            'Remarks': 'No doses recorded for this vaccine'
                        });
                    }
                });

                if (vaccinationRecordsData.length > 0) {
                    currentY = drawTable(doc, vaccinationRecordsData, vaccinationTableHeaders, doc.y, doc.page.margins.left, vacColWidths, {
                        headerFillColor: '#D8BFD8',
                        rowFillColor1: '#E6E6FA',
                        rowFillColor2: '#F0F8FF',
                        headerFontSize: 10,
                        rowFontSize: 9
                    });
                    doc.moveDown(1);
                } else {
                    doc.fontSize(11).text('No detailed vaccination dose records found for this newborn.', { align: 'left' });
                    doc.moveDown(1);
                }
            } else {
                doc.fontSize(11).text('No vaccination records found for this newborn.', { align: 'left' });
                doc.moveDown(1);
            }
        });

        // Finalize the PDF document
        doc.end();
    } catch (error) {
        console.error('Error generating profile PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        }
    }
});

