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

-- Config.
CREATE TABLE IF NOT EXISTS `Config` (
    `Password`          VARCHAR(100) NOT NULL,
    `PrimaryNumber`     VARCHAR(20) NOT NULL,
    `SecondaryNumber`   VARCHAR(20) NOT NULL,
    `FixedNumber`       VARCHAR(20) NOT NULL,
    `Email`             VARCHAR(50) NOT NULL,
    `Facebook`          NVARCHAR(100),
    `Instagram`         NVARCHAR(100),
    `Youtube`           NVARCHAR(100)
);

-- Mail.
CREATE TABLE IF NOT EXISTS `Mail` (
    `MailID`            INT NOT NULL AUTO_INCREMENT,
    `SenderEmail`       VARCHAR(80) NOT NULL,
    `SenderName`        VARCHAR(300) NOT NULL,
    `Message`           TEXT NOT NULL,
    `IssueDate`         DATETIME NOT NULL DEFAULT NOW(),
    `Read`              BIT NOT NULL DEFAULT 0,          

    CONSTRAINT pk_mail_id PRIMARY KEY (`MailID`)
);

-- Brands.
CREATE TABLE IF NOT EXISTS `Brands` (
    `BrandID`           SMALLINT NOT NULL AUTO_INCREMENT,
    `BrandName`         VARCHAR(50) NOT NULL,
    `Logo`              VARCHAR(300) NOT NULL,

    CONSTRAINT pk_brands_id PRIMARY KEY (`BrandID`)
);

-- Flavors.
CREATE TABLE IF NOT EXISTS `Flavors` (
    `FlavorID`           SMALLINT NOT NULL AUTO_INCREMENT,
    `FlavorName`         VARCHAR(30) NOT NULL,

    CONSTRAINT pk_flavor_id PRIMARY KEY (`FlavorID`)
);

-- Categories.
CREATE TABLE IF NOT EXISTS `Categories` (
    `CategoryID`        SMALLINT NOT NULL AUTO_INCREMENT,
    `CategoryName`      VARCHAR(50) NOT NULL,
    `CategoryParent`    SMALLINT NULL,

    CONSTRAINT pk_categories_id PRIMARY KEY (`CategoryID`),
    CONSTRAINT fk_categories_id FOREIGN KEY (`CategoryParent`) REFERENCES `Categories` (`CategoryID`)
);

-- Coupons.
CREATE TABLE IF NOT EXISTS `Coupons` (
    `CouponID`          SMALLINT NOT NULL AUTO_INCREMENT,
    `CouponCode`        VARCHAR(50) NOT NULL,
    `Activated`         BIT NOT NULL DEFAULT 1,

    CONSTRAINT pk_coupons_id PRIMARY KEY(`CouponID`)
);

-- CouponsHistory.
CREATE TABLE IF NOT EXISTS `CouponsHistory` (
    `CouponID`          SMALLINT NOT NULL,
    `CreatedDate`       DATETIME NOT NULL DEFAULT NOW(),
    `Discount`          TINYINT NOT NULL,

    CONSTRAINT pk_coupons_history_id PRIMARY KEY (`CouponID`, `CreatedDate`),
    CONSTRAINT fk_coupons_history_id FOREIGN KEY (`CouponID`) REFERENCES `Coupons` (`CouponID`),
    CONSTRAINT ck_coupons_history_dc CHECK (`Discount` BETWEEN 0 AND 100)
);

-- ShippingBumpHistory.
CREATE TABLE IF NOT EXISTS `ShippingBumpHistory` (
    `ShippingBump`      DOUBLE NOT NULL,
    `StartingDate`      DATETIME NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_shipping_bump_history_id PRIMARY KEY (`ShippingBump`, `StartingDate`)
);

-- ShippingPriceHistory.
CREATE TABLE IF NOT EXISTS `ShippingPriceHistory` (
    `ShippingPrice`     DOUBLE NOT NULL,
    `StartingDate`      DATETIME NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_shipping_price_history_id PRIMARY KEY (`ShippingPrice`, `StartingDate`)
);

