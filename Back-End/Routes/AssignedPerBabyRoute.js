const express = require('express');
const router = express.Router();//express router
const AssignVaccinePerBaby=require('../Controller/AssignVaccinePerBaby')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,AssignVaccinePerBaby.createPerAssigned)
    .get(authController.protect,AssignVaccinePerBaby.displayAssignedVaccines)

router.route('/:id')
    .delete(authController.protect,AssignVaccinePerBaby.DeleteAssignVaccines)
    .patch(authController.protect,AssignVaccinePerBaby.UpdateAssignVaccine)


module.exports=router