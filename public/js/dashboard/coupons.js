$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-coupons .tabs').tabs({ duration: 50 });

    // Initializing the character counter.
    $('#coupons-creation-tab input[type=text], #coupons-creation-tab input[type=number], #coupons-edition-tab input[type=text], #coupons-edition-tab input[type=number]').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-coupons .collapsible').collapsible();

    // Generating the coupon code.
    $('#coupon-code-generator-btn').on('click', () => {

        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789@';
        let
            i = 0,
            couponCode = '';

        for (i = 0; i < 50; i++) {

            const rand = Math.floor(Math.random() * chars.length);

            couponCode += chars[rand];
        }

        $('#coupon-code').val(couponCode);
        $('#coupon-code').focus();
    });

    // Updating the coupon state.
    $('#coupon-state-toggler').on('change', function () {

        $('#coupon-state-input').val($(this).is(':checked'));
    });
});
