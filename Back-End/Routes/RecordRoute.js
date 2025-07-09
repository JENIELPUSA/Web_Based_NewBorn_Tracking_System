const express = require('express');
const router = express.Router();//express router
const RecordController=require('./../Controller/CheckUpRecord')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,RecordController.createCheckup)
router.route('/latest/:newbornId')
    .get(RecordController.displayLatestCheckup)

router.route('/AllRelated/:newbornId')
    .get(authController.protect,RecordController.displayAllCheckups)
router.route('/:id')
    .delete(authController.protect,RecordController.deleteCheckup)
    .patch(authController.protect,RecordController.updateCheckup)


module.exports=router