const express = require('express');
const dateTimeET = require('./src/dateTimeET');
const fs = require('fs').promises;
const bodyparser= require('body-parser');

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';


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

app.listen(5317); 