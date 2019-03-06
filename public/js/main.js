$('document').ready(() => {

    // Initializing the number phone dropdown.
    $('#phone-dropdown-trigger').dropdown({
        constrainWidth: false
    });

    // Initializing the carousel.
    $('.carousel.carousel-slider').carousel({
        fullWidth: true,
        indicators: true
    });
});
