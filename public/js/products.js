$('document').ready(() => {
	// Frenquently used elements.
	var $searchKeyword = $('#search-keyword'),
		$searchBrands = $('#search-brands'),
		$searchCategories = $('#search-categories'),
		$searchFlavors = $('#search-flavors'),
		searchPrice = document.getElementById('search-price'),
		$searchAdvanced = $('#search-advanced'),
		$searchAdvancedSection = $('#search-advanced-section'),
		$priecePreview = $('#price-preview');

	// Setting up the search object.
	var Search = {
		Name: '',
		Brands: [],
		Categories: [],
		Flavors: [],
		Price: {
			Min: 0,
			Max: Infinity
		}
	};

	// Getting data.
	var data = JSON.parse($('#autocomplete-json').text());

	// Setting up the dropdowns.
	$('.product-section select').formSelect();

	// Setting up the image previews.
	$('.materialboxed').materialbox();

	// Setting up the collapsible.
	$('.product-section .collapsible').collapsible();

	// Setting up the brands input.
	$searchBrands.chips({
		placeholder: 'علامة تجارية',
		secondaryPlaceholder: '+ علامة تجارية',
		autocompleteOptions: {
			data: {
				Apple: null,
				Microsoft: null,
				Google: null
			},
			limit: 5,
			minLength: 1
		}
	});

	// Setting up the categories input.
	$searchCategories.chips({
		placeholder: 'فئة',
		secondaryPlaceholder: '+ فئة',
		autocompleteOptions: {
			data: {
				Apple: null,
				Microsoft: null,
				Google: null
			},
			limit: 5,
			minLength: 1
		}
	});

	// Setting up the flavors input.
	$searchFlavors.chips({
		placeholder: 'نكهة',
		secondaryPlaceholder: '+ نكهة',
		autocompleteOptions: {
			data: {
				Apple: null,
				Microsoft: null,
				Google: null
			},
			limit: 5,
			minLength: 1
		}
	});

	// Setting up the price input.
	noUiSlider.create(searchPrice, {
		start: [0, data['MaxPrice']],
		connect: true,
		step: 1,
		orientation: 'horizontal',
		range: {
			min: 0,
			max: data['MaxPrice']
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
			Flavors: $.map(M.Chips.getInstance($searchFlavors).chipsData, function(
				flavor
			) {
				return flavor.tag;
			}),
			Price: {
				Min: parseInt(searchPrice.noUiSlider.get()[0]),
				Max: parseInt(searchPrice.noUiSlider.get()[1])
			}
		};

		console.log(Search);
	});

	// Search reset event handler.
	$('#search-form').on('reset', function() {
		var searchBrandsInstance = M.Chips.getInstance($searchBrands),
			searchCategoriesInstance = M.Chips.getInstance($searchCategories),
			searchFlavorsInstance = M.Chips.getInstance($searchFlavors);

		for (var i = 0; i < searchBrandsInstance.chipsData.length; i++) {
			searchBrandsInstance.deleteChip(i);
			i--;
		}

		for (var i = 0; i < searchCategoriesInstance.chipsData.length; i++) {
			searchCategoriesInstance.deleteChip(i);
			i--;
		}

		for (var i = 0; i < searchFlavorsInstance.chipsData.length; i++) {
			searchFlavorsInstance.deleteChip(i);
			i--;
		}
	});

	console.log(data);
});
