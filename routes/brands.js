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
	SELECT `BrandID`, `BrandName`, `Logo` FROM `Brands` WHERE `Deleted` = 0; \
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
        Brands: results[2]
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the brands page.
      res.render('brands', {
        Data: data
      });
    }
  });
});

// Exporting the route.
module.exports = router;
