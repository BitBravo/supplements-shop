module.exports = {
	/**
	 * Appropriately assigns the “new” class to the read messages.
	 *
	 * @param {Int} read Whether or not the message is read.
	 */
	isMsgNew: function (read) {
		if (read.readInt8(0) == 0) {
			return 'new';
		}
	},

	/**
	 * Appropriately assigns the selection mode of the entries of the mail-mode-select input.
	 *
	 * @param {Int} mode The current mail mode.
	 * @param {Int} option The according select value.
	 */
	select: function (mode, option) {
		if (mode == option) {
			return 'selected';
		}
	},

	/**
	 * Assings an appopriate tag for a category given into consideration whether it's a parent category or a sub category.
	 *
	 * @param {String} categoryParent The category's parent name.
	 */
	categoryTag: function (categoryParent) {
		if (categoryParent == null) {
			return 'فئة رئيسية';
		} else {
			return `فئة فرعية - ${categoryParent}`;
		}
	},

	/**
	 * Appropriately selects a coupon's state.
	 *
	 * @param {Bit} state Whether or not the coupon is active or idle.
	 */
	couponState: function (state) {
		if (state.readInt8(0) == 1) {
			return 'checked';
		}
	},

	/**
	 * Formats the given date.
	 *
	 * @param {Date} date The date to format.
	 */
	formatDate: function (date) {
		const moment = require('moment');

		// Setting the local timezone.
		moment.locale('ar-ma');

		return moment(date).format('MMMM Do YYYY');
	},

	/**
	 * Formats a given decimal to a currency.
	 *
	 * @param {Decimal} value The value to format.
	 */
	formatCurrency: function (value) {
		return new Intl.NumberFormat('ar-MA', {
			style: 'currency',
			currency: 'MAD'
		}).format(value);
	},

	/**
	 * Decides whether or not to print the old price.
	 *
	 * @param {Decimal} oldPrice The old price.
	 * @param {Decimal} newPrice The new price.
	 * @param {Object} options The helper's options.
	 */
	displayOldPrice: function (oldPrice, newPrice, options) {
		return oldPrice > newPrice && oldPrice != null
			? options.fn(this)
			: options.inverse(this);
	},

	/**
	 * Calculates the discount percentage.
	 *
	 * @param {Decimal} oldPrice The old price.
	 * @param {Decimal} newPrice The new price.
	 */
	calculateDiscount: function (oldPrice, newPrice) {
		return `-${Math.round(((oldPrice - newPrice) * 100) / oldPrice)}%`;
	},

	/**
	 * Displays the appropriate unite given a weight value.
	 *
	 * @param {Float} weight The weight to base the unite off of.
	 */
	formatMeasurementUnit: function (type, value) {
		var output = '';

		switch (parseInt(type)) {
			case 1: {
				output = parseFloat(value) >= 1 ? 'كلغ' : 'غرام';
				break;
			}
			case 2: {
				output = parseInt(value) > 1 ? 'حصص' : 'حصة';
				break;
			}
			case 3: {
				output = parseInt(value) > 1 ? 'قطع' : 'قطعة';
				break;
			}
		}

		return output;
	},

	/**
	 * Formats the given weight value.
	 *
	 * @param {Float} weight The weight to format.
	 */
	formatMeasurement: function (value, type) {
		var output = '';

		if (parseInt(type) === 1) {
			output = value >= 1 ? value : value * 1000;
		} else {
			output = parseInt(value);
		}

		return output;
	}
};
