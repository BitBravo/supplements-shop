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
        const flavorId = $(this).attr('data-flavor-id');

        $.ajax({
            url: '/dashboard/flavors',
            type: 'DELETE',
            data: { flavorId: flavorId },
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
