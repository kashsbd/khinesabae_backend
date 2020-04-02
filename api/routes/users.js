const express = require('express');
const router = express.Router();
const checkAuth = require("../middlewares/check-auth");

const UserController = require('../controllers/users');

router.get('/test', UserController.test);

router.post('/signup', UserController.user_signup);

router.post('/login', UserController.user_login);

router.get('/', checkAuth, UserController.get_all_users);

router.post('/delete', checkAuth, UserController.delete_user);

router.post('/update', checkAuth, UserController.update_user);

router.post('/send_mail', UserController.send_mail);

module.exports = router;