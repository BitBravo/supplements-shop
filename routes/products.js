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
router.get('/', function (req, res) {
  conn.query(
    '\
    SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`; \
    SELECT * FROM `Categories`; \
		SELECT 1; \
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
        Categories: formater.groupCategories(results[1]),
        Products: results[2]
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

// Getting all products for autocompletion purposes.
router.post('/', function (req, res) {
  conn.query('SELECT 1;',
    (error, results) => {
      // Checking if there are any errors.
      if (error) throw error;

      const data = formater.constructAutocompletionData(results);

      // Sending the retrieved data.
      res.json({ data });
    }
  );
});

// Setting up product route.
router.get('/:variantID', function (req, res) {
  const stmt = conn.format(
    `
    SELECT ??, ??, ??, ??, ??, ??, ?? FROM ??; 
    SELECT * FROM ??; 
    SELECT P.??, P.??, P.??, P.??, (SELECT C.?? FROM ?? C WHERE C.?? = P.??) AS ??, (SELECT B.?? FROM ?? B WHERE B.?? = P.??) AS ?? FROM ?? P INNER JOIN ?? PV ON P.?? = PV.?? WHERE PV.?? = ?;
    SELECT PV.??, PV.??, PVF.??, PVF.??, (SELECT PH.?? FROM ?? PH WHERE PH.?? = PV.?? ORDER BY PH.?? DESC LIMIT 1) AS ??, (SELECT DISTINCT PH.?? FROM ?? PH WHERE PH.?? = PV.?? ORDER BY PH.?? DESC LIMIT 1, 1) AS ??, (SELECT F.?? FROM ?? F WHERE F.?? = PVF.??) AS ?? FROM ?? PV INNER JOIN ?? PVF ON PV.?? = PVF.?? WHERE PV.?? = ?;
    SELECT PV.??, (SELECT F.?? FROM ?? F WHERE F.?? = PVF.??) AS ??, PV.?? FROM ?? PV INNER JOIN ?? PVF ON PV.?? = PVF.?? WHERE PV.?? = (SELECT P.?? FROM ?? P INNER JOIN ?? PV ON P.?? = PV.?? WHERE PV.?? = ?) AND (SELECT PVF.?? FROM ?? PVF WHERE PVF.?? = PV.??) > 0 ORDER BY PV.??;
    SELECT ?? FROM ?? WHERE ?? = ?;`,
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
      'Quantity',
      'ProductsVariantsFlavors',
      'VariantID',
      'VariantID',
      'Weight',
      // Check.
      'Quantity',
      'ProductsVariantsFlavors',
      'VariantID',
      req.params['variantID']
    ]
  );

  conn.query(stmt, (error, results) => {
    // Checking if there are any errors.
    if (error) throw error;

    if (results[5][0].Quantity > 0) {
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
    } else {
      res.redirect('/error');
    }
  });
});

// Exporting the route.
module.exports = router;
