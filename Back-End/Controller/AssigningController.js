
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const assign = require('./../Models/AssigningEquipment');
const CustomError = require('./../Utils/CustomError');
const Apifeatures = require('./../Utils/ApiFeatures');
const mongoose = require('mongoose');
const Department = require('../Models/Departmentmodel');
const Equipment = require('../Models/Equipment');



exports.AssignEquipment = AsyncErrorHandler(async (req, res) => {
    // Create the AssignEquipment document
    const Assign = await assign.create(req.body);  // Use 'Assign' model with the pre-save hook

    // Send a success response after the document is created and saved
    res.status(201).json({
        status: 'success',
        data: Assign
    });
});

exports.displayAssign = AsyncErrorHandler(async (req, res) => {
  // Apply API features (filter, sort, limit, paginate) using the query
  const features = new Apifeatures(assign.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Fetch filtered and paginated results
  const filterAssign = await features.query;

  // Aggregation pipeline to join other collections with the filtered assignments
  const assigns = await assign.aggregate([
    {
      $match: {
        _id: { $in: filterAssign.map((tool) => tool._id) }
      }
    },
    // Left join 'laboratories' collection
    {
      $lookup: {
        from: 'laboratories',
        localField: 'Laboratory',
        foreignField: '_id',
        as: 'LaboratoryInfo'
      }
    },
    {
      $unwind: {
        path: '$LaboratoryInfo',
        preserveNullAndEmptyArrays: true // Left join behavior
      }
    },
    // Left join 'users' collection (Encharge)
    {
      $lookup: {
        from: 'users',
        localField: 'LaboratoryInfo.Encharge',
        foreignField: '_id',
        as: 'EnchargeInfo'
      }
    },
    {
      $unwind: {
        path: '$EnchargeInfo',
        preserveNullAndEmptyArrays: true // Left join behavior
      }
    },
    // Left join 'departments' collection
    {
      $lookup: {
        from: 'departments',
        localField: 'LaboratoryInfo.department',
        foreignField: '_id',
        as: 'DepartmentInfo'
      }
    },
    {
      $unwind: {
        path: '$DepartmentInfo',
        preserveNullAndEmptyArrays: true // Left join behavior
      }
    },
    // Left join 'equipment' collection
    {
      $lookup: {
        from: 'equipment',
        localField: 'Equipments',
        foreignField: '_id',
        as: 'EquipmentsInfo'
      }
    },
    {
      $unwind: {
        path: '$EquipmentsInfo',
        preserveNullAndEmptyArrays: true // Left join behavior
      }
    },
    // Left join 'categories' collection
    {
      $lookup: {
        from: 'categories',
        localField: 'EquipmentsInfo.Category',
        foreignField: '_id',
        as: 'CategoryInfo'
      }
    },
    {
      $unwind: {
        path: '$CategoryInfo',
        preserveNullAndEmptyArrays: true // Left join behavior
      }
    },
    // Group by LaboratoryName to remove duplicates
    {
      $group: {
        _id: '$LaboratoryInfo.LaboratoryName',
        assignCount: { $sum: 1 },
        assignLabId: { $first: '$_id' },
        laboratoryId: { $first: '$LaboratoryInfo._id' },
        departmentId: { $first: '$DepartmentInfo._id' },
        enchargeId: { $first: '$EnchargeInfo._id' },
        encharge: { $first: '$EnchargeInfo' },
        departmentName: { $first: '$DepartmentInfo.DepartmentName' },
        equipments: {
          $addToSet: {
            $mergeObjects: [
              '$EquipmentsInfo',
              { categoryName: '$CategoryInfo.CategoryName' },
            ],
          }
        },
        categories: { $addToSet: '$CategoryInfo.CategoryName' }
      }
    },
    {
      $project: {
        _id: 1,
        assignCount: 1,
        assignLabId: 1,
        laboratoryId: 1,
        departmentId: 1,
        laboratoryName: '$_id',
        encharge: {
          $concat: [
            '$encharge.FirstName', ' ',
            { $ifNull: ['$encharge.Middle', ''] }, ' ',
            '$encharge.LastName'
          ]
        },
        departmentName: 1,
        equipments: 1,
        enchargeId: 1,
        equipmentsCount: {
          $size: { $ifNull: ['$equipments', []] }
        }
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: assigns
  });
});


exports.UpdateEquipments = AsyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid ID format' });
  }

  // Find the existing assignment to check its status
  const existingAssignment = await assign.findById(id);
  if (!existingAssignment) {
      return res.status(404).json({
          status: 'fail',
          message: 'Laboratory not found',
      });
  }

  // Check if the status is "Available" and update to "Not Available"
  if (existingAssignment.Status === 'Available') {
      req.body.Status = 'Not Available'; // Force update the status to "Not Available"
  } else if (existingAssignment.Status === 'Not Available') {
    req.body.Status = 'Available'; // Force update the status to "Not Available"
}

  // Update the assignment
  const updateResult = await assign.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
  });

  if (!updateResult) {
      return res.status(404).json({
          status: 'fail',
          message: 'Laboratory not found after update',
      });
  }

  // Use an aggregation pipeline to perform the lookups
  const AssignEquipment = await assign.aggregate([
      {
          $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      // Lookup for Laboratory -> Encharge -> department
      {
          $lookup: {
              from: 'laboratories',
              localField: 'Laboratory',
              foreignField: '_id',
              as: 'LaboratoryData',
          },
      },
      { $unwind: { path: '$LaboratoryData', preserveNullAndEmptyArrays: true } },
      {
          $lookup: {
              from: 'encharges',
              localField: 'LaboratoryData.Encharge',
              foreignField: '_id',
              as: 'LaboratoryData.Encharge',
          },
      },
      { $unwind: { path: '$LaboratoryData.Encharge', preserveNullAndEmptyArrays: true } },
      {
          $lookup: {
              from: 'departments',
              localField: 'LaboratoryData.Encharge.department',
              foreignField: '_id',
              as: 'LaboratoryData.Encharge.department',
          },
      },
      { $unwind: { path: '$LaboratoryData.Encharge.department', preserveNullAndEmptyArrays: true } },

      // Lookup for Equipments -> Category
      {
          $lookup: {
              from: 'equipments',
              localField: 'Equipments',
              foreignField: '_id',
              as: 'EquipmentsData',
          },
      },
      {
          $unwind: { path: '$EquipmentsData', preserveNullAndEmptyArrays: true },
      },
      {
          $lookup: {
              from: 'categories',
              localField: 'EquipmentsData.Category',
              foreignField: '_id',
              as: 'EquipmentsData.Category',
          },
      },
      { $unwind: { path: '$EquipmentsData.Category', preserveNullAndEmptyArrays: true } },

      // Group back Equipments with categories (if needed)
      {
          $group: {
              _id: '$_id',
              Laboratory: { $first: '$LaboratoryData' },
              Equipments: { $push: '$EquipmentsData' },
              otherFields: { $first: '$$ROOT' }, // Preserve other fields
          },
      },
      // Add the rest of the fields back to the root object
      {
          $addFields: {
              Laboratory: '$Laboratory',
              Equipments: '$Equipments',
          },
      },
      { $unset: ['otherFields._id'] }, // Optional: Remove unnecessary fields
  ]);

  if (!AssignEquipment || AssignEquipment.length === 0) {
      return res.status(404).json({
          status: 'fail',
          message: 'Laboratory not found after update.',
      });
  }

  // Return the first matched document
  res.status(200).json({
      status: 'success',
      totalLaboratory: AssignEquipment.length,
      data: AssignEquipment[0],
  });
});



