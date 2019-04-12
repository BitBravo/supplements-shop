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


// Setting up the products route.
router.get('/', function (req, res) {

    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT * FROM `Products` ORDER BY `ProductName` ASC;\
        SELECT * FROM `Categories` WHERE `CategoryParent` > 0 ORDER BY `CategoryName` ASC;\
        SELECT * FROM `Brands` ORDER BY `BrandName` ASC;\
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
                Products: results[2],
                Categories: results[3],
                Brands: results[4]
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the products page.
            res.render('dashboard/products', {
                Data: data
            });
        });
});


// Setting the product creation route.
router.post('/', function (req, res) {

    const
        stmt = conn.format('INSERT INTO ?? (??, ??) VALUES (?, ?);', ['Brands', 'BrandName', 'Logo', req.body['brand-name'], req.body['brand-logo']]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Rendering the products page.
        res.redirect('/dashboard/products');
    });
});


// Setting up the product edition route.
router.put('/', function (req, res) {

    const
        stmt = conn.format('UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?;', ['Brands', 'BrandName', req.body['brand-name'], 'Logo', req.body['brand-logo'], 'BrandID', req.body['brand-id']]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Rendering the products page.
        res.redirect('/dashboard/products');
    });
});


// Exporting the route.
module.exports = router;
