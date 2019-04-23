$('document').ready(() => {
  // Setting up the dropdowns.
  $('.product-section select').formSelect();

  // Selecting the correct dropdown.
  $.each($('.product-variant-select option'), (i, v) => {
    if ($(v).val() == $('.product-section').data('variant-id')) {
      $(v).prop('selected', true);
    } else {
      $(v).prop('selected', false);
    }

    $('.product-section select').formSelect();
  });

  $('.product-section select').on('change', function() {
    window.location.href = '/products/' + $(this).val();
  });
});
