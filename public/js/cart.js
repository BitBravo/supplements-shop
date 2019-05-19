$(document).ready(function () {

  // Frequently used elements
  var
    $cartModal = $('#cart-modal'),
    $cartItemsCounter = $('#cart-item-count'),
    $cartItemsContent = $('#cart-modal .collection');

  $cartModal.modal({
    onOpenStart: function () {

      // Adding a loader
      $cartModal.addClass('loading');

      // Getting the cart cata
      $.get('/cart', function (items) {
        console.log(items);

        // Emptying the items list
        $cartItemsContent.empty();

        // Updating the item counter
        $cartItemsCounter.text(items.length);

        // Displaying the cart items
        if (items.length > 0) {

          // Showing the cart's content
          $cartItemsContent.show();

          // Appending the items to the cart
          $.each(items, function (index, item) {
            $cartItemsContent.append(' \
              <li class="collection-item avatar"> \
                <img src="images/yuna.jpg" alt="The item\'s image" class="circle"> \
                <span class="title">Title</span> \
                <p>First Line <br> \
                  Second Line \
                </p> \
                <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a> \
              </li> \
            ');
          });
        } else {

          // Hiding the cart's content
          $cartItemsContent.hide();
        }

        // Removing the loader
        $cartModal.removeClass('loading');
      });
    }
  });

  // Adding a click event to the pack product addition button
  $('.cart-product-add').on('click', function () {
    var productId = $(this).data('id');

    $.post('/cart', { 'cart-item': productId, 'item-type': 1 }, function () {
      M.toast({ html: 'تمت الإضافة السلة' })
    });
  });

  // Adding a click event to the pack cart addition button
  $('.cart-pack-add').on('click', function () {
    var packId = $(this).data('id');

    $.post('/cart', { 'cart-item': packId, 'item-type': 2 }, function () {
      M.toast({ html: 'تمت الإضافة السلة' })
    });
  });
});
