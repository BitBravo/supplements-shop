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

// Exporting the route.
module.exports = router;
