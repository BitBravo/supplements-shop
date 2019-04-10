$('document').ready(() => {

    // Initializing tabs.
    $('.dashboard-brands .tabs').tabs({
        duration: 50,
        swipeable: true
    });

    // Initializing the character counter.
    $('#brands-creation-tab input, #brands-edition-tab input').characterCounter();

    // Initializing the brand image box.
    $('.dashboard-brands .materialboxed').materialbox();

    // Initializing the collapsibles.
    $('.dashboard-brands .collapsible').collapsible();

    // Loading the image preview.
    $('#brand-logo').on('change', function () {

        $('#brands-creation-preview').attr('src', $(this).val());
    });

    // Deleting a brand.
    $('.dashboard-brands .btn-brand-delete').on('click', function () {

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
