const express = require('express');
const router = express.Router();//express router
const AssignController = require('./../Controller/AssigningController')
const authController = require('./../Controller/authController')


router.route('/')
    .post(authController.protect,authController.restrict('Admin'),AssignController.AssignEquipment)
    .get(authController.protect,AssignController.displayAssign)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),AssignController.UpdateEquipments)
    .delete(authController.protect,authController.restrict('Admin'),AssignController.deleteAssign)
    .get(authController.protect,authController.restrict('Admin'),AssignController.GetidAssign)
    
 router.route('/laboratory/:LaboratoryName') // Siguraduhing may leading slash
    .get(authController.protect,authController.restrict('Admin'),AssignController.getAssignmentsByLaboratoryName)
    
module.exports=router