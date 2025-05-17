const express = require("express");
const router = express.Router(); //express router
const GetbabyController = require("../Controller/NewBornBabyController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .get(authController.protect, GetbabyController.DisplayAllData)
  .post(authController.protect, GetbabyController.createNewRecord);
router
.route("/:id")
  .delete(authController.protect, GetbabyController.deletedSpecificData)
  .patch(authController.protect, GetbabyController.UpdateBabyData)
module.exports = router;
