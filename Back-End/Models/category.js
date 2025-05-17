const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    CategoryName:{
        type:String,
        required:[true,'Please input a Category Name !'],
        unique:true
    }
})

const Category = mongoose.model('Category',categorySchema)

module.exports = Category