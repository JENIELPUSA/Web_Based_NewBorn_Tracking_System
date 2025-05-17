const express = require('express');
const router = express.Router();//express router
const CategoryController = require('../Controller/CategoryController')
const authController = require('../Controller/authController')


router.route('/')
    .post(authController.protect,authController.restrict('Admin'),CategoryController.createcategory)
    .get(authController.protect,CategoryController.displayCategory)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),CategoryController.UpdateCategory)
    .delete(authController.protect,authController.restrict('Admin'),CategoryController.deleteCategory)





module.exports=router