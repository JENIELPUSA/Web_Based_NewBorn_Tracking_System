const express = require("express");
const router = express.Router(); //express router
const IncmngController = require("./../Controller/IncomingRequestController");
const authController = require("./../Controller/authController");
router
  .route("/")
  .post(authController.protect,IncmngController.IncomingData)
  .get(authController.protect,IncmngController.displayIncomingRequest)
  router.route("/:id")
  .delete(authController.protect,IncmngController.deletedIncoming)

module.exports = router;
