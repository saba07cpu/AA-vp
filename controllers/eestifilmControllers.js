//@desc homepage for Estonian Film section
//@route GET /eestifilm
//@access public
const mysql = require('mysql2/promise');
//app.get('/eestifilm', (req, res)=>{
const eestifilm = (req, res) => {
	res.render('eestifilm');
	
};


//@desc page for people involved in Estonian Film industry
//@route GET /eestifilmInimesedLisa
//@access public

//app.get('/eestifilm/film_inimesed', async (req, res)=>{
const eestifilmInimesed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER, 
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});
		//defineerime sql päringu
		let sqlReq = 'SELECT * FROM person';
		//käivitame päringu
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('film_inimesed', {personList: sqlRes});
	}
	catch(err){
		console.log('Andmebaasiga suhtlemise viga: '+ err)
		res.render('film_inimesed', {personList: []});
	}
	finally {
		if(conn) {
			await conn.end();
		}
	}
};
//app.get('/eestifilm/lisa_film_inimesed', (req, res) => {
const eestifilmInimesedLisa = (req, res) => {
	res.render('lisa_film_inimesed', {
		notice: 'Ootan sisestust.',
		firstNameInput: null,
		lastNameInput: null,
		bornInput: null,
		deceasedInput: null
	});
};

//@desc page for people involved in Estonian Film industry
//@route POST /eestifilmInimesedLisaPost
//@access public

//app.post('/eestifilm/lisa_film_inimesed', async (req, res) => {
const eestifilmInimesedLisaPost = async (req, res) => {
	const firstName = req.body.firstNameInput ? req.body.firstNameInput.trim() : '';
	const lastName = req.body.lastNameInput ? req.body.lastNameInput.trim() : '';
	const bornDateText = req.body.bornInput;
	const deceasedDateText = req.body.deceasedInput;

	let notice = '';

	if (!firstName) {
		notice = 'Eesnimi on sisestamata!';
	} else if (!lastName) {
		notice = 'Perekonnanimi on sisestamata!';
	} else if (!bornDateText) {
		notice = 'Sünnikuupäev on sisestamata!';
	} else {
		const bornDate = new Date(bornDateText);
		const timeNow = new Date();

		if (isNaN(bornDate.getTime())) {
			notice = 'Sünnikuupäev ei ole korrektne!';
		} else if (bornDate > timeNow) {
			notice = 'Sünnikuupäev ei saa olla tulevikus!';
		} else if (deceasedDateText !== '') {
			const deceasedDate = new Date(deceasedDateText);
			if (isNaN(deceasedDate.getTime())) {
				notice = 'Surmakuupäev ei ole korrektne!';
			} else if (deceasedDate > timeNow) {
				notice = 'Surmakuupäev ei saa olla tulevikus!';
			} else if (deceasedDate < bornDate) {
				notice = 'Surmakuupäev ei saa olla varasem kui sünnikuupäev!';
			}
		}
	}

	if (notice !== '') {
		return res.render('lisa_film_inimesed', {
			notice: notice,
			firstNameInput: firstName,
			lastNameInput: lastName,
			bornInput: bornDateText,
			deceasedInput: deceasedDateText
		});
	}

	let finalDeceasedDate = deceasedDateText !== '' ? deceasedDateText : null;
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});

		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [firstName, lastName, bornDateText, finalDeceasedDate]);

		res.render('lisa_film_inimesed', {
			notice: `${firstName} ${lastName} edukalt andmebaasi salvestatud!`,
			firstNameInput: null,
			lastNameInput: null,
			bornInput: null,
			deceasedInput: null
		});
	} catch (err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('lisa_film_inimesed', {
			notice: 'Tekkis viga ja andmeid ei salvestatud.',
			firstNameInput: firstName,
			lastNameInput: lastName,
			bornInput: bornDateText,
			deceasedInput: deceasedDateText
		});
	} finally {
		if (conn) {
			await conn.end();
		}
	}
};
//@desc form for adding movies
//@route GET /eestifilm/lisa_film
//@access public
//app.get('/eestifilm/lisa_film', (req, res) => {
const eestifilmLisaFilm = (req, res) => {	
	res.render('lisa_film', {
		notice: 'Ootan sisestust.',
		titleInput: null,
		releaseYearInput: null,
		durationMinutesInput: null,
		descriptionInput: null
	});
};

