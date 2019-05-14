$('document').ready(() => {

  // Setting up the parent packs dropdown.
  $('.dashboard-packs select').formSelect();

  // Initializing tabs.
  $('.dashboard-packs .tabs').tabs();

  // Initializing the materialboxes.
  $('.dashboard-packs img').materialbox();

  // Initializing the collapsibles.
  $('.dashboard-packs .collapsible').collapsible();

  // Pack creation
  (function () {

    // Frequently used elements
    var $creationinput = $('.dashboard-packs #packs-creation-tab input[name="pack-image"]'),
      $creationPreview = $('.dashboard-packs #packs-creation-tab img'),
      $creationProductsSelect = $('.dashboard-packs #packs-creation-products-select'),
      $creationVariantsSelect = $('.dashboard-packs #packs-creation-variants-select'),
      $creationSubmit = $('.dashboard-packs #packs-creation-tab input[type="submit"]'),
      $productsCreationList = $('.stock-creation-products-panel .products-list');

    // Setting up the pack object
    var pack = {
      Disount: 0,
      PackImage: '',
      Variants: []
    }

    // Setting up the parent packs dropdown.
    $('.dashboard-packs select').formSelect();

    // Initializing tabs.
    $('.dashboard-packs .tabs').tabs();

    // Initializing the materialboxes.
    $('.dashboard-packs img').materialbox();

    // Initializing the character counter.
    $('#packs-creation-tab input[type=url], #packs-edition-tab input[type=url]').characterCounter();

    // Initializing the collapsibles.
    $('.dashboard-packs .collapsible').collapsible();

    // Updating the pack's image
    $creationinput.on('change', function () {
      $creationPreview.attr('src', $(this).val());
    });

    // Changing the preview's src on error
    $creationPreview.on('error', function () {
      $(this).attr('src', '/assets/img/backgrounds/placeholder.jpg');
    });

    // Products change event handler
    $creationProductsSelect.on('change', function () {
      var productID = $(this).val();

      if (productID) {
        disableVariantsCreation();
        $.get('/dashboard/packs/variants/' + productID, function (response) {
          if (response !== false) {
            $creationVariantsSelect.empty();
            $creationVariantsSelect.prop('disabled', false);
            $creationSubmit.prop('disabled', false);

            $.each(response, function (index, variant) {
              $creationVariantsSelect.append('<option value="' + variant['VariantID'] + '">' + formatVariantName(variant['VariantType'], variant['VariantValue']) + '</option>');
            });

            updateUI();
          }
        });
      }
    });

    // Creation reset event
    $('.dashboard-packs #packs-creation-tab form').on('reset', function () {
      if (confirm('هل ترغب في إعادة تعيين هذه الحزمة') === true) {

        // Reseting the preview
        $creationPreview.attr('src', '/assets/img/backgrounds/placeholder.jpg');

        // Reseting the pack
        pack = {
          Disount: 0,
          PackImage: '',
          Variants: []
        }

        // Updating the UI
        updateUI();
      }
    });

    // Creation submit event
    $('.dashboard-packs #packs-creation-tab form').on('submit', function (e) {
      // Stoping the form from submiting
      e.preventDefault();

      if (confirm('هل ترغب في إضافة هذه الحزمة') === true) {
        $.post('/dashboard/packs', {
          'pack-discount': $('#pack-discount').val(),
          'pack-image': $('#pack-image').val(),
          'pack-variants': pack.Variants
        }, function () {
          location.reload();
        });
      }
    });

    // Deleting a pack.
    $('.dashboard-packs .btn-delete').on('click', function () {
      var categoryId = $(this).next().val();

      $.ajax({
        url: "/dashboard/categories",
        type: "DELETE",
        data: { categoryId },
        success: function () {
          location.reload();
        }
      })
    });

    // Restoring a pack.
    $('.dashboard-packs .btn-restore').on('click', function () {
      var categoryId = $(this).prev().val();

      $.ajax({
        url: "/dashboard/categories/restore",
        type: "PUT",
        data: { categoryId },
        success: function () {
          location.reload();
        }
      })
    });

    // Adding a product to the pack
    $('#stock-creation-add-products-btn').on('click', function () {

      // Adding a product to the list
      pack.Variants.push({
        VariantID: $creationVariantsSelect.val(),
        ProductName: $creationProductsSelect.find('option:selected').text(),
        VariantName: $creationVariantsSelect.find('option:selected').text()
      });

      // Updating the UI
      updateUI();
    });

    // updating the UI
    updateUI();

    // Triggering the products creation change event
    $creationProductsSelect.trigger('change');

    // Disabling the variants' select
    function disableVariantsCreation() {
      $creationVariantsSelect.empty();
      $creationVariantsSelect.prop('disabled', true);
      $creationVariantsSelect.append('<option value="0">لا توجد أي أنواع</option>');

      $creationSubmit.prop('disabled', true);
    }

    // Formating the variant name
    function formatVariantName(variantType, variantValue) {
      var formatedVariantType = '', formatedVariantValue = 0;

      formatedVariantValue = (function () {
        var output = '';

        if (parseInt(variantType) === 1) {
          output = variantValue >= 1 ? variantValue : variantValue * 1000;
        } else {
          output = parseInt(variantValue);
        }

        return output;
      })();

      formatedVariantType = (function () {
        var output = '';

        switch (parseInt(variantType)) {
          case 1: {
            output = parseFloat(variantValue) >= 1 ? 'كلغ' : 'غرام';
            break;
          }
          case 2: {
            output = parseInt(variantValue) > 1 ? 'حصص' : 'حصة';
            break;
          }
          case 3: {
            output = parseInt(variantValue) > 1 ? 'حزم' : 'حزمة';
            break;
          }
          case 4: {
            output = parseInt(variantValue) > 1 ? 'حزم' : 'حزمة';
            break;
          }
          case 5: {
            output = parseInt(variantValue) > 1 ? 'ملاعق' : 'ملعقة';
            break;
          }
        }

        return output;
      })();

      return formatedVariantType + ' ' + formatedVariantValue;
    }

    // UI update
    function updateUI() {
      var productsFound = $creationProductsSelect.data('empty');

      if (productsFound === true) {
        disableVariantsCreation();
      }

      // Updating the stop creation products count
      $('.stock-creation-products-panel .card-title span').text(pack.Variants.length);

      // Emptying the products' list
      $productsCreationList.empty();

      // Displaying the products
      $.each(pack.Variants, function (index, variant) {
        $productsCreationList.append(' \
        <div class="col s6 m3 l4 xl4"> \
          <div class="card grey lighten-4" data-index="'+ index + '"> \
            <div class="card-content"> \
              <span class="card-title"> \
                '+ variant['ProductName'] + ' \
              </span> \
              <div class="chip">' + variant['VariantName'] + '</div> \
            </div> \
            <div class="card-action"> \
              <a href="javascript:void(0)" class="remove-product">إزالة</a> \
            </div> \
          </div> \
        </div> \
        ');
      });

      // Removing a product from the pack
      $('.stock-creation-products-panel .remove-product').on('click', function () {

        // Removing the product
        pack.Variants.splice($(this).closest('.card').data('index'), 1);

        // Updating the UI
        updateUI();
      });

      // Re-initializing the select inputs
      $('.dashboard-packs select').formSelect();
    }
  })();
});
