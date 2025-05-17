const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const UnreadIcomingRequest=require('../Models/UnreadIncomingMaintenance')
const Apifeatures = require('../Utils/ApiFeatures');
const user=require('../Models/usermodel')


exports.IncomingData = AsyncErrorHandler(async (req, res) => {
      const { Equipments } = req.body;
    
      // Convert Equipments to ObjectId if it's in string form
      const equipmentId =new mongoose.Types.ObjectId(Equipments); // Assuming only 1 equipment is passed
    
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
      // Check if a request for the same equipment exists within the last 24 hours
      const existing = await UnreadIcomingRequest.findOne({
        Equipments: equipmentId,
        createdAt: { $gte: twentyFourHoursAgo }
      });

    
    
      if (existing) {
        return res.status(400).json({
          status: "fail",
          message: "Duplicate request: This equipment already has a maintenance request in the last 24 hours."
        });
      }
    const Incoming = await UnreadIcomingRequest.create(req.body);  // Use 'Assign' model with the pre-save hook

    // Send a success response after the document is created and saved
    res.status(201).json({
        status: 'success',
        data: Incoming
    });
});

exports.displayIncomingRequest = AsyncErrorHandler(async(req,res)=>{

    const features = new Apifeatures(UnreadIcomingRequest.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    displayrequest = await features.query;

    res.status(200).json({
        status:'success',
        data:displayrequest
    })

})


  exports.deletedIncoming = AsyncErrorHandler(async(req,res,next)=>{
    await UnreadIcomingRequest.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })




