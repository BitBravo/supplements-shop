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
		e.preventDefault();

		const quantity = $("#product-creation-stock-quantity").val(),
			weight = $("#product-creation-stock-weight").val(),
			flavor = $("#product-creation-stock-flavor").val();

		$("#product-creation-stock-quantity").val("");
		$("#product-creation-stock-weight").val("");
		$("#product-creation-stock-flavor").val("");

		console.log(quantity, weight, flavor);
		$(".stock-list").append(`
            <div class="row stock">
                <div class="col s2">
                    <label>Quantity
                        <input type="number" min="0" class="validate" required>
                    </label>
                </div>
                <div class="col s2">
                    <label>Weight (Kg)
                        <input type="number" min="0" class="validate" required>
                    </label>
                </div>
                <div class="col s8">
                    <label>Flavor
                        <select>
                            {{#each Data.Flavors }}
                            <option value="{{ this.FlavorID }}">
                                {{ this.FlavorName }}
                            </option>
                            {{/each}}
                        </select>
                    </label>
                </div>
            </div>
        `);
		$("#product-creation-modal").modal("close");
	});

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
});
