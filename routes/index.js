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

// Setting up index route.
router.get('/', function(req, res) {
  conn.query(
    '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        SELECT * FROM `Brands`; \
        SELECT * FROM `Categories`; \
        SELECT Res.* FROM (SELECT P.*, PV.`Weight`, PV.`VariantID` AS `VariantID`, (SELECT F.`FlavorName` FROM `Flavors` F INNER JOIN `ProductsVariantsFlavors` PVF ON F.`FlavorID` = PVF.`FlavorID` WHERE PVF.`VariantID` = PV.`VariantID`) AS `FlavorName`, (SELECT PVF.`VariantImage` FROM `ProductsVariantsFlavors` PVF WHERE PVF.`VariantID` = PV.`VariantID`) AS `ProductImage`, (SELECT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1) AS `NewPrice`, (SELECT DISTINCT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1, 1) AS `OldPrice` FROM `ProductsVariants` PV INNER JOIN `Products` P ON PV.`ProductID` = P.`ProductID`) AS Res ORDER BY RAND() LIMIT 6; \
        SELECT P.*, PV.`Weight`, PV.`VariantID` AS `VariantID`, (SELECT F.`FlavorName` FROM `Flavors` F INNER JOIN `ProductsVariantsFlavors` PVF ON F.`FlavorID` = PVF.`FlavorID` WHERE PVF.`VariantID` = PV.`VariantID`) AS `FlavorName`, (SELECT PVF.`VariantImage` FROM `ProductsVariantsFlavors` PVF WHERE PVF.`VariantID` = PV.`VariantID`) AS `ProductImage`, (SELECT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1) AS `NewPrice`, (SELECT DISTINCT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1, 1) AS `OldPrice` FROM `ProductsVariants` PV INNER JOIN `Products` P ON PV.`ProductID` = P.`ProductID` ORDER BY P.`AddedDate` DESC LIMIT 6; \
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
        NewestProducts: results[4]
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
