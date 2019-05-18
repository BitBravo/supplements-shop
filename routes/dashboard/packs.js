/**
 * Importing the dependancies
 */
var express = require('express'),
  mysql = require('mysql'),
  async = require('async'),
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
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
        SELECT * FROM `Categories` WHERE `Deleted` = 0; \
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0; \
        SELECT `ProductID`, `ProductName` FROM `Products` WHERE `Deleted` = 0; \
        SELECT `PacksVariants`.`PackID`, GROUP_CONCAT(`Products`.`ProductName` SEPARATOR " + ") AS `PackName`, `Packs`.`AddedDate`, COUNT(0) AS `Quantity` FROM `Packs` INNER JOIN `PacksVariants` ON `Packs`.`PackID` = `PacksVariants`.`PackID` INNER JOIN `ProductsVariants` ON `ProductsVariants`.`VariantID` = `PacksVariants`.`VariantID` INNER JOIN `Products` ON `Products`.`ProductID` = `ProductsVariants`.`ProductID` where `Packs`.`Deleted` = 0 GROUP BY `Packs`.`PackID` ORDER BY `Packs`.`AddedDate` DESC; \
        SELECT `PacksVariants`.`PackID`, GROUP_CONCAT(`Products`.`ProductName` SEPARATOR " + ") AS `PackName` FROM `Packs` INNER JOIN `PacksVariants` ON `Packs`.`PackID` = `PacksVariants`.`PackID` INNER JOIN `ProductsVariants` ON `ProductsVariants`.`VariantID` = `PacksVariants`.`VariantID` INNER JOIN `Products` ON `Products`.`ProductID` = `ProductsVariants`.`ProductID` where `Packs`.`Deleted` = 1 GROUP BY `Packs`.`PackID`; \
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

// Setting up the pack retreival route
router.get('/:packID', function (req, res) {
  var stmt = conn.format('\
    SELECT ??, ?? FROM ?? WHERE ?? = ?; \
    SELECT PV.PackVariantID, PV.VariantID, PVr.VariantType, PVr.VariantValue, P.ProductName FROM PacksVariants PV INNER JOIN ProductsVariants PVr ON PV.VariantID = PVr.VariantID INNER JOIN Products P ON  PVr.ProductID = P.ProductID WHERE PV.PackID = ?; \
    ', [
      'PackImage', 'Discount', 'Packs', 'PackID', req.params['packID'],
      req.params['packID']
    ]);

  conn.query(stmt, function (errors, results) {
    if (errors) {
      console.error(errors);
    } else {
      res.json(results);
    }
  });
});

// Setting up the products retrieval route
router.get('/variants/:productID', function (req, res) {
  var stmt = conn.format('SELECT `PV`.`VariantID`, `PV`.`VariantValue`, `PV`.`VariantType` FROM `ProductsVariants` `PV` WHERE (SELECT SUM(`PVF`.`Quantity`) FROM `ProductsVariantsFlavors` `PVF` WHERE `PVF`.`VariantID` = `PV`.`VariantID`) > 0 AND `PV`.`Deleted` = 0 AND `PV`.`ProductID` = ? ORDER BY `PV`.`VariantType` ASC;', [req.params['productID']]);

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (!error) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

// Setting the category creation route.
router.post('/', function (req, res) {
  var stmt = conn.format('INSERT INTO ?? (??, ??, ??) VALUES (?, ?, 0);', ['Packs', 'PackImage', 'Discount', 'Deleted', req.body['pack-image'], req.body['pack-discount']]);

  conn.query(stmt, function (error, results) {
    // Checking if there are any errors.
    if (error) {
      console.error(error);
      res.redirect('/error');
    } else {
      if (req.body['pack-variants']) {
        async.each(req.body['pack-variants'], function (variant) {
          var variantStmt = conn.format('INSERT INTO ?? (??, ??, ??) VALUES (?, ?, 0);', ['PacksVariants', 'PackID', 'VariantID', 'Deleted', results.insertId, variant['VariantID']]);

          conn.query(variantStmt, function (variantError) {
            if (variantError) {
              console.error(variantError);
              res.redirect('/error');
            }
          });
        });
      }
    }
  });

  // Setting up the flash message.
  req.flash('pack-flash', 'تم إنشاء الحزمة بنجاح');

  // Rendering the packs page.
  res.send();
});

// Setting up the category edition route.
router.put('/', function (req, res) {
  var stmt = conn.format('UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?;', ['Packs', 'Discount', req.body['pack-discount'], 'PackImage', req.body['pack-image'], 'PackID', req.body['pack-id']]);

  conn.query(stmt, function (errors, results) {
    if (errors) {
      console.error(errors);
    } else {

      var packsToDelete = [],
        packsToInsert = [];

      packsToInsert = req.body['pack-variants'].filter(function (variant) {
        return variant['PackVariantID'] == null ? variant : null;
      });

      packsToDelete = req.body['pack-variants'].filter(function (variant) {
        return variant['PackVariantID'] != null ? variant : null;
      }).map(function (variant) {
        return variant['PackVariantID'];
      });

      if (packsToDelete.length > 0) {
        var stmt = conn.format('DELETE FROM ?? WHERE ?? = ? AND ?? NOT IN (?);', ['PacksVariants', 'PackID', req.body['pack-id'], 'PackVariantID', packsToDelete]);

        conn.query(stmt, function (errors, results) {
          if (errors) {
            console.error(errors);
          }
        });
      }

      if (packsToInsert.length > 0) {
        async.each(packsToInsert, function (packVariant) {
          var stmt = conn.format('INSERT INTO ?? (??, ??, ??) VALUES (?, ?, 0);', ['PacksVariants', 'PackID', 'VariantID', 'Deleted', req.body['pack-id'], packVariant['VariantID']]);

          conn.query(stmt, function (errors, results) {
            if (errors) {
              console.error(errors);
            }
          });
        });
      }

      // Setting up the flash message.
      req.flash('pack-flash', 'تم تحديث الفئة بنجاح');

      // Signaling the client
      res.send();
    }
  });
});

// Setting up the deletion route.
router.delete('/', function (req, res) {
  var packId = req.body['packId'],
    stmt = conn.format('UPDATE ?? SET ?? = 1 WHERE ?? = ?;', [
      'Packs',
      'Deleted',
      'PackID',
      packId
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

  var packId = req.body['packId'],
    stmt = conn.format('UPDATE ?? SET ?? = 0 WHERE ?? = ?;', [
      'Packs',
      'Deleted',
      'PackID',
      packId
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
