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
	$('.dashboard-brands .btn-delete').on('click', function () {
		var brandId = $(this).next().val();

		$.ajax({
			url: "/dashboard/brands",
			type: "DELETE",
			data: { brandId },
			success: function () {
				location.reload();
			}
		})
	});

	// Restoring a brand.
	$('.dashboard-brands .btn-restore').on('click', function () {
		var brandId = $(this).prev().val();

		$.ajax({
			url: "/dashboard/brands/restore",
			type: "PUT",
			data: { brandId },
			success: function () {
				location.reload();
			}
		})
	});
});
