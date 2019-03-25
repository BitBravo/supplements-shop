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
        user: database.user
    }),
    router = express.Router();


// Connecting to the database.
conn.connect();


// Setting up dashboard route.
router.get('/', function (req, res) {

    const data = {};

    conn.query('SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;', (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Getting the data.
        data.Config = {
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
        };

        // Getting the proper copyright date.
        data.CopyrightDate = getCopyrightDate();

        // Rendering the dashboard page.
        res.render('dashboard/dashboard', {
            Data: data
        });
    });
});


// Exporting the route.
module.exports = router;
