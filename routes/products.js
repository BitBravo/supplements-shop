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

// Setting up products route.
router.get('/', function(req, res) {
  conn.query(
    '\
    SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
    SELECT * FROM `Categories`; \
		/*SELECT P.*, PV.`Weight`, (SELECT F.`FlavorName` FROM `Flavors` F WHERE F.`FlavorID` = PV.`FlavorID`) AS `FlavorName`, (SELECT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1) AS `NewPrice`, (SELECT DISTINCT PH.`Price` FROM `PriceHistory` PH WHERE PH.`VariantID` = PV.`VariantID` ORDER BY PH.`ActivatedDate` DESC LIMIT 1, 1) AS `OldPrice` FROM `ProductsVariants` PV INNER JOIN `Products` P ON PV.`ProductID` = P.`ProductID`*/; \
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
          Email: results[0].Email,
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
        Categories: formater.groupCategories(results[1])
        //Products: results[2]
      };

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the products page.
      res.render('product/products', {
        Data: data
      });
    }
  );
});

// Setting up product route.
router.get('/:variantID', function(req, res) {
  const stmt = conn.format(
    `
    SELECT ??, ??, ??, ??, ??, ??, ?? FROM ??; 
    SELECT * FROM ??; 
    SELECT P.??, P.??, P.??, P.??, (SELECT C.?? FROM ?? C WHERE C.?? = P.??) AS ??, (SELECT B.?? FROM ?? B WHERE B.?? = P.??) AS ?? FROM ?? P INNER JOIN ?? PV ON P.?? = PV.?? WHERE PV.?? = ?;
    SELECT PV.??, PV.??, PVF.??, PVF.??, (SELECT PH.?? FROM ?? PH WHERE PH.?? = PV.?? ORDER BY PH.?? DESC LIMIT 1) AS ??, (SELECT DISTINCT PH.?? FROM ?? PH WHERE PH.?? = PV.?? ORDER BY PH.?? DESC LIMIT 1, 1) AS ??, (SELECT F.?? FROM ?? F WHERE F.?? = PVF.??) AS ?? FROM ?? PV INNER JOIN ?? PVF ON PV.?? = PVF.?? WHERE PV.?? = ?;
    SELECT PV.??, (SELECT F.?? FROM ?? F WHERE F.?? = PVF.??) AS ??, PV.?? FROM ?? PV INNER JOIN ?? PVF ON PV.?? = PVF.?? WHERE PV.?? = (SELECT P.?? FROM ?? P INNER JOIN ?? PV ON P.?? = PV.?? WHERE PV.?? = ?) ORDER BY PV.??;`,
    [
      // Config.
      'PrimaryNumber',
      'SecondaryNumber',
      'FixedNumber',
      'Email',
      'Facebook',
      'Instagram',
      'Youtube',
      'Config',
      // Categories.
      'Categories',
      // ProductInfo.
      'ProductName',
      'Description',
      'Usage',
      'Warning',
      'CategoryName',
      'Categories',
      'CategoryID',
      'CategoryID',
      'CategoryName',
      'BrandName',
      'Brands',
      'BrandID',
      'BrandID',
      'BrandName',
      'Products',
      'ProductsVariants',
      'ProductID',
      'ProductID',
      'VariantID',
      req.params['variantID'],
      // ProductVariant.
      'VariantID',
      'Weight',
      'VariantImage',
      'NutritionInfo',
      'Price',
      'PriceHistory',
      'VariantID',
      'VariantID',
      'ActivatedDate',
      'NewPrice',
      'Price',
      'PriceHistory',
      'VariantID',
      'VariantID',
      'ActivatedDate',
      'OldPrice',
      'FlavorName',
      'Flavors',
      'FlavorID',
      'FlavorID',
      'FlavorName',
      'ProductsVariants',
      'ProductsVariantsFlavors',
      'VariantID',
      'VariantID',
      'VariantID',
      req.params['variantID'],
      // SimilarProducts.
      'VariantID',
      'FlavorName',
      'Flavors',
      'FlavorID',
      'FlavorID',
      'FlavorName',
      'Weight',
      'ProductsVariants',
      'ProductsVariantsFlavors',
      'VariantID',
      'VariantID',
      'ProductID',
      'ProductID',
      'Products',
      'ProductsVariants',
      'ProductID',
      'ProductID',
      'VariantID',
      req.params['variantID'],
      'Weight'
    ]
  );

  conn.query(stmt, (error, results) => {
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
      ProductInfo: results[2][0],
      ProductVariant: results[3][0],
      SimilarVariants: formater.groupVariants(results[4])
    };

    // Getting the proper copyright date.
    data.CopyrightDate = getCopyrightDate();

    // Rendering the products page.
    res.render('product/product', {
      Data: data
    });
  });
});

// Exporting the route.
module.exports = router;
