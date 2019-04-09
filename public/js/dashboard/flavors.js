$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-flavors .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#flavors-creation-tab input, #flavors-edition-tab input').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-flavors .collapsible').collapsible();

    // Deleting a brand.
    $('.dashboard-flavors .btn-brand-delete').on('click', function () {

        // Getting the brand ID.
        const brandId = $(this).attr('data-brand-id');

        $.ajax({
            url: '/dashboard/brands',
            type: 'DELETE',
            data: { brandId: brandId },
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
