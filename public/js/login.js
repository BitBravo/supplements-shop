$('document').ready(() => {

    $('#login-form').on('submit', (e) => {
        
        e.preventDefault();

        $.post('/login', $(e.target).serialize(), (data) => {
           
            if (data.allow === true) {

                window.location = '/dashboard';
            } else {
                M.toast({html: 'Login failed!'})
            }
        });
    });
});
