const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

router.get('/', indexController.index);

router.get('/sign-up', indexController.signUpGet)
router.post('/sign-up', indexController.signUpPost)

module.exports = router;