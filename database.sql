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
    Setting up the database
*/

-- Creating the database.
CREATE DATABASE IF NOT EXISTS `db_supp_maroc`;

-- Using the database.
USE `db_supp_maroc`;


/**
    Creating the tables.
*/

-- Brands.
CREATE TABLE IF NOT EXISTS `Brands` (
    `BrandID`   INT NOT NULL 
);

-- Products.
-- PriceHistory.
-- Tastes.
-- Orders.
-- OrdersDetails.
-- Discounts.
-- DiscountHistory.
-- Categories.
-- Mail.
-- Config.
-- Features.
