// Importing the dependancies.
const
    express = require('express'),
    sha1 = require('sha1'),
    mysql = require('mysql'),
    database = require('../../helpers/database'),
    getCopyrightDate = require('../../helpers/copyright'),
    login = require('./../../helpers/login'),
    conn = mysql.createConnection({
        database: database.name,
        host: database.host,
        password: database.password,
        user: database.user,
        multipleStatements: true
    }),
    router = express.Router();


// Connecting to the database.
conn.connect();


// Using the login middleware.
router.use(login);


// Setting up the config route.
router.get('/', function (req, res) {

    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
    ', (error, results) => {

            // Checking if the there are any errors.
            if (error) throw error;

            // Getting the data.
            const data = {
                Config: {
                    Phone: {
                        Primary: results[0][0].PrimaryNumber,
                        Secondary: results[0][0].SecondaryNumber,
                        Fixed: results[0][0].FixedNumber
                    },
                    Email: results[0][0].Email,
                    Facebook: {
                        Name: results[0][0].Facebook.split('|')[0],
                        Link: results[0][0].Facebook.split('|')[1]
                    },
                    Instagram: {
                        Name: results[0][0].Instagram.split('|')[0],
                        Link: results[0][0].Instagram.split('|')[1]
                    },
                    Youtube: {
                        Name: results[0][0].Youtube.split('|')[0],
                        Link: results[0][0].Youtube.split('|')[1]
                    },
                },
                NewMail: results[1][0].NewMail
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the config page.
            res.render('dashboard/config', {
                Data: data
            });
        });
});


// Setting up the config update route.
router.post('/', function (req, res) {

    const stmt = mysql.format("UPDATE ?? \
                        SET ?? = ?, \
                        ?? = ?, \
                        ?? = ?, \
                        ?? = ?, \
                        ?? = ?, \
                        ?? = ?, \
                        ?? = ?;", [
            'Config',
            'PrimaryNumber', req.body['primary-phone'],
            'SecondaryNumber', req.body['secondary-phone'],
            'FixedNumber', req.body['fixed-phone'],
            'Email', req.body['email'],
            'Facebook', req.body['facebook-name'] + '|' + req.body['facebook-url'],
            'Instagram', req.body['instagram-name'] + '|' + req.body['instagram-url'],
            'Youtube', req.body['youtube-name'] + '|' + req.body['youtube-url']
        ]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // redirecting to the config page.
        res.redirect('/dashboard/config');
    });

});


// Setting up the password update route.
router.put('/', function (req, res) {

    const
        newPassword = req.body['password'],
        currPassword = req.body['password-old'];

    conn.query('SELECT `Password` FROM `Config`;', (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;
        
        if (sha1(currPassword) === results[0].Password) {
    
            const 
                hashedPassword = sha1(newPassword),
                stmt = mysql.format("UPDATE ?? SET ?? = ?;", ['Config', 'Password', hashedPassword]);

            conn.query(stmt, (error, results) => {

                // Throwing the error.
                if (error) throw error;
            });
        }

        res.redirect('/dashboard/config');
    });

});


// Exporting the route.
module.exports = router;
