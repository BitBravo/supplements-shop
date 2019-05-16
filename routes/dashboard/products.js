/**
 * Importing the dependancies
 */
var express = require('express'),
	mysql = require('mysql'),
	async = require('async'),
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
// Setting up the products route.
router.get('/', function (req, res) {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories` WHERE `Deleted` = 0;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT DISTINCT `B`.`BrandName`, `P`.`ProductID`, `P`.`ProductName`, `P`.`AddedDate`, `C`.`CategoryName`, IFNULL((SELECT SUM(`PVF`.`Quantity`) FROM `ProductsVariants` `PV` INNER JOIN `ProductsVariantsFlavors` `PVF` ON `PV`.`VariantID` = `PVF`.`VariantID` WHERE `PV`.`ProductID` = `P`.`ProductID` AND `PV`.`Deleted` = 0 AND `PVF`.`Deleted` = 0), 0) AS `Quantity` FROM `Products` `P` INNER JOIN `Categories` `C` ON `P`.`CategoryID` = `C`.`CategoryID` INNER JOIN `Brands` `B` ON `P`.`BrandID` = `B`.`BrandID` WHERE `P`.`Deleted` = 0 ORDER BY `P`.`AddedDate` DESC;\
        SELECT `C`.*, `P`.`CategoryName` AS `CategoryParentName` FROM `Categories` `C` LEFT JOIN `Categories` `P` ON `C`.`CategoryParent` = `P`.`CategoryID` WHERE `C`.`Deleted` = 0 AND (`P`.`Deleted` = 0 OR `P`.`Deleted` IS NULL) ORDER BY `C`.`CategoryParent`, `C`.`CategoryName`; \
        SELECT * FROM `Brands` WHERE `Deleted` = 0 ORDER BY `BrandName` ASC;\
        SELECT * FROM `Flavors` WHERE `Deleted` = 0 ORDER BY `FlavorName` ASC;\
        SELECT `ProductID`, NULL AS `VariantID`, NULL AS `FlavorID`, `ProductName` AS `Name`, NULL AS `VariantValue`, NULL AS `VariantType`, NULL AS `Flavor` FROM `Products` WHERE `Deleted` = 1 UNION SELECT `P`.`ProductID`, `PV`.`VariantID` AS `VariantID`, NULL AS `FlavorID`, `P`.`ProductName` AS `Name`, `PV`.`VariantValue` AS `VariantValue`, `PV`.`VariantType` AS `VariantType`, NULL AS `FlavorFlavor` FROM `ProductsVariants` `PV` INNER JOIN `Products` `P` ON `PV`.`ProductID` = `P`.`ProductID` WHERE `PV`.`Deleted` = 1 UNION SELECT `P`.`ProductID`, `PV`.`VariantID` AS `VariantID`, F.`FlavorID` AS `FlavorID`, `P`.`ProductName` AS `Name`, `PV`.`VariantValue` AS `VariantValue`, `PV`.`VariantType` AS `VariantType`, `F`.`FlavorName` AS `Flavor` FROM `ProductsVariants` `PV` INNER JOIN `Products` `P` ON `PV`.`ProductID` = `P`.`ProductID` INNER JOIN `ProductsVariantsFlavors` `PVF` ON `PV`.`VariantID` = `PVF`.`VariantID` INNER JOIN `Flavors` `F` ON `PVF`.`FlavorID` = `F`.`FlavorID` WHERE `PVF`.`Deleted` = 1;\
				',
		(error, results) => {
			// Checking if there are any errors.
			if (error) {
				console.error(error);
				res.redirect('/error');
			} else {
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
					Products: results[3],
					CategoriesData: formater.groupCategories(results[4]),
					Brands: results[5],
					Flavors: results[6],
					FlavorsJSON: JSON.stringify(results[6]),
					DeletedProducts: results[7]
				};

				// Getting the proper copyright date.
				data.CopyrightDate = getCopyrightDate();

				// Rendering the products page.
				res.render('dashboard/products', {
					Data: data,
					Messages: {
						Product: req.flash('product-flash')
					}
				});
			}
		}
	);
});

// Setting up the product retrieval route.
router.get('/:productID', function (req, res) {
	const stmt = conn.format(
		'\
    SELECT * FROM ?? WHERE ?? = ?;\
    SELECT ??.??, ??.??, ??.??, ??.??, ??.??, (SELECT ??.?? From ProductsPriceHistory ?? WHERE ??.?? = ??.?? ORDER BY ??.?? DESC LIMIT 1) AS ?? FROM ?? ?? WHERE ??.?? = ? AND ??.?? = 0;\
    SELECT ??.??, ??.??, ??.??, ??.?? FROM ?? ?? INNER JOIN ?? ?? ON ??.?? = ??.?? WHERE ??.?? = ? AND ??.?? = 0 AND ??.?? = 0;\
  ',
		[
			// Meta data.
			'Products',
			'ProductID',
			req.params['productID'],
			// Stock data
			'PV',
			'VariantID',
			'PV',
			'VariantValue',
			'PV',
			'VariantType',
			'PV',
			'Tags',
			'PV',
			'FeaturedVariant',
			'PPH',
			'Price',
			'PPH',
			'PPH',
			'VariantID',
			'PV',
			'VariantID',
			'PPH',
			'ChangedDate',
			'Price',
			'ProductsVariants',
			'PV',
			'PV',
			'ProductID',
			req.params['productID'],
			'PV',
			'Deleted',
			// Flavors data.
			'PVF',
			'VariantID',
			'PVF',
			'FlavorID',
			'PVF',
			'Quantity',
			'PVF',
			'VariantImage',
			'ProductsVariantsFlavors',
			'PVF',
			'ProductsVariants',
			'PV',
			'PVF',
			'VariantID',
			'PV',
			'VariantID',
			'PV',
			'ProductID',
			req.params['productID'],
			'PV',
			'Deleted',
			'PVF',
			'Deleted'
		]
	);

	conn.query(stmt, (error, results) => {
		// Checking if there are any errors.
		if (error) {
			console.error(error);
			res.redirect('/error');
		} else {
			// Rendering the products page.
			res.json(results);
		}
	});
});

// Setting the product creation route.
router.post('/', function (req, res) {
	var stmt = conn.format(
		'INSERT INTO ?? (??, ??, ??, ??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, 0);',
		[
			'Products',
			'ProductName',
			'NutritionInfo',
			'Description',
			'Usage',
			'Warning',
			'AddedDate',
			'CategoryID',
			'BrandID',
			'Deleted',
			req.body['Name'],
			req.body['NutritionInfo'],
			req.body['Description'],
			req.body['Usage'],
			req.body['Warning'],
			req.body['CategoryID'],
			req.body['BrandID']
		]
	);

	conn.query(stmt, function (errors, results) {
		// Checking if there are any errors.
		if (errors) {
			console.error(errors);
			res.redirect('/error');
		} else {
			if (req.body['Stock']) {
				async.each(req.body['Stock'], function (productStock) {
					var variantStmt = conn.format(
						'INSERT INTO ?? (??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, 0);',
						[
							'ProductsVariants',
							'ProductID',
							'VariantValue',
							'VariantType',
							'Tags',
							'FeaturedVariant',
							'Deleted',
							results.insertId,
							productStock['Value'],
							productStock['Type'],
							productStock['Tags'] != null
								? productStock['Tags'].join(',')
								: '',
							productStock['FeaturedVariant'] == 'true' ? 1 : 0
						]
					);

					conn.query(variantStmt, function (variantErrors, variantResults) {
						// Checking if there are any errors.
						if (variantErrors) {
							console.error(variantErrors);
							res.redirect('/error');
						} else {
							async.each(productStock['Flavors'], function (stockFlavor) {
								var flavorsStmt = conn.format(
									'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, 0);',
									[
										'ProductsVariantsFlavors',
										'VariantID',
										'VariantImage',
										'Quantity',
										'FlavorID',
										'Deleted',
										variantResults.insertId,
										stockFlavor['VariantImage'],
										stockFlavor['Quantity'],
										stockFlavor['FlavorID']
									]
								);

								conn.query(flavorsStmt, function (
									flavorsErrors,
									flavorsResults
								) {
									// Checking if there are any errors.
									if (flavorsErrors) {
										console.error(flavorsErrors);
										res.redirect('/error');
									}
								});
							});
						}

						var priceStmt = conn.format(
							'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, NOW());',
							[
								'ProductsPriceHistory',
								'VariantID',
								'Price',
								'ChangedDate',
								variantResults.insertId,
								productStock['Price']
							]
						);

						conn.query(priceStmt, function (priceErrors, priceResults) {
							// Checking if there are any errors.
							if (priceErrors) {
								console.error(priceErrors);
								res.redirect('/error');
							}
						});
					});
				});
			}

			// Setting up the flash message.
			req.flash('product-flash', 'تم إنشاء المنتوج بنجاح');

			// Signalung the client.
			res.send();
		}
	});
});

// Setting up the product edition route.
router.put('/', function (req, res) {
	var stmt = conn.format(
		'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?;',
		[
			'Products',
			'ProductName',
			req.body['Name'],
			'NutritionInfo',
			req.body['NutritionInfo'],
			'BrandID',
			req.body['BrandID'],
			'CategoryID',
			req.body['CategoryID'],
			'Description',
			req.body['Description'],
			'Warning',
			req.body['Warning'],
			'Usage',
			req.body['Usage'],
			'ProductID',
			req.body['ID']
		]
	);

	conn.query(stmt, function (errors, results) {
		// Checking if there are any errors.
		if (errors) {
			console.error(errors);
			res.redirect('/error');
		} else {
			if (req.body['Stock']) {
				var update = req.body['Stock'].filter(function (stk) {
					if (parseInt(stk.VariantID) !== 0) {
						return true;
					} else {
						return false;
					}
				}),
					insert = req.body['Stock'].filter(function (stk) {
						if (parseInt(stk.VariantID) === 0) {
							return true;
						} else {
							return false;
						}
					});

				// Updates.
				async.each(update, function (upStock) {
					var stockUpdateStmt = conn.format(
						'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?;',
						[
							'ProductsVariants',
							'FeaturedVariant',
							upStock['FeaturedVariant'] == 'true' ? 1 : 0,
							'VariantType',
							upStock['Type'],
							'Tags',
							upStock['Tags'] != null ? upStock['Tags'].join(',') : '',
							'VariantID',
							upStock['VariantID']
						]
					);

					conn.query(stockUpdateStmt, function (
						stockUpdateErrors,
						stockUpdateResults
					) {
						// Checking if there are any errors.
						if (stockUpdateErrors) {
							console.error(stockUpdateErrors);
							res.redirect('/error');
						} else {
							var stockPriceCheckStmt = conn.format(
								'SELECT ?? FROM ?? WHERE ?? = ? ORDER BY ?? DESC LIMIT 1;',
								[
									'Price',
									'ProductsPriceHistory',
									'VariantID',
									upStock['VariantID'],
									'ChangedDate'
								]
							);

							conn.query(stockPriceCheckStmt, function (
								stockPriceCheckErrors,
								stockPriceCheckResults
							) {
								// Checking if there are any errors.
								if (stockPriceCheckErrors) {
									console.error(stockPriceCheckErrors);
									res.redirect('/error');
								} else {
									if (stockPriceCheckResults[0].Price != upStock['Price']) {
										var stockPriceStmt = conn.format(
											'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, NOW());',
											[
												'ProductsPriceHistory',
												'VariantID',
												'Price',
												'ChangedDate',
												upStock['VariantID'],
												upStock['Price']
											]
										);

										conn.query(stockPriceStmt, function (
											stockPriceErrors,
											stockPriceResults
										) {
											// Checking if there are any errors.
											if (stockPriceErrors) {
												console.error(stockPriceErrors);
												res.redirect('/error');
											}
										});
									}
								}
							});
						}

						async.each(upStock['Flavors'], function (flv) {
							if (flv['VariantID']) {
								var flavorUpdateStmt = conn.format(
									'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ?',
									[
										'ProductsVariantsFlavors',
										'VariantImage',
										flv['VariantImage'],
										'Quantity',
										flv['Quantity'],
										'VariantID',
										flv['VariantID'],
										'FlavorID',
										flv['FlavorID']
									]
								);

								conn.query(flavorUpdateStmt, function (
									flavorUpdateErrors,
									flavorUpdateResults
								) {
									// Checking if there are any errors.
									if (flavorUpdateErrors) throw flavorUpdateErrors;
								});
							} else {
								var flavorInsertStmt = conn.format(
									'INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?);',
									[
										'ProductsVariantsFlavors',
										'VariantID',
										'VariantImage',
										'Quantity',
										'FlavorID',
										upStock['VariantID'],
										flv['VariantImage'],
										flv['Quantity'],
										flv['FlavorID']
									]
								);

								conn.query(flavorInsertStmt, function (
									flavorInsertErrors,
									flavorInsertResults
								) {
									// Checking if there are any errors.
									if (flavorInsertErrors) throw flavorInsertErrors;
								});
							}
						});

						async.each(upStock['DeletedFlavors'], function (flvId) {
							var flavorDeletionStmt = conn.format(
								'UPDATE ?? SET ?? = 1 WHERE ?? = ? AND ?? = ?;',
								[
									'ProductsVariantsFlavors',
									'Deleted',
									'VariantID',
									upStock['VariantID'],
									'FlavorID',
									flvId
								]
							);

							conn.query(flavorDeletionStmt, function (
								flavorDeletionErrors,
								flavorDeletionResults
							) {
								// Checking of there are any errors.
								if (flavorDeletionErrors) throw flavorDeletionErrors;
							});
						});
					});
				});

				// Insertions.
				async.each(insert, function (inStock) {
					var stockInsertStmt = conn.format(
						'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?);',
						[
							'ProductsVariants',
							'ProductID',
							'VariantValue',
							'Tags',
							'VariantType',
							'FeaturedVariant',
							req.body['ID'],
							inStock['Value'],
							inStock['Tags'] != null ? inStock['Tags'].join(',') : '',
							inStock['Type'],
							inStock['FeaturedVariant'] == 'true' ? 1 : 0
						]
					);

					conn.query(stockInsertStmt, function (
						stockInsertErrors,
						stockInsertResults
					) {
						// Checking if there are any errors.
						if (stockInsertErrors) {
							console.error(stockInsertErrors);
							res.redirect('/error');
						} else {
							var stockPriceStmt = conn.format(
								'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, NOW());',
								[
									'ProductsPriceHistory',
									'VariantID',
									'Price',
									'ChangedDate',
									stockInsertResults.insertId,
									inStock['Price']
								]
							);

							conn.query(stockPriceStmt, function (
								stockPriceErrors,
								stockPriceResults
							) {
								// Checking if there are any errors.
								if (stockPriceErrors) {
									console.error(stockPriceErrors);
									res.redirect('/error');
								}
							});

							async.each(inStock['Flavors'], function (flv) {
								var flavorInsertStmt = conn.format(
									'INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?);',
									[
										'ProductsVariantsFlavors',
										'VariantID',
										'VariantImage',
										'Quantity',
										'FlavorID',
										stockInsertResults.insertId,
										flv['VariantImage'],
										flv['Quantity'],
										flv['FlavorID']
									]
								);

								conn.query(flavorInsertStmt, function (
									flavorInsertErrors,
									flavorInsertResults
								) {
									// Checking if there are any errors.
									if (flavorInsertErrors) {
										console.error(flavorInsertErrors);
										res.redirect('/error');
									}
								});
							});
						}
					});
				});

				// Deletions.
				async.each(req.body['DeletedVariants'], function (variantId) {
					var stockDeletionStmt = conn.format(
						'UPDATE ?? SET ?? = 1, ?? = 0 WHERE ?? = ?',
						[
							'ProductsVariants',
							'Deleted',
							'FeaturedVariant',
							'VariantID',
							variantId
						]
					);

					conn.query(stockDeletionStmt, function (
						stockDeletionErrors,
						stockDelitionResults
					) {
						// Checking if there are any errors.
						if (stockDeletionErrors) {
							console.error(stockDelitionResults);
							res.redirect('/error');
						}
					});
				});
			}

			// Setting up the flash message.
			req.flash('product-flash', 'تم تحديث المنتوج بنجاح');

			// Signaling the client.
			res.send();
		}
	});
});

// Setting up the product's deletion route.
router.delete('/', function (req, res) {
	var stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', [
		'Products',
		'Deleted',
		'ProductID',
		req.body['ID']
	]);

	conn.query(stmt, function (errors, results) {
		// Checking if there are any erros.
		if (errors) {
			console.error(errors);
			res.redirect('/error');
		}
	});

	// Setting up the flash message.
	req.flash('product-flash', 'تم حذف المنتوج بنجاح');

	// Signalign the client.
	res.send();
});

// Setting up the product restoration route.
router.put('/restore', function (req, res) {
	var data = {
		productId: parseInt(req.body['productId']),
		variantId: parseInt(req.body['variantId']),
		flavorId: parseInt(req.body['flavorId'])
	};

	if (data.flavorId) {
		var stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ? AND ?? = ?;', [
			'ProductsVariantsFlavors',
			'Deleted',
			'VariantID',
			data.variantId,
			'FlavorID',
			data.flavorId
		]);

		conn.query(stmt, function (errors, results) {
			// Checking if there are any errors.
			if (errors) {
				console.error(errors);
				res.redirect('/error');
			}
		});
	} else if (data.variantId) {
		var stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
			'ProductsVariants',
			'Deleted',
			'VariantID',
			data.variantId
		]);

		conn.query(stmt, function (errors, results) {
			// Checking if there are any errors.
			if (errors) {
				console.error(errors);
				res.redirect('/error');
			}
		});
	} else if (data.productId) {
		var stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
			'Products',
			'Deleted',
			'ProductID',
			data.productId
		]);

		conn.query(stmt, function (errors, results) {
			// Checking if there are any errors.
			if (errors) {
				console.error(errors);
				res.redirect('/error');
			}
		});
	}

	// Setting up the flash message.
	req.flash('product-flash', 'تمت استعادة المنتوج بنجاح');

	// Signaling the client.
	res.send();
});

// Exporting the route.
module.exports = router;
