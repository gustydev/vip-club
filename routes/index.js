const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const User = require('../models/user')

router.get('/', indexController.index);

router.get('/sign-up', indexController.signUpGet)
router.post('/sign-up', indexController.signUpPost)

router.get('/login', indexController.loginGet)
router.post('/login', indexController.loginPost)

router.get('/logout', indexController.logout)

module.exports = router;