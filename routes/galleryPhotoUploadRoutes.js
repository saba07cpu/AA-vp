const express = require('express');
const multer = require('multer');
const checkLogin = require('../src/checkLogin');
const router = express.Router();
router.use(checkLogin.isLogin);
//seadistame multer vahevara (middleware) failide üleslaadimiseks
//määran üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
const {
    galleryPhotoUpload,
    galleryPhotoUploadPost
} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload).post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;