const express = require('express');
const router = express.Router();//express router
const departmentsController = require('./../Controller/departmentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,authController.restrict('Admin'),departmentsController.createdepartment)
    .get(authController.protect,departmentsController.DisplayDepartment)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),departmentsController.Updatedepartment)
    .delete(authController.protect,authController.restrict('Admin'),departmentsController.deletedepartment)
    .get(authController.protect,authController.restrict('Admin'),departmentsController.getDepartment)

module.exports=router