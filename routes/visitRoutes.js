const express = require('express');
const router = express.Router();

const {
	visitHome,
	regVisit,
	regVisitPost
} = require('../controllers/visitControllers');

// Külastuste avaleht (/visit)
router.route('/').get(visitHome);

// Külastuse registreerimine (/visit/reg)
router.route('/reg').get(regVisit).post(regVisitPost);

module.exports = router;