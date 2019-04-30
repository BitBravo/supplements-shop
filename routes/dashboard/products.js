// Importing the dependancies.
const express = require('express'),
  mysql = require('mysql'),
  database = require('../../helpers/database'),
  getCopyrightDate = require('../../helpers/copyright'),
  formater = require('../../helpers/formater'),
  login = require('./../../helpers/login'),
  async = require('async'),
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

// Setting up the products route.
router.get('/', function (req, res) {
  conn.query(
    '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT 1;\
        SELECT `C`.*, `P`.`CategoryName` AS `CategoryParentName` FROM `Categories` `C` LEFT JOIN `Categories` `P` ON `C`.`CategoryParent` = `P`.`CategoryID` WHERE `C`.`Deleted` = 0 AND (`P`.`Deleted` = 0 OR `P`.`Deleted` IS NULL) ORDER BY `C`.`CategoryParent`, `C`.`CategoryName`; \
        SELECT * FROM `Brands` WHERE `Deleted` = 0 ORDER BY `BrandName` ASC;\
        SELECT * FROM `Flavors` WHERE `Deleted` = 0 ORDER BY `FlavorName` ASC;\
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
        Products: results[3],
        CategoriesData: formater.groupCategories(results[4]),
        Brands: results[5],
        Flavors: results[6],
        FlavorsJSON: JSON.stringify(results[6])
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the products page.
      res.render('dashboard/products', {
        Data: data
      });
    }
  );
});

// Setting up the product retrieval route.
router.get('/:productID', function (req, res) {
  const stmt = conn.format(
    '\
		SELECT * FROM ?? WHERE ?? = ?; \
		SELECT PV.*, (SELECT PH.?? FROM ?? PH WHERE PH.?? = PV.?? ORDER BY ?? DESC LIMIT 1) AS ?? FROM ?? PV WHERE PV.?? = ?; \
		SELECT * FROM ??; \
		SELECT PVF.* FROM ?? PVF INNER JOIN ?? PV ON PVF.?? = PV.?? WHERE PV.?? = ?; \
		',
    [
      //
      'Products',
      'ProductID',
      req.params.productID,
      //
      'Price',
      'PriceHistory',
      'VariantID',
      'VariantID',
      'ActivatedDate',
      'Price',
      'ProductsVariants',
      'ProductID',
      req.params.productID,
      //
      'Flavors',
      //
      'ProductsVariantsFlavors',
      'ProductsVariants',
      'VariantID',
      'VariantID',
      'ProductID',
      req.params.productID
    ]
  );
  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Rendering the products page.
    res.json(results);
  });
});

// Setting the product creation route.
router.post('/', function (req, res) {
  var stmt = conn.format('INSERT INTO ?? (??, ??, ??, ??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, 0);',
    [
      'Products', 'ProductName', 'NutritionInfo', 'Description', 'Usage', 'Warning', 'AddedDate', 'CategoryID', 'BrandID', 'Deleted',
      req.body['Name'], req.body['NutritionInfo'], req.body['Description'], req.body['Usage'], req.body['Warning'], req.body['CategoryID'], req.body['BrandID']
    ]);

  conn.query(stmt, function (errors, results) {

    // Checking if there are any errors.
    if (errors) throw errors;

    if (req.body['Stock']) {
      async.each(req.body['Stock'], function (productStock) {
        var variantStmt = conn.format('INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, 0);',
          [
            'ProductsVariants', 'ProductID', 'Weight', 'FeaturedVariant', 'Deleted',
            results.insertId, productStock['Weight'], productStock['FeaturedVariant'] == 'true' ? 1 : 0
          ]);

        conn.query(variantStmt, function (variantErrors, variantResults) {

          // Checking if there are any errors.
          if (variantErrors) throw variantErrors;

          async.each(productStock['Flavors'], function (stockFlavor) {
            var flavorsStmt = conn.format('INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, 0);',
              [
                'ProductsVariantsFlavors', 'VariantID', 'VariantImage', 'Quantity', 'FlavorID', 'Deleted',
                variantResults.insertId, stockFlavor['VariantImage'], stockFlavor['Quantity'], stockFlavor['FlavorID']
              ]);

            conn.query(flavorsStmt, function (flavorsErrors, flavorsResults) {

              // Checking if there are any errors.
              if (flavorsErrors) throw flavorsErrors;
            });
          });


          var priceStmt = conn.format('INSERT INTO ?? (??, ??, ??) VALUES (?, ?, NOW());',
            [
              'ProductsPriceHistory', 'VariantID', 'Price', 'ChangedDate',
              variantResults.insertId, productStock['Price']
            ]);

          conn.query(priceStmt, function (priceStmt, priceResults) {

            // Checking if there are any errors.
            if (priceStmt) throw priceStmt;
          });
        });
      });
    }

    // Signalung the client.
    res.send();
  });
});

// Setting up the product edition route.
router.put('/', function (req, res) {
  const stmt = conn.format(
    '\
		UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?; \
	',
    [
      'Products',
      'ProductName',
      req.body.productName,
      'Description',
      req.body.description,
      'Usage',
      req.body.usage,
      'Warning',
      req.body.warning,
      'CategoryID',
      req.body.categoryID,
      'BrandID',
      req.body.brandID,
      'ProductID',
      req.body.productID
    ]
  );

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    if (req.body.stock) {
      if (req.body.stock.add) {
        async.each(req.body.stock.add, addStock => {
          const _stmt =
            'INSERT INTO `ProductsVariants` (`ProductID`, `Weight`) VALUES (' +
            req.body.productID +
            ', ' +
            addStock.weight +
            ');';

          conn.query(_stmt, (_error, _results) => {
            // Checking if there are any errors.
            if (_error) throw _error;

            const __stmt =
              'INSERT INTO `PriceHistory` (`VariantID`, `Price`, `ActivatedDate`) VALUES (' +
              _results.insertId +
              ', ' +
              addStock.price +
              ', NOW());' +
              'INSERT INTO `ProductsVariantsFlavors` (`VariantID`, `VariantImage`, `NutritionInfo`, `Quantity`, `FlavorID`) VALUES (' +
              _results.insertId +
              ', "' +
              addStock.image +
              '", "' +
              addStock.nutrition +
              '", ' +
              addStock.quantity +
              ', ' +
              addStock.flavorID +
              ');';

            conn.query(__stmt, (__error, __results) => {
              // Checking if there are any errors.
              if (__error) throw __error;
            });
          });
        });
      }

      if (req.body.stock.edit) {
        async.each(req.body.stock.edit, editStock => {
          const _stmt =
            'UPDATE `ProductsVariantsFlavors` SET ' +
            '`VariantImage` = "' +
            editStock.image +
            '", `NutritionInfo` = "' +
            editStock.nutrition +
            '", `Quantity` = ' +
            editStock.quantity +
            ' WHERE `VariantID` = ' +
            editStock.variantID +
            '; \
								INSERT INTO `PriceHistory` (`VariantID`, `Price`, `ActivatedDate`) VALUES (' +
            editStock.variantID +
            ', ' +
            editStock.price +
            ', NOW());';

          conn.query(_stmt, (_error, _results) => {
            // Checking if there are any errors.
            if (_error) throw _error;
          });
        });
      }
    }

    // Rendering the products page.
    res.send();
  });
});

// Exporting the route.
module.exports = router;
