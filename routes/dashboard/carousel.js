// Importing the dependancies.
const express = require('express'),
	mysql = require('mysql'),
	database = require('../../helpers/database'),
	getCopyrightDate = require('../../helpers/copyright'),
	login = require('./../../helpers/login'),
	formater = require('./../../helpers/formater'),
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

// Using the login middleware.
router.use(login);

// Setting up the carousel route.
router.get('/', function(req, res) {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        SELECT * FROM `Categories` WHERE `Deleted` = 0; \
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0; \
        SELECT * FROM `Carousel` WHERE `Deleted` = 0 ORDER BY `Index` ASC; \
        SELECT * FROM `Carousel` WHERE `Deleted` = 1 ORDER BY `Index` ASC; \
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
					Carousel: req.flash('carousel-flash')
				}
			});
		}
	);
});

// Setting up the carousel creation route.
router.post('/', function(req, res) {
	var checkStmt = conn.format('SELECT IFNULL(MAX(??), 0) AS ?? FROM ??', [
		'Index',
		'LastIndex',
		'Carousel'
	]);

	conn.query(checkStmt, (checkErrors, checkResults) => {
		// Checking if there are any errors.
		if (checkErrors) throw checkErrors;

		var insertStmt = conn.format(
			'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, 0);',
			[
				'Carousel',
				'CarouselUrl',
				'Index',
				'Deleted',
				req.body['carousel-url'],
				parseInt(checkResults[0]['LastIndex']) + 1
			]
		);

		conn.query(insertStmt, function(insertErrors, insertResults) {
			// Checking if there are any errors.
			if (insertErrors) throw insertErrors;
		});

		// Setting up the flash message.
		req.flash('carousel-flash', 'تم إنشاء الصورة المميزة بنجاح');

		// Rendering the brands page.
		res.redirect('/dashboard/carousel');
	});
});

// Setting up the carousel edition route.
router.put('/', function(req, res) {
	const stmt = conn.format('UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?;', [
		'Brands',
		'BrandName',
		req.body['brand-name'],
		'Logo',
		req.body['brand-logo'],
		'BrandID',
		req.body['brand-id']
	]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('carousel-flash', 'تم تحديث الصورة المميزة بنجاح');

		// Rendering the brands page.
		res.redirect('/dashboard/carousel');
	});
});

// Setting up the carousel deletion route.
router.delete('/', function(req, res) {
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
router.put('/restore', function(req, res) {
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
