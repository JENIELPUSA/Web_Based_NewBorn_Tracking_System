const express = require('express');
const router = express.Router();//express router
const userController = require('./../Controller/userController')
const authController = require('./../Controller/authController')
const upload = require('../Controller/middleware/imageUploader');
router.route('/')
    .get(userController.DisplayAll)
    .post(authController.protect,userController.createUser)
router.route('/:id')
    .delete(authController.protect,userController.deleteUser)
    .patch(authController.protect,userController.Updateuser)
    .get(authController.protect,userController.Getiduser)
router.route('/updatePassword').patch(
        authController.protect,
        userController.updatePassword
)

router.route('/Profile/:id')
    .get(authController.protect,userController.DisplayProfile)
router.route('/ProfilePicture/:id')
    .patch(authController.protect,upload.single("avatar"),userController.updateUserProfile)
    
module.exports=router
