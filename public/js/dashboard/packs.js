$('document').ready(() => {
  // Frequently used elements
  var $creationinput = $('.dashboard-packs #packs-creation-tab input[name="pack-image"]'),
    $creationPreview = $('.dashboard-packs #packs-creation-tab img'),
    $creationProductsSelect = $('.dashboard-packs #packs-creation-products-select'),
    $creationVariantsSelect = $('.dashboard-packs #packs-creation-variants-select'),
    $creationSubmit = $('.dashboard-packs #packs-creation-tab input[type="submit"]');

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

  // Creation reset event.
  $('.dashboard-packs #packs-creation-tab form').on('reset', function () {
    // Reseting the preview
    $creationPreview.attr('src', '/assets/img/backgrounds/placeholder.jpg');
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

    // Re-initializing the select inputs
    $('.dashboard-packs select').formSelect();
  }
});
