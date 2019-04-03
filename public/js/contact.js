$('document').ready(() => {

    // Initializing the character counter.
    $(document).ready(function () {
        $('.message-content input').characterCounter();
    });

    // Sending the message.
    $('#send-btn').on('click', () => {

        $.post('dashboard/mail', $('#contact-form').serialize(), (data) => {

            console.log(data);
        });
    });
});
