$('document').ready(() => {

    // Hiding the parent categories select.
    $('#parent-categories-select').hide();

    // Initializing tabs.
    $('.dashboard-categories .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#categories-creation-tab input, #categories-edition-tab input').characterCounter();

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
