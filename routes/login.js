/**
 * Importing the dependancies
 */
var express = require('express'),
	mysql = require('mysql'),
	sha1 = require('sha1'),
	router = express.Router(),
	databaseConfig = require('./../config/database'),
	getCopyrightDate = require('./../helpers/copyright'),
	formater = require('./../helpers/formater');



/**
 * Configurations
 */
var conn = mysql.createConnection({
	database: databaseConfig.name,
	host: databaseConfig.host,
	password: databaseConfig.password,
	user: databaseConfig.user,
	multipleStatements: true
});



/**
 * Connecting to the database
 */
conn.connect();



/**
 * Routing
 */
// Setting up login route.
router.get('/', function (req, res) {
	if (req.session.loggedIn) {
		res.redirect('/dashboard');
	} else {
		conn.query(
			'\
            SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
            SELECT * FROM `Categories` WHERE Deleted = 0;\
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
					Categories: formater.groupCategories(results[1])
				};

				// Getting the proper copyright date.
				data.CopyrightDate = getCopyrightDate();

				// Rendering the login page.
				res.render('login', {
					Data: data
				});
			}
		);
	}
});

// Setting up the login route.
router.post('/', function (req, res) {
	const sentPassword = sha1(req.body.password);

	conn.query('SELECT `Password` FROM `Config`;', (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		let isAllowed = false;

		if (sentPassword === results[0].Password) {
			req.session.loggedIn = true;
			isAllowed = true;

			// Setting up the flash messages.
			req.flash('login', 'لقد قمت بتسجيل الدخول بنجاح');
		}

		res.json({
			allow: isAllowed
		});
	});
});

// Setting up the logout route.
router.get('/logout', function (req, res) {
	// Loggin out.
	req.session.loggedIn = false;

	// Redirecting to the main page
	res.redirect('/');
});

// Exporting the route.
module.exports = router;
