const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');
const Lab = require('../Models/Laboratory');
const Apifeatures = require('./../Utils/ApiFeatures');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const path=require('path');
const fs = require('fs');
require('pdfkit-table');

const collectionFieldMapping = {
  RequestMaintenance: "Laboratory",
};

exports.deleteLaboratory = async (req, res) => {
  const { id: laboratoryID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(laboratoryID)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid Laboratory ID.",
    });
  }

  try {
    let preventDeletion = false;

    for (const [collectionName, fieldName] of Object.entries(collectionFieldMapping)) {
      const collection = mongoose.model(collectionName);

      const relatedDocs = await collection.find({
        [fieldName]: new mongoose.Types.ObjectId(laboratoryID),
      });

      if (collectionName === "RequestMaintenance" && relatedDocs.length > 0) {
        preventDeletion = true;
        break;
      }
    }

    if (preventDeletion) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot delete: Laboratory is still referenced in RequestMaintenance.",
      });
    }

    await Lab.findByIdAndDelete(laboratoryID);

    return res.status(200).json({
      status: "success",
      message: "Laboratory deleted successfully.",
    });
  } catch (error) {
    console.error("Delete error:", error.message);
    return res.status(500).json({
      status: "fail",
      message: "Error occurred while deleting laboratory and related documents.",
      error: error.message,
    });
  }
};



exports.createLaboratory = AsyncErrorHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.department)) {
    return res.status(400).send("Invalid department ID");
  }
  
  if (!mongoose.Types.ObjectId.isValid(req.body.Encharge)) {
    return res.status(400).send("Invalid Encharge ID");
  }
  const newLab = await Lab.create(req.body);

    const newLaboratory = await Lab.aggregate([
        {
                $match: { _id: newLab._id } // Match only the filtered Lab
            
          },
        {
            $lookup:{
                from:"users",
                localField:"Encharge",
                foreignField:"_id",
                as:"EnchargeInfo"
            }
        },
        {
            $unwind:{
                path:"$EnchargeInfo"
            }
        },
        {
            $lookup:{
                from: 'departments', // The department collection
                localField: 'department', // Field in encharge collection
                foreignField: '_id', // Field in departments collection
                as: 'DepartmentInfo' // The alias to store the joined data
            }
        },
        {
            $unwind:{
                path:"$DepartmentInfo",
                
            }
        },
        {
          $project:{
            id:1,
            RefNo:1,
            LaboratoryName:1,
            EnchargeName: {
                $concat: [
                    '$EnchargeInfo.FirstName', 
                    ' ',  // Space between names
                    { $ifNull: ['$EnchargeInfo.Middle', ''] }, 
                    ' ',  // Space before Last Name
                    '$EnchargeInfo.LastName'
                ]
            },
            department: { $ifNull: ['$DepartmentInfo.DepartmentName', ''] }
            
          }
            
        }

    ])
    res.status(200).json({
        status:'success',
        totalLaboratory:newLaboratory.length,
        data:newLaboratory
     });
});



exports.DisplayLaboratory = AsyncErrorHandler(async (req, res) => {
    const features = new Apifeatures(Lab.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
  
    const filteredLab = await features.query;
  
    const laboratory = await Lab.aggregate([
      {
        $match: {
          _id: { $in: filteredLab.map((lab) => lab._id) }, // Match only the filtered labs
        },
      },
      {
        $lookup: {
          from: "users",//collection
          localField: "Encharge",//gi declare na foreignkey sa model or ang match
          foreignField: "_id",
          as: "EnchargeInfo",
        },
      },
      {
        $unwind: {
          path: "$EnchargeInfo",
          preserveNullAndEmptyArrays: true, // Prevents dropping documents without a match
        },
      },
      {
        $lookup: {
          from: "departments", // The department collection
          localField: "department", // Field in the laboratory collection
          foreignField: "_id", // Field in departments collection
          as: "DepartmentInfo", // The alias to store the joined data
        },
      },
      {
        $unwind: {
          path: "$DepartmentInfo",
          preserveNullAndEmptyArrays: true, // Prevents dropping documents without a match
        },
      },
      {
        $project: {
          id: 1,
          RefNo: 1,
          LaboratoryName: 1,
          EnchargeName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$EnchargeInfo.FirstName", "N/A"] },
                  " ", // Space between names
                  { $ifNull: ["$EnchargeInfo.Middle", ""] },
                  " ", // Space before Last Name
                  { $ifNull: ["$EnchargeInfo.LastName", ""] },
                ],
              },
            },
          },
          EnchargeId: '$EnchargeInfo._id',
          department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
          DepartmentId: '$DepartmentInfo._id', // Include the Category ID from the joined data
          _id: 1
        },
      },
    ]);
  
    res.status(200).json({
      status: "success",
      totalLaboratory: laboratory.length,
      data: laboratory,
    });
  });



  exports.UpdateLab = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.department)) {
      return res.status(400).send("Invalid department ID");
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.body.Encharge)) {
      return res.status(400).send("Invalid Encharge ID");
    }
    // Update the laboratory
    const updatelab = await Lab.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatelab) {
        return res.status(404).json({
            status: 'fail',
            message: 'Laboratory not found'
        });
    }

    // Fetch updated laboratory with populated data
    const toolWithLaboratory = await Lab.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
        },
        {
            $lookup: {
                from: "users",
                localField: "Encharge",
                foreignField: "_id",
                as: "EnchargeInfo"
            }
        },
        { $unwind: { path: "$EnchargeInfo" } },
        {
            $lookup: {
                from: 'departments',
                localField: 'department',
                foreignField: '_id',
                as: 'DepartmentInfo'
            }
        },
        { $unwind: { path: "$DepartmentInfo" } },
        {
            $project: {
                id: 1,
                RefNo: 1,
                LaboratoryName: 1,
                EnchargeName: {
                    $concat: [
                        '$EnchargeInfo.FirstName',
                        ' ',
                        { $ifNull: ['$EnchargeInfo.Middle', ''] },
                        ' ',
                        '$EnchargeInfo.LastName'
                    ]
                },
                department: { $ifNull: ['$DepartmentInfo.DepartmentName', 'N/A'] }
            }
        }
    ]);

    if (!toolWithLaboratory.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Laboratory not found after update.'
        });
    }

    res.status(200).json({
        status: 'success',
        totalLaboratory: toolWithLaboratory.length,
        data: toolWithLaboratory[0]
    });
});


