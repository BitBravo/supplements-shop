// Importing the dependancies.
const
    express = require('express'),
    mysql = require('mysql'),
    router = express.Router(),
    conn = mysql.createConnection({
        database: 'db_supp_maroc',
        host: 'localhost',
        password: 'Upe385LGvkhJv5KN',
        user: 'root'
    });


// Connecting to the database.
conn.connect();


// Setting up search route.
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

        // Rendering the search page.
        res.render('index', {
            data: data
        });
    });
});


/**
 * Gets the proper copyright date.
 */
function getCopyrightDate() {

    // The variable dates.
    const
        foundingYear = 2019,
        currentYear = (new Date()).getFullYear();

    // The resuting date range.
    let properRange = (foundingYear == currentYear) ? foundingYear : `${foundingYear} - ${currentYear}`;

    // Returning the proper date range.
    return properRange;
}

// Exporting the route.
module.exports = router;
