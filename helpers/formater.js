/**
 * All costume data formaters used in the application.
 */

/**
 * Groups all categories together approprietely.
 *
 * @param {Object[]} categories The collection of categories.
 */
module.exports.groupCategories = function(categories) {
	const formatedCatgories = [];

	categories.forEach(category => {
		if (category.CategoryParent == null) {
			category.SubCategories = (() => {
				const cats = [];

				categories.forEach(cat => {
					if (cat.CategoryParent == category.CategoryID) {
						cats.push(cat);
					}
				});

				return cats;
			})();

			if (category.SubCategories.length) {
				formatedCatgories.push(category);
			}
		}
	});

	formatedCatgories.sort((a, b) => {
		if (a.SubCategories.length > b.SubCategories.length) {
			return -1;
		} else if (a.SubCategories.length < b.SubCategories.length) {
			return 1;
		} else {
			return 0;
		}
	});

	return formatedCatgories;
};

/**
 * Groups a collection of data by the weight's property.
 *
 * @param {Object[]} collection The collection of mixed data.
 */
module.exports.groupVariants = function(collection) {
	let track = [],
		groupedCol = [];

	collection.forEach(col => {
		if (!track.includes(col.Weight)) {
			groupedCol.push({
				Weight: col.Weight,
				Flavors: (() => {
					const flavors = [];

					collection.forEach(c => {
						if (c.Weight === col.Weight) {
							flavors.push({
								VariantID: c.VariantID,
								FlavorName: c.FlavorName
							});
						}
					});

					return flavors;
				})()
			});
			track.push(col.Weight);
		}
	});

	return groupedCol;
};

/**
 * Truncates a message for it to properly fit the screen.
 *
 * @param {String} mail The message to truncate.
 */
module.exports.truncateMessages = function(mail) {
	for (const m of mail) {
		if (m.Message.length > 80) {
			m.Message = m.Message.substring(0, 80) + '...';
		}
	}

	return mail;
};

/**
 * Readies an array of products for use in the autocompletion plugin.
 *
 * @param {Object[]} data The collection of data to format.
 */
module.exports.constructAutocompletionData = function(data) {
	var formatedData = {};

	data.forEach(d => {
		formatedData[d.ProductName] = d.VariantImage;
	});

	return formatedData;
};

/**
 * Formats a proper search filter query.
 *
 * @param {Object[]} queryDatan The collection params to form the query from.
 * @param {Object[]} conn The connection object.
 */
module.exports.formatSearchFilterQuery = function(queryData, conn) {
	var query = '',
		keys = Object.keys(queryData);

	if (keys.length > 0) {
		if (keys.indexOf('price') !== -1) {
			try {
				var price = JSON.parse(queryData['price']);

				query +=
					'AND ((SELECT `PPH`.`Price` FROM `ProductsPriceHistory` `PPH` WHERE `PPH`.`VariantID` = `PV`.`VariantID` ORDER BY `PPH`.`ChangedDate` DESC LIMIT 1) BETWEEN ' +
					price['Min'] +
					' AND ' +
					price['Max'] +
					') ';
			} catch (e) {}
		}

		if (keys.indexOf('tag') !== -1) {
			try {
				var keyword = queryData['tag'];

				query += conn.format("AND (??.?? LIKE '%" + keyword + "%') ", [
					'PV',
					'Tags',
					keyword
				]);
			} catch (e) {}
		}

		if (keys.indexOf('search') !== -1) {
			try {
				var keyword = queryData['search'];

				query += conn.format("AND (??.?? LIKE '%" + keyword + "%') ", [
					'P',
					'ProductName',
					keyword
				]);
			} catch (e) {}
		}

		if (keys.indexOf('brands') !== -1) {
			try {
				var brands = JSON.parse(queryData['brands']);

				query += conn.format('AND (??.?? IN (?)) ', ['B', 'BrandName', brands]);
			} catch (e) {}
		}

		if (keys.indexOf('categories') !== -1) {
			try {
				var categories = JSON.parse(queryData['categories']);

				query += conn.format(
					'AND (??.?? IN (?) OR (SELECT ??.?? FROM ?? ?? INNER JOIN ?? ?? ON ??.?? = ??.?? WHERE ??.?? IS NULL AND ??.?? = 0 AND ??.?? = P.CategoryID) IN (?)) ',
					[
						'C',
						'CategoryName',
						categories,
						'CP',
						'CategoryName',
						'Categories',
						'CP',
						'Categories',
						'_C',
						'CP',
						'CategoryID',
						'_C',
						'CategoryParent',
						'CP',
						'CategoryParent',
						'CP',
						'Deleted',
						'_C',
						'CategoryID',
						categories
					]
				);
			} catch (e) {}
		}
	}

	return query;
};

/**
 * Formats a proper search sort query.
 *
 * @param {Object[]} queryDatan The collection params to form the query from.
 */
module.exports.formatSearchSortQuery = function(queryData) {
	var query = '',
		keys = Object.keys(queryData);

	if (keys.length > 0) {
		if (keys.indexOf('sorting') !== -1) {
			try {
				var sorting = JSON.parse(queryData['sorting']),
					byKey = '';

				switch (parseInt(sorting['By'])) {
					case 1:
						byKey = '`P`.`ProductName`';
						break;
					case 2:
						byKey = '`NewPrice`';
						break;
					case 3:
						byKey = '`P`.`AddedDate`';
						break;
					default:
						byKey = null;
				}

				if (byKey != null) {
					query += byKey + ' ' + sorting['Mode'];
				} else {
					query += '`PV`.`FeaturedVariant` DESC';
				}
			} catch (e) {}
		} else {
			query += '`PV`.`FeaturedVariant` DESC';
		}
	} else {
		query += '`PV`.`FeaturedVariant` DESC';
	}

	return query;
};
