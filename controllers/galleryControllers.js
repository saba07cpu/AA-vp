const mysql = require('mysql2/promise');

//@desc Photogallery
//@route GET /gallery
//@access private

const galleryHome = async (req, res) => {
    res.redirect('/gallery/1');
};

//@desc Photogallery page
//@route GET /gallery/:page
//@access private   
const galleryPage = async (req, res) => {
    let page = parseInt(req.params.page);
    const privacy = 2;   
    const skip = 5; 
    const limit = 5;
    console.log('Gallery page: ' + page);
    //kontrollimr, kas lehekülgede arv pole liiga väike
    if (page < 1 || isNaN(page)) {
        page = 1;
    }
    let conn;
    //teeme kindlaks, palju üldse sobivaid pilte on, et saaksime lehekülgede arvu arvutada
    conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
    try {
        let sqlReq = 'SELECT COUNT(id) AS photos FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL';       
        const [countResult] = await conn.execute(sqlReq, [privacy]);
        const photoCount = countResult[0].photos;
        //kui lehekülgede arv on liiga suur, siis määrame lehekülje viimasele lehele
        if((page - 1) * limit >= photoCount) {
            page = Math.max(1, Math.ceil(photoCount / limit));
        }
        //fikseerime skip väärtuse, et saaksime päringus kasutada
        const skip = (page - 1) * limit;

        //teeme navigatsioonilingid
        //tagasi liikumine
        let galleryLinks = [];
        if (page === 1) {
            galleryLinks = `eelmine leht &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;`;
        
        }else {
            galleryLinks = `<a href="/gallery/${page - 1}">eelmine leht</a> &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;`;
        }
        //edasi liikumine
        if (page * limit >= photoCount) {
            galleryLinks += ` järgmine leht`;
        } else {
            galleryLinks += `<a href="/gallery/${page + 1}">järgmine leht</a>`;
        }
        sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL LIMIT ?,?';
        
        const [photos] = await conn.execute(sqlReq, [privacy, skip, limit]);
        const galleryData = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = "Galeriipilt";
			if(photos[i].alttext != ""){
				altText = photos[i].alttext;
			}
			galleryData.push({id: photos[i].id, src: photos[i].filename, alt: altText});
		}

        res.render('gallery', {
            galleryData,
            imagehref: process.env.GALLERY_THUMBS,
            links: galleryLinks
        });
    } catch (err) {
        console.log('Viga galerii laadimisel: ' + err);
        galleryLinks = `Eelmine leht &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; järgmine leht`;
        res.render('gallery', {
            galleryData: [],
            imagehref: process.env.GALLERY_THUMBS,
            links: galleryLinks
        });
    } finally {
        if (conn) {
            await conn.end();
        }
    }
};

//@desc My paginated photogallery
//@route GET /gallery/my?skip=0
//@access private
const myGalleryPage = async (req, res) => {
	let conn;
	try {
		const sqlReq = 'SELECT id, filename, alttext FROM galleryphotos WHERE userid = ? AND deleted IS NULL';
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});
		const [photos] = await conn.execute(sqlReq, [req.session.userId]);
		let galleryData = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = "Galeriipilt";
			if(photos[i].alttext != ""){
				altText = photos[i].alttext;
			}
			galleryData.push({id: photos[i].id, src: photos[i].filename, alt: altText});
		}
		res.render('mygallery', {galleryData: galleryData, imagehref: process.env.GALLERY_NORMAL});
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('mygallery', {galleryData: [], imagehref: process.env.GALLERY_NORMAL});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
	//res.render('gallery');
};

module.exports = {
    galleryHome,
    myGalleryPage,
    galleryPage
};
