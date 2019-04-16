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
router.get('/', function(req, res) {
    conn.query(
        '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        SELECT * FROM `Brands`; \
        SELECT P.*, PV.`Weight`, (SELECT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1) AS `NewPrice`, (SELECT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 2, 1) AS `OldPrice` FROM `ProductsVariants` PV INNER JOIN `Products` P ON PV.`ProductID` = P.`ProductID` LIMIT 6; \
        SELECT P.*, (1) AS `NewPrice`, (0) AS `OldPrice` FROM `Products` P ORDER BY P.`AddedDate` DESC LIMIT 6; \
        ',
        (error, results) => {
            // Checking if there are any errors.
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
                    }
                },
                Brands: results[1],
                TopProducts: results[2],
                NewestProducts: results[3]
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the index page.
            res.render('index', {
                Data: data
            });
        }
    );
});

// Exporting the route.
module.exports = router;
