$('document').ready(() => {

    // Initializing tabs.
    $('.tabs').tabs({
        swipeable: true
    });

    // Initializing the character counter.
    $('#brands-creation-tab input').characterCounter();

    // Initializing the brand image box.
    $('.materialboxed').materialbox();

    // Loading the image preview.
    $('#brand-image').on('change', function () {

        $('#brands-creation-preview').attr('src', $(this).val());
    });
});
