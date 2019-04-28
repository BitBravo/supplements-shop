// Importing the dependancies.
const express = require("express"),
  mysql = require("mysql"),
  database = require("../../helpers/database"),
  getCopyrightDate = require("../../helpers/copyright"),
  formater = require("../../helpers/formater"),
  login = require("./../../helpers/login"),
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

// Setting up the shipping route.
router.get("/", function(req, res) {
  conn.query(
    "\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories`;\
        SELECT COUNT(`MailID`) AS `NewMail` FROM `Mail` WHERE `Read` = 0;\
        SELECT `ShippingPrice` FROM `shippingpricehistory` ORDER BY `StartingDate` DESC LIMIT 1;\
        SELECT `ShippingBump` FROM `shippingbumphistory` ORDER BY `StartingDate` DESC LIMIT 1;\
    ",
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
            Name: results[0][0].Facebook.split("|")[0],
            Link: results[0][0].Facebook.split("|")[1]
          },
          Instagram: {
            Name: results[0][0].Instagram.split("|")[0],
            Link: results[0][0].Instagram.split("|")[1]
          },
          Youtube: {
            Name: results[0][0].Youtube.split("|")[0],
            Link: results[0][0].Youtube.split("|")[1]
          }
        },
        Categories: formater.groupCategories(results[1]),
        NewMail: results[2][0].NewMail,
        Shipping: {
          Price: results[3],
          Bump: results[4]
        }
      };

      console.log(data.Shipping);

      // Getting the proper copyright date.
      data.CopyrightDate = getCopyrightDate();

      // Rendering the shipping page.
      res.render("dashboard/shipping", {
        Data: data
      });
    }
  );
});

// Exporting the route.
module.exports = router;
