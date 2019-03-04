// Importing the dependancies.
const
    express = require('express'),
    router = express.Router();


// Setting up search route.
router.get('/', function (req, res) {

    // Rendering the search page.
    res.render('index');
});


// Exporting the route.
module.exports = router;
