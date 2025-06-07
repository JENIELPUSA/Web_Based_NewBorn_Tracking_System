const express = require("express");
const router = express.Router(); //express router
const GetVacineController = require("../Controller/VaccineController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, GetVacineController.createNewRecord)
  .get(authController.protect, GetVacineController.DisplayAllData)
router
.route("/:id")
.patch(authController.protect,GetVacineController.UpdateVaccine)
.delete(authController.protect,GetVacineController.deleteVaccine)
router
  .route("/VaccineReports")
  .get(authController.protect, GetVacineController.getReportsVaccine)

module.exports=router;
