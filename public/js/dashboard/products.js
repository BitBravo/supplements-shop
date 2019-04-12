$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-products .tabs').tabs({ duration: 50 });

    // Setting up the dropdowns.
    $('select').formSelect();

    // Initializing the character counter.
    $('#products-creation-tab input[type=text], #products-edition-tab input[type=text]').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-products .collapsible').collapsible();

    // Initializing quill.
    const quill = new Quill('#editor', {
        theme: 'snow'
    });

    // Loading the image preview.
    $('#brand-logo').on('change', function () {

        $('#products-creation-preview').attr('src', $(this).val());
    });
});
