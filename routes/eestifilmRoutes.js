const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
	eestifilm,
	eestifilmInimesed,
	eestifilmInimesedLisa,
	eestifilmInimesedLisaPost,
	eestifilmLisaFilm,
	eestifilmLisaFilmPost,
	eestifilmLisaAmet,
	eestifilmLisaAmetPost,
	eestifilmLisaSeos,
	eestifilmLisaSeosPost,
	eestifilmSeosed
} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);
router.route('/film_inimesed').get(eestifilmInimesed);
router.route('/lisa_film_inimesed').get(eestifilmInimesedLisa);
router.route('/lisa_film_inimesed').post(eestifilmInimesedLisaPost);

router.route('/lisa_film').get(eestifilmLisaFilm);
router.route('/lisa_film').post(eestifilmLisaFilmPost);

router.route('/lisa_amet').get(eestifilmLisaAmet);
router.route('/lisa_amet').post(eestifilmLisaAmetPost);

router.route('/lisa_seos').get(eestifilmLisaSeos).post(eestifilmLisaSeosPost);
router.route('/seosed').get(eestifilmSeosed);

module.exports = router;