const assign = require('../Models/AssigningEquipment');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Lab = require('../Models/Laboratory');

// Function to fetch laboratories
const fetchLaboratories = async () => {
    return Lab.aggregate([
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
                'EnchargeInfo.EnchargeName': {
                    $concat: [
                        '$EnchargeInfo.FirstName', ' ',
                        { $ifNull: ['$EnchargeInfo.Middle', ''] }, ' ',
                        '$EnchargeInfo.LastName'
                    ]
                },
                'DepartmentInfo.department': 1,
                'DepartmentInfo.RefNo': 1,
                'DepartmentInfo.DepartmentName': 1
            }
        }
    ]);
};

// Function to fetch equipment assignments by laboratory names
const fetchAssignmentsByLaboratoryName = async (laboratory) => {
    return assign.aggregate([
        {
            $lookup: {
                from: 'laboratories',
                localField: 'Laboratory',
                foreignField: '_id',
                as: 'LaboratoryInfo'
            }
        },
        { $unwind: { path: '$LaboratoryInfo', preserveNullAndEmptyArrays: true } },
        {
            $match: {
                'LaboratoryInfo.LaboratoryName': { $regex: new RegExp(laboratory, 'i') }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'LaboratoryInfo.Encharge',
                foreignField: '_id',
                as: 'EnchargeInfo'
            }
        },
        { $unwind: { path: '$EnchargeInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'departments',
                localField: 'LaboratoryInfo.department',
                foreignField: '_id',
                as: 'DepartmentInfo'
            }
        },
        { $unwind: { path: '$DepartmentInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'equipment',
                localField: 'Equipments',
                foreignField: '_id',
                as: 'EquipmentsInfo'
            }
        },
        { $unwind: { path: '$EquipmentsInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'EquipmentsInfo.Category',
                foreignField: '_id',
                as: 'CategoryInfo'
            }
        },
        { $unwind: { path: '$CategoryInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                RefNo: 1,
                'EquipmentsInfo.Brand': 1,
                'EquipmentsInfo.SerialNumber': 1,
                'EquipmentsInfo.Specification': 1,
                'CategoryInfo.CategoryName': 1
            }
        }
    ]);
};

// Main dashboard function
exports.dashboard = AsyncErrorHandler(async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const { FirstName, Middle, LastName } = req.session.user;
    const fullName = `${FirstName} ${Middle} ${LastName}`;

    // Fetch laboratories
    const laboratories = await fetchLaboratories();
    const matchingLabs = laboratories.filter(lab => lab.EnchargeInfo.EnchargeName === fullName);

    // Handle response based on matching labs
    if (matchingLabs.length > 0) {
        const laboratoryNames = matchingLabs.map(lab => lab.LaboratoryName).join(', ');
        const AssignEquipment = await fetchAssignmentsByLaboratoryName(laboratoryNames);

        // Check if no assignments are found
        if (!AssignEquipment.length) {
            return res.status(404).json({ message: 'No assignments found for the specified laboratory.' });
        }

        return res.status(200).json({
            status: 'success',
            data: { AssignEquipment }
        });
    } else {
        return res.send(`Welcome back, ${fullName}! You are not in charge of any laboratories.`);
    }
});
