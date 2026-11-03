const express = require('express');
const multer = require('multer');

const router = express.Router();
//seadistame multer vahevara (middleware) failide üleslaadimiseks
//määran üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
const {
    galleryPhotoUpload,
    galleryPhotoUploadPost
} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload).post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;