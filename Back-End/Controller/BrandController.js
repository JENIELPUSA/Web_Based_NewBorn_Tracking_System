const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const brand = require('./../Models/BrandModel');
const Apifeatures = require('./../Utils/ApiFeatures');
const Brand = require('./../Models/VaccineModel')


exports.createBrand=AsyncErrorHandler(async(req,res) => {
    const branded = await brand.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            branded
    })

})

exports.DisplayBrand = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(brand.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    const branded = await features.query;


    res.status(200).json({
        status:'success',
        data:branded
    })

})


exports.Updatebrand =AsyncErrorHandler(async (req,res,next) =>{
    const updatebrand=await brand.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updatebrand
        
     }); 
  })

  exports.deletebrand = AsyncErrorHandler(async(req,res,next)=>{

      const hasBrand = await Brand.exists({ brand: req.params.id });
    
      if (hasBrand) {
        return res.status(400).json({
          status: "fail",
          message: "Cannot delete Brand: there are existing related records.",
        });
      }
    await brand.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })
