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
        } else {
            $('#parent-categories-select').slideUp();
        }
    });

    // Deleting a category.
    $('.dashboard-categories .btn-category-delete').on('click', function () {

        // Getting the cateogry ID.
        const categoryId = $(this).attr('data-category-id');

        $.ajax({
            url: '/dashboard/categories',
            type: 'DELETE',
            data: { categoryId: categoryId },
            success: (data) => {

                if (data.success === true) {
                    location.reload();
                } else {
                    M.toast({ html: 'Something went wrong!' });
                }
            }
        });
    });
});
