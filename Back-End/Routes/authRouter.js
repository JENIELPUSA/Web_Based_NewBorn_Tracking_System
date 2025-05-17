const express = require('express');
const authController = require('../Controller/authController');
const router = express.Router();
const Dash = require('../Controller/Dashboard')

router.route('/signup')
.post(authController.signup);

router.route('/login')
.post(authController.login);

router.route('/forgotPassword').post(
    authController.forgotPassword
);
router.route('/resetPassword/:token')
.patch(authController.resetPassword)

router.route('/dashboard')
.get(Dash.dashboard)



module.exports = router;
