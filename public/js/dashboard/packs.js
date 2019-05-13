$('document').ready(() => {

  // Setting up the parent packs dropdown.
  $('.dashboard-packs select').formSelect();

  // Initializing tabs.
  $('.dashboard-packs .tabs').tabs();

  // Initializing the character counter.
  $('#packs-creation-tab input[type=number], #packs-edition-tab input[type=number]').characterCounter();

  // Initializing the collapsibles.
  $('.dashboard-packs .collapsible').collapsible();

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
});
