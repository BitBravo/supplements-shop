$('document').ready(() => {
  // Initializing the character counter.
  $('.message-content input').characterCounter();

  // Opening up the contact modal.
  $('.contact-btn').on('click', () => {
    M.Modal.getInstance($('#contact-modal')).open();
  });

  // Sending the message.
  $('#contact-form').on('submit', e => {
    // Temporarely disabling the submit button.
    $('#contact-form input[type=submit]').prop('disabled', true);

    // Preventing the page from reloading.
    e.preventDefault();

    // Sending the mail to the server.
    $.post('/dashboard/mail', $(e.target).serialize(), data => {
      if (data.sent === true) {
        M.toast({ html: 'تم الارسال' });
      } else {
        M.toast({ html: 'هناك خطأ ما' });
      }

      $('#contact-form input[type=submit]').prop('disabled', false);
      $('#contact-modal').modal('close');
    });
  });
});
