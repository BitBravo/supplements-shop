$('document').ready(() => {

    // Initializing tabs.
    $('.tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#brands-creation-tab input, #brands-edition-tab input').characterCounter();

    // Initializing the brand image box.
    $('.materialboxed').materialbox();

    // Initializing the collapsibles.
    $('.collapsible').collapsible();

    // Loading the image preview.
    $('#brand-logo').on('change', function () {

        $('#brands-creation-preview').attr('src', $(this).val());
    });
});
