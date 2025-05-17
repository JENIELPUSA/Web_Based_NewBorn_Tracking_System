const express = require("express");
const router = express.Router(); //express router
const EquipmentController = require("./../Controller/EquipmentController");
const authController = require("./../Controller/authController");
router
  .route('/getEquipment')
  .get(
    authController.protect,
    EquipmentController.getSpecificEquipment
  );
router
  .route("/")
  .post(
    authController.protect,
    authController.restrict("Admin"),
    EquipmentController.createtool
  )
  .get(authController.protect, EquipmentController.Displaytool);
router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrict("Admin"),
    EquipmentController.Updatetool
  )
  .delete(
    authController.protect,
    authController.restrict("Admin"),
    EquipmentController.deletetool
  )
  .get(
    authController.protect,
    authController.restrict("Admin"),
    EquipmentController.Getidequip
  );

  router
  .route("/delete/:equipmentID")
  .delete(
    authController.protect,
    authController.restrict("Admin"),
    EquipmentController.deleteEquipmentAndRelated // This is the new method
  );

  router
  .route("/Releted/:equipmentID")
  .delete(
    authController.protect,
    authController.restrict("Admin"),
    EquipmentController.RemoverelatedData // This is the new method
  );


module.exports = router;
