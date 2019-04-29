$('document').ready(() => {
  // Getting frequently used elements.
  var
    $stockCreationList = $('#stock-creation-list'),
    $stockCreationModal = $('#stock-creation-modal');

  // Initializing the product object.
  var Product = {
    Name: '',
    NutritionInfo: '',
    BrandId: 0,
    CateogryId: 0,
    Description: '',
    Usage: '',
    Warning: '',
    Stock: []
  };

  // The selection index.
  var currentIndex = -1;

  // Getting all flavors.
  var flavors = JSON.parse($('#flavors-json').text());

  // Initializing QuillJS.
  var
    descEditor = new Quill('#desc-editor', {
      theme: 'snow'
    }),
    usageEditor = new Quill('#usage-editor', {
      theme: 'snow'
    }),
    warningEditor = new Quill('#warning-editor', {
      theme: 'snow'
    }),
    descEditorEdit = new Quill('#desc-editor-edit', {
      theme: 'snow'
    }),
    usageEditorEdit = new Quill('#usage-editor-edit', {
      theme: 'snow'
    }),
    warningEditorEdit = new Quill('#warning-editor-edit', {
      theme: 'snow'
    });

  // Updating the UI.
  updateUI();

  // Initializing tabs.
  $('.dashboard-products .tabs').tabs();

  // Setting up the dropdowns.
  $('#product-creation-brand, #product-creation-category').formSelect();

  // Initializing the character counter.
  $('.dashboard-products #product-creation-name, .dashboard-products #product-creation-nutrition-info').characterCounter();

  // Initializing the collapsibles.
  $('.dashboard-products .collapsible').collapsible();

  // Initializing the materialbox.
  $('.dashboard-products .materialboxed').materialbox();

  // Nutrition facts preview.
  $('#product-creation-nutrition-info').on('change', function () {
    $('.nutrition-facts-creation-preview img').attr('src', $(this).val());

    if ($('.nutrition-facts-creation-preview img').on('error', function () {
      $('.nutrition-facts-creation-preview img').attr('src', '/assets/img/backgrounds/placeholder.jpg');
    }));
  });

  // Handeling the submit event on the stock-creation-modal.
  $('#stock-creation-form').on('submit', function (e) {

    // Preventing the page from loading.
    e.preventDefault();

    // Closing the modal.
    $stockCreationModal.modal('close');

    // Getting the inputs.
    var
      $stockWeightInput = $(this).find('#stock-creation-modal-weight'),
      $stockPriceInput = $(this).find('#stock-creation-modal-price');

    // Adding a new stock.
    addNewStock({
      Weight: $stockWeightInput.val(),
      Price: $stockPriceInput.val(),
      CurrentIndex: -1,
      Flavors: []
    });

    // Clearing the inputs.
    $stockWeightInput.val('');
    $stockPriceInput.val('');
  });

  // Handeling the click event on the stock-creation-clear-btn.
  $('#stock-creation-clear-btn').on('click', function () {

    // Clearing the created stock.
    Product.Stock = [];

    // Updating the current index.
    currentIndex = -1;

    // Updating the UI.
    updateUI();
  });

  // Handeling the change event on the product-creation-name.
  $('#product-creation-name').on('change', function () {
    Product.Name = $(this).val();

    updateUI();
  });

  function addNewStock(stock) {

    // Adding the stock.
    Product.Stock.push(stock);

    // Updating the currenr index.
    currentIndex = Product.Stock.length - 1;

    // Updating the UI.
    updateUI();
  }

  function removeStock(index) {

    // Remove a stock.
    Product.Stock.splice(index, 1);

    // Updating the current index.
    currentIndex = currentIndex === index ? -1 : (currentIndex >= 0 ? (currentIndex < index ? currentIndex : currentIndex - 1) : -1);

    // Updating the UI.
    updateUI();
  }

  function addFlavor(index, flavor) {

    // Adding a flavor.
    Product.Stock[index].Flavors.push(flavor);

    // Updating the UI.
    updateUI();
  }

  function removeFlavor(index, flavorIndex) {

    // Removing a flavor.
    Product.Stock[index].Flavors.splice(flavorIndex, 1);

    // Updating the UI.
    updateUI();
  }

  function updateUI() {

    // Updating the stock count.
    $('#stock-creation-count').text(Product.Stock.reduce(function (total, stock) {
      return total + formater.calculateStockQuantity(stock);
    }, 0));

    // Clearing the old output.
    $stockCreationList.empty();

    // Updating the stock list.
    Product.Stock.forEach(function (stock, index) {

      var
        stockFlavors = '',
        flavorsDropDown = '';

      $.each(flavors, function (index, flavor) {
        flavorsDropDown += '<option value="' + flavor.FlavorID + '">' + flavor.FlavorName + '</option>';
      });

      $.each(stock.Flavors, function (index, flavor) {
        stockFlavors += '\
          <li data-flavor-index="'+ index + '" class="stock-creation-flavor-entry ' + (index === stock.CurrentIndex ? 'active' : '') + '">\
            <div class="collapsible-header"><i class="fas fa-trash stock-creation-flavor-remove-btn"></i>'+ formater.getFlavorNameFromID(flavor.FlavorID) + '</div>\
            <div class="collapsible-body">\
              <div class="row">\
                <div class="col s6"></div>\
                <div class="col s6">\
                  <div class="row">\
                    <div class="input-field col s12">\
                    <select name="stock-creation-entry-flavor">\
                        '+ flavorsDropDown + '\
                    </select >\
                    <label>النكهة</label>\
                    </div >\
                  </div >\
                  <div class="row">\
                  <div class="input-field col s12 right-align">\
                    <label>الكمية <small class="grey-text">&rlm;(درهم)&rlm;</small>\
                      <input min="0" name="stock-creation-entry-quantity" type="number" value="'+ flavor.Quantity + '" class="validate right-align" required>\
                    </label>\
                  </div>\
                </div>\
                </div >\
              </div >\
            </div >\
          </li >\
        ';
      });

      $stockCreationList.append('\
        <li data-id="'+ index + '" class="stock-creation-entry ' + (index === currentIndex ? 'active' : '') + '">\
          <div class="collapsible-header stock-creation-header">\
            <span class="valign-wrapper">\
              <i class="fas fa-trash stock-creation-remove-btn"></i>\
            </span>\
            <span class="valign-wrapper">\
            ' + formater.calculateStockQuantity(stock) + '&nbsp; <b>الكمية</b> <i class="material-icons">inbox</i> \
            </span>\
            <span class="valign-wrapper">\
            ' + formater.formatPrice(stock.Price) + '&nbsp; <b>السعر</b> <i class="material-icons">attach_money</i> \
            </span>\
            <span class="valign-wrapper">\
            ' + formater.formatWeight(stock.Weight) + '&nbsp; <b>الوزن</b> <i class="fas fa-balance-scale"></i> \
            </span>\
          </div>\
          <div class="collapsible-body">\
            <div class="row">\
              <div class="col s4 grey lighten-4">\
                <div class="row">\
                  <div class="col s12 right-align">\
                    <label>الوزن <small class="grey-text">&rlm;(كلغ)&rlm;</small>\
                      <input min="0" name="stock-creation-entry-weight" step="0.001" type="number" value="'+ stock.Weight + '" class="validate right-align" required>\
                    </label>\
                  </div>\
                </div>\
                <div class="row">\
                  <div class="col s12 right-align">\
                    <label>السعر <small class="grey-text">&rlm;(درهم)&rlm;</small>\
                      <input min="0" name="stock-creation-entry-price" type="number" step="0.01" value="'+ stock.Price + '" class="validate right-align" required>\
                    </label>\
                  </div>\
                </div>\
                <div class="row">\
                  <div class="col s8 offset-s2">\
                    <button class="btn btn-block btn-large waves-effect waves-light stock-creation-flavor-add-btn">إضافة نكهة للمنتوج</button>\
                    </label>\
                  </div>\
                </div>\
              </div>\
              <div class="col s7 offset-s1 stock-creation-entry-flavor-list">\
                <h5 class="right-align">[ '+ stock.Flavors.length + ' ] النكهات</h5>\
                <ul class="collapsible">\
                  '+ stockFlavors + '\
                </ul>\
              </div>\
            </div>\
          </div>\
        </li>');
    });

    // Adding the stock remove click event.
    $('#stock-creation-list .stock-creation-remove-btn').on('click', function (e) {

      // Stopping event propagation.
      e.stopPropagation();

      // Getting the stock's index.
      var index = $(this).closest('li').data('id');

      // Removing the stock.
      removeStock(index);
    });

    // Adding the stock update event for price and weight inputs.
    $('#stock-creation-list input[name=stock-creation-entry-price], #stock-creation-list input[name=stock-creation-entry-weight]').on('change', function (e) {

      // Getting the stock's index.
      var index = $(this).closest('li').data('id');

      // Updaing the stock.
      if ($(this).attr('name') === 'stock-creation-entry-weight') {
        Product.Stock[index].Weight = $(this).val();
      } else if ($(this).attr('name') === 'stock-creation-entry-price') {
        Product.Stock[index].Price = $(this).val();
      }

      // Updating the UI.
      updateUI();
    });

    // Adding the index update event.
    $('#stock-creation-list .stock-creation-header').on('click', function () {

      if (!$(this).parent().hasClass('active')) {
        currentIndex = $(this).parent().data('id');
      } else {
        currentIndex = -1;
      }
    });

    // Adding the flavor addition event.
    $('.stock-creation-flavor-add-btn').on('click', function () {

      // Getting the stock's index.
      var index = $(this).closest('li').data('id');

      // Adding a flavor.
      addFlavor(index, {
        Quantity: 1,
        FlavorID: flavors[0].FlavorID,
        ProductVariantImage: ''
      });
    });

    // Adding the flavor removal event.
    $('.stock-creation-flavor-remove-btn').on('click', function (e) {

      // Stopping event propagation.
      e.stopPropagation();

      // Getting the stock's index.
      var
        index = $(this).closest('.stock-creation-entry').data('id'),
        flavorIndex = $(this).closest('li').data('flavor-index');

      // Adding a flavor.
      removeFlavor(index, flavorIndex);
    });

    $('.stock-creation-entry .stock-creation-flavor-entry .collapsible-header').on('click', function () {

      // Getting the stock's index.
      var index = $(this).closest('.stock-creation-entry').data('id');

      if (!$(this).hasClass('active')) {
        Product.Stock[index].CurrentIndex = $(this).parent().data('flavor-index');
      } else {
        Product.Stock[index].CurrentIndex = -1;
      }
    });

    // Adding the flavor update event.
    $('.stock-creation-entry select').on('change', function (e) {

      // Getting the stock's index.
      var
        index = $(this).closest('.stock-creation-entry').data('id'),
        flavorIndex = $(this).closest('li').data('flavor-index'),
        newFlavorId = parseInt($(e.target).val());

      // Updating the flavor.
      Product.Stock[index].Flavors[flavorIndex].FlavorID = newFlavorId;

      // Updating the UI.
      updateUI();
    });

    // Adding the quantity update event.
    $('#stock-creation-list [name=stock-creation-entry-quantity]').on('change', function (e) {

      // Getting the stock's index.
      var
        index = $(this).closest('.stock-creation-entry').data('id'),
        flavorIndex = $(this).closest('li').data('flavor-index'),
        quantity = parseInt($(e.target).val());

      // Updating the quantity.
      Product.Stock[index].Flavors[flavorIndex].Quantity = quantity;

      // Updating the UI.
      updateUI();
    });

    // Re-initializing the collapsibles.
    $('#stock-creation-list, #stock-creation-list .collapsible').collapsible();

    // Re-initializing the dropdowns.
    $('#stock-creation-list select').formSelect();
  }

  var formater = {
    formatWeight: function (weight) {
      return (weight >= 1) ? weight + "kg" : (weight * 1000) + "g";
    },
    formatPrice: function (price) {
      return new Intl.NumberFormat('ar-MA', {
        style: 'currency',
        currency: 'MAD'
      }).format(price);
    },
    calculateStockQuantity: function (stock) {
      return stock.Flavors.reduce(function (total, flv) {
        return total + flv.Quantity;
      }, 0);
    },
    getFlavorNameFromID: function (flavorId) {
      for (var i = 0; i < flavors.length; i++) {
        if (flavors[i].FlavorID == flavorId) {
          return flavors[i].FlavorName;
        }
      }

      return 'Unflavored';
    }
  }

  addNewStock({
    Price: 399.99,
    Weight: 1,
    CurrentIndex: -1,
    Flavors: []
  });
  addNewStock({
    Price: 900,
    Weight: 10.5,
    CurrentIndex: -1,
    Flavors: []
  });
  addNewStock({
    Price: 120.50,
    Weight: 0.400,
    CurrentIndex: -1,
    Flavors: []
  });
  addNewStock({
    Price: 560.90,
    Weight: 0.85,
    CurrentIndex: -1,
    Flavors: []
  });
  addNewStock({
    Price: 490.99,
    Weight: 3.2,
    CurrentIndex: -1,
    Flavors: []
  });

  // Adding stock.
  /*$('#product-creation-stock-form').on('submit', e => {
  // Stopping the form's submition.
  e.preventDefault();

  // Getting the values.
  const image = $('#product-creation-stock-image').val(),
    nutritionInfo = $('#product-creation-stock-nutrition').val(),
    quantity = $('#product-creation-stock-quantity').val(),
    weight = $('#product-creation-stock-weight').val(),
    flavor = $('#product-creation-stock-flavor').val(),
    price = $('#product-creation-stock-price').val(),
    flavorName = $('#product-creation-stock-flavor option:selected').text();

  // Clearing out the inputs.
  $('#product-creation-stock-image').val('');
  $('#product-creation-stock-nutrition').val('');
  $('#product-creation-stock-quantity').val('');
  $('#product-creation-stock-weight').val('');
  $('#product-creation-stock-price').val('');

  $('.stock-list').append(`
      <tr>
          <td class="center-align">
              <a class="stock-remove btn-floating waves-effect waves-light red">
                  <i class="fa fa-trash"></i>
              </a>
              <input type="hidden" name="stock-image" value="${image}" >
              <input type="hidden" name="stock-nutrition" value="${nutritionInfo}" >
          </td>
          <td class="center-align">
              ${quantity}
              <input type="hidden" name="stock-quantity" value="${quantity}">
          </td>
          <td class="center-align">
              ${weight}
              <input type="hidden" name="stock-weight" step="0.001" value="${weight}">
          </td>
          <td class="center-align">
              ${new Intl.NumberFormat('ar-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(price)}
              <input type="hidden" name="stock-price" value="${price}">
          </td>
          <td class="center-align">
              ${flavorName}
              <input type="hidden" name="stock-flavor" value="${flavor}">
          </td>
      </tr>
  `);

  addStockRemovingEvent();
  $('#product-creation-modal').modal('close');
});*/

  // Creating the product.
  /*$('#product-creation-form').on('submit', e => {
    e.preventDefault();
    $('#product-creation-trigger').prop('disabled', true);

    const data = {
      productName: $('#product-name').val(),
      productDescription: descEditor.container.innerHTML,
      productUsage: usageEditor.container.innerHTML,
      productWarning: warningEditor.container.innerHTML,
      productCategory: $('#product-category').val(),
      productBrand: $('#product-brand').val(),
      stock: getStock()
    };

    $.post('/dashboard/products', data);
    setTimeout(() => window.location.reload(), 1500);
  });*/

  // Opening the product edition modal.
  /*$('.product-list tr').on('click', function () {
    const productID = $(this).data('product-id');

    $.get('/dashboard/products/' + productID, data => {
      // Affecting the retrieved values.
      $('#product-edition-modal [name=product-id]').val(productID);
      $('#product-edition-modal [name=product-name]').val(
        data[0][0].ProductName
      );
      $('#product-edition-modal [name=product-image]').val(
        data[0][0].ProductImage
      );
      $('#product-edition-modal [name=product-nutrition]').val(
        data[0][0].NutritionInfo
      );

      descEditorEdit.clipboard.dangerouslyPasteHTML(data[0][0].Description);
      usageEditorEdit.clipboard.dangerouslyPasteHTML(data[0][0].Usage);
      warningEditorEdit.clipboard.dangerouslyPasteHTML(data[0][0].Warning);

      $('#product-category-edit').val(data[0][0].CategoryID);
      $('#product-brand-edit').val(data[0][0].BrandID);

      $('#edition-stock-list').empty();

      // Constructing the flavors' dropdown.
      $.each(data[1], (i, v) => {
        let flavorsDropdown = '<select name="stock-flavor">';

        $.each(data[2], (i, _v) => {
          flavorsDropdown += `
					<option ${
            _v.FlavorID == getProductVariantFlavor(v.VariantID).FlavorID
              ? 'selected'
              : ''
            } value="${_v.FlavorID}">${_v.FlavorName}</option>`;
        });

        flavorsDropdown += '</select>';

        $('#edition-stock-list').append(`
            <tr data-variant-id="${v.VariantID}">
                <div class="row">
                    <td></td>
                    <td class="center-align">
                        <input type="number" name="stock-quantity" min="0" value="${
          getProductVariantFlavor(v.VariantID).Quantity
          }" class="validate">
                    </td>
                    <td class="center-align">
                        <input type="number" name="stock-weight" min="0" step="0.001" value="${
          v.Weight
          }" class="validate" disabled>
                    </td>
                    <td class="center-align">
                        <input type="number" name="stock-price" min="0" step="0.01" value="${
          v.Price
          }" class="validate">
                    </td>
                    <td class="center-align">
                        ${flavorsDropdown}
                    </td>
                    <td class="center-align">
                        <input type="url" name="stock-image" value="${
          getProductVariantFlavor(v.VariantID).VariantImage
          }" class="validate">
                    </td>
                    <td class="center-align">
                        <input type="url" name="stock-nutrition" value="${
          getProductVariantFlavor(v.VariantID).NutritionInfo
          }" class="validate">
                    </td>
                </div>
            </tr>
        `);
      });

      function getProductVariantFlavor(variantID) {
        for (let productVariantFlavor of data[3]) {
          if (productVariantFlavor.VariantID === variantID) {
            return productVariantFlavor;
          }
        }
      }

      // Updating the dropdowns.
      $(
        '#product-category-edit, #product-brand-edit, #edition-stock-list select'
      ).formSelect();

      $('#product-edition-modal').modal('open');
    });
  });*/

  // Editing the product.
  /*$('#product-edition-form').on('submit', e => {
    e.preventDefault();

    const data = {
      productID: $('#product-edition-modal [name=product-id]').val(),
      productName: $('#product-edition-modal [name=product-name]').val(),
      productImage: $('#product-edition-modal [name=product-image]').val(),
      productNutrition: $(
        '#product-edition-modal [name=product-nutrition]'
      ).val(),
      description: descEditorEdit.container.innerHTML,
      usage: usageEditorEdit.container.innerHTML,
      warning: warningEditorEdit.container.innerHTML,
      categoryID: $('#product-category-edit').val(),
      brandID: $('#product-brand-edit').val(),
      stock: {
        add: getAdditionStock(),
        edit: getEditableStock()
      }
    };

    $.ajax({
      url: '/dashboard/products',
      type: 'PUT',
      data: data,
      success: data => {
        window.location.reload();
      }
    });
  });*/

  // Adding a new stock to an editable product.
  /*$('#add-stock-edition').on('click', () => {
    let flavorsDropdown = '<select name="stock-flavor">';

    $.each($('#product-creation-stock-flavor').find('option'), (i, v) => {
      flavorsDropdown += `<option value="${$(v).val()}">${$(v)
        .text()
        .trim()}</option>`;
    });

    flavorsDropdown += '</select>';

    $(flavorsDropdown)
      .find('option')
      .text('dddd');

    $('#edition-stock-list').append(`
        <tr>
            <td class="center-align">
                <a class="stock-remove btn-floating waves-effect waves-light red">
                    <i class="fa fa-trash"></i>
                </a>
            </td>
            <td class="center-align">
                <input type="number" name="stock-quantity" min="0" value="0" class="validate">
            </td>
            <td class="center-align">
                <input type="number" name="stock-weight" min="0" step="0.001" value="0" class="validate">
            </td>
            <td class="center-align">
                <input type="number" step="0.01" min="0" name="stock-price" value="0" class="validate">
            </td>
            <td class="center-align">
                ${flavorsDropdown}
            </td>
            <td class="center-align">
                <input type="url" name="stock-image" class="validate">
            </td>
            <td class="center-align">
                <input type="url" name="stock-nutrition" class="validate">
            </td>
        </tr>
    `);

    addStockRemovingEvent();
    $('#edition-stock-list select').formSelect();
  });*/

  /*function addStockRemovingEvent() {
    // Removing a stock.
    $('.stock-remove').on('click', function () {
      $(this)
        .closest('tr')
        .remove();
    });
  }*/

  /*function getStock() {
    const stock = [];

    $.each($('.stock-list tr'), (i, v) => {
      stock.push({
        image: $(v)
          .find('[name=stock-image]')
          .val(),
        nutritionInfo: $(v)
          .find('[name=stock-nutrition]')
          .val(),
        quantity: $(v)
          .find('[name=stock-quantity]')
          .val(),
        weight: $(v)
          .find('[name=stock-weight]')
          .val(),
        price: $(v)
          .find('[name=stock-price]')
          .val(),
        flavorID: $(v)
          .find('[name=stock-flavor]')
          .val()
      });
    });

    return stock;
  }*/

  /*function getEditableStock() {
    const variants = [];

    $.each($('#edition-stock-list tr[data-variant-id]'), (i, v) => {
      variants.push({
        variantID: $(v).data('variant-id'),
        image: $(v)
          .find('[name=stock-image]')
          .val(),
        nutrition: $(v)
          .find('[name=stock-nutrition]')
          .val(),
        flavorID: $(v)
          .find('[name=stock-flavor]')
          .val(),
        quantity: $(v)
          .find('[name=stock-quantity]')
          .val(),
        weight: $(v)
          .find('[name=stock-weight]')
          .val(),
        price: $(v)
          .find('[name=stock-price]')
          .val()
      });
    });

    return variants;
  }*/

  /*function getAdditionStock() {
    const variants = [];

    $.each($('#edition-stock-list tr:not([data-variant-id])'), (i, v) => {
      variants.push({
        image: $(v)
          .find('[name=stock-image]')
          .val(),
        nutrition: $(v)
          .find('[name=stock-nutrition]')
          .val(),
        flavorID: $(v)
          .find('[name=stock-flavor]')
          .val(),
        quantity: $(v)
          .find('[name=stock-quantity]')
          .val(),
        weight: $(v)
          .find('[name=stock-weight]')
          .val(),
        price: $(v)
          .find('[name=stock-price]')
          .val()
      });
    });

    return variants;
  }*/
});
