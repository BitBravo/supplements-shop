$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-categories .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#categories-creation-tab input, #categories-edition-tab input').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-categories .collapsible').collapsible();

    // Deleting a brand.
    $('.dashboard-categories .btn-category-delete').on('click', function () {

        // Getting the brand ID.
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
