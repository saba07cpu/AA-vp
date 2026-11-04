const express = require('express');
const router = express.Router();

const {
    signinPage,
    signinPagePost
} = require('../controllers/signinControllers');

router.route('/')
    .get(signinPage)
    .post(signinPagePost);

module.exports = router;