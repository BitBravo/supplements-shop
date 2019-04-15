module.exports = {
	/**
	 * Appropriately assigns the “new” class to the read messages.
	 *
	 * @param {Int} read Whether or not the message is read.
	 */
	isMsgNew: function(read) {
		if (read.readInt8(0) == 0) {
			return "new";
		}
	},

	/**
	 * Appropriately assigns the selection mode of the entries of the mail-mode-select input.
	 *
	 * @param {Int} mode The current mail mode.
	 * @param {Int} option The according select value.
	 */
	select: function(mode, option) {
		if (mode == option) {
			return "selected";
		}
	},

	/**
	 * Assings an appopriate tag for a category given into consideration whether it's a parent category or a sub category.
	 *
	 * @param {String} categoryParent The category's parent name.
	 */
	categoryTag: function(categoryParent) {
		if (categoryParent == null) {
			return "Parent category";
		} else {
			return `Sub category of ${categoryParent}`;
		}
	},

	/**
	 * Appropriately selects a coupon's state.
	 *
	 * @param {Bit} state Whether or not the coupon is active or idle.
	 */
	couponState: function(state) {
		if (state.readInt8(0) == 1) {
			return "checked";
		}
	},

	/**
	 * Formats the given date.
	 *
	 * @param {Date} date The date to format.
	 */
	formateDate: function(date) {
		const moment = require("moment");

		// Setting the local timezone.
		moment.locale("ar-ma");

		return moment(date).format("MMMM Do YYYY");
	}
};
