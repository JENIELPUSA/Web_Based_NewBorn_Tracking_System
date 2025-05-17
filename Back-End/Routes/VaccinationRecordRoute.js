const express = require("express");
const router = express.Router(); //express router
const RecordController=require('../Controller/VaccinationRecordController')
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, RecordController.createNewRecord)
  .get(authController.protect,RecordController.DisplayVaccinationRecord)
router
  .route("/:id")
  .patch(authController.protect, RecordController.UpdateRecord)
  .delete(authController.protect,RecordController.deleteRecord)

module.exports = router;
