$('document').ready(() => {

	// Initializing tabs.
	$('.dashboard-brands .tabs').tabs();

	// Initializing the character counter.
	$('#brands-creation-tab input[type=text], #brands-creation-tab input[type=url], #brands-edition-tab input[type=text], #brands-edition-tab input[type=url]').characterCounter();

	// Initializing the brand image box.
	$('.dashboard-brands .materialboxed').materialbox();

	// Initializing the collapsibles.
	$('.dashboard-brands .collapsible').collapsible();

	// Loading the image preview.
	$('#brand-logo').on('change', function () {
		$('#brands-creation-preview').attr('src', $(this).val());

		$('#brands-creation-preview').on('error', function () {
			$('#brands-creation-preview').attr('src', '/assets/img/backgrounds/placeholder.jpg');
		});
	});

	// Deleting a brand.
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

	// Restoring a brand.
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
