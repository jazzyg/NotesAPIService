/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app;
var USERDATA = "user";
var TOKENKEY = "token";
var manualOffline = false;

var serviceurl = "https://notesapiservice.azurewebsites.net";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    kendo.mobile.ui.Drawer.current = null;
    app = new kendo.mobile.Application($(document.body), {skin: 'nova'});
    checkLoginStatus();
}


function initGrid() {

    $("#log-out-button").kendoButton({
        click: function(e) {
            OnModalViewLogout();
        }
    });


    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    var dataSource = new kendo.data.DataSource({
        offlineStorage: "products-offline",
        transport: {
            read: {
                url: function () {
                    return serviceurl + '/api/notesdatas/' + window.localStorage.getItem(USERDATA)
                },
                dataType : "json",
                type: 'GET',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", 'Bearer ' + window.localStorage.getItem(TOKENKEY));
                }
            },
            update: {
                url: function () {
                    return serviceurl + "/api/notesdatas/" + window.localStorage.getItem(USERDATA);
                },
                dataType: "json",
                type: 'PUT',
                contentType: "application/json",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", 'Bearer ' + window.localStorage.getItem(TOKENKEY));
                }
            },
            destroy: {
                url : function (item) {
                    return serviceurl + "/api/notesdatas/" + window.localStorage.getItem(USERDATA) + "/" + item.guidID;
                },
                dataType: "json",
                type: 'DELETE',
                contentType: "application/json",
            },
            create: {
                url: function () {
                    return serviceurl + "/api/notesdatas";   //no query string needed
                },
                dataType: "json",
                type: 'POST',
                contentType: "application/json",
            },
            parameterMap: function (options, operation) {
                if (operation !== "read" && options) {
                    var header = {};
                    header.notes = options.notes;
                    header.userID = window.localStorage.getItem(USERDATA);
                    header.guidid = options.guidID;
                    if (operation == "create") {
                        header.guidid = NewGuid();
                    }
                    header.Authorization = 'Bearer ' + window.localStorage.getItem(TOKENKEY);
                    return JSON.stringify(header);

                }
            }
        },
        batch: false,
        pageSize: 20,
        schema: {
            model: {
                id: "guidID",
                fields: {
                    userID: {editable: false, nullable: false, type: "string"},
                    guidID: {editable: false, nullable: false, type: "string"},
                    notes: {editable: true, nullable: false, type: "string"},
                    title: {editable: false, nullable: false, type: "string"},
                    syncstatus: {editable: false, nullable: false, type: "number"},
                    createdate: {editable: false, nullable: false, type: "date"},
                    updateDate: {editable: false, nullable: false, type: "date"}
                }
            }
        }
    });

    var online = localStorage["kendo-grid-online"] == "true" || localStorage["kendo-grid-online"] === undefined;
    if (!online) {
        $("#online").removeAttr("checked");
        dataSource.online(false);
    }

    $("#online").kendoMobileSwitch({
        value: online,
        change: function () {
            online = this.value();

            console.log("Working " + (online ? "kendo-grid-online" : "off-line"));

            localStorage["kendo-grid-online"] = online;

            dataSource.online(online);
            manualOffline = !online;

            if(online) {
                checkOnlineStatus(dataSource);
            }
        }
    });

//#=moment.duration(moment().diff(moment(start_time, 'X'))).humanize()#
    $("#envGrid").kendoGrid({
        dataSource: dataSource,
        pageable: true,
        mobile: "phone",
        height: 'auto',
        resizable: true,
        toolbar: ["create"],
        edit: function (e) {
            if (e.model.isNew()) {
                //            debugger;
                // Disable the editor of the "id" column when editing data items
                // var numeric = e.container.find("input[name=id]").data("kendoNumericTextBox");
                // numeric.enable(false);
            }
        },
        columns: [
            {command: ["destroy"], title: "&nbsp;", width: "30px"},
            {field: "title", title: "Note"},
            {field: "updateDate", title: "Updated", format: "{0:t}"}
        ],
        editable: {
            mode:"popup",
            template: $("#stickyTemplate").html(),
            confirmation: "Are you sure?"
        },
        filterable: false,
        sortable: true,
        columnMenu: false
    });


    $("#envGrid").delegate("tbody>tr", "click", function () {
        if (!$(this).hasClass('k-grid-edit-row')) {
            $("#envGrid").data("kendoGrid").editRow($(this));
        }
    });

    // make a request to some URL every 5 seconds to see if Internet access is available
    var pollId = setInterval(function() {
        checkLoginStatus();
        checkOnlineStatus(dataSource);

    }, 5000);

}

