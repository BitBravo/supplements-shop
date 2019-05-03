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
	routes = {
		products: require('./products'),
		mail: require('./mail'),
		brands: require('./brands'),
		categories: require('./categories'),
		flavors: require('./flavors'),
		coupons: require('./coupons'),
		shipping: require('./shipping'),
		config: require('./config')
	},
	router = express.Router();

// Connecting to the database.
conn.connect();

// Routing dashboard related routes.
router.use('/products', routes.products);
router.use('/mail', routes.mail);
router.use('/brands', routes.brands);
router.use('/categories', routes.categories);
router.use('/flavors', routes.flavors);
router.use('/coupons', routes.coupons);
router.use('/shipping', routes.shipping);
router.use('/config', routes.config);

// Setting up dashboard route.
router.get('/', login, function(req, res) {
	conn.query(
		"\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories` WHERE `Deleted` = 0;\
        SELECT COUNT(*) AS `ProductsNum` FROM `Products`;\
        SELECT COUNT(*) AS `MailNum` FROM `Mail`;\
        SELECT COUNT(*) AS `OrdersNum` FROM `Orders`;\
        SELECT '0,00 MAD' AS `TotalRevenue`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
    ",
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
				ProductsNum: results[2][0].ProductsNum,
				MailNum: results[3][0].MailNum,
				OrdersNum: results[4][0].OrdersNum,
				TotalRevenue: results[5][0].TotalRevenue,
				NewMail: results[6][0].NewMail
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the dashboard page.
			res.render('dashboard/dashboard', {
				Data: data
			});
		}
	);
});

// Exporting the route.
module.exports = router;
