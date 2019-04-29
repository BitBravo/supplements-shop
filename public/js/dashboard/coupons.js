$('document').ready(() => {

	// Initializing tabs.
	$('.dashboard-coupons .tabs').tabs();

	// Initializing the character counter.
	$('#coupons-creation-tab input[type=text], #coupons-creation-tab input[type=number], #coupons-edition-tab input[type=text], #coupons-edition-tab input[type=number]').characterCounter();

	// Initializing the collapsibles.
	$('.dashboard-coupons .collapsible').collapsible();

	// Generating the coupon code.
	$('#coupon-code-generator-btn').on('click', () => {

		var
			chars = 'abcdefghijklmnopqrstuvwxyz0123456789@',
			i = 0,
			couponCode = '';

		for (i = 0; i < 50; i++) {
			var rand = Math.floor(Math.random() * chars.length);
			couponCode += chars[rand];
		}

		$('#coupon-code').val(couponCode);
		$('#coupon-code').focus();
	});

	// Updating the coupon state.
	$('#coupon-state-toggler').on('change', function () {
		$('#coupon-state-input').val($(this).is(':checked'));
	});

	// Deleting the coupon.
	$('.dashboard-coupons .btn-delete').on('click', function () {
		var couponId = $(this).next().val();

		$.ajax({
			url: "/dashboard/coupons/",
			type: "DELETE",
			data: { couponId },
			success: function () {
				location.reload();
			}
		})
	});

	// Restoring a coupon.
	$('.dashboard-coupons .btn-restore').on('click', function () {
		var couponId = $(this).closest('input[type=hidden]').data('coupon-id');

		console.log(couponId);
	});
});