-- Products.
CREATE TABLE IF NOT EXISTS `Products` (
    `ProductID`         INT NOT NULL AUTO_INCREMENT,
    `ProductName`       VARCHAR(80) NOT NULL,
    `CategoryID`        SMALLINT NOT NULL,
    `Description`       TEXT NOT NULL,
    `NutritionInfo`     VARCHAR(100) NOT NULL,
    `Usage`             TEXT NOT NULL,
    `Warning`           TEXT NOT NULL,
    `BrandID`           SMALLINT NOT NULL,
    `FlavorID`           SMALLINT NOT NULL,
    `AddedDate`         DATETIME NOT NULL DEFAULT NOW(),
    `Quantity`          SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT pk_products_id PRIMARY KEY (`ProductID`),
    CONSTRAINT fk_products_cat FOREIGN KEY (`CategoryID`) REFERENCES `Categories` (`CategoryID`),
    CONSTRAINT fk_products_brd FOREIGN KEY (`BrandID`) REFERENCES `Brands` (`BrandID`),
    CONSTRAINT fk_products_tst FOREIGN KEY (`FlavorID`) REFERENCES `Flavors` (`FlavorID`)
);

-- PriceHistory.
CREATE TABLE IF NOT EXISTS `PriceHistory` (
    `ProductID`         INT NOT NULL,
    `Price`             DOUBLE NOT NULL,
    `ActivatedDate`     DATETIME NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_price_history_id PRIMARY KEY (`ProductID`, `ActivatedDate`),
    CONSTRAINT fk_price_history_id FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`)
);

-- OrderStates.
CREATE TABLE IF NOT EXISTS `OrderStates` (
    `StateID`       TINYINT NOT NULL AUTO_INCREMENT,
    `StateName`     VARCHAR(50) NOT NULL,

    CONSTRAINT pk_order_states_id PRIMARY KEY (`StateID`)
);

-- Orders.
CREATE TABLE IF NOT EXISTS `Orders` (
    `OrderID`           INT NOT NULL AUTO_INCREMENT,
    `OrderReference`    VARCHAR(50) NOT NULL UNIQUE,
    `OrderDate`         DATETIME NOT NULL DEFAULT NOW(),
    `Firstname`         VARCHAR(50) NOT NULL,
    `Lastname`          VARCHAR(50) NOT NULL,
    `PhoneNumber`       VARCHAR(30) NOT NULL,
    `Email`             VARCHAR(50) NOT NULL,
    `City`              VARCHAR(30) NOT NULL,
    `Address`           VARCHAR(100) NOT NULL,
    `StateID`           TINYINT NOT NULL,
    `CouponID`          SMALLINT NULL,

    CONSTRAINT pk_orders_id PRIMARY KEY (`OrderID`),
    CONSTRAINT fk_orders_st FOREIGN KEY (`StateID`) REFERENCES `OrderStates` (`StateID`),
    CONSTRAINT fk_orders_cp FOREIGN KEY (`CouponID`) REFERENCES `Coupons` (`CouponID`)
);

-- OrdersDetails.
CREATE TABLE IF NOT EXISTS `OrdersDetails` (
    `OrderDetailsID`     INT NOT NULL AUTO_INCREMENT,
    `OrderId`           INT NOT NULL,
    `ProductID`         INT NOT NULL,
    `Quantity`          SMALLINT NOT NULL DEFAULT 1,
    `FlavorID`           SMALLINT NOT NULL,

    CONSTRAINT pk_orders_details_id PRIMARY KEY (`OrderDetailsID`),
    CONSTRAINT fk_order_details_id FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`),
    CONSTRAINT fk_order_details_ts FOREIGN KEY (`FlavorID`) REFERENCES `Flavors` (`FlavorID`)
);

/**
    Data insertion.
*/

INSERT INTO `Config` VALUES (
    'w4jkPd5ePA5kBaAA', 
    '0656975326', 
    '0680016480', 
    '0500000000', 
    'supplementsmaroc@gmail.com', 
    'Suppléments Maroc|https://www.facebook.com/supplemaroc/',
    'supplementmaroc|https://www.instagram.com/supplementmaroc/',
    'supmar|https://www.youtube.com/'
);

INSERT INTO `OrderStates` (`StateName`) VALUES ('Issued'), ('Delivered'), ('Cancelled'), ('Rejected');
