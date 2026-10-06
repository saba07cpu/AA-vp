//function dateFormattedET(){
const dateFormattedET = function(option){
	let timeNow = new Date();
	const monthFolknamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'];
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	if(option === 0){
		return timeNow.getDate() + '. ' + monthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
	}
	else if(option === 1){
		return timeNow.getDate() + '. ' + monthFolknamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
	}
	else {
		return 'Wrong option, please use 0 or 1!';
	}
}


function addLeadZero(numValue){
	if(numValue < 10){
		numValue = '0' + numValue;
		//numValue = numValue.padStart(2, '0');
	}
	return numValue;
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	let timeFormatted = hourNow + ':' + addLeadZero(minuteNow) + ':' + addLeadZero(secondNow);
	return timeFormatted;
}
const weekdayFormattedET = function(){
	const weekdayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
	let timeNow = new Date();
	let weekdayNow = timeNow.getDay();
	return weekdayNamesET[weekdayNow];
}

module.exports = {dateET: dateFormattedET, timeET: timeFormattedET, weekdayET: weekdayFormattedET};

