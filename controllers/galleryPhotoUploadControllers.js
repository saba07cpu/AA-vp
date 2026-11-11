const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

//@desc home page for uploading gallery photos
//@route GET /galleryPhotoUpload
//@access public
const galleryPhotoUpload = (req, res) => {
    res.render('galleryPhotoUpload');
};

//@desc process photo upload
//@route POST /galleryPhotoUpload
//@access public
const galleryPhotoUploadPost = async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let conn;
    try {
        // Uus failinimi ajatempliga
        const fileName = 'vp_' + Date.now() + '.jpg';
        
        // Nimetame ajutise multeri faili ümber
        await fs.rename(req.file.path, process.env.UPLOAD_ORIGINAL_PATH + fileName);
        
        // Suur pilt (max 800x600) + vesimärk paremas all nurgas
        await sharp(process.env.UPLOAD_ORIGINAL_PATH + fileName)
            .resize(800, 600)
            .composite([{
                input: './public/pics/vp_logo_small.png',
                gravity: 'southeast' // paneb vesimärgi all paremale nurka
            }])
            .jpeg({ quality: 90 })
            .toFile(process.env.UPLOAD_RESIZED_PATH + fileName);
            
        // Pisipilt / thumbnail (100x100)
        await sharp(process.env.UPLOAD_ORIGINAL_PATH + fileName)
            .resize(100, 100)
            .jpeg({ quality: 90 })
            .toFile(process.env.UPLOAD_THUMBNAIL_PATH + fileName);
            
        let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
       // const userId = 1; // Ajutine ID
        const userId = req.session.userId; // Kasutaja ID sessioonist
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        
        const [result] = await conn.execute(sqlReq, [
            fileName, 
            req.file.originalname, 
            req.body.altInput, 
            req.body.privacyInput, 
            userId
        ]);
        
        console.log('Salvestati kirje id: ' + result.insertId);
        res.render('galleryPhotoUpload');
    }
    catch (err) {
        console.log('Viga: ' + err);
        res.render('galleryPhotoUpload');
    }
    finally {
        if(conn){
            await conn.end();
        }
    }
};

module.exports = {
    galleryPhotoUpload,
    galleryPhotoUploadPost
};