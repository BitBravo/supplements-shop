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

    // Updating the coupon state.
    $('#coupon-state-toggler').on('change', function () {

        $('#coupon-state-input').val($(this).is(':checked'));
    });
});
