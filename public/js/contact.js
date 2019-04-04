$('document').ready(() => {

    // Initializing the character counter.
    $(document).ready(function () {
        $('.message-content input').characterCounter();
    });

    // Sending the message.
    $('#contact-form').on('submit', (e) => {

        e.preventDefault();
        
        $.post('dashboard/mail', $(e.target).serialize(), (data) => {

            console.log(data);
        });
    });
});
