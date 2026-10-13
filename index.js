const express = require('express');
const dateTimeET = require('./src/dateTimeET');
const fs = require('fs').promises;
const bodyparser= require('body-parser');
const mysql = require('mysql2/promise')
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';
require('dotenv').config();

//käivitan express funktsiooni ja tähistan töötava asja nimega "app"
const app = express();
//määrame veebilehe mallide järgi renderdamise mootori (EJS)
app.set('view engine','ejs');
	//muudan "public" veebiserveris kättesaadavaks
app.use(express.static('public'));
	//hakkame päringuid parsima
app.use(bodyparser.urlencoded({extended: false}));

app.get('/', (req, res) => {
	//res.send('Express.js veeb käivitus!');
	const day = dateTimeET.weekdayET()
	const date = dateTimeET.dateET(0)
	const time = dateTimeET.timeET()
	res.render('index', {day: day, date: date, time: time});
});
// Marsruut /tlu
app.get('/tlu', (req, res) => {
	res.render('tlu');
});
app.get('/vanasona', async (req, res)=>{
	try{
		const data = await fs.readFile(textRef, 'utf8');
		let folkWisdom = data.split(';');
		let wisdom = folkWisdom[Math.round(Math.random()*(folkWisdom.length-1))];
		res.render('wisdom', {wisdom: wisdom}); 
	}
	catch(err){
		console.log(err);
		res.render('wisdom', {wisdom: 'Kahjuks ühtegi vanasõna ei leitud.'});
	}
});
app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});
app.post('/regvisit', async (req, res)=>{
	const name = req.body.nameInput;
	const date = dateTimeET.dateET(0);
	const time = dateTimeET.timeET();
	
	const entry = `${name},${date},${time};`;	
	
	try{
		
		await fs.appendFile(regTextRef, entry);
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});

	// PUNKT 3: UUS MARSRUUT /visitlog (VIIMASE KÜLASTUSE NÄITAMINE)
app.get('/visitlog', async (req, res) => {
	try {
		const data = await fs.readFile(regTextRef, 'utf8');
		// splitime teksti semikoolonite järgi
		let visits = data.split(';');
		
		
		// (või filtreerime tühjad read välja)
		visits = visits.filter(entry => entry.trim() !== '');
		
		if (visits.length > 0) {
			let lastVisit = visits[visits.length - 1];
			// 3. Tükeldame viimase külastuse info komade järgi
			let partOfLastVisit = lastVisit.split(',');
			
			let name = partOfLastVisit[0];
			let date = partOfLastVisit[1];
			let time = partOfLastVisit[2];
			
			// Nõutud lause formaat: "Viimati registreeriti külastus " kuupäev ", kell " kellaaeg " kui seda tegi " nimi.
			let message = `Viimati registreeriti külastus ${date}, kell ${time}, kui seda tegi ${name}.`;
			res.render('visitlog', { lastVisitInfo: message });
		} else {
			res.render('visitlog', { lastVisitInfo: 'Ühtegi külastust pole veel registreeritud.' });
		}
	} catch (err) {
		console.log(err);
		res.render('visitlog', { lastVisitInfo: 'Külastuste faili lugemisel tekkis viga või fail on tühi.' });
	}
});
app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
	
});

app.get('/eestifilm/film_inimesed', async (req, res)=>{
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
});
app.get('/eestifilm/lisa_film_inimesed', (req, res) => {
	res.render('lisa_film_inimesed', {
		notice: 'Ootan sisestust.',
		firstNameInput: null,
		lastNameInput: null,
		bornInput: null,
		deceasedInput: null
	});
});

app.post('/eestifilm/lisa_film_inimesed', async (req, res) => {
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
});

// ==================== 2. FILMI LISAMINE ====================
app.get('/eestifilm/lisa_film', (req, res) => {
	res.render('lisa_film', {
		notice: 'Ootan sisestust.',
		titleInput: null,
		releaseYearInput: null,
		durationMinutesInput: null,
		descriptionInput: null
	});
});

app.post('/eestifilm/lisa_film', async (req, res) => {
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
});

// ==================== 3. AMETI LISAMINE ====================
app.get('/eestifilm/lisa_amet', (req, res) => {
	res.render('lisa_amet', {
		notice: 'Ootan sisestust.',
		titleInput: null,
		descriptionInput: null
	});
});

app.post('/eestifilm/lisa_amet', async (req, res) => {
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
});
app.listen(5317); 