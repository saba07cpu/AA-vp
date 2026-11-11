exports.isLogin = function(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			console.log('Sisse on loginud kasutaja: ' + req.session.userId);
			next();
		} else {
			console.log('Pole sisse logitud kasutaja!');
			return res.redirect('/signin');
		}
	} else {
		console.log('Sessiooni pole tuvastatud!');
		return res.redirect('/signin');
	}
}