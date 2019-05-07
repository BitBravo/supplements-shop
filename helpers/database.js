/**
 * The database's information.
 */
module.exports = {
	name: process.env.DB_DATABASE,
	host: process.env.DB_HOSTNAME,
	password: process.env.DB_PASSWORD,
	user: process.env.DB_USERNAME
};
