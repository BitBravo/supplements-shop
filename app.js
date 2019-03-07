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
    exphbs = require('express-handlebars'),
    app = express(),
    routers = {
        index: require('./routes/index'),
        search: require('./routes/search')
    };


// Setting up the app.
app.set('port', process.env.PORT || 3000);
app.set('ip', process.env.IP || '127.0.0.1');


// Setting up handlebars.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


// Static assets.
app.use('/assets', express.static(path.join(__dirname + '/public')));
app.use('/assets', express.static(path.join(__dirname + '/bower_components')));


// Routing.
app.use(routers.index);
app.use('/search', routers.search);


// Error redirecting.
app.get('*', (req, res) => {

    // Rendering the error page.
    return res.render('error');
});


// Listening.
app.listen(app.get('port'), app.get('ip'), () => {

    // Logging.
    console.log(`Supplements Maroc has successfully started on port ${app.get('port')}.`);
});
