/**
 * Importing the dependancies
 */
var express = require('express'),
  mysql = require('mysql'),
  async = require('async'),
  databaseConfig = require('./../config/database'),
  router = express.Router();



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

// Setting up the cart retrieval route
router.get('/', function (req, res) {
  if ('cart' in req.session) {

    var cart = [];

    async.each(req.session['cart'], function (cartItem) {

      if (parseInt(cartItem['type']) == 1) {
        var stmt = conn.format(' \
          SELECT \
                `P`.`ProductName` AS `ItemName`, \
                `PV`.`VariantValue`, \
                `PV`.`VariantType`, \
                ? AS `ID`, \
                ? AS `Type`, \
                ? AS `Quantity`, \
                (SELECT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `PV`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1) AS `ItemPrice`, \
                (SELECT `PVF`.`VariantImage` FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID` AND `PVF`.`Deleted` = 0 LIMIT 1) AS `ItemImage`\
          FROM \
                `ProductsVariants` `PV` \
          INNER JOIN \
                `Products` `P` \
          ON \
                `PV`.`ProductID` = `P`.`ProductID` \
          WHERE \
          `PV`.`VariantID` = ? \
                AND \
                `P`.`Deleted` = 0 \
                AND \
                (SELECT SUM(`PVF`.`Quantity`) FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID` AND `PVF`.`Deleted` = 0) > 0 \
        ;', [cartItem['id'], cartItem['type'], cartItem['quantity'], cartItem['id']]);

        conn.query(stmt, function (errors, results) {
          if (errors == null && results != null) {
            cart.push(results[0]);
          }
        });
      }

      if (parseInt(cartItem['type']) == 2) {
        var stmt = conn.format(' \
        SELECT `Packs`.`PackImage` AS `ItemImage`, GROUP_CONCAT(`Products`.`ProductName` SEPARATOR " + ") AS `ItemName`, ? AS `Quantity`, ((SELECT SUM((SELECT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `p_v`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1)) FROM `PacksVariants` `p_v` WHERE `p_v`.`PackID` = `Packs`.`PackID`) - `Packs`.`Discount`) AS `ItemPrice` FROM `Packs` INNER JOIN `PacksVariants` ON `Packs`.`PackID` = `PacksVariants`.`PackID` INNER JOIN `ProductsVariants` ON `ProductsVariants`.`VariantID` = `PacksVariants`.`VariantID` INNER JOIN `Products` ON `Products`.`ProductID` = `ProductsVariants`.`ProductID` where `Packs`.`Deleted` = 0 AND `Packs`.`PackID` = ? GROUP BY `Packs`.`PackID` ORDER BY `Packs`.`AddedDate` DESC; ',
          [cartItem['quantity'], cartItem['id']]);

        conn.query(stmt, function (errors, results) {
          console.log(results);
          if (errors == null && results != null) {
            cart.push(results[0]);
          }
        });
      }
    });

    setTimeout(function () {
      res.json(cart);
    }, 500);
  }
});

// Setting up the cart addition route
router.post('/', function (req, res) {

  if ('cart' in req.session) {
    req.session['cart'].push({
      'id': req.body['item-id'],
      'quantity': req.body['quantity'],
      'type': req.body['type']
    });
  } else {
    req.session['cart'] = [{
      'id': req.body['item-id'],
      'quantity': req.body['quantity'],
      'type': req.body['type']
    }];
  }

  // Signaling the client
  res.json(req.session['cart']);
});

// Setting up the cart removal route
router.delete('/', function (req, res) {

  if ('cart' in req.session) {

    // Clearing the cart
    req.session['cart'].splice(parseInt(req.body['index']), 1);
  }

  // Signaling the client
  res.send();
});

// Setting up the cart clearing route
router.patch('/', function (req, res) {

  // Clearing the cart
  req.session['cart'] = [];

  // Signaling the client
  res.send();
});

// Exporting the route.
module.exports = router;
