// Importing the dependancies.
const
    express = require('express'),
    router = express.Router();


// Setting up search route.
router.get('/', function (req, res) {

    // Rendering the search page.
    res.render('index', {
        date: getCopyrightDate()
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
