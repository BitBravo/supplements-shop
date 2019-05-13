/**
 * Importing the dependancies
 */
var express = require('express'),
  mysql = require('mysql'),
  router = express.Router(),
  login = require('./../../helpers/login'),
  databaseConfig = require('./../../config/database'),
  getCopyrightDate = require('./../../helpers/copyright'),
  formater = require('./../../helpers/formater');



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
 * Using the login middleware
 */
router.use(login);



/**
 * Routing
 */

// Setting up the packs route.
router.get('/', function (req, res) {
  conn.query(
    '\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories` WHERE `Deleted` = 0;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT `ProductID`, `ProductName` FROM `Products` WHERE `Deleted` = 0;\
        SELECT 1;\
        SELECT 1;\
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
        Products: results[3],
        Packs: results[4],
        DeletedPacks: results[5]
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the packs page.
      res.render('dashboard/packs', {
        Data: data,
        Messages: {
          Pack: req.flash('pack-flash')
        }
      });
    }
  );
});

// Setting the category creation route.
router.post('/', function (req, res) {
  const categoryName = req.body['category-name'],
    categoryParent =
      req.body['category-parent'] == 0 ? null : req.body['category-parent'],
    stmt = conn.format('INSERT INTO ?? (??, ??) VALUES (?, ?);', [
      'Categories',
      'CategoryName',
      'CategoryParent',
      categoryName,
      categoryParent
    ]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Setting up the flash message.
    req.flash('pack-flash', 'تم إنشاء الفئة بنجاح');

    // Rendering the categories page.
    res.redirect('/dashboard/categories');
  });
});

// Setting up the category edition route.
router.put('/', function (req, res) {
  const stmt = conn.format('UPDATE ?? SET ?? = ? WHERE ?? = ?;', [
    'Categories',
    'CategoryName',
    req.body['category-name'],
    'CategoryID',
    req.body['category-id']
  ]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Setting up the flash message.
    req.flash('pack-flash', 'تم تحديث الفئة بنجاح');

    // Rendering the categories page.
    res.redirect('/dashboard/categories');
  });
});

// Setting up the deletion route.
router.delete('/', function (req, res) {
  var categoryId = req.body['categoryId'],
    stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', [
      'Categories',
      'Deleted',
      'CategoryID',
      categoryId
    ]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Setting up the flash message.
    req.flash('pack-flash', 'تم حذف الفئة بنجاح');

    // Signaling the client.
    res.send();
  });
});

// Setting up the restoration route.
router.put('/restore', function (req, res) {
  var categoryId = req.body['categoryId'],
    stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
      'Categories',
      'Deleted',
      'CategoryID',
      categoryId
    ]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    // Setting up the flash message.
    req.flash('pack-flash', 'تمت استعادة الفئة بنجاح');

    // Signaling the client.
    res.send();
  });
});

// Exporting the route.
module.exports = router;
