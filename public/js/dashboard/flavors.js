$('document').ready(() => {

	// Initializing tabs.
	$('.dashboard-flavors .tabs').tabs();

	// Initializing the character counter.
	$('#flavors-creation-tab input[type=text], #flavors-edition-tab input[type=text]').characterCounter();

	// Initializing the collapsibles.
	$('.dashboard-flavors .collapsible').collapsible();

	// Deleting a falvor.
	$('.dashboard-flavors .btn-delete').on('click', function () {
		var flavorId = $(this).next().val();

		$.ajax({
			url: "/dashboard/flavors",
			type: "DELETE",
			data: { flavorId },
			success: function () {
				location.reload();
			}
		})
	});

	// Restoring a falvor.
	$('.dashboard-flavors .btn-restore').on('click', function () {
		var flavorId = $(this).prev().val();

		$.ajax({
			url: "/dashboard/flavors/restore",
			type: "PUT",
			data: { flavorId },
			success: function () {
				location.reload();
			}
		})
	});
});
