$("document").ready(() => {
	// Initializing tabs.
	$(".dashboard-products .tabs").tabs({ duration: 50 });

	// Setting up the dropdowns.
	$("select").formSelect();

	// Initializing the character counter.
	$(
		"#products-creation-tab input[type=text], #products-creation-tab input[type=url], #products-edition-tab input[type=text], #products-edition-tab input[type=url]"
	).characterCounter();

	// Initializing the collapsibles.
	$(".dashboard-products .collapsible").collapsible();

	// Adding stock.
	$("#product-creation-stock-form").on("submit", e => {
		// Stopping the form's submition.
		e.preventDefault();

		// Getting the values.
		const quantity = $("#product-creation-stock-quantity").val(),
			weight = $("#product-creation-stock-weight").val(),
			flavor = $("#product-creation-stock-flavor").val(),
			flavorName = $("#product-creation-stock-flavor option:selected").text();

		// Clearing out the inputs.
		$("#product-creation-stock-quantity").val("");
		$("#product-creation-stock-weight").val("");
		$("#product-creation-stock-flavor").val("");

		$(".stock-list").append(`
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
                    ${flavorName}
                    <input type="hidden" name="stock-flavor" value="${flavor}">
                </td>
            </tr>
        `);

		addStockRemovingEvent();
		$("#product-creation-modal").modal("close");
	});

	function addStockRemovingEvent() {
		// Removing a stock.
		$(".stock-remove").on("click", function() {
			$(this)
				.closest("tr")
				.remove();
		});
	}

	// Initializing quill.
	const descEditor = new Quill("#desc-editor", {
			theme: "snow"
		}),
		usageEditor = new Quill("#usage-editor", {
			theme: "snow"
		}),
		warningEditor = new Quill("#warning-editor", {
			theme: "snow"
		});

	// Loading the image preview.
	$("#brand-logo").on("change", function() {
		$("#products-creation-preview").attr("src", $(this).val());
	});

	$('#product-creation-form').on('submit', (e) => {

		e.preventDefault();

		const data = {
			productName: $('#product-name').val(),
			productImage: $('#product-image').val(),
			productNutrition: $('#product-nutrition').val(),
			productDescription: descEditor.container.innerHTML,
			productUsage: usageEditor.container.innerHTML,
			productWarning: warningEditor.innerHTML,
			productCategory: $('#product-category').val(),
			ProductBrand: $('#product-brand').val()
		};

		console.log(data);
	})
});
