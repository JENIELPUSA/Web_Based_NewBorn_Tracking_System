const express = require('express');
const router = express.Router();//express router
const PDFcontroller=require('../Controller/PDFcontroller')
const authController = require('./../Controller/authController')
router.route('/')
.post(authController.protect,PDFcontroller.GeneratePDF)
router.route('/download')
.get(authController.protect,PDFcontroller.DownloadPDF)
module.exports=router