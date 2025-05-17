const mongoose = require('mongoose')

const DepartmentSchema = new mongoose.Schema({
    DepartmentName:{
        type:String,
        required:[true,'Please input Department Name !'],
        unique: true
    }
})



DepartmentSchema.set('toJSON', { virtuals: true });
DepartmentSchema.set('toObject', { virtuals: true });

DepartmentSchema.set('toJSON', {
    virtuals: true, // Include virtuals
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.id;
      return ret;
    }
  });


const Department = mongoose.model('Department', DepartmentSchema);

module.exports = Department;