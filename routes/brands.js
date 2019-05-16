/**
 * Importing the dependancies
 */
var express = require('express'),
  mysql = require('mysql'),
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
// Setting up brands route.
router.get('/', function (req, res) {
  var stmt =
    '\
	SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
	SELECT * FROM `Categories` WHERE Deleted = 0; \
	SELECT `Packs`.`PackImage`, `Packs`.`Discount`, `PacksVariants`.`PackID`, GROUP_CONCAT(`Products`.`ProductName` SEPARATOR " + ") AS `PackName`, ((SELECT SUM((SELECT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `p_v`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1)) FROM `PacksVariants` `p_v` WHERE `p_v`.`PackID` = `Packs`.`PackID`) - `Packs`.`Discount`) AS `Price` FROM `Packs` INNER JOIN `PacksVariants` ON `Packs`.`PackID` = `PacksVariants`.`PackID` INNER JOIN `ProductsVariants` ON `ProductsVariants`.`VariantID` = `PacksVariants`.`VariantID` INNER JOIN `Products` ON `Products`.`ProductID` = `ProductsVariants`.`ProductID` where `Packs`.`Deleted` = 0 GROUP BY `Packs`.`PackID` ORDER BY `Packs`.`AddedDate` DESC; \
  SELECT `BrandName` FROM `Brands` WHERE `Deleted` = 0; \
  SELECT `C`.`CategoryName` FROM `Categories` `C` LEFT JOIN `Categories` `P` ON `C`.`CategoryParent` = `P`.`CategoryID` WHERE `C`.`Deleted` = 0 AND `P`.`Deleted` = 0 UNION SELECT `CategoryName` FROM `Categories` WHERE `Deleted` = 0 AND `CategoryParent` IS NULL; \
  ';

  conn.query(stmt, (error, results) => {
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
        Packs: results[2]
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the packs page.
      res.render('packs/packs', {
        Data: data
      });
    }
  });
});

// Exporting the route.
module.exports = router;
