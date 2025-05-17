
const { findByIdAndUpdate } = require('../Models/usermodel');
const Apifeatures = require('../Utils/ApiFeatures');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const category = require('./../Models/category');


exports.createcategory=AsyncErrorHandler(async(req,res) => {
    const addcategory = await category.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            addcategory
        
    })

})

exports.displayCategory = AsyncErrorHandler(async(req,res)=>{

    const features = new Apifeatures(category.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    displaycategories = await features.query;

    res.status(200).json({
        status:'success',
        totalCategory:displaycategories.lenght,
        data:displaycategories
        
    })

})



exports.UpdateCategory = AsyncErrorHandler(async(req,res)=>{
    const updatecategory = await category.findByIdAndUpdate(req.params.id,req.body,{new:true})

    if(!updatecategory){
        const error = new CustomError('User with the ID is not found',404); 
        return next(error); 
    }

    res.status(201).json({
        status:'success',
        data:
            updatecategory
        
    })
})

exports.deleteCategory = AsyncErrorHandler(async(req,res)=>{

    const deleteCategorys = await category.findByIdAndDelete(req.params.id)
    
    if(!deleteCategorys){
        const error = new CustomError('User with the ID is not found',404); 
        return next(error); 
    }

    res.status(201).json({
        status:'success',
        data:{
            deleteCategorys:null
        }
    })
})

