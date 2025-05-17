const mongoose = require('mongoose')

const LaboratorySchema = new mongoose.Schema({
    LaboratoryName:{
        type:String,
        required:[true,'Please input a LaboratoryName !'],
        unique:true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',  // Reference to the Department model
        required: true
      },
      Encharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the 
      
        unique:true
      }, 
})

const Laboratory = mongoose.model('Laboratory',LaboratorySchema)

module.exports = Laboratory