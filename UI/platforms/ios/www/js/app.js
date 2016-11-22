function ViewModel() {
    var self = this;
    var webapiserviceUrl = "https://notesapiservice.azurewebsites.net/api";

    var tokenKey = 'accessToken';

    self.result = ko.observable();
    //self.user = ko.observable();

    self.register-email = ko.observable();
    self.register-password = ko.observable();
    self.register-password2 = ko.observable();

    //self.login-email = ko.observable();
    //self.login-password = ko.observable();
    self.errors = ko.observableArray([]);

    function showError(jqXHR) {

        self.result(jqXHR.status + ': ' + jqXHR.statusText);

        var response = jqXHR.responseJSON;
        if (response) {
            if (response.Message) self.errors.push(response.Message);
            if (response.ModelState) {
                var modelState = response.ModelState;
                for (var prop in modelState)
                {
                    if (modelState.hasOwnProperty(prop)) {
                        var msgArr = modelState[prop]; // expect array here
                        if (msgArr.length) {
                            for (var i = 0; i < msgArr.length; ++i) self.errors.push(msgArr[i]);
                        }
                    }
                }
            }
            if (response.error) self.errors.push(response.error);
            if (response.error_description) self.errors.push(response.error_description);
        }
    }

    //self.callApi = function () {
    //    self.result('');
    //    self.errors.removeAll();
    //    var token = sessionStorage.getItem(tokenKey);
    //    var headers = {};
    //    if (token) {
    //        headers.Authorization = 'Bearer ' + token;
    //    
    //    $.ajax({
    //        type: 'GET',
    //        url: 'api/NotesDatas',
    //        headers: headers
    //    }).done(function (data) {
    //        self.result(data);
    //    }).fail(showError);
    //}

    self.appregister = function () {
        self.result('');
        self.errors.removeAll();

        var data = {
            Email: self.register-email(),
            Password: self.register-password(),
            ConfirmPassword: self.register-password2()
        };

        $.ajax({
            type: 'POST',
            url: webapiserviceUrl + '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.result("Registeration Done, Pls login!");
            closeModalViewRegister();
            openModalViewLogin();
        }).fail(showError);
    }

    self.applogin = function () {
        self.result('');
        self.errors.removeAll();

        var loginData = {
            grant_type: 'password',
            username: self.register-email(),
            password: self.register-password(),
            
        };

        $.ajax({
            type: 'POST',
            url: webapiserviceUrl + '/Token',
            data: loginData
        }).done(function (data) {
            self.user(data.userName);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            sessionStorage.setItem(loggedUser, data.userName);

            self.result("Logged!");
            closeModalViewLogin();

        }).fail(showError);
    }
    //To be implemented
    self.appexternallogin = function () {
        self.result('');
        self.errors.removeAll();

        var externalloginData = {
            grant_type: 'password',
            username: self.externalloginEmail(),
            password: self.externalloginPassword()
        };

        $.ajax({
            type: 'POST',
            url: webapiserviceUrl + '/Token',
            data: externalloginData
        }).done(function (data) {
            self.user(data.userName);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            self.result("external Logged!");
        }).fail(showError);
    }

    self.applogout = function () {
        // Log out from the cookie based logon.
        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'POST',
            url: webapiserviceUrl + '/api/Account/Logout',
            headers: headers
        }).done(function (data) {
            // Successfully logged out. Delete the token.
            self.user('');
            sessionStorage.removeItem(tokenKey);
            sessionStorage.removeItem(sessionStorage.getItem(loggedUser));
            self.result("Logged off!");
        }).fail(showError);
    }
}

var app = new ViewModel();
ko.applyBindings(app);