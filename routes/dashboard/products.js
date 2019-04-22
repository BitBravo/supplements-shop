// Importing the dependancies.
const express = require('express'),
  mysql = require('mysql'),
  database = require('../../helpers/database'),
  getCopyrightDate = require('../../helpers/copyright'),
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
router.get('/', function(req, res) {
  conn.query(
    '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT P.*, C.`CategoryName` AS `Category`, (SELECT SUM(PVF.`Quantity`) FROM `ProductsVariantsFlavors` PVF INNER JOIN `ProductsVariants` PV ON PVF.`VariantID` = PV.`VariantID` WHERE PV.`ProductID` = P.`ProductID`) AS `Quantity` FROM `Products` P INNER JOIN `Categories` C ON P.`CategoryID` = C.`CategoryID` ORDER BY P.`ProductName` ASC;\
        SELECT * FROM `Categories` WHERE `CategoryParent` > 0 ORDER BY `CategoryName` ASC;\
        SELECT * FROM `Brands` ORDER BY `BrandName` ASC;\
        SELECT * FROM `Flavors` ORDER BY `FlavorName` ASC;\
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
        NewMail: results[1][0].NewMail,
        Products: results[2],
        Categories: results[3],
        Brands: results[4],
        Flavors: results[5]
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
router.get('/:productID', function(req, res) {
  const stmt = conn.format(
    '\
		SELECT * FROM ?? WHERE ?? = ?; \
		SELECT PV.*, (SELECT PH.?? FROM ?? PH WHERE PH.?? = PV.?? ORDER BY ?? DESC LIMIT 1) AS ?? FROM ?? PV WHERE PV.?? = ?; \
		SELECT * FROM ??; \
		SELECT PVF.* FROM ?? PVF INNER JOIN ?? PV ON PVF.?? = PV.?? WHERE PV.?? = ?; \
		',
    [
      'Products',
      'ProductID',
      req.params.productID,
      'Price',
      'PriceHistory',
      'VariantID',
      'VariantID',
      'ActivatedDate',
      'Price',
      'ProductsVariants',
      'ProductID',
      req.params.productID,
      'Flavors',
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
router.post('/', function(req, res) {
  const stmt = conn.format(
    '\
        INSERT INTO ?? (??, ??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, NOW(), ?, ?); \
        ',
    [
      'Products',
      'ProductName',
      'Description',
      'Usage',
      'Warning',
      'AddedDate',
      'CategoryID',
      'BrandID',
      req.body.productName,
      req.body.productDescription,
      req.body.productUsage,
      req.body.productWarning,
      req.body.productCategory,
      req.body.productBrand
    ]
  );

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    if (req.body.stock) {
      req.body.stock.forEach((s, i) => {
        const _stmt = conn.format('INSERT INTO ?? (??, ??) VALUES (?, ?);', [
          'ProductsVariants',
          'ProductID',
          'Weight',
          results.insertId,
          s.weight
        ]);

        conn.query(_stmt, (_error, _results) => {
          // Checking if there are any errors.
          if (_error) throw _error;

          const __stmt = conn.format(
            'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, NOW());',
            [
              'PriceHistory',
              'VariantID',
              'Price',
              'ActivatedDate',
              _results.insertId,
              s.price
            ]
          );

          conn.query(__stmt, (__error, __results) => {
            // Checking if there are any errors.
            if (__error) throw __error;

            const ___stmt = conn.format(
              'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?);',
              [
                'ProductsVariantsFlavors',
                'VariantID',
                'VariantImage',
                'NutritionInfo',
                'Quantity',
                'FlavorID',
                _results.insertId,
                s.image,
                s.nutritionInfo,
                s.quantity,
                s.flavorID
              ]
            );

            conn.query(___stmt, (___error, ___results) => {
              if (___error) throw ___error;
            });
          });
        });
      });
    }
  });
});

// Setting up the product edition route.
router.put('/', function(req, res) {
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
