// Importing the dependancies.
const
    express = require('express'),
    mysql = require('mysql'),
    moment = require('moment'),
    database = require('../../helpers/database'),
    getCopyrightDate = require('../../helpers/copyright'),
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


// Setting the local timezone.
moment.locale('ar-ma');


// Setting up the mail retrieval route.
router.get('/read/:id', function (req, res) {

    const mailId = req.params.id;

    stmt = mysql.format("\
        SELECT * FROM ?? WHERE ?? = ?;\
        UPDATE ?? SET ?? = ? WHERE ?? = ?;\
        ", [
            'Mail', 'MailID', mailId,
            'Mail', 'Read', 1, 'MailID', mailId
        ]);

    conn.query(stmt, (error, results) => {

        if (error) throw error;

        results[0][0].IssueDate = moment(results[0][0].IssueDate).format('HH:MM - MMMM Do YYYY');
        res.json({ ...results[0][0] });
    });
});


// Setting up the mail route.
router.get('/:mode', function (req, res) {

    const mode = req.params.mode > 2 ? 2 : req.params.mode < 0 ? 0 : req.params.mode;

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


// Setting up the mail creation route.
router.post('/', function (req, res) {

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


// Setting up the mail update route.
router.put('/', function(req, res) {

    console.log(req.body);
});


// Exporting the route.
module.exports = router;
