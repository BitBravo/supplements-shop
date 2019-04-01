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
                TotalRevenue: results[4][0].TotalRevenue
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
router.get('/mail', function (req, res) {

    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(*) AS `ProductsNum` FROM `Products`;\
        SELECT COUNT(*) AS `MailNum` FROM `Mail`;\
        SELECT COUNT(*) AS `OrdersNum` FROM `Orders`;\
        SELECT \'0,00 MAD\' AS `TotalRevenue`;\
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
                TotalRevenue: results[4][0].TotalRevenue
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the mail page.
            res.render('dashboard/mail', {
                Data: data
            });
        });
});


// Exporting the route.
module.exports = router;
