const express = require('express');
const router = express.Router();//express router
const NotificationController=require('./../Controller/NotificationController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,NotificationController.createNotification)
    .get(authController.protect,NotificationController.DisplayNotification)


module.exports=router