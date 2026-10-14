const dateTimeET = require('../src/dateTimeET');
const regTextRef = 'public/txt/visits.txt';
const fs = require('fs').promises;

//@desc Külastuste avaleht (näitab viimase külastuse infot)
//@route GET /visit
//@access public
//app.get('/visitlog', async (req, res) => {
const visitHome = async (req, res) => {
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
};
//@desc Külastuse registreerimise vorm
//@route GET /visit/reg
//@access public
//app.get('/regvisit', (req, res)=>{
const regVisit = (req, res) => {
	res.render('regvisit');
};
//@desc Uue külastuse salvestamine
//@route POST /visit/reg
//@access public
//app.post('/regvisit', async (req, res)=>{
const regVisitPost = async (req, res) => {
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
};

module.exports = {
	visitHome,
	regVisit,
	regVisitPost
};