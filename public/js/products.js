$('document').ready(() => {
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

	// Setting up the dropdowns.
	$('.product-section select').formSelect();

	// Setting up the image previews.
	$('.materialboxed').materialbox();

	// Setting up the collapsible.
	$('.product-section .collapsible').collapsible();

	// Search submit event handler.
	$('#search-form').on('submit', function(e) {
		// Stopping the page from loading.
		e.preventDefault();

		console.log(Search);
	});
});
