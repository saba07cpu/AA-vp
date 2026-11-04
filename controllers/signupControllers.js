const mysql = require('mysql2/promise');
const validator = require('validator');
const argon = require('argon2');

//@desc page creating user account
//@route GET /signup
//@access public
const signupPage = (req, res) => {
    res.render('signup', { notice: 'Ootan andmeid!' });
};

//@desc page creating user account
//@route POST /signup
//@access public
const signupPagePost = async (req, res) => {
    let notice = '';
    let conn;

    // 1. Andmete puhastamine ja saamine
    const firstName = req.body.firstNameInput ? validator.escape(req.body.firstNameInput.trim()) : '';
    const lastName = req.body.lastNameInput ? validator.escape(req.body.lastNameInput.trim()) : '';
    const birthDate = req.body.birthDateInput || '';
    const gender = req.body.genderInput || '';
    const email = req.body.emailInput ? req.body.emailInput.trim() : '';
    const password = req.body.passwordInput || '';
    const confirmPassword = req.body.confirmPasswordInput || '';

    // 2. Kontrollime, kas kõik olulised väljad on olemas
    if (!firstName || !lastName || !birthDate || !gender || !email || !password || !confirmPassword) {
        notice = 'Andmeid on puudu või miski pole korrektne!';
        return res.render('signup', { notice: notice });
    }

    // 3. Kas e-mail on korrektne
    if (!validator.isEmail(email)) {
        notice = 'E-maili aadress pole korrektne!';
        return res.render('signup', { notice: notice });
    }

    // 4. Kas parool on piisavalt tugev
    const passwordOptions = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 };
    if (!validator.isStrongPassword(password, passwordOptions)) {
        notice = 'Valitud salasõna ei ole piisavalt tugev! Vaja on suur- ja väiketähti, numbreid ja kokku minimaalselt 8 märki!';
        return res.render('signup', { notice: notice });
    }

    // 5. Kas paroolid ühtivad
    if (password !== confirmPassword) {
        notice = 'Sisestatud salasõnad ei ole ühesugused!';
        return res.render('signup', { notice: notice });
    }

    // 6. Kas sünnikuupäev on korrektne
    if (!validator.isDate(birthDate) || validator.isAfter(birthDate)) {
        notice = 'Valitud sünnikuupäev pole korrektne!';
        return res.render('signup', { notice: notice });
    }

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE || process.env.DB_NAME,
            charset: 'utf8mb4'
        });

        // 7. Kontrollime, kas selline kasutaja on juba olemas
        let sqlReq = 'SELECT id FROM users WHERE email = ?';
        const [users] = await conn.execute(sqlReq, [email]);
        
        if (users.length > 0) {
            notice = 'Selline kasutaja on juba olemas!';
            return res.render('signup', { notice: notice });
        }

        // 8. Krüpteerime parooli
        const pwdHash = await argon.hash(password);

        // 9. Salvestame andmed
        sqlReq = 'INSERT INTO users (firstname, lastname, birthdate, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)';
        await conn.execute(sqlReq, [
            firstName,
            lastName,
            birthDate,
            gender,
            email,
            pwdHash
        ]);

        res.render('signup', { notice: 'Kasutajakonto on loodud!' });
    } catch (err) {
        console.log('Viga: ' + err);
        res.render('signup', { notice: 'Kasutajakonto loomine ei õnnestunud!' });
    } finally {
        if (conn) {
            await conn.end();
        }
    }
};

module.exports = {
    signupPage,
    signupPagePost
};