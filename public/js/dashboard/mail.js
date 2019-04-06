$('document').ready(() => {

    // Initializing the modal.
    //$('.modal').modal();

    // Select all.
    $('#select-all-mail-btn').on('change', (e) => {
        $.each($('table tr td:first-of-type input'), (index, value) => {

            value.checked = e.target.checked;
        });
    });

    // Mail mode selection.
    $('#mail-mode-select').on('change', (e) => {

        switch(e.target.value) {

            case '2': {
                location.href = '/dashboard/mail/1';
                break;
            }

            case '3': {
                location.href = '/dashboard/mail/2';
                break;
            }

            default: location.href = '/dashboard/mail/0';
        }
    });

    // Opening the mail modal.
    $('tr.mail').on('click', function () {

        // Getting the mail ID.
        const mailId = $(this).data('id');

        // Requesting the e-mail's content.
        $.get('/dashboard/mail/read/' + mailId, (email) => {

            console.log(email);
            $('.mail-content').html(`
                <h5>
                    ${email.SenderName} <span class="grey-text">(${email.SenderEmail})</span>
                    <br>
                    <small class="grey-text">Issue Date: ${email.IssueDate}</small>
                </h5>
                <hr>
                <textarea height="auto" sizeable=false readonly>${email.Message}</textarea>
            `);
            (M.Modal.getInstance($('#mail-modal'))).open();
        });
    });
});
