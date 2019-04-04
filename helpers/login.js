/**
 * The loggin middleware.
 */
module.exports = function (req, res, next) {
    
    if (req.method === 'GET') {

        if (req.url.toLowerCase().indexOf('dashboard') !== -1) {
            
            if (req.session.loggedIn) {
                next();
            } else {
                res.redirect('/login');
            }
        } else {
            next();
        }
    } else {
        next();
    }
};
