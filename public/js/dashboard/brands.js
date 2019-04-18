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
    });
});
