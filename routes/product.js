// Importing the dependancies.
const express = require('express'),
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

// Setting up index route.
router.get('/:productID', function(req, res) {
    conn.query(
        '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        ',
        (error, results) => {
            // Checking if there are any errors.
            if (error) throw error;

            // Getting the data.
            const data = {
                Config: {
                    Phone: {
                        Primary: results[0].PrimaryNumber,
                        Secondary: results[0].SecondaryNumber,
                        Fixed: results[0].FixedNumber
                    },
                    Email: results[0].Email,
                    Facebook: {
                        Name: results[0].Facebook.split('|')[0],
                        Link: results[0].Facebook.split('|')[1]
                    },
                    Instagram: {
                        Name: results[0].Instagram.split('|')[0],
                        Link: results[0].Instagram.split('|')[1]
                    },
                    Youtube: {
                        Name: results[0].Youtube.split('|')[0],
                        Link: results[0].Youtube.split('|')[1]
                    }
                }
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the index page.
            res.render('product', {
                Data: data
            });
        }
    );
});

// Exporting the route.
module.exports = router;
