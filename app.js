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


// Importing the dependancies.
const
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    exphbs = require('express-handlebars'),
    mysql = require('mysql'),
    dotenv = require('dotenv').config(),
    database = require('./helpers/database'),
    login = require('./helpers/login'),
    getCopyrightDate = require('./helpers/copyright'),
    conn = mysql.createConnection({
        database: database.name,
        host: database.host,
        password: database.password,
        user: database.user
    }),
    session = require('express-session'),
    app = express(),
    routers = {
        dashboard: require('./routes/dashboard'),
        index: require('./routes/index'),
        login: require('./routes/login'),
        search: require('./routes/search')
    };


// Setting up the app.
app.set('port', process.env.PORT || 3000);
app.set('ip', process.env.IP || '127.0.0.1');


// Setting up sessions.
app.set('trust proxy', 1);
app.use(session({
    secret: '2gQqHgF2NuH3KGJP',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


// Setting up Body Parser.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Setting up handlebars.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


// Static assets.
app.use('/assets', express.static(path.join(__dirname + '/public')));
app.use('/assets', express.static(path.join(__dirname + '/bower_components')));


// Connecting to the database.
conn.connect();


// The login-in middleware.
app.use(login);


// Routing.
app.use(routers.index);
app.use('/search', routers.search);
app.use('/dashboard', routers.dashboard);
app.use('/login', routers.login);


// Error redirecting.
app.get('*', (req, res) => {

    const data = {};

    conn.query('SELECT `PrimaryNumber`, `SecondaryNumber`, `FixedNumber`, `Email`, `Facebook`, `Instagram`, `Youtube` FROM `Config`;', (error, results) => {

        // Checking if the there are any errors.
        if (error) throw error;

        // Getting the data.
        data.Config = {
            Phone: {
                Primary: results[0].PrimaryNumber,
                Secondary: results[0].SecondaryNumber,
                Fixed: results[0].FixedNumber
            },
            Email: results[0].Email,
            Facebook: {
                Name: results[0].Facebook.split('|')[0],
                Link: results[0].Facebook.split('|')[1]
            },
            Instagram: {
                Name: results[0].Instagram.split('|')[0],
                Link: results[0].Instagram.split('|')[1]
            },
            Youtube: {
                Name: results[0].Youtube.split('|')[0],
                Link: results[0].Youtube.split('|')[1]
            }
        };

        // Getting the proper copyright date.
        data.CopyrightDate = getCopyrightDate();

        // Rendering the error page.
        res.render('error', {
            Data: data
        });
    });
});


// Listening.
app.listen(app.get('port'), app.get('ip'), () => {

    // Logging.
    console.log(`Supplements Maroc has successfully started on port ${app.get('port')}.`);
});
