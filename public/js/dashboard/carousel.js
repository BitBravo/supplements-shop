$('document').ready(() => {
	// Initializing tabs.
	$('.dashboard-carousel .tabs').tabs();

	// Initializing the character counter.
	$(
		'#carousel-creation-tab input[type=url], #carousel-edition-tab input[type=url]'
	).characterCounter();

	// Initializing the brand image box.
	$('.dashboard-carousel .materialboxed').materialbox();

	// Initializing the collapsibles.
	$('.dashboard-carousel .collapsible').collapsible();

	// Loading the image preview.
	$('#carousel-url').on('change', function() {
		$('#carousel-creation-preview').attr('src', $(this).val());

		$('#carousel-creation-preview').on('error', function() {
			$('#carousel-creation-preview').attr(
				'src',
				'/assets/img/backgrounds/placeholder.jpg'
			);
		});
	});

	// Deleting a brand.
	$('.dashboard-carousel .btn-delete').on('click', function() {
		var carouselId = $(this)
			.next()
			.val();

		$.ajax({
			url: '/dashboard/carousel',
			type: 'DELETE',
			data: { carouselId },
			success: function() {
				location.reload();
			}
		});
	});

	// Restoring a brand.
	$('.dashboard-carousel .btn-restore').on('click', function() {
		var carouselId = $(this)
			.prev()
			.val();

		$.ajax({
			url: '/dashboard/carousel/restore',
			type: 'PUT',
			data: { carouselId },
			success: function() {
				location.reload();
			}
		});
	});
});
