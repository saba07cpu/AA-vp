const mysql = require('mysql2/promise');

//@desc Photogallery
//@route GET /gallery
//@access public

const galleryPage = async (req, res) => {
    let conn;
    try {
        const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
        const privacy = 2;
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        const [photos] = await conn.execute(sqlReq, [privacy]);
        const galleryData = photos.map((photo) => ({
            src: photo.filename,
            alt: photo.alttext || 'Galeriipilt'
        }));

        res.render('gallery', {
            photos,
            galleryData,
            imagehref: process.env.GALLERY_THUMBNAIL
        });
    } catch (err) {
        console.log('Viga galerii laadimisel: ' + err);
        res.render('gallery', {
            photos: [],
            galleryData: [],
            imagehref: process.env.GALLERY_THUMBNAIL
        });
    } finally {
        if (conn) {
            await conn.end();
        }
    }
};

module.exports = {
    galleryPage,
    getGallery: galleryPage
};
