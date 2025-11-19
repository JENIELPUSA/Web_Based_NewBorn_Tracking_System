const express = require("express");
const router = express.Router(); //express router
const ProfillingController = require("./../Controller/ProfillingController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, ProfillingController.createProfile)
  .get(authController.protect, ProfillingController.DisplayProfile);

router
  .route("/:id")
  .patch(authController.protect, ProfillingController.UpdateProfilling)
  .delete(authController.protect, ProfillingController.deleteProfilling);
router
  .route("/SpecificProfilling")
  .get(authController.protect, ProfillingController.getSpecificProfilling);

router
  .route("/GetChildData")
  .get(ProfillingController.GetChildData);

module.exports = router;
