$(document).ready(function () {

  // Frequently used elements
  var
    $cartModal = $('#cart-modal'),
    $cartItemsCounter = $('#cart-item-count'),
    $cartItemsContent = $('#cart-modal .collection'),
    $cartClearBtn = $('#cart-clear-btn'),
    $navCartCounter = $('.cart-button__badge');

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
              <li class="collection-item avatar" data-index="'+ index + '" data-id="' + item['ID'] + '" data-type="' + item['Type'] + '" data-quantity="' + item['Quantity'] + '"> \
                <img src="'+ item['ItemImage'] + '" alt="The item\'s image" class="circle"> \
                <span class="title"><b>'+ item['ItemName'] + '</b> x' + item['Quantity'] + '</span> \
                <p> \
                  <span class="green-text">'+ formatCurrency(item['ItemPrice']) + '</span> \
                </p > \
                <a href="#!" class="secondary-content"><i class="material-icons red-text cart-item-remove">close</i></a> \
              </li > \
            ');
          });

          // Adding the cart-item removal event
          $('.cart-item-remove').on('click', function () {
            var
              $parentContainer = $(this).closest('.collection-item'),
              itemIndex = $parentContainer.data('index');

            $.ajax({
              url: '/cart',
              type: 'DELETE',
              data: { index: itemIndex },
              success: function () {
                $cartModal.modal('close');
                $cartModal.modal('open');
              }
            });
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

  // Adding a click event to the cart clearing button
  $cartClearBtn.on('click', function () {
    if (confirm('هل تريد حقًا مسح سلة التسوق الخاصة بك؟')) {
      $.ajax({
        url: '/cart',
        type: 'PATCH',
        success: function () {

          // Updating the item counter
          $cartItemsCounter.text('0');

          // Updating the cart badge counter
          $navCartCounter.text('0');

          // Emptying the items list
          $cartItemsContent.empty();

          // Hiding the cart's content
          $cartItemsContent.hide();

          // Displaying a toast message
          M.toast({ html: 'تم مسح العربة' });
        }
      });
    }
  });

  // Adding a click event to the pack product addition button
  $('.cart-product-add').on('click', function () {
    var
      quantityInput = document.getElementById('product-quantity'),
      productId = $(this).data('id'),
      quantity = quantityInput != null ? quantityInput.value || 1 : 1;

    if (quantityInput != null && quantityInput.validity.valid) {
      $.post('/cart', { 'item-id': productId, 'item-type': 1, 'quantity': quantity, 'type': 1 }, function (cartItems) {

        // Updating the cart badge counter
        $navCartCounter.text(cartItems.length);

        // Triggerig a toast message
        M.toast({ html: 'تمت الإضافة السلة' });
      });
    } else {
      $.post('/cart', { 'item-id': productId, 'item-type': 1, 'quantity': quantity, 'type': 1 }, function (cartItems) {

        // Updating the cart badge counter
        $navCartCounter.text(cartItems.length);

        // Triggerig a toast message
        M.toast({ html: 'تمت الإضافة السلة' });
      });
    }
  });

  // Adding a click event to the pack cart addition button
  $('.cart-pack-add').on('click', function () {
    var
      quantityInput = document.getElementById('pack-quantity'),
      packId = $(this).data('id'),
      quantity = quantityInput != null ? quantityInput.value || 1 : 1;

    if (quantityInput != null && quantityInput.validity.valid) {
      $.post('/cart', { 'item-id': packId, 'item-type': 2, 'quantity': quantity, 'type': 2 }, function (cartItems) {

        // Updating the cart badge counter
        $navCartCounter.text(cartItems.length);

        // Triggerig a toast message
        M.toast({ html: 'تمت الإضافة للسلة' });
      });
    } else {
      $.post('/cart', { 'item-id': packId, 'item-type': 2, 'quantity': quantity, 'type': 2 }, function (cartItems) {

        // Updating the cart badge counter
        $navCartCounter.text(cartItems.length);

        // Triggerig a toast message
        M.toast({ html: 'تمت الإضافة للسلة' });
      });
    }
  });

  function formatCurrency(value) {
    return new Intl.NumberFormat('ar-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(value);
  }
});
