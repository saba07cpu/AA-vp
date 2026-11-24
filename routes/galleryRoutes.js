const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

//kasutatavad kontrollerid
const {
	galleryHome,
    myGalleryPage,
    galleryPage,
    editPhotoPage,
    savePhoto
	} = require('../controllers/galleryControllers');

router.route('/').get(galleryHome);
router.route('/my').get(myGalleryPage);
router.route('/my/edit/:id')
    .get(editPhotoPage)
    .post(savePhoto);
router.route('/:page').get(galleryPage);

module.exports = router;