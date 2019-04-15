$('document').ready(() => {
	// Initializing tabs.
	$('.dashboard-products .tabs').tabs({ duration: 50 });

	// Setting up the dropdowns.
	$('.dashboard-products select').formSelect();

	// Initializing the character counter.
	$(
		'#products-creation-tab input[type=text], #products-creation-tab input[type=url], #products-edition-tab input[type=text], #products-edition-tab input[type=url], #product-edition-modal input[type=text], #product-edition-modal input[type=url]'
	).characterCounter();

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
			flavorName = $(
				'#product-creation-stock-flavor option:selected'
			).text();

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
                    <input type="hidden" name="stock-weight" value="${weight}">
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

	// Loading the image preview.
	$('#brand-logo').on('change', function() {
		$('#products-creation-preview').attr('src', $(this).val());
	});

	$('#product-creation-form').on('submit', e => {
		e.preventDefault();

		const data = {
			productName: $('#product-name').val(),
			productImage: $('#product-image').val(),
			productNutrition: $('#product-nutrition').val(),
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

	$('.product-list tr').on('click', function() {
		const productID = $(this).data('product-id');

		$.get('/dashboard/products/' + productID, data => {
			// Affecting the retrieved values.
			$('#product-edition-modal [name=product-id]').val(productID);
			$('#product-edition-modal [name=product-name]').val(
				data.ProductName
			);
			$('#product-edition-modal [name=product-image]').val(
				data.ProductImage
			);
			$('#product-edition-modal [name=product-nutrition]').val(
				data.NutritionInfo
			);
			descEditorEdit.container.innerHTML = data.Description;
			usageEditorEdit.container.innerHTML = data.Usage;
			warningEditorEdit.container.innerHTML = data.Warning;
			$('#product-category-edit').val(data.CategoryID);
			$('#product-brand-edit').val(data.BrandID);

			// Updating the dropdowns.
			$('#product-category-edit, #product-brand-edit').formSelect();

			$('#product-edition-modal').modal('open');
		});
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
});
