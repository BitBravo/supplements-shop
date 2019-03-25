// Importing the dependancies.
const
    express = require('express'),
    router = express.Router();


// Setting up dashboard route.
router.get('/', function (req, res) {

    // Rendering the dashboard page.
    res.render('dashboard/dashboard');
});


// Exporting the route.
module.exports = router;
