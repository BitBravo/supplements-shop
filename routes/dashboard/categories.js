// Importing the dependancies.
const express = require('express'),
	mysql = require('mysql'),
	database = require('../../helpers/database'),
	getCopyrightDate = require('../../helpers/copyright'),
	formater = require('../../helpers/formater'),
	login = require('./../../helpers/login'),
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

// Setting up the categories route.
router.get('/', function(req, res) {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories` WHERE `Deleted` = 0;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT `C`.*, `P`.`CategoryName` AS `CategoryParentName` FROM `Categories` `C` LEFT JOIN `Categories` `P` ON `C`.`CategoryParent` = `P`.`CategoryID` WHERE `C`.`Deleted` = 0 AND (`P`.`Deleted` = 0 OR `P`.`Deleted` IS NULL) ORDER BY `C`.`CategoryParent`, `C`.`CategoryName`;\
        SELECT `C`.*, `P`.`CategoryName` AS `CategoryParentName` FROM `Categories` `C` LEFT JOIN `Categories` `P` ON `C`.`CategoryParent` = `P`.`CategoryID` WHERE `C`.`Deleted` = 1 ORDER BY `C`.`CategoryParent`, `C`.`CategoryName`;\
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
				CategoriesData: results[3],
				DeletedCategoriesData: results[4]
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the categories page.
			res.render('dashboard/categories', {
				Data: data,
				Messages: {
					Category: req.flash('category-flash')
				}
			});
		}
	);
});

// Setting the category creation route.
router.post('/', function(req, res) {
	const categoryName = req.body['category-name'],
		categoryParent =
			req.body['category-parent'] == 0 ? null : req.body['category-parent'],
		stmt = conn.format('INSERT INTO ?? (??, ??) VALUES (?, ?);', [
			'Categories',
			'CategoryName',
			'CategoryParent',
			categoryName,
			categoryParent
		]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('category-flash', 'تم إنشاء الفئة بنجاح');

		// Rendering the categories page.
		res.redirect('/dashboard/categories');
	});
});

// Setting up the category edition route.
router.put('/', function(req, res) {
	const stmt = conn.format('UPDATE ?? SET ?? = ? WHERE ?? = ?;', [
		'Categories',
		'CategoryName',
		req.body['category-name'],
		'CategoryID',
		req.body['category-id']
	]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('category-flash', 'تم تحديث الفئة بنجاح');

		// Rendering the categories page.
		res.redirect('/dashboard/categories');
	});
});

// Setting up the deletion route.
router.delete('/', function(req, res) {
	var categoryId = req.body['categoryId'],
		stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', [
			'Categories',
			'Deleted',
			'CategoryID',
			categoryId
		]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('category-flash', 'تم حذف الفئة بنجاح');

		// Signaling the client.
		res.send();
	});
});

// Setting up the restoration route.
router.put('/restore', function(req, res) {
	var categoryId = req.body['categoryId'],
		stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
			'Categories',
			'Deleted',
			'CategoryID',
			categoryId
		]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('category-flash', 'تمت استعادة الفئة بنجاح');

		// Signaling the client.
		res.send();
	});
});

// Exporting the route.
module.exports = router;
