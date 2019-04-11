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
});