//@desc page for adding movies
//@route POST /eestifilm/lisa_film
//@access public
//app.post('/eestifilm/lisa_film', async (req, res) => {
const eestifilmLisaFilmPost = async (req, res) => {
	const title = req.body.titleInput ? req.body.titleInput.trim() : '';
	const releaseYear = req.body.releaseYearInput;
	const durationMinutes = req.body.durationMinutesInput;
	const description = req.body.descriptionInput ? req.body.descriptionInput.trim() : '';

	let notice = '';
	if (!title) {
		notice = 'Filmi pealkiri on puudu!';
	} else if (!releaseYear || isNaN(releaseYear) || releaseYear < 1888 || releaseYear > new Date().getFullYear()) {
		notice = 'Palun sisesta korrektne väljaande aasta!';
	} else if (!durationMinutes || isNaN(durationMinutes) || durationMinutes <= 0) {
		notice = 'Palun sisesta korrektne kestus minutites!';
	} else if (!description) {
		notice = 'Filmi kirjeldus on puudu!';
	}

	if (notice !== '') {
		return res.render('lisa_film', {
			notice: notice,
			titleInput: title,
			releaseYearInput: releaseYear,
			durationMinutesInput: durationMinutes,
			descriptionInput: description
		});
	}

	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});

		let sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [title, releaseYear, durationMinutes, description]);

		res.render('lisa_film', {
			notice: `Film "${title}" edukalt lisatud!`,
			titleInput: null,
			releaseYearInput: null,
			durationMinutesInput: null,
			descriptionInput: null
		});
	} catch (err) {
		console.log('Andmebaasi viga filmi salvestamisel: ' + err);
		res.render('lisa_film', {
			notice: 'Tekkis viga ja filmi ei salvestatud.',
			titleInput: title,
			releaseYearInput: releaseYear,
			durationMinutesInput: durationMinutes,
			descriptionInput: description
		});
	} finally {
		if (conn) {
			await conn.end();
		}
	}
};
//@desc form for adding professions/positions
//@route GET /eestifilm/lisa_amet
//@access public
//app.get('/eestifilm/lisa_amet', (req, res) => {
const eestifilmLisaAmet = (req, res) => {
	res.render('lisa_amet', {
		notice: 'Ootan sisestust.',
		titleInput: null,
		descriptionInput: null
	});
};
//@desc page for adding professions/positions
//@route POST /eestifilm/lisa_amet
//@access public
//app.post('/eestifilm/lisa_amet', async (req, res) => {
const eestifilmLisaAmetPost = async (req, res) => {
	const title = req.body.titleInput ? req.body.titleInput.trim() : '';
	const description = req.body.descriptionInput ? req.body.descriptionInput.trim() : '';

	let notice = '';
	if (!title) {
		notice = 'Ameti nimetus on sisestamata!';
	} else if (!description) {
		notice = 'Ameti kirjeldus on sisestamata!';
	}

	if (notice !== '') {
		return res.render('lisa_amet', {
			notice: notice,
			titleInput: title,
			descriptionInput: description
		});
	}

	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});

		let sqlReq = 'INSERT INTO profession (title, description) VALUES (?,?)';
		await conn.execute(sqlReq, [title, description]);

		res.render('lisa_amet', {
			notice: `Amet "${title}" edukalt lisatud!`,
			titleInput: null,
			descriptionInput: null
		});
	} catch (err) {
		console.log('Andmebaasi viga ameti salvestamisel: ' + err);
		res.render('lisa_amet', {
			notice: 'Tekkis viga ja ametit ei salvestatud.',
			titleInput: title,
			descriptionInput: description
		});
	} finally {
		if (conn) {
			await conn.end();
		}
	}
};
module.exports = {
	eestifilm,
	eestifilmInimesed,
	eestifilmInimesedLisa,
	eestifilmInimesedLisaPost,
	eestifilmLisaFilm,
	eestifilmLisaFilmPost,
	eestifilmLisaAmet,
	eestifilmLisaAmetPost
};