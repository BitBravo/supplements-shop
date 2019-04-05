// Importing the dependancies.
const
    express = require('express'),
    mysql = require('mysql'),
    database = require('./../helpers/database'),
    getCopyrightDate = require('./../helpers/copyright'),
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


// Setting up dashboard route.
router.get('/', function (req, res) {

    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(*) AS `ProductsNum` FROM `Products`;\
        SELECT COUNT(*) AS `MailNum` FROM `Mail`;\
        SELECT COUNT(*) AS `OrdersNum` FROM `Orders`;\
        SELECT \'0,00 MAD\' AS `TotalRevenue`;\
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
                ProductsNum: results[1][0].ProductsNum,
                MailNum: results[2][0].MailNum,
                OrdersNum: results[3][0].OrdersNum,
                TotalRevenue: results[4][0].TotalRevenue,
                NewMail: results[5][0].NewMail
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the dashboard page.
            res.render('dashboard/dashboard', {
                Data: data
            });
        });
});


// Setting up the mail route.
router.get('/mail/:mode', function (req, res) {

    const mode = req.params.mode > 2 ? 2 : req.params.mode < 0 ? 0 : req.params.mode;

    console.log('QUERY: ' + 'SELECT * FROM `Mail` ' + (mode === 0 ? '' : (mode === 1 ? 'WHERE `Read` = 0' : 'WHERE `Read` = 1')) + ' ORDER BY `IssueDate` DESC;');
    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Mail` ' + (mode == 0 ? '' : (mode == 1 ? 'WHERE `Read` = 1' : 'WHERE `Read` = 0')) + ' ORDER BY `IssueDate` DESC;\
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
                Mail: truncateMessages(results[1]),
                NewMail: results[2][0].NewMail,
                Mode: mode
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the mail page.
            res.render('dashboard/mail', {
                Data: data
            });
        });

    function truncateMessages(mail) {

        for (const m of mail) {

            if (m.Message.length > 80) {
                m.Message = m.Message.substring(0, 80) + '...';
            }
        }

        return mail;
    }
});


// Setting up the mail reception route.
router.post('/mail', function (req, res) {

    const mail = {
        username: req.body.username,
        email: req.body.email,
        message: req.body.message
    };

    stmt = mysql.format("INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, NOW(), ?);", ['Mail', 'SenderEmail', 'SenderName', 'Message', 'IssueDate', 'Read', mail.email, mail.username, mail.message, 0]);

    conn.query(stmt, (error, results) => {

        let isSent = true;

        if (error) isSent = false;

        res.json({ sent: isSent });
    });
});


// Exporting the route.
module.exports = router;
