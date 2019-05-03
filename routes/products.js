// Importing the dependancies.
const express = require('express'),
	mysql = require('mysql'),
	database = require('./../helpers/database'),
	getCopyrightDate = require('./../helpers/copyright'),
	formater = require('../helpers/formater'),
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

// Setting up products route.
router.get('/', function(req, res) {
	conn.query(
		'\
    SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
    SELECT * FROM `Categories` WHERE Deleted = 0; \
		SELECT 1; \
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
					Email: results[0].Email,
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
				Products: results[2]
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the products page.
			res.render('product/products', {
				Data: data
			});
		}
	);
});

// Getting all products for autocompletion purposes.
router.post('/', function(req, res) {
	conn.query('SELECT 1;', (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		const data = formater.constructAutocompletionData(results);

		// Sending the retrieved data.
		res.json({ data });
	});
});

// Setting up product route.
router.get('/:variantID', function(req, res) {
	const stmt = conn.format(
		'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = 0 AND ?? > 0 ORDER BY ?? LIMIT 1;',
		[
			'FlavorID',
			'ProductsVariantsFlavors',
			'VariantID',
			req.params['variantID'],
			'Deleted',
			'Quantity',
			'FlavorID'
		]
	);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) throw error;

		if (results.length > 0) {
			// Rendering the products page.
			res.redirect(
				'/products/' + req.params['variantID'] + '/' + results[0].FlavorID
			);
		} else {
			res.redirect('/error');
		}
	});
});

// Setting up product with flavor route.
router.get('/:variantID/:flavorID', function(req, res) {
	var checkStmt = conn.format(
		'SELECT 1 FROM ?? ?? INNER JOIN ?? ?? ON ??.?? = ??.?? WHERE ??.?? = ? AND ??.?? = ? AND ??.?? = 0 AND ??.?? > 0 AND ??.?? = 0',
		[
			'ProductsVariants',
			'PV',
			'ProductsVariantsFlavors',
			'PVF',
			'PV',
			'VariantID',
			'PVF',
			'VariantID',
			'PV',
			'VariantID',
			req.params['variantID'],
			'PVF',
			'FlavorID',
			req.params['flavorID'],
			'PVF',
			'Deleted',
			'PVF',
			'Quantity',
			'PV',
			'Deleted'
		]
	);
	conn.query(checkStmt, function(checkErrors, checkResults) {
		// Checking if there are any errors.
		if (checkErrors) throw checkErrors;

		if (checkResults.length > 0) {
			var stmt = conn.format(
				`
    SELECT ??, ??, ??, ??, ??, ??, ?? FROM ??; 
    SELECT * FROM ??  WHERE ?? = 0;
    SELECT 
          *,
          (SELECT PPH.Price FROM ProductsPriceHistory PPH WHERE PPH.VariantID = PV.VariantID ORDER BY PPH.ChangedDate DESC LIMIT 1) AS NewPrice, 
          (SELECT DISTINCT PPH.Price FROM ProductsPriceHistory PPH WHERE PPH.VariantID = PV.VariantID ORDER BY PPH.ChangedDate DESC LIMIT 1, 1) AS OldPrice
    FROM 
        Products P 
    INNER JOIN 
        ProductsVariants PV 
    ON 
        P.ProductID = PV.ProductID 
    INNER JOIN 
        ProductsVariantsFlavors PVF 
    ON 
        PV.VariantID = PVF.VariantID 
    INNER JOIN
        Flavors F
    ON
        F.FlavorID = PVF.FlavorID
    INNER JOIN
        Brands B
    ON
        B.BrandID = P.BrandID
    INNER JOIN
        Categories C
    ON
        C.CategoryID = P.CategoryID
    WHERE 
        PV.VariantID = ? 
        AND
        PVF.FlavorID = ?;
    SELECT DISTINCT 
        PV.VariantID, 
        PV.Weight 
    FROM 
        ProductsVariants PV
    INNER JOIN 
        ProductsVariantsFlavors PVF 
    ON 
        PV.VariantID = PVF.VariantID 
    WHERE 
        PV.ProductID = (SELECT _PV.ProductID FROM ProductsVariants _PV WHERE _PV.VariantID = ?) 
        AND 
        PV.Deleted = 0
        AND
        PVF.Quantity > 0
    ORDER BY
        PV.Weight ASC;
    SELECT * FROM ProductsVariantsFlavors PVF INNER JOIN Flavors F ON F.FlavorID = PVF.FlavorID WHERE PVF.VariantID = ? AND PVF.Deleted = 0 AND PVF.Quantity > 0;
    `,
				[
					// Config.
					'PrimaryNumber',
					'SecondaryNumber',
					'FixedNumber',
					'Email',
					'Facebook',
					'Instagram',
					'Youtube',
					'Config',
					// Categories.
					'Categories',
					'Deleted',
					// Product.
					req.params['variantID'],
					req.params['flavorID'],
					req.params['variantID'],
					req.params['variantID']
				]
			);
			conn.query(stmt, (error, results) => {
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
					ProductInfo: results[2][0],
					Variants: results[3],
					Flavors: results[4]
				};

				// Getting the proper copyright date.
				data.CopyrightDate = getCopyrightDate();

				// Rendering the products page.
				res.render('product/product', {
					Data: data
				});
			});
		} else {
			res.redirect('/error');
		}
	});
});

// Exporting the route.
module.exports = router;
