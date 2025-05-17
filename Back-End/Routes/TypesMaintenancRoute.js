const express = require("express");
const router = express.Router(); //express router
const TypesofMaintenances = require("../Controller/TypesMaintenances");
const authController = require("../Controller/authController")
router
  .route("/")
  .post(authController.protect,TypesofMaintenances.TypesRequest)
  .get(authController.protect,TypesofMaintenances.DisplaySched)
router.route("/:id")
.patch(authController.protect,TypesofMaintenances.UpdateSched)
.delete(authController.protect,TypesofMaintenances.deleteSched)

module.exports = router;