function checkOnlineStatus(dataSource) {
    $.ajax({
        // use an URL from the same domain to adhere to the same origin policy
        url: "https://api.github.com/users/google",
        dataType: "jsonp",
        jsonpCallback: "logResults"
    })
        .done(function () {
            // the ajax request succeeded - we are probably online.
            console.log("Online");
            if (!manualOffline) {
                dataSource.online(true);
                var switchInstance = $("#online").data("kendoMobileSwitch");
                switchInstance.check(true);
                console.log($('.k-grid-edit-form').length);
                if($('.k-grid-edit-form').length == 0) {
                    dataSource.read();
                }
            }
            else {
                console.log("manual offline activated. Skip!");
            }
        })
        .fail(function () {
            // the ajax request failed - we are probably offline.
            console.log("Offline");
            dataSource.online(false);
            var switchInstance = $("#online").data("kendoMobileSwitch");
            switchInstance.check(false);
        });
}


function checkLoginStatus(){
    var token = window.localStorage.getItem(TOKENKEY);

    if (token != null) {
        $("#login-modalview-open-button").hide();
        $("#logout-button").show();
        $( "#envGrid" ).show();

    }
    else {
        $("#login-modalview-open-button").show();
        $("#logout-button").hide();
        $( "#envGrid" ).hide();
    }

}

function NewGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


function closeModalViewLogin() {
    $("#modalview-login").kendoMobileModalView("close");
    $("#modalview-register").kendoMobileModalView("close");
}

function OnModalViewRegister() {
    $("#modalview-login").kendoMobileModalView("close");

    var data = {
        Email: $('#register-email').val(),
        Password: $('#register-password').val(),
        ConfirmPassword: $('#register-password2').val(),
    };

    $.ajax({
        type: 'POST',
        url: serviceurl + '/api/Account/Register',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data)
    }).done(function (data) {
        login($('#register-email').val(), $('#register-password').val());
        $('#register-email').val('');
        $('#register-password').val('');
        $('#register-password2').val('');
        $("#modalview-register").kendoMobileModalView("close");
    }).fail(function (jqXHR){
        console.log('Register Error' + jqXHR.status + ': ' + jqXHR.statusText);
    });
}

function closeModalViewRegister() {
    $("#modalview-login").kendoMobileModalView("close");
    $("#modalview-register").kendoMobileModalView("close");
}

function openModalViewLogin() {
    $("#modalview-register").kendoMobileModalView("close");
    $("#modalview-login").kendoMobileModalView("open");
}

function OnModalViewLogin()
{
    login($('#login-email').val(), $('#login-password').val());
}

function login(email, password) {
    var loginData = {
        grant_type: 'password',
        username: email,
        password: password,
    };
    $.ajax({
        type: 'POST',
        url: serviceurl + '/Token',
        data: loginData
    }).done(function (data) {
        // Cache the access token in session storage.
        window.localStorage.setItem(USERDATA, data.userName);
        window.localStorage.setItem(TOKENKEY, data.access_token);
        $('#login-email').val('');
        $('#login-password').val('');

        $("#modalview-register").kendoMobileModalView("close");
        $("#modalview-login").kendoMobileModalView("close");
        $("#envGrid").show();
        $("#envGrid").data("kendoGrid").dataSource.read();
        checkLoginStatus();
    }).fail(function (jqXHR){
        console.log('Login Error' + jqXHR.status + ': ' + jqXHR.statusText);
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function OnModalViewLogout()
{
    //logout-button
    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    window.localStorage.removeItem(USERDATA);
    window.localStorage.removeItem(TOKENKEY);
    $("#envGrid").data("kendoGrid").dataSource.read();
    $("#envGrid").hide();
    kendo.mobile.application.navigate("#");
    checkLoginStatus();

        /*
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
            window.localStorage.setItem(USERDATA, '');
            window.localStorage.setItem(TOKENKEY, '');

        }).fail(function (jqXHR){
            console.log('Logout Error' + jqXHR.status + ': ' + jqXHR.statusText);
        });
        */
}

