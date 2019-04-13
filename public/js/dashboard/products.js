$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-products .tabs').tabs({ duration: 50 });

    // Setting up the dropdowns.
    $('select').formSelect();

    // Initializing the character counter.
    $('#products-creation-tab input[type=text], #products-creation-tab input[type=url], #products-edition-tab input[type=text], #products-edition-tab input[type=url]').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-products .collapsible').collapsible();

    // Initializing quill.
    const
        descEditor = new Quill('#desc-editor', {
            theme: 'snow'
        }),
        usageEditor = new Quill('#usage-editor', {
            theme: 'snow'
        }),
        warningEditor = new Quill('#warning-editor', {
            theme: 'snow'
        });

    // Loading the image preview.
    $('#brand-logo').on('change', function () {

        $('#products-creation-preview').attr('src', $(this).val());
    });
});