exports.getSpecificDepartment = AsyncErrorHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    return next(new CustomError('Invalid department ID', 400));
  }

  const labs = await Lab.find({ department: departmentId });

  if (!labs || labs.length === 0) {
    return next(new CustomError('No laboratory found for that department', 404));
  }

  const laboratory = await Lab.aggregate([
    {
      $match: {
        _id: { $in: labs.map((lab) => lab._id) },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'Encharge',
        foreignField: '_id',
        as: 'EnchargeInfo',
      },
    },
    {
      $unwind: {
        path: '$EnchargeInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'DepartmentInfo',
      },
    },
    {
      $unwind: {
        path: '$DepartmentInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: 1,
        LaboratoryName: 1,
        EnchargeName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ['$EnchargeInfo.FirstName', ''] },
                ' ',
                { $ifNull: ['$EnchargeInfo.Middle', ''] },
                ' ',
                { $ifNull: ['$EnchargeInfo.LastName', ''] },
              ],
            },
          },
        },
        EnchargeId: '$EnchargeInfo._id',
        department: { $ifNull: ['$DepartmentInfo.DepartmentName', 'N/A'] },
        DepartmentId: '$DepartmentInfo._id',
        _id: 1,
      },
    },
  ]);

  // PDF Generation
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 70 });

  // Set the response headers for downloading the PDF directly
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Laboratory-_Report' + Date.now() + '.pdf');

  // Pipe the PDF document directly to the response
  doc.pipe(res);

  // Header section (logo + text)
  const logoPath = path.join(__dirname, '../public/image/logo.jpg');
  if (fs.existsSync(logoPath)) {
    const logoWidth = 70;
    const centerX = (doc.page.width - logoWidth) / 2;
    doc.image(logoPath, centerX, 30, { width: logoWidth });
  }

  doc.moveDown(3);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Republic of the Philippines', { align: 'center' })
    .moveDown(0.2)
    .fontSize(10)
    .text('BILIRAN PROVINCE STATE UNIVERSITY', { align: 'center' })
    .moveDown(0.2)
    .fontSize(10)
    .text('6560 Naval, Biliran Province', { align: 'center' })
    .moveDown(2);

  // Title & Summary
  const startX = doc.page.margins.left;

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  doc.font('Helvetica-Bold').fontSize(14).text('Laboratory Report', startX, doc.y);
  doc.moveDown();
  doc.fontSize(12).text(`Department: ${laboratory[0]?.department || 'N/A'}`);
  doc.text(`Total Laboratories: ${laboratory.length}`);
  doc.text(`Date: ${generatedDate}`);
  doc.moveDown(2.5);

  // Table headers
  const tableHeaders = ['In-Charge Id','In-charge','Laboratory Name', 'Department'];
  const columnWidths = [200, 170, 160,180];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startXTable = doc.page.margins.left + (pageWidth - tableWidth) / 2;
  const rowHeight = 20;
  let currentY = doc.y;
  const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

  // Render headers
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

  // Render rows
  doc.font('Helvetica').fontSize(10);
  laboratory.forEach((lab) => {
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = 50;

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
    }

    const rowData = [
      lab.EnchargeId|| 'N/A',
      lab.EnchargeName || 'N/A',
      lab.LaboratoryName || 'N/A',
      lab.department || 'N/A'
    ];

    rowData.forEach((text, index) => {
      doc.text(text, startXTable + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
        width: columnWidths[index],
        align: 'left',
      });
    });

    currentY += rowHeight;
  });

  // Para sa vertical Line
  doc.moveTo(startXTable, currentY).lineTo(startXTable + tableWidth, currentY).stroke();
  // Footer
  doc.moveDown(1);
  const footerText = 'Generated by EPDO';
  const footerX = doc.page.margins.left;
  
  // Only show footer text, no page number
  doc.fontSize(10).text(footerText, footerX, currentY + 10, { align: 'left' });
  doc.end();
});


