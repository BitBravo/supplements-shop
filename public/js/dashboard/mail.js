$('document').ready(() => {

    // Marking selected messages as read.
    $('#email-read-btn').on('click', () => {

        const selectedEmails = getSelectedEmails();
        
        $.ajax({
            url: '/dashboard/mail',
            type: 'DELETE',
            data: { ids: selectedEmails },
            success: () => {
                 M.toast({html: 'Message(s) marked as read!'})
            }
        });
    });
    
    // Marking selected messages as unread.
    $('#email-unread-btn').on('click', () => {
        
        const selectedEmails = getSelectedEmails();

        $.ajax({
            url: '/dashboard/mail',
            type: 'PUT',
            data: { ids: selectedEmails },
            success: () => {
                 M.toast({html: 'Message(s) marked as unread!'})
            }
        });
    });

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

    // Preventing the modal from opening when checking a checkbox.
    $('tr.mail label').on('click', function (e) {

        e.stopPropagation();
    });

    $('tr.mail').on('click', function () {

        // Getting the mail ID.
        const mailId = $(this).data('id');

        // Requesting the e-mail's content.
        $.get('/dashboard/mail/read/' + mailId, (email) => {

            // Marking as read.
            $(this).removeClass('new');

            // Displaying the email's information.
            $('.mail-content').html(`
                <h5>
                    ${email.SenderName} <span class="grey-text">(${email.SenderEmail})<small class="grey-text right">${email.IssueDate}</small></span>
                    <br>
                </h5>
                <hr>
                <textarea height="auto" sizeable=false readonly>${email.Message}</textarea>
                <input type="hidden" value="${mailId}">
            `);

            // Opening the email modal.
            (M.Modal.getInstance($('#mail-modal'))).open();
        });
    });

    /**
     * Returns a list of selected emails' IDs.
     */
    function getSelectedEmails() {

        const selectedEmails = [];

        $.each($('table tr td:first-of-type input'), (index, value) => {

            if (value.checked) {
                selectedEmails.push($(value).closest('tr').data('id'));
            }
        });

        return selectedEmails;
    }
});
