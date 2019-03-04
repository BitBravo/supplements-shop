/**
 * 
 * @name:       supplements-maroc-store
 * @version:    1.0.0
 * @author:     EOussama
 * @license     MIT
 * @source:     https://github.com/EOussama/supplements-maroc-store
 * 
 * Supplements 
 * 
 */

// Importing the dependancies.
const
    path = require('path'),
    express = require('express'),
    app = express(),
    routers = {
        index: require('./routes/index'),
        topist: require('./routes/search')
    };


// Setting up the app.
app.set('port', process.env.PORT || 3000);
app.set('ip', process.env.IP || '127.0.0.1');
app.set("view engine", "ejs");



// Static assets.
app.use('/assets', express.static(path.join(__dirname + '/public')));
app.use('/assets', express.static(path.join(__dirname + '/bower_components')));


// Routing.
app.use(routers.index);
app.use('/topist', routers.topist);


// Error redirecting.
app.get('*', (req, res) => {

    // Rendering the error.ejs template.
    return res.render('error');
});


// Listening.
app.listen(app.get('port'), app.get('ip'), () => {

    // Logging.
    console.log(`Supplements Maroc has successfully started on port ${app.get('port')}`);
});