// Importing the dependancies.
const
    express = require('express'),
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


// Setting up the categories route.
router.get('/', function (req, res) {

    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT * FROM `Categories`;\
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
                NewMail: results[1][0].NewMail,
                Categories: results[2]
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the categories page.
            res.render('dashboard/categories', {
                Data: data
            });
        });
});


// Setting the category creation route.
router.post('/', function (req, res) {

    const
        categoryName = req.body['category-name'],
        categoryParent = req.body['category-parent'] == 0 ? null : req.body['category-parent'],
        stmt = conn.format('INSERT INTO ?? (??, ??) VALUES (?, ?);', ['Categories', 'CategoryName', 'CategoryParent', categoryName, categoryParent]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Rendering the categories page.
        res.redirect('/dashboard/categories');
    });
});


// Setting up the category edition route.
router.put('/', function (req, res) {

    const
        stmt = conn.format('UPDATE ?? SET ?? = ? WHERE ?? = ?;', ['Flavors', 'FlavorName', req.body['flavor-name'], 'FlavorID', req.body['flavor-id']]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Rendering the categories page.
        res.redirect('/dashboard/categories');
    });
});


// Setting up the category deletion route.
router.delete('/', function (req, res) {

    const
        stmt = conn.format('\
        DELETE FROM ?? WHERE ?? = ?; \
        DELETE FROM ?? WHERE ?? = ?; \
        ', 
        [
            'Categories', 'CategoryParent', req.body.categoryId,
            'Categories', 'CategoryID', req.body.categoryId
        ]);

    conn.query(stmt, (error, results) => {

        let success = true;

        // Checking if the there are any errors.
        if (error) success = false;

        res.json({ success: success });
    });
});


// Exporting the route.
module.exports = router;
