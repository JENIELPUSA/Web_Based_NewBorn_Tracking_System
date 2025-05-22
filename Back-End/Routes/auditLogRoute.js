const express = require('express');
const router = express.Router();//express router
const auditLogController=require('./../Controller/auditLogController')
const authController = require('./../Controller/authController')

router.route('/')
.post(authController.protect,auditLogController.createAuditLog)
.get(authController.protect,auditLogController.getAllAuditLogs)



module.exports=router