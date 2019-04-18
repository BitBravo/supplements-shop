$('document').ready(() => {

    // Fading out the scroll to top button by default.
    $('#scroll-to-top').fadeOut(0);

    // Initializing the burger menu's sidenav.
    $('#nav-sidebar').sidenav({
        edge: 'right'
    });

    // Initializing the modals.
    $('.modal').modal();

    // Initializing the header carousel.
    $('.carousel.carousel-slider').carousel({
        fullWidth: true,
        indicators: true
    });

    // Initializing the brands carousel.
    $('.brand-carousel').carousel({
        dist: -50,
        fullWidth: false,
        indicators: true,
        numVisible: 5,
        padding: 100
    });

    // Initializing the search box
    $('input.autocomplete').autocomplete({
        data: {
            "Apple": null,
            "Microsoft": null,
            "Google": 'https://placehold.it/250x250'
        },
    });

    // Scrolling to the about section.
    $('.about-btn').on('click', () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#about").offset().top
        }, 500);
    });

    // Detecting scrolling behavior.
    $(window).on('scroll', () => {
        if ($(this).scrollTop() >= 600) {
            $('#scroll-to-top').fadeIn(500);
        } else {
            $('#scroll-to-top').fadeOut(500);
        }
    });

    // The scroll-to-top button press event.
    $('#scroll-to-top').on('click', () => {
        $('body,html').animate({
            scrollTop: 0
        }, 300);
    });

    // The back button click.
    $('.back-btn').on('click', () => {
        history.back();
    });
});
