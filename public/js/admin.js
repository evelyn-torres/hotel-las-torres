(function ($) {
    // client-side validation for logging in 
    const checkUsername = (userName) => {
        if(!userName) throw "Error: you must supply a Username"; 
        if(typeof userName !== "string") throw "Error: Username must be a string"
        userName = userName.trim();
        if(userName.length === 0) {
            throw "Error: userName cannot be empty or just spaces."
        }
        return; 
    };

    const checkPassword = (password) => {
        // Check if password is at least 8 chars, and combo of upper & lower case char, at least 1 digit, at least 1 special char.
        if (!password) throw `Error: must supply a password`;
        if (typeof password !== 'string') throw `Error: Password must be a string!`;
        password = password.trim();
        if (password.length === 0) throw `Error: must supply a password`;

        return;
    }

    document.getElementById('loginForm').addEventListener('submit', function (event) {
        //let errordiv = document.getElementById('error_div'); 
        // prevent submission 
        let password = document.getElementById('passInput').value;
        let username = document.getElementById('userInput').value;

        // let perror = document.getElementById('perror');
        // let eerror = document.getElementById('eerror');

        try {
            let result = checkUsername(username);
            eerror.classList.add('hidden');
        } catch (e) {
            event.preventDefault();
            eerror.classList.remove('hidden');
            eerror.textContent = e;
        }

        try {
            let result = checkPassword(password);
            perror.classList.add('hidden');
        } catch (e) {
            event.preventDefault();
            perror.classList.remove('hidden');
            perror.textContent = e;
        }
    });

    $('#loginForm').submit(function (event) {
        event.preventDefault();

        let username = $('#userInput').val();
        let password = $('#passInput').val();

        try {
            checkUsername(username);
            checkPassword(password);

            $.ajax({
                method: 'POST',
                url: '/users/login',
                contentType: 'application/json',
                data: JSON.stringify({
                    username: username,
                    password: password
                })
            }).done(function (response) {
                window.location.href = '/users/profile';
            }).fail(function (error) {
                $('#login-error').text("Log in failed: " + error.responseJSON.message);
            });
        } catch (error) {

            $('#login-error').text(error);
        }
    });
})(window.jQuery);

//this doesn't work yet 