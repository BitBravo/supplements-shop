$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-coupons .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#coupons-creation-tab input, #coupons-edition-tab input').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-coupons .collapsible').collapsible();

    // Deleting a coupon.
    $('.dashboard-coupons .btn-coupon-delete').on('click', function () {

        // Getting the coupon ID.
        const couponId = $(this).attr('data-coupon-id');

        $.ajax({
            url: '/dashboard/coupons',
            type: 'DELETE',
            data: { couponId: couponId },
            success: (data) => {

                if (data.success === true) {
                    location.reload();
                } else {
                    M.toast({ html: 'Something went wrong!' });
                }
            }
        });
    });
});
