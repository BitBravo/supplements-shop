$('document').ready(() => {
	// Frenquently used elements.
	var $searchKeyword = $('#search-keyword'),
		$searchBrands = $('#search-brands'),
		$searchCategories = $('#search-categories'),
		searchPrice = document.getElementById('search-price'),
		$searchAdvanced = $('#search-advanced'),
		$searchAdvancedSection = $('#search-advanced-section'),
		$priecePreview = $('#price-preview');

	// Setting up the search object.
	var Search = {
		Name: '',
		Brands: [],
		Categories: [],
		Price: {
			Min: 0,
			Max: Infinity
		},
		Sorting: {
			By: 1,
			Mode: 'ASC'
		}
	};

	// Getting data.
	var data = JSON.parse($('#autocomplete-json').text());

	// Getting initialization data.
	var decodedURI = decodeURI(location.href),
		paramsArray = decodedURI.substring(decodedURI.indexOf('?') + 1).split('&'),
		initData = {
			search: '',
			brands: [],
			categories: [],
			price: {
				Min: 0,
				Max: data['MaxPrice']
			}
		};

	try {
		if (
			paramsArray.length > 0 &&
			paramsArray[0] !== '' &&
			paramsArray[0] !== decodedURI
		) {
			$.each(paramsArray, function(index, param) {
				var json,
					splitPram = param.split('='),
					paramKey = splitPram[0],
					paramValue = splitPram[1];

				if (paramValue[0] === '{' || paramValue[0] === '[') {
					json = JSON.parse(paramValue);
				} else {
					json = paramValue;
				}

				initData[paramKey] = json;
			});
		}
	} catch (e) {}

	// Setting up the dropdowns.
	$('.product-section select, #search-sort-by, #search-sort-mode').formSelect();

	// Setting up the image previews.
	$('.materialboxed').materialbox();

	// Setting up the collapsible.
	$('.product-section .collapsible').collapsible();

	// Set a default value to the search input.
	$searchKeyword.val(initData['search']);

	// Setting up the brands input.
	$searchBrands.chips({
		data: getInitData(initData['brands']),
		placeholder: 'علامة تجارية',
		secondaryPlaceholder: '+ علامة تجارية',
		autocompleteOptions: {
			data: getAutoComletionData(data['Brands'], 'BrandName'),
			limit: 5,
			minLength: 1
		}
	});

	// Setting up the categories input.
	$searchCategories.chips({
		data: getInitData(initData['categories']),
		placeholder: 'فئة',
		secondaryPlaceholder: '+ فئة',
		autocompleteOptions: {
			data: getAutoComletionData(data['Categories'], 'CategoryName'),
			limit: 5,
			minLength: 1
		}
	});

	// Setting up the price input.
	noUiSlider.create(searchPrice, {
		start: [initData['price']['Min'] || 0, initData['price']['Max'] || 1],
		connect: true,
		step: 1,
		orientation: 'horizontal',
		range: {
			min: 0,
			max: data['MaxPrice'] || 1
		},
		format: wNumb({
			decimals: 0
		})
	});

	// Hiding the advanced search section.
	$searchAdvancedSection.slideUp(0);

	// Toggle the advanced search section.
	$searchAdvanced.on('change', function() {
		$searchAdvancedSection.slideToggle();
	});

	// The priece update event handler.
	searchPrice.noUiSlider.on('update', function(values, handle) {
		$priecePreview.text(
			'[' +
				parseInt(searchPrice.noUiSlider.get()[0]) +
				' - ' +
				parseInt(searchPrice.noUiSlider.get()[1]) +
				']'
		);
	});

	// Search submit event handler.
	$('#search-form').on('submit', function(e) {
		// Stopping the page from loading.
		e.preventDefault();

		// Puting up the search object.
		Search = {
			Name: $searchKeyword.val(),
			Brands: $.map(M.Chips.getInstance($searchBrands).chipsData, function(
				brand
			) {
				return brand.tag;
			}),
			Categories: $.map(
				M.Chips.getInstance($searchCategories).chipsData,
				function(category) {
					return category.tag;
				}
			),
			Price: {
				Min: parseInt(searchPrice.noUiSlider.get()[0]),
				Max: parseInt(searchPrice.noUiSlider.get()[1])
			},
			Sorting: {
				By: $('#search-sort-by').val(),
				Mode: $('#search-sort-mode').val()
			}
		};

		// Setting up the search query.
		var query = '';

		if (Search.Price) {
			query += 'price=' + JSON.stringify(Search.Price);
		}

		if (Search.Name.length > 0) {
			query += '&search=' + Search.Name;
		}

		if (Search.Brands.length > 0) {
			query += '&brands=' + JSON.stringify(Search.Brands);
		}

		if (Search.Categories.length > 0) {
			query += '&categories=' + JSON.stringify(Search.Categories);
		}

		if (Search.Sorting) {
			query += '&sorting=' + JSON.stringify(Search.Sorting);
		}

		// Redirection.
		location.href = encodeURI('/products?' + query);
	});

	// Search reset event handler.
	$('#search-form').on('reset', function() {
		var searchBrandsInstance = M.Chips.getInstance($searchBrands),
			searchCategoriesInstance = M.Chips.getInstance($searchCategories);

		for (var i = 0; i < searchBrandsInstance.chipsData.length; i++) {
			searchBrandsInstance.deleteChip(i);
			i--;
		}

		for (var i = 0; i < searchCategoriesInstance.chipsData.length; i++) {
			searchCategoriesInstance.deleteChip(i);
			i--;
		}

		searchPrice.noUiSlider.set([0, data['MaxPrice']]);
		$searchAdvancedSection.slideUp();
	});

	function getAutoComletionData(autocompleteData, nameKey) {
		var autoData = {};

		$.each(autocompleteData, function(index, value) {
			autoData[value[nameKey]] = null;
		});

		return autoData;
	}

	function getInitData(data) {
		return $.map(data, function(dt) {
			return { tag: dt };
		});
	}
});
