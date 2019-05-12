/**
 * Importing the dependancies
 */
var express = require('express'),
	mysql = require('mysql'),
	router = express.Router(),
	login = require('./../../helpers/login'),
	databaseConfig = require('./../../config/database'),
	getCopyrightDate = require('./../../helpers/copyright'),
	formater = require('./../../helpers/formater');



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
 * Using the login middleware
 */
router.use(login);



/**
 * Routing
 */

// Setting up the carousel route.
router.get('/', function (req, res) {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        SELECT * FROM `Categories` WHERE `Deleted` = 0; \
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0; \
        SELECT * FROM `Carousel` WHERE `Deleted` = 0; \
        SELECT * FROM `Carousel` WHERE `Deleted` = 1; \
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
				Categories: formater.groupCategories(results[1]),
				NewMail: results[2][0].NewMail,
				Carousel: results[3],
				DeletedCarousels: results[4]
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the carousel page.
			res.render('dashboard/carousel', {
				Data: data,
				Messages: {
					Success: req.flash('carousel-flash'),
					Error: req.flash('carousel-error')
				}
			});
		}
	);
});

// Setting up the carousel creation route.
router.post('/', function (req, res) {
	var checkStmt = conn.format('SELECT 1 FROM ?? WHERE ?? = ?;', [
		'Carousel',
		'Tag',
		req.body['carousel-tag']
	]);

	conn.query(checkStmt, function (checkErrors, checkResults) {
		if (checkResults.length === 0) {
			var insertStmt = conn.format(
				'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, 0);',
				[
					'Carousel',
					'CarouselUrl',
					'Tag',
					'Deleted',
					req.body['carousel-url'],
					req.body['carousel-tag']
				]
			);

			conn.query(insertStmt, function (insertErrors, insertResults) {
				// Checking if there are any errors.
				if (insertErrors) throw insertErrors;
			});

			// Setting up the flash message.
			req.flash('carousel-flash', 'تم إنشاء الصورة المميزة بنجاح');
		} else {
			// Setting up the flash message.
			req.flash('carousel-error', 'هذه العلامة موجودة');
		}

		// Rendering the brands page.
		res.redirect('/dashboard/carousel');
	});
});

// Setting up the carousel edition route.
router.put('/', function (req, res) {
	const stmt = conn.format('UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?;', [
		'Carousel',
		'CarouselURL',
		req.body['carousel-url'],
		'Tag',
		req.body['carousel-tag'],
		'CarouselID',
		req.body['carousel-id']
	]);

	conn.query(stmt, (errors, results) => {
		// Checking if there are any errors.
		if (errors) throw errors;

		// Setting up the flash message.
		req.flash('carousel-flash', 'تم تحديث الصورة المميزة بنجاح');

		// Rendering the brands page.
		res.redirect('/dashboard/carousel');
	});
});

// Setting up the carousel deletion route.
router.delete('/', function (req, res) {
	var carouselId = req.body['carouselId'],
		stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', [
			'Carousel',
			'Deleted',
			'CarouselID',
			carouselId
		]);

	conn.query(stmt, (errors, results) => {
		// Checking if there are any errors.
		if (errors) throw errors;

		// Setting up the flash message.
		req.flash('carousel-flash', 'تم حذف الصورة المميزة بنجاح');

		// Signaling the client.
		res.send();
	});
});

// Setting up the carousel restoration route.
router.put('/restore', function (req, res) {
	var carouselId = req.body['carouselId'],
		stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
			'Carousel',
			'Deleted',
			'CarouselID',
			carouselId
		]);

	conn.query(stmt, (errors, results) => {
		// Checking if there are any errors.
		if (errors) throw errors;

		// Setting up the flash message.
		req.flash('carousel-flash', 'تمت استعادة الصورة المميزة بنجاح');

		// Signaling the client.
		res.send();
	});
});

// Exporting the route.
module.exports = router;
