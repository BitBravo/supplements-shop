$('document').ready(() => {

    // Initializing the carousel.
    $('.carousel.carousel-slider').carousel({
        fullWidth: true,
        indicators: true
    });

    // Scrolling to the about section.
    $('#btn-about').on('click', () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#about").offset().top
        }, 500);
    });
});
