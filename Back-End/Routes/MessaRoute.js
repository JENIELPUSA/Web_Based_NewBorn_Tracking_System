const express = require("express");
const router = express.Router(); //express router
const MsgController = require("../Controller/MessageController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, MsgController.AddMessage)

  .get(authController.protect, MsgController.DisplayMessage)
  .patch(authController.protect, MsgController.UpdateAllStatus);

router.route("/:id").patch(MsgController.UpdateSendMSG);

router
  .route("/emailSend")
  .post(authController.protect, MsgController.EmailNotification);

module.exports = router;
