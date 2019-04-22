$('document').ready(() => {
  // Initializing tabs.
  $('.dashboard-products .tabs').tabs();

  // Setting up the dropdowns.
  $('.dashboard-products select').formSelect();

  // Initializing the character counter.
  $('.dashboard-products #product-name').characterCounter();

  // Initializing the collapsibles.
  $('.dashboard-products .collapsible').collapsible();

  // Adding stock.
  $('#product-creation-stock-form').on('submit', e => {
    // Stopping the form's submition.
    e.preventDefault();

    // Getting the values.
    const quantity = $('#product-creation-stock-quantity').val(),
      weight = $('#product-creation-stock-weight').val(),
      flavor = $('#product-creation-stock-flavor').val(),
      price = $('#product-creation-stock-price').val(),
      flavorName = $('#product-creation-stock-flavor option:selected').text();

    // Clearing out the inputs.
    $('#product-creation-stock-quantity').val('');
    $('#product-creation-stock-weight').val('');
    $('#product-creation-stock-price').val('');

    $('.stock-list').append(`
            <tr>
                <td class="center-align">
                    <a class="stock-remove btn-floating waves-effect waves-light red">
                        <i class="fa fa-trash"></i>
                    </a>
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
  });

  // Initializing quill.
  const descEditor = new Quill('#desc-editor', {
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

  // Creating the product.
  $('#product-creation-form').on('submit', e => {
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
    setTimeout(() => window.location.reload(), 2000);
  });

  // Opening the product edition modal.
  $('.product-list tr').on('click', function() {
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
      $.each(data[1], (i, v) => {
        let flavorsDropdown = '<select name="stock-flavor">';

        $.each(data[2], (i, _v) => {
          flavorsDropdown += `
					<option ${_v.FlavorID == v.FlavorID ? 'selected' : ''} value="${_v.FlavorID}">${
            _v.FlavorName
          }</option>
					`;
        });

        flavorsDropdown += '</select>';

        $('#edition-stock-list').append(`
					<tr data-variant-id="${v.VariantID}">
						<td></td>
						<td class="center-align">
							<input type="number" name="stock-quantity" value="${v.Quantity}">
						</td>
						<td class="center-align">
							<input type="number" name="stock-weight" step="0.001" value="${v.Weight}">
						</td>
						<td class="center-align">
							<input type="number" name="stock-price" step="0.01" value="${v.Price}">
						</td>
						<td class="center-align">
							${flavorsDropdown}
						</td>
					</tr>
				`);
      });

      // Updating the dropdowns.
      $(
        '#product-category-edit, #product-brand-edit, #edition-stock-list select'
      ).formSelect();

      $('#product-edition-modal').modal('open');
    });
  });

  // Editing the product.
  $('#product-edition-form').on('submit', e => {
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
  });

  // Adding a new stock to an editable product.
  $('#add-stock-edition').on('click', () => {
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
					<input type="number" name="stock-quantity" value="0">
				</td>
				<td class="center-align">
					<input type="number" name="stock-weight" step="0.001" value="0">
				</td>
				<td class="center-align">
					<input type="number" step="0.01" name="stock-price" value="0">
				</td>
				<td class="center-align">
					${flavorsDropdown}
				</td>
			</tr>
		`);

    addStockRemovingEvent();
    $('#edition-stock-list select').formSelect();
  });

  function addStockRemovingEvent() {
    // Removing a stock.
    $('.stock-remove').on('click', function() {
      $(this)
        .closest('tr')
        .remove();
    });
  }

  function getStock() {
    const stock = [];

    $.each($('.stock-list tr'), (i, v) => {
      stock.push({
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
  }

  function getEditableStock() {
    const variants = [];

    $.each($('#edition-stock-list tr[data-variant-id]'), (i, v) => {
      variants.push({
        variantID: $(v).data('variant-id'),
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
  }

  function getAdditionStock() {
    const variants = [];

    $.each($('#edition-stock-list tr:not([data-variant-id])'), (i, v) => {
      variants.push({
        variantID: $(v).data('variant-id'),
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
  }
});
