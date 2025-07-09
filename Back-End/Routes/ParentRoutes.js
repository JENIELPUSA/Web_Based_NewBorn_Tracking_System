const express = require('express');
const router = express.Router();//express router
const ParentController=require('./../Controller/ParentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,ParentController.createParent)
    .get(authController.protect,ParentController.DisplayParent)

router.route('/:id')
    .patch(authController.protect,ParentController.UpdateParent)
    .delete(authController.protect,ParentController.deleteParent)


module.exports=router