$('document').ready(() => {

    // Hiding the parent categories select.
    $('#parent-categories-select').hide();

    // Setting up the orders dropdown.
    $('select').formSelect();

    // Initializing tabs.
    $('.dashboard-categories .tabs').tabs({ duration: 50 });

    // Initializing the character counter.
    $('#categories-creation-tab input[type=text], #categories-edition-tab input[type=text]').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-categories .collapsible').collapsible();

    // Toggle sub-category.
    $('#sub-cat').on('click', (e) => {

        if (e.target.checked === true) {
            $('#parent-categories-select').slideDown();
            $('#category-parent-par').attr('name', '');
            $('#category-parent-sub').attr('name', 'category-parent');
        } else {
            $('#parent-categories-select').slideUp();
            $('#category-parent-par').attr('name', 'category-parent');
            $('#category-parent-sub').attr('name', '');
        }
    });
});
