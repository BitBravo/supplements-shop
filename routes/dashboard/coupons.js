// Importing the dependancies.
const
    express = require('express'),
    mysql = require('mysql'),
    database = require('../../helpers/database'),
    getCopyrightDate = require('../../helpers/copyright'),
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
router.get('/', function (req, res) {

    conn.query('\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT `C`.*, `CH`.`Discount` AS `CouponDiscount` FROM `Coupons` `C` INNER JOIN `CouponsHistory` `CH` ON `C`.`CouponID` = `CH`.`CouponID` ORDER BY `CH`.`CreatedDate` DESC LIMIT 1;\
    ', (error, results) => {

            // Checking if the there are any errors.
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
                    },
                },
                NewMail: results[1][0].NewMail,
                Coupons: results[2]
            };

            // Getting the proper copyright date.
            data.CopyrightDate = getCopyrightDate();

            // Rendering the coupons page.
            res.render('dashboard/coupons', {
                Data: data
            });
        });
});


// Setting the coupon creation route.
router.post('/', function (req, res) {

    const
        couponCode = req.body['coupon-code'],
        couponDiscount = req.body['coupon-discount'],
        couponState = req.body['coupon-state'] == 'false' ? 0 : 1,
        stmt = conn.format('INSERT INTO ?? (??, ??) VALUES (?, ?);', ['Coupons', 'CouponCode', 'Activated', couponCode, couponState]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        const
            _stmt = conn.format('INSERT INTO ?? (??, ??, ??) VALUES (?, NOW(), ?); ', ['CouponsHistory', 'CouponID', 'CreatedDate', 'Discount', results.insertId, couponDiscount]);

        conn.query(_stmt, (_error, _results) => {

            // Checking if the there are any errors.
            if (_error) throw _error;

            // Rendering the coupons page.
            res.redirect('/dashboard/coupons');
        });
    });
});

// Setting up the coupon edition route.
router.put('/', function (req, res) {

    const
        couponID = req.body['coupon-id'],
        couponState = req.body['coupon-state'] ? 1 : 0,
        couponDiscount = req.body['coupon-discount']
    stmt = conn.format('\
            UPDATE ?? SET ?? = ? WHERE ?? = ?; \
            INSERT INTO ?? (??, ??, ??) VALUES (?, NOW(), ?); \
            ',
        [
            'Coupons', 'Activated', couponState, 'CouponID', couponID,
            'CouponsHistory', 'CouponID', 'CreatedDate', 'Discount', couponID, couponDiscount
        ]);

    conn.query(stmt, (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Rendering the coupons page.
        res.redirect('/dashboard/coupons');
    });
});


// Exporting the route.
module.exports = router;
