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

// Setting up the coupons route.
router.get('/', function(req, res) {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories` WHERE `Deleted` = 0;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT `C`.*, (SELECT `CH`.`Discount` FROM `CouponsHistory` `CH` WHERE `C`.`CouponID` = `CH`.`CouponID` ORDER BY `CH`.`CreatedDate` DESC LIMIT 1) AS `CouponDiscount` FROM `Coupons` `C` WHERE `C`.`Deleted` = 0 ORDER BY `C`.`CouponID` DESC;\
        SELECT `C`.*, (SELECT `CH`.`Discount` FROM `CouponsHistory` `CH` WHERE `C`.`CouponID` = `CH`.`CouponID` ORDER BY `CH`.`CreatedDate` DESC LIMIT 1) AS `CouponDiscount` FROM `Coupons` `C` WHERE `C`.`Deleted` = 1 ORDER BY `C`.`CouponID` DESC;\
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
				Coupons: results[3],
				DeletedCoupons: results[4]
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the coupons page.
			res.render('dashboard/coupons', {
				Data: data,
				Messages: {
					Coupon: req.flash('coupon-flash')
				}
			});
		}
	);
});

// Setting the coupon creation route.
router.post('/', function(req, res) {
	const couponCode = req.body['coupon-code'],
		couponTimes = req.body['coupon-times'],
		couponDiscount = req.body['coupon-discount'],
		couponState = req.body['coupon-state'] == 'false' ? 0 : 1,
		stmt = conn.format('INSERT INTO ?? (??, ??, ??) VALUES (?, ?, ?);', [
			'Coupons',
			'CouponCode',
			'Times',
			'Activated',
			couponCode,
			couponTimes,
			couponState
		]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		const _stmt = conn.format(
			'INSERT INTO ?? (??, ??, ??) VALUES (?, NOW(), ?); ',
			[
				'CouponsHistory',
				'CouponID',
				'CreatedDate',
				'Discount',
				results.insertId,
				couponDiscount
			]
		);

		conn.query(_stmt, (_error, _results) => {
			// Checking if there are any errors.
			if (_error) throw _error;

			// Setting up the flash message.
			req.flash('coupon-flash', 'تم إنشاء القسيمة بنجاح');

			// Rendering the coupons page.
			res.redirect('/dashboard/coupons');
		});
	});
});

// Setting up the coupon edition route.
router.put('/', function(req, res) {
	const couponID = req.body['coupon-id'],
		couponTimes = req.body['coupon-times'],
		couponState = req.body['coupon-state'] ? 1 : 0,
		couponDiscount = req.body['coupon-discount'],
		couponOldDiscount = req.body['coupon-old-discount'],
		stmt = conn.format(
			'\
            UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?; \
            ' +
				(couponDiscount != couponOldDiscount
					? 'INSERT INTO ?? (??, ??, ??) VALUES (?, NOW(), ?);'
					: '') +
				' \
            ',
			[
				'Coupons',
				'Times',
				couponTimes,
				'Activated',
				couponState,
				'CouponID',
				couponID,
				'CouponsHistory',
				'CouponID',
				'CreatedDate',
				'Discount',
				couponID,
				couponDiscount
			]
		);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('coupon-flash', 'تم تحديث القسيمة بنجاح');

		// Rendering the coupons page.
		res.redirect('/dashboard/coupons');
	});
});

// Setting up the deletion route.
router.delete('/', function(req, res) {
	var couponId = req.body['couponId'],
		stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', [
			'Coupons',
			'Deleted',
			'CouponID',
			couponId
		]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('coupon-flash', 'تم حذف القسيمة بنجاح');

		// Signaling the client.
		res.send();
	});
});

// Setting up the restoration route.
router.put('/restore', function(req, res) {
	var couponId = req.body['couponId'],
		stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
			'Coupons',
			'Deleted',
			'CouponID',
			couponId
		]);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		// Setting up the flash message.
		req.flash('coupon-flash', 'تمت استعادة القسيمة بنجاح');

		// Signaling the client.
		res.send();
	});
});

// Exporting the route.
module.exports = router;
