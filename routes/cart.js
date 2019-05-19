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
        var stmt = conn.format('SELECT P.ProductName, ? AS Quantity FROM Products P INNER JOIN ProductsVariants PV ON P.ProductID = PV.ProductID WHERE PV.VariantID = ?;', [cartItem['quantity'], cartItem['id']]);

        conn.query(stmt, function (errors, results) {
          if (errors == null && results != null) {
            cart.push(results[0]);
          }
        });
      }

      if (parseInt(cartItem['type']) == 2) {
        var stmt = conn.format('SELECT 2;', []);

        conn.query(stmt, function (errors, results) {
          if (errors == null && results != null) {
            cart.push(results);
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

// Setting up the cart clearing route
router.patch('/', function (req, res) {

  // Clearing the cart
  req.session['cart'] = [];

  // Signaling the client
  res.send();
});

// Exporting the route.
module.exports = router;
