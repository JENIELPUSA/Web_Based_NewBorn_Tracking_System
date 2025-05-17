const { findById } = require('../Models/usermodel');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const department = require('./../Models/Departmentmodel');
const Apifeatures = require('./../Utils/ApiFeatures');


exports.createdepartment=AsyncErrorHandler(async(req,res) => {
    const departments = await department.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            departments
        
    })

})

exports.DisplayDepartment = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(department.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    displaydepartment = await features.query;


    res.status(200).json({
        status:'success',
        totalDepartment:displaydepartment.lenght,
        data:displaydepartment
    })

})

exports.Updatedepartment =AsyncErrorHandler(async (req,res,next) =>{
    const updatedepartment=await department.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updatedepartment
        
     }); 
  })

  exports.deletedepartment = AsyncErrorHandler(async(req,res,next)=>{
    await department.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })

  exports.getDepartment = AsyncErrorHandler(async(req,res,next)=>{
    const dep = await department.findById(req.params.id)

    if(!dep){
        const error = new CustomError('User with the ID is not found',404); 
        return next(error); 
    }

    res.status(200).json({
        status:'success',
        data:{
            dep
        } 
     });

  })
  