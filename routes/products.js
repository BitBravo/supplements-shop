// Importing the dependancies.
const express = require('express'),
  mysql = require('mysql'),
  database = require('./../helpers/database'),
  getCopyrightDate = require('./../helpers/copyright'),
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
		SELECT P.*, PV.`Weight`, (SELECT F.`FlavorName` FROM `Flavors` F WHERE F.`FlavorID` = PV.`FlavorID`) AS `FlavorName`, (SELECT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1) AS `NewPrice`, (SELECT DISTINCT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1, 1) AS `OldPrice` FROM `ProductsVariants` PV INNER JOIN `Products` P ON PV.`ProductID` = P.`ProductID`; \
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
        Products: results[1]
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

// Setting up product route.
router.get('/:variantID', function(req, res) {
  conn.query(
    '\
		SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
		SELECT * FROM `Products` WHERE `ProductID` = ' +
      req.params.variantID +
      '; \
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
        Product: results[1][0]
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the products page.
      res.render('product/product', {
        Data: data
      });
    }
  );
});

// Exporting the route.
module.exports = router;
