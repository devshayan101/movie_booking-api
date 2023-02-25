const router = require('express').Router();
const { signUp, signUp_verifyOtp, signIn, signIn_verifyOtp, refresh, logout } = require('../Controllers/userController');

router.route('/signup').post(signUp);
router.route('/signup/verify').post(signUp_verifyOtp);
router.route('/login').post(signIn);
router.route('/login/verify').post(signIn_verifyOtp);
router.route('/refresh').post(refresh);
router.route('/logout').get(logout);


module.exports = router;