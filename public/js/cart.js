$(document).ready(function () {

  // Frequently used elements
  var $cartModal = $('#cart-modal');

  $cartModal.modal({
    onOpenStart: function () {

      // Add loader
      $cartModal.addClass('loading');

      // Ajax get data
    }
  });
});
