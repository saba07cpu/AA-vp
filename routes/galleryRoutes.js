const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryControllers');

router.get('/', galleryController.getGallery);

module.exports = router;