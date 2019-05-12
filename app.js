/**
 *
 * @name:       supplements-maroc
 * @version:    1.0.0
 * @author:     EOussama
 * @license     GPL-3.0
 * @source:     https://github.com/EOussama/supplements-maroc
 *
 * Online store for selling workout-related protein products.
 *
 */



/**
 * Importing the dependancies
 */
var
	// Utils
	path = require('path'),
	dotenv = require('dotenv-extended').load({ overrideProcessEnv: true }),

	// Dependancies
	express = require('express'),
	methodOverride = require('method-override'),
	bodyParser = require('body-parser'),
	exphbs = require('express-handlebars'),
	mysql = require('mysql'),
	flash = require('connect-flash'),
	favicon = require('express-favicon'),
	session = require('express-session'),
	databaseConfig = require('./config/database'),
	formater = require('./helpers/formater'),
	getCopyrightDate = require('./helpers/copyright');



/**
 * Configurations
 */
var
	// Database config
	conn = mysql.createConnection({
		database: databaseConfig.name,
		host: databaseConfig.host,
		password: databaseConfig.password,
		user: databaseConfig.user,
		multipleStatements: true
	}),

	// Getting the routes
	routers = {
		dashboard: require('./routes/dashboard/dashboard'),
		index: require('./routes/index'),
		products: require('./routes/products'),
		login: require('./routes/login')
	};



/**
 * Initializing the app
 */
var app = express();

// Connecting to the database.
conn.connect();

// Setting up handlebars.
app.engine(
	'hbs',
	exphbs({
		extname: 'hbs',
		defaultLayout: 'main',
		helpers: require('./helpers/hbs')
	})
);



/**
 * Setting up the app's variable
 */
app.set('port', process.env.PORT || 3000);
app.set('trust proxy', 1);
app.set('view engine', 'hbs');



/**
 * Setting up the middlewares
 */

// Setting up sessions.
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }
	})
);

// Setting up method override.
app.use(methodOverride('_method'));

// Setting up Body Parser.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setting up connect-flash.
app.use(flash());

// Setting up the favicon.
app.use(favicon(path.join(__dirname + '/public/img/favicon.ico')));

// Updating the logg-in status.
app.use(function (req, res, next) {
	res.locals.loggedIn = req.session.loggedIn;
	next();
});



/**
 * Setting up the public assets
 */
app.use('/assets', express.static(path.join(__dirname + '/public')));
app.use('/assets', express.static(path.join(__dirname + '/node_modules')));



/**
 * Routing
 */
app.use(routers.index);
app.use('/products', routers.products);
app.use('/dashboard', routers.dashboard);
app.use('/login', routers.login);

// Error redirecting.
app.get('*', (req, res) => {
	conn.query(
		'\
        SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;\
        SELECT * FROM `Categories` WHERE `Deleted` = 0;',
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
				Categories: formater.groupCategories(results[1])
			};

			// Getting the proper copyright date.
			data.CopyrightDate = getCopyrightDate();

			// Rendering the error page.
			res.render('error', {
				Data: data
			});
		}
	);
});



/**
 * Exporting the app
 */
module.exports = app;