exports.deleteAssign = AsyncErrorHandler(async(req,res)=>{
     await assign.findByIdAndDelete(req.params.id)
    res.status(201).json({
        status: 'success',
        data: {
            message: `This Data successfully Deleted!`
        }
    });
})

exports.getAssignmentsByLaboratoryName = AsyncErrorHandler(async (req, res) => {
    const laboratoryName = req.params.LaboratoryName; // Get laboratory name from the request parameters
    
    // Use Apifeatures to filter, sort, limit, and paginate the data
    const features = new Apifeatures(assign.find(), req.query)
                                  .filter()         // Apply filters
                                  .sort()           // Apply sorting
                                  .limitFields()    // Limit fields in response
                                  .paginate();      // Apply pagination
    
    let displayuser = await features.query;  // Execute the query after applying all features

    const AssignEquipment = await assign.aggregate([
        // First lookup: Join 'laboratories' collection
        {
            $lookup: {
                from: 'laboratories',  // The collection you are joining
                localField: 'Laboratory',  // Field in assign collection
                foreignField: '_id',  // Field in laboratories collection
                as: 'LaboratoryInfo'  // The alias to store the joined data
            }
        },
        {
            $unwind: {
                path: '$LaboratoryInfo',
                preserveNullAndEmptyArrays: true  // In case there are no laboratory matches
            }
        },
        // Filter by Laboratory name (case-insensitive)
        {
            $match: {
                'LaboratoryInfo.LaboratoryName': { $regex: new RegExp(laboratoryName, 'i') }
            }
        },
        // Second lookup: Join 'users' collection (Encharge)
        {
            $lookup: {
                from: 'users',  // The users collection
                localField: 'LaboratoryInfo.Encharge',  // Field in laboratories collection (foreign key)
                foreignField: '_id',  // Field in users collection
                as: 'EnchargeInfo'  // The alias to store the joined data
            }
        },
        {
            $unwind: {
                path: '$EnchargeInfo',
                preserveNullAndEmptyArrays: true  // If no encharge, preserve the record
            }
        },
        // Third lookup: Join 'departments' collection
        {
            $lookup: {
                from: 'departments',  // The department collection
                localField: 'LaboratoryInfo.department',  // Field in laboratories collection
                foreignField: '_id',  // Field in departments collection
                as: 'DepartmentInfo'  // The alias to store the joined data
            }
        },
        {
            $unwind: {
                path: '$DepartmentInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        // Fourth lookup: Join 'equipment' collection
        {
            $lookup: {
                from: 'equipment',  // The equipment collection
                localField: 'Equipments',  // Field in assign collection (array)
                foreignField: '_id',  // Field in equipment collection
                as: 'EquipmentsInfo'  // The alias to store the joined data
            }
        },
        {
            $unwind: {
                path: '$EquipmentsInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        // Fifth lookup: Join 'categories' collection
        {
            $lookup: {
                from: 'categories',  // The category collection
                localField: 'EquipmentsInfo.Category',  // Field in equipment collection
                foreignField: '_id',  // Field in category collection
                as: 'CategoryInfo'  // The alias to store the joined data
            }
        },
        {
            $unwind: {
                path: '$CategoryInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        // Project only the fields you want to return
        {
            $project: {
                _id: 1,
                RefNo: 1,
                'LaboratoryInfo.LaboratoryName': 1,
                'EnchargeInfo.EnchargeName': {
                    $concat: [
                        '$EnchargeInfo.FirstName', ' ',  // First Name
                        { $ifNull: ['$EnchargeInfo.Middle', ''] }, ' ', // Optional Middle Name
                        '$EnchargeInfo.LastName' // Last Name
                    ]
                },
                'DepartmentInfo.DepartmentName': 1,
                'EquipmentsInfo.Brand': 1,
                'EquipmentsInfo.SerialNumber': 1,
                'EquipmentsInfo.Specification': 1,
                'CategoryInfo.CategoryName': 1
            }
        }
    ]);

    // Check if no assignments are found
    if (!AssignEquipment.length) {
        return res.status(404).json({ message: 'No assignments found for the specified laboratory.' });
    }

    // Return the filtered assignments with related information
    createSendResponse(AssignEquipment, 200, res);
});



exports.GetidAssign =AsyncErrorHandler(async (req,res,next) =>{

    const Assigk = await assign.findById(req.params.id);
    if(!Assigk){
       const error = new CustomError('User with the ID is not found',404); 
       return next(error);
    }
    res.status(200).json({
       status:'Success',
       data:Assigk
    }); 
 })


exports.AssignRemove = AsyncErrorHandler(async (req, res) => {
  // 1st Validation: Check if assignId and equipmentId are provided and valid ObjectIds
  const { assignId, equipmentId } = req.query;

  if (!assignId || !equipmentId) {
    return res.status(400).json({
      status: 'fail',
      message: 'AssignId and EquipmentId must be provided.',
    });
  }

  // Validate if assignId and equipmentId are valid MongoDB ObjectIds
  if (!mongoose.Types.ObjectId.isValid(assignId) || !mongoose.Types.ObjectId.isValid(equipmentId)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid AssignId or EquipmentId format.',
    });
  }

  // Convert assignId and equipmentId to ObjectId
  const assignObjectId = mongoose.Types.ObjectId(assignId);
  const equipmentObjectId = mongoose.Types.ObjectId(equipmentId);

  // 2nd Validation: Check if the assignId exists in the database and contains the equipmentId
  const assignment = await assign.findById(assignObjectId);

  if (!assignment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Assignment with the provided assignId not found.',
    });
  }

  // Check if the equipmentId is part of the assignment's Equipments array
  const equipmentExists = assignment.Equipments.some(
    (equipment) => equipment.toString() === equipmentObjectId.toString()
  );

  if (!equipmentExists) {
    return res.status(404).json({
      status: 'fail',
      message: 'Equipment with the provided equipmentId not found in this assignment.',
    });
  }

  // Remove the equipment from the Equipments array
  assignment.Equipments = assignment.Equipments.filter(
    (equipment) => equipment.toString() !== equipmentObjectId.toString()
  );

  // Save the updated assignment back to the database
  await assignment.save();

  res.status(200).json({
    status: 'success',
    message: 'Equipment removed successfully from the assignment.',
  });
});



 

  















