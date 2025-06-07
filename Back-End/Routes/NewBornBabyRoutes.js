const express = require("express");
const router = express.Router(); //express router
const GetbabyController = require("../Controller/NewBornBabyController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .get(authController.protect, GetbabyController.DisplayAllData)
  .get(authController.protect, GetbabyController.DisplayGraph)
  .post(authController.protect, GetbabyController.createNewRecord);
router
.route("/:id")
  .delete(authController.protect, GetbabyController.deletedSpecificData)
  .patch(authController.protect, GetbabyController.UpdateBabyData)

router
  .route("/DisplayGraph")
  .get(authController.protect, GetbabyController.DisplayGraph)
router
.route("/GetBabyReport")
.get(authController.protect, GetbabyController.getReportsNewborn)
module.exports = router;
