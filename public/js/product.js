$('document').ready(() => {
	// Setting up the dropdowns.
	$('.product-section select').formSelect();

	// Setting up the image previews.
	$('.materialboxed').materialbox();

	// Setting up the collapsible.
	$('.product-section .collapsible').collapsible();

	// Selecting the correct variant dropdown value.
	$.each($('.product-variant-select option'), (i, v) => {
		if ($(v).val() == $('.product-section').data('variant-id')) {
			$(v).prop('selected', true);
		} else {
			$(v).prop('selected', false);
		}

		$('.product-section select').formSelect();
	});

	// Selecting the correct flavor dropdown value.
	$.each($('.product-flavor-select option'), (i, v) => {
		if ($(v).val() == $('.product-section').data('flavor-id')) {
			$(v).prop('selected', true);
		} else {
			$(v).prop('selected', false);
		}

		$('.product-section select').formSelect();
	});

	// Removing the contenteditable attribute from the rich text content areas.
	$('.ql-editor').prop('contenteditable', false);

	// Adding the page redirect action to the variants' select input.
	$('.product-section .product-variant-select select').on('change', function() {
		window.location.href = '/products/' + $(this).val();
	});

	// Adding the page redirect action to the flavors' select inout.
	$('.product-section .product-flavor-select select').on('change', function() {
		window.location.href =
			'/products/' + $('.product-section select').val() + '/' + $(this).val();
	});
});
