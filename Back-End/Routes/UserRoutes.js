const express = require('express');
const router = express.Router();//express router
const userController = require('./../Controller/userController')
const authController = require('./../Controller/authController')

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
    
module.exports=router
