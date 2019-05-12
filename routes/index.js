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
// Setting up index route.
router.get('/', function (req, res) {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        SELECT `B`.`BrandID`, `B`.`BrandName`, `B`.`Logo` FROM `Brands` `B` WHERE `B`.`Deleted` = 0; \
        SELECT * FROM `Categories` WHERE Deleted = 0; \
        SELECT \
              `PV`.`VariantID`, \
              `P`.`ProductName`, \
		  `PV`.`VariantValue`, \
		  `PV`.`VariantType`, \
		  (SELECT `B`.`BrandName` FROM `Brands` `B` WHERE `B`.`BrandID` = `P`.`BrandID`) AS `BrandName`, \
              (SELECT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `PV`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1) AS `NewPrice`, \
              (SELECT DISTINCT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `PV`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1, 1) AS `OldPrice`, \
              (SELECT `PVF`.`VariantImage` FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID` AND `PVF`.`Deleted` = 0 LIMIT 1) AS `VariantImage`\
        FROM \
              `ProductsVariants` `PV` \
        INNER JOIN \
              `Products` `P` \
        ON \
              `PV`.`ProductID` = `P`.`ProductID` \
        WHERE \
              `PV`.`FeaturedVariant` = 1 \
              AND \
              `P`.`Deleted` = 0 \
              AND \
              (SELECT SUM(`PVF`.`Quantity`) FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID` AND `PVF`.`Deleted` = 0) > 0\
        ORDER BY RAND() \
        LIMIT 6; \
        SELECT `PV`.`VariantID`, \
              `P`.`ProductName`, \
		  `PV`.`VariantValue`, \
		  `PV`.`VariantType`, \
		  (SELECT `B`.`BrandName` FROM `Brands` `B` WHERE `B`.`BrandID` = `P`.`BrandID`) AS `BrandName`, \
              (SELECT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `PV`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1) AS `NewPrice`, \
              (SELECT DISTINCT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `PV`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1, 1) AS `OldPrice`, \
              (SELECT `PVF`.`VariantImage` FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID` AND `PVF`.`Deleted` = 0 LIMIT 1) AS `VariantImage`\
        FROM \
              `ProductsVariants` `PV` \
        INNER JOIN \
              `Products` `P` \
        ON \
              `PV`.`ProductID` = `P`.`ProductID` \
        WHERE \
              `PV`.`FeaturedVariant` = 1 \
              AND \
              `P`.`Deleted` = 0 \
              AND \
              (SELECT SUM(`PVF`.`Quantity`) FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID` AND `PVF`.`Deleted` = 0) > 0\
        ORDER BY \
              `P`.`AddedDate`\
        DESC \
        LIMIT 6; \
        SELECT `ShippingPrice` FROM `shippingpricehistory` ORDER BY `StartingDate` DESC LIMIT 1; \
        SELECT `ShippingBump` FROM `shippingbumphistory` ORDER BY `StartingDate` DESC LIMIT 1; \
        SELECT `CarouselURL`, `Tag` FROM `Carousel` WHERE `Deleted` = 0; \
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
				Brands: results[1],
				Categories: formater.groupCategories(results[2]),
				TopProducts: results[3],
				NewestProducts: results[4],
				Carousel: results[7],
				Shipping: {
					Price: results[5][0].ShippingPrice,
					Bump: results[6][0].ShippingBump
				}
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the index page.
			res.render('index', {
				Data: data
			});
		}
	);
});

// Exporting the route.
module.exports = router;
