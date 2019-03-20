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


// Requiring all dependencies.
const
    mysql = require('mysql'),
    conn = mysql.createConnection({
        database: 'db_supp_maroc',
        host: 'localhost',
        password: 'Upe385LGvkhJv5KN',
        user: 'root'
    });


// Connecting to the database.
conn.connect((err) => {

    // Checking of the connection was successful or not.
    try {
        if (err) {
            if (err.errno === 1049) {
    
                console.log(`[Database]: Creating the “${conn.config.database}” database...`);
                conn.query(`CREATE DATABASE IF NOT EXISTS ${conn.config.database}`, (dbError) => {
                    
                    if (dbError) {
                        throw dbError;
                    }
                    else {
                        console.info(`[Database]: “${conn.config.database}” database was successfully created.`);
                    }
                });
    
            } else {
               throw err.sqlMessage;
            }
        } else {
            console.info(`[Database]: Connected successfully to “${conn.config.database}” database.`);
        }
    }
    catch(ex) {
        console.error(`[Database]: ${ex}.`);
    }
});
