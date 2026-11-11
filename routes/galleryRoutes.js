const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryControllers');
const checkLogin = require('../src/checkLogin');

router.use(checkLogin.isLogin);
router.get('/', galleryController.getGallery);

module.exports = router;