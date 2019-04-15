$('document').ready(() => {

    // Setting up the dropdown.
    $('select').formSelect();
    
    // Marking selected messages as read.
    $('#email-read-btn').on('click', () => {

        const selectedEmails = getSelectedEmails();

        $.ajax({
            url: '/dashboard/mail',
            type: 'DELETE',
            data: { ids: selectedEmails },
            success: () => {

                toggleReadStatus(selectedEmails, true);
                M.toast({ html: 'تمت قراءة الرسائل' });
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

                toggleReadStatus(selectedEmails, false);
                M.toast({ html: 'تم تعليم الرسائل كغير مقروءة' });
            }
        });
    });

    // Select all.
    $('#select-all-mail-btn').on('change', (e) => {

        if (e.target.checked) {
            $('#select-all-label').text('Unselect all');
        } else {
            $('#select-all-label').text('Select all');
        }

        $.each($('table tr td:first-of-type input'), (index, value) => {

            value.checked = e.target.checked;
        });
    });

    // Mail mode selection.
    $('#mail-mode-select').on('change', (e) => {

        switch (e.target.value) {

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

    /**
     * Toggles the read status for a select group of emails.
     * 
     * @param {Array<Int>} ids The ids of the emails to toggle the read status for.
     * @param {Boolean} status The status to toggle to.
     */
    function toggleReadStatus(ids, status) {

        $.each($('table tr'), (index, value) => {

            if (ids.includes($(value).data('id'))) {

                if (status === true) {
                    $(value).removeClass('new');
                } else {
                    $(value).addClass('new');
                }
            }
        });
    }
});
