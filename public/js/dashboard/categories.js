$('document').ready(() => {

	// Hiding the parent categories select.
	$('#parent-categories-select').hide();

	// Setting up the parent categories dropdown.
	$('select').formSelect();

	// Initializing tabs.
	$('.dashboard-categories .tabs').tabs();

	// Initializing the character counter.
	$('#categories-creation-tab input[type=text], #categories-edition-tab input[type=text]').characterCounter();

	// Initializing the collapsibles.
	$('.dashboard-categories .collapsible').collapsible();

	// Toggle sub-category.
	$('#sub-cat').on('click', (e) => {

		if (e.target.checked === true) {
			$('#parent-categories-select').slideDown();
			$('#category-parent-par').attr('name', '');
			$('#category-parent-sub').attr('name', 'category-parent');
		} else {
			$('#parent-categories-select').slideUp();
			$('#category-parent-par').attr('name', 'category-parent');
			$('#category-parent-sub').attr('name', '');
		}
	});

	// Deleting a category.
	$('.dashboard-categories .btn-delete').on('click', function () {
		var categoryId = $(this).next().val();

		$.ajax({
			url: "/dashboard/categories",
			type: "DELETE",
			data: { categoryId },
			success: function () {
				location.reload();
			}
		})
	});

	// Restoring a category.
	$('.dashboard-categories .btn-restore').on('click', function () {
		var categoryId = $(this).prev().val();

		$.ajax({
			url: "/dashboard/categories/restore",
			type: "PUT",
			data: { categoryId },
			success: function () {
				location.reload();
			}
		})
	});
});
