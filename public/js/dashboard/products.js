$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-products .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#products-creation-tab input, #products-edition-tab input').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-products .collapsible').collapsible();

    // Loading the image preview.
    $('#brand-logo').on('change', function () {

        $('#products-creation-preview').attr('src', $(this).val());
    });
});
