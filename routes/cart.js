/**
 * Importing the dependancies
 */
var express = require('express'),
  router = express.Router();



/**
 * Routing
 */

// Setting up the cart retrieval route
router.get('/', function (req, res) {
  setTimeout(function () {
    res.json(req.session['cart']);
  }, 500);
});

// Setting up the cart addition route
router.post('/', function (req, res) {

  if ('cart' in req.session) {
    req.session['cart'].push(req.body['cart-item']);
  } else {
    req.session['cart'] = [req.body['cart-item']];
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
