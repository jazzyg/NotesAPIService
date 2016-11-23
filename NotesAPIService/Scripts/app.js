function ViewModel() {
    var self = this;

    var tokenKey = 'accessToken';
    
    self.result = ko.observable();
    self.user = ko.observable();

    self.registerEmail = ko.observable();
    self.registerPassword = ko.observable();
    self.registerPassword2 = ko.observable();

    self.externaltestEmail = ko.observable();
    self.externaltestPassword = ko.observable();

    self.externalloginEmail = ko.observable();
    self.externalloginPassword = ko.observable();

    self.loginEmail = ko.observable();
    self.loginPassword = ko.observable();
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

    self.callApi = function () {
        self.result('');
        self.errors.removeAll();

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: 'api/NotesDatas',
            headers: headers
        }).done(function (data) {
            self.result(data);
        }).fail(showError);
    }

    self.register = function () {
        self.result('');
        self.errors.removeAll();

        var data = {
            Email: self.registerEmail(),
            Password: self.registerPassword(),
            ConfirmPassword: self.registerPassword2()
        };

        $.ajax({
            type: 'POST',
            url: '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.result("Register Done!");
        }).fail(showError);
    }

    self.login = function () {
        self.result('');
        self.errors.removeAll();

        var loginData = {
            grant_type: 'password',
            username: self.loginEmail(),
            password: self.loginPassword()
        };

        $.ajax({
            type: 'POST',
            url: '/Token',
            data: loginData
        }).done(function (data) {
            self.user(data.userName);
                // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            sessionStorage.setItem(user, data.userId);
                self.result("Logged!");
        }).fail(showError);
    }

    self.externallogin = function () {
        self.result('');
        self.errors.removeAll();

        var externalloginData = {
            grant_type: 'password',
            username: self.externalloginEmail(),
            password: self.externalloginPassword()
        };

        $.ajax({
            type: 'POST',
            url: '/Token',
            data: externalloginData
        }).done(function (data) {
            self.user(data.userName);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            self.result("external Logged!");
        }).fail(showError);
    }

    self.logout = function () {
        // Log out from the cookie based logon.
        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'POST',
            url: '/api/Account/Logout',
            headers: headers
        }).done(function (data) {
            // Successfully logged out. Delete the token.
            self.user('');
            sessionStorage.removeItem(tokenKey);
            self.result("Logged!");
        }).fail(showError);
    }



    //*************************************************************************************


  
    var app;
    var localDebug = true;
    var CREDENTIALS = "credentials";
    var STICKYDATA = "sticky";
    var USERDATA = "user";
    var TOKENKEY = "token";
    

    var serviceurl = "";

   
    function NewGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $("#OnModalViewRegister").click(function () {
        //YourFunctionNameInExternalFile();
        OnModalViewRegister();
    });
    $("#OnModalViewLogin").click(function () {
        //YourFunctionNameInExternalFile();
        OnModalViewLogin();
    });

               

    $("#syncStickyData").click(function () {
        //YourFunctionNameInExternalFile();
        syncStickyData();
    });
                $("#EditEnvModelView").click(function () {
        //YourFunctionNameInExternalFile();
                    EditEnvModelView();
    });

                $("#saveEnvModalView").click(function () {
        //YourFunctionNameInExternalFile();
                    saveEnvModalView();
    });
                $("#deleteidEnv").click(function () {
        //YourFunctionNameInExternalFile();
                    deleteidEnv();
    });

    function OnModalViewRegister() {
        var data = {
            Email: 'test003@test.com',
            Password: 'Password11!',
            ConfirmPassword: 'Password11!',
        };
        debugger;
        $.ajax({
            type: 'POST',
            url: serviceurl + '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            alert("Registration complete!");
        }).fail(showError);
    }

    function OnModalViewLogin() {

        var loginData = {
            grant_type: 'password',
            username: 'test11@test.com',
            password: 'Password11!',
        };
        $.ajax({
            type: 'POST',
            url: serviceurl + '/Token',
            data: loginData
        }).done(function (data) {
            
            // Cache the access token in session storage.
            sessionStorage.setItem(TOKENKEY, data.access_token);
            sessionStorage.setItem(USERDATA, data.userName);

        alert('Logged In')
        }).fail(showError);
    }

    function syncStickyData() {

        var jsondata = {};
        var token = sessionStorage.getItem(TOKENKEY);
        var usr = sessionStorage.getItem(USERDATA);

        if (token) {

            $.ajax
            ({
                type: "GET",
                contentType: 'application/json',
                url: serviceurl + '/api/notesdatas/' + usr,
                async: false,
                //data:headers,
                beforeSend: function (xhr) {
                    // if (request.pass != '') {
                    //     console.log('beforeSend Build Details');
                    //     var username = request.user;
                    //     var password = request.pass;
                    //     console.log(btoa(username + ":" + password))
                    //     xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
                    xhr.setRequestHeader("Authorization", 'Bearer ' + token);
                    // }
                },
                timeout: 3000, // sets timeout to 3 seconds
                success: function (result) {

                    alert('result received: ' + JSON.stringify(result));
                    
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(textStatus + "Error: " + errorThrown);
                }
            });
        }
        else {
            //not logged...get local data or login screen
            return;
        }

    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.hash);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    self.logouttest = function () {
        var localData = [];
        

        // Log out from the cookie based logon.
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'POST',
            url: serviceurl + '/api/Account/Logout',
            headers: headers
        }).done(function (data) {
            // Successfully logged out. Delete the token.
       

        }).fail(showError);
    }

    function deleteidEnv() {

        var header = {};
        var token = sessionStorage.getItem(TOKENKEY);
        var usr = sessionStorage.getItem(USERDATA);

        var id = '1e3e6856-81a7-40cf-8ac8-a45929d0202d';
       
        header.guidid = '121755ce-7b9d-4834-b6cb-06241bcb19bd';
        header.userID = usr;

        if (token) {
            header.Authorization = 'Bearer ' + token;
        }
        else {
            return; //not logged, only local removed, if possible add a message for user to delete proceed in local, will it send to server?
        }
        $.ajax({
            method: "DELETE",
            contentType: 'application/json',
            url: serviceurl + "/api/notesdatas/" + usr + "/" + id,
            data: header,
            success: function (result) {
                alert('Deleted: ' + JSON.stringify(result));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(textStatus + "Error: " + errorThrown);
            }
        });
    }


    function EditEnvModelView() {
        //var localData = getStickyData();
        var header = {};

        var token = sessionStorage.getItem(TOKENKEY);
        var usr = sessionStorage.getItem(USERDATA);
        var id = usr;

        header.notes = 'Test notes from js file';
        header.guidid = '121755ce-7b9d-4834-b6cb-06241bcb19bd';
        header.userID = usr;

        if (token) {
            header.Authorization = 'Bearer ' + token;
        }
        else {
            alert("User not logged");
            return; //Not logged. will it send to server later...
        }

        $.ajax({
            method: "PUT",
            contentType: 'application/json',
            url: serviceurl + "/api/notesdatas/" + id,   //noteid
            data: JSON.stringify(header),   //array to JSON
            success: function (result) {
                alet('Modified');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(textStatus + "Error: " + errorThrown);
            }
        });


        //localData.push(data);
        //window.localStorage[STICKYDATA] = JSON.stringify(data);
        //$("#envListView").data("kendoMobileListView").dataSource.read();
        //$("#env-add-modalview").kendoMobileModalView("close");
    }

    function saveEnvModalView() {
        var header = {};
        var token = sessionStorage.getItem(TOKENKEY);
        var usr = sessionStorage.getItem(USERDATA);
        

        header.guidID = NewGuid();
        header.notes = 'Save new note';
        header.userID = usr;

        if (token) {
            header.Authorization = 'Bearer ' + token;
        }
        else {
            alert("User Not logged");
            return; //Not logged. will it send to server later...
        }

        $.ajax({
            method: "POST",
            contentType: 'application/json',
            url: serviceurl + "/api/notesdatas",   //noteid
            data: JSON.stringify(header),   //array to JSON
            success: function (result) {
                alert('Saved new note ' + JSON.stringify(result));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(textStatus + "Error: " + errorThrown);
            }
        });

    }


   
    //************************************************************************************




}

var app = new ViewModel();
ko.applyBindings(app);