const express = require('express');
const router = express.Router();//express router
const BrandControler=require('./../Controller/BrandController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,authController.restrict('Admin'),BrandControler.createBrand)
    .get(authController.protect,BrandControler.DisplayBrand)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),BrandControler.Updatebrand)
    .delete(authController.protect,authController.restrict('Admin'),BrandControler.deletebrand)


module.exports=router