const express = require("express");
const router = express.Router(); //express router
const RecordController=require('../Controller/VaccinationRecordController')
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, RecordController.createNewRecord)
  .get(RecordController.DisplayVaccinationRecord)
// routes/vaccinationRecord.js
router
  .route("/:recordId/doses/:doseId")  // Now includes doseId
  .patch(
    authController.protect,
    RecordController.UpdateRecord
  )
  .delete(authController.protect,RecordController.deleteRecord)

module.exports = router;
