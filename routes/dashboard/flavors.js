// Importing the dependancies.
const express = require('express'),
  mysql = require('mysql'),
  database = require('../../helpers/database'),
  getCopyrightDate = require('../../helpers/copyright'),
  formater = require('../../helpers/formater'),
  login = require('./../../helpers/login'),
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

// Setting up the flavors route.
router.get('/', function (req, res) {
  conn.query(
    '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT * FROM `Flavors` WHERE `Deleted` = 0 ORDER BY `FlavorName` ASC;\
        SELECT * FROM `Flavors` WHERE `Deleted` = 1 ORDER BY `FlavorName` ASC;\
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
        Flavors: results[3],
        DeletedFlavors: results[4]
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the flavors page.
      res.render('dashboard/flavors', {
        Data: data
      });
    }
  );
});

// Setting the flavor creation route.
router.post('/', function (req, res) {
  const stmt = conn.format('INSERT INTO ?? (??) VALUES (?);', [
    'Flavors',
    'FlavorName',
    req.body['flavor-name']
  ]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Rendering the flavors page.
    res.redirect('/dashboard/flavors');
  });
});

// Setting up the flavor edition route.
router.put('/', function (req, res) {
  const stmt = conn.format('UPDATE ?? SET ?? = ? WHERE ?? = ?;', [
    'Flavors',
    'FlavorName',
    req.body['flavor-name'],
    'FlavorID',
    req.body['flavor-id']
  ]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Rendering the flavors page.
    res.redirect('/dashboard/flavors');
  });
});

// Setting up the deletion route.
router.delete('/', function (req, res) {
  var
    flavorId = req.body['flavorId'],
    stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', ['Flavors', 'Deleted', 'FlavorID', flavorId]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Signaling the client.
    res.send();
  });
});

// Setting up the restoration route.
router.put('/restore', function (req, res) {
  var
    flavorId = req.body['flavorId'],
    stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', ['Flavors', 'Deleted', 'FlavorID', flavorId]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Signaling the client.
    res.send();
  });
});

// Exporting the route.
module.exports = router;
