const mysql = require('mysql2/promise');

exports.getGallery = async (req, res) => {
    let conn;
    let photos = [];
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        
        const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= 2 AND deleted IS NULL ORDER BY id DESC';
        const [rows] = await conn.execute(sqlReq);
        photos = rows;
    } catch (err) {
        console.log('Viga galerii laadimisel: ' + err);
    } finally {
        if (conn) {
            await conn.end();
        }
    }
    
    res.render('gallery', { photos: photos });
};