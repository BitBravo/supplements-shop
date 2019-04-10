$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-coupons .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#coupons-creation-tab input[type=text], #coupons-creation-tab input[type=number], #coupons-edition-tab input[type=text], #coupons-edition-tab input[type=number]').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-coupons .collapsible').collapsible();

    // Updating the coupon state.
    $('#coupon-state-toggler').on('change', function () {

        $('#coupon-state-input').val($(this).is(':checked'));
    });
});
