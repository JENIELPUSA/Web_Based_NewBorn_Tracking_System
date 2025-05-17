const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const TypesofMaintenances = require("../Models/TypesOfMaintenace");
const Apifeatures = require("../Utils/ApiFeatures");

exports.TypesRequest = AsyncErrorHandler(async (req, res) => {
  const typesofMaintenances = await TypesofMaintenances.create(req.body);

  res.status(200).json({
    status: "success",
    data: typesofMaintenances,
  });
});


exports.DisplaySched = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(TypesofMaintenances.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  displaySched = await features.query;

  res.status(200).json({
    status: "success",
    data: displaySched,
  });
});


exports.UpdateSched =AsyncErrorHandler(async (req,res,next) =>{
    const updateSchedule=await TypesofMaintenances.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
        updateSchedule
        
     }); 
  })

    exports.deleteSched = AsyncErrorHandler(async(req,res,next)=>{
      await TypesofMaintenances.findByIdAndDelete(req.params.id)
  
      res.status(200).json({
          status:'success',
          data:null
       });
    })

