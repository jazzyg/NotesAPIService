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
var localDebug = true;
var CREDENTIALS = "credentials";
var STICKYDATA = "sticky";
var USERDATA = "user";
var TOKENKEY = "token";

var serviceurl = "https://notesapiservice.azurewebsites.net";

document.addEventListener("deviceready", onDeviceReady, false);

// PhoneGap is ready
function onDeviceReady() {
    kendo.mobile.ui.Drawer.current = null;
    app = new kendo.mobile.Application($(document.body), {skin: 'nova'});
    getStickyData();
}

function  openWindow(url) {
    console.log('openWindow');

    window.open = cordova.InAppBrowser.open;

    var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbar=yes');

}

function NewGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function getStickyData()
{
    syncStickyData();
    return jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));
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
        $("#modalview-register").kendoMobileModalView("close");
        alert("Registration complete!");
    }).fail(showError);
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
  
    var loginData = {
        grant_type: 'password',
        username: $('#login-email').val(),
        password: $('#login-password').val(),
    };
    $.ajax({
        type: 'POST',
        url: serviceurl + '/Token',
        data: loginData
    }).done(function (data) {
        // Cache the access token in session storage.
        debugger;
        window.localStorage.setItem(USERDATA, data.userName);
        window.localStorage.setItem(TOKENKEY, data.access_token);
        $("#modalview-register").kendoMobileModalView("close");
        $("#modalview-login").kendoMobileModalView("close");
        $("#envListView").data("kendoMobileListView").dataSource.read();
    }).fail(showError);
}

function syncStickyData() {

    var jsondata = {};
    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

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
                window.localStorage.setItem(STICKYDATA, JSON.stringify(result));
                var localStickyData = jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));
                if (localStickyData == null) {
                    localStickyData = [];

                    window.localStorage.setItem(STICKYDATA, JSON.stringify(localStickyData));
                }
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

function closePipelineModalView()
{
    $("#pipeline-add-modalview").kendoMobileModalView("close");
}

function closeEnvModalView() {
    $("#pipeline-add-modalview").kendoMobileModalView("close");
}

function logout()
{
    var localData = [];
    window.localStorage[STICKYDATA] = JSON.stringify(localData);
    window.localStorage[CREDENTIALS] = JSON.stringify(localData);
    kendo.mobile.application.navigate("index");

    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);
   
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

        }).fail(showError);
}

function deleteEnv(id)
{

    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    var localData = getStickyData();
 
    for(var i=0; i<localData.length; i++){
        if(localData[i].guidID === id){
            localData.splice(i, 1);
            usr = localData[i].userId;

            break;
        }
    }
    
    var data = {};

    if (token) {
        headers.Authorization = 'Bearer ' + token;
    }
    else {
        return; //not logged, only local removed, if possible add a message for user to delete proceed in local, will it send to server?
    }

    $.ajax({
        method: "DELETE",
        contentType: 'application/json',
        url: serviceurl + "/api/notesdatas/" + usr + "/" + id,
        data: headers,
        success: function (result) {
            window.localStorage.setItem(STICKYDATA, JSON.stringify(result));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus + "Error: " + errorThrown);
        }
    });
}



function EditEnvModelView(id) {
    //var localData = getStickyData();
    var header = {};

    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    header.notes = $("#env-add-text").val();
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
            window.localStorage.setItem(STICKYDATA, JSON.stringify(result));
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
    debugger;

    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    header.guidID = NewGuid();
    header.notes = $("#env-add-text").val();
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
        url: serviceurl + "/api/notesdatas" ,   //noteid
        data: JSON.stringify(header),   //array to JSON
        success: function (result) {
            window.localStorage.setItem(STICKYDATA, JSON.stringify(result));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus + "Error: " + errorThrown);
        }
    });

    var data = { guidID: header.guidID, userID: header.userID, notes: header.notes, createdate:  new Date(), updateDate:  new Date()};
    var localData = JSON.parse(window.localStorage[STICKYDATA]);
    localData.push(data);
    window.localStorage[STICKYDATA] = JSON.stringify(localData);

    //window.localStorage[STICKYDATA] = JSON.stringify(data);
    $("#envListView").data("kendoMobileListView").dataSource.read();
    $("#env-add-modalview").kendoMobileModalView("close");

}

function envViewInit(e){

    e.view.element.find("#envListView").kendoMobileListView({
        dataSource: stickyDataSource,
        template: $("#environment-template").html()
    }).kendoTouch({
            filter: ">li",
            enableSwipe: true,
            touchstart: touchstart,
            tap: envNavigate,
            swipe: swipe
        });

    $("#envListView").data("kendoMobileListView").dataSource.read();
}

function envNavigate(e) {
    console.log($(e.touch.target).data("uid"))
    var itemUID = $(e.touch.target).data("uid");
    kendo.mobile.application.navigate("#env-edit-detailview?uid=" + itemUID);
}

function swipe(e) {
    var button = kendo.fx($(e.touch.currentTarget).find("[data-role=button]"));
    button.expand().duration(30).play();
}

function showError(jqXHR) {
//    debugger;
    alert(jqXHR.status + ': ' + jqXHR.statusText);
    /*
    var response = jqXHR.responseJSON;
    if (response) {
        if (response.Message) self.errors.push(response.Message);
        if (response.ModelState) {
            var modelState = response.ModelState;
            for (var prop in modelState) {
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
    */
}

function touchstart(e) {

    var target = $(e.touch.initialTouch),
        listview = $("#envListView").data("kendoMobileListView"),
        model,
        button = $(e.touch.target).find("[data-role=button]:visible");

    if (target.closest("[data-role=button]")[0]) {
        var dataSource = listview.dataSource;

        model = dataSource.getByUid($(e.touch.target).attr("data-uid"));
        dataSource.remove(model);

        //prevent `swipe`
        this.events.cancel();
        e.event.stopPropagation();
    } else if (button[0]) {
        button.hide();

        //prevent `swipe`
        this.events.cancel();
    } else {
        listview.items().find("[data-role=button]:visible").hide();
    }
}

function envDetailShow(e) {
    var listview = $("#envListView").data("kendoMobileListView");
    var dataSource = listview.dataSource;

    var model = dataSource.getByUid(e.view.params.uid);

    $("#env-delete-button").data("kendoMobileButton").bind("click", function() {
        deleteEnv(model.id);
        dataSource.read();
        kendo.mobile.application.navigate("#");
    });


    kendo.bind(e.view.element, model, kendo.mobile.ui);
}


function envDetailInit(e) {
    var view = e.view;
    var listview = $("#envListView").data("kendoMobileListView");
    var dataSource = listview.dataSource;

    view.element.find("#done").data("kendoMobileButton").bind("click", function() {
        view.element.find("#env-edit-text").val(view.element.find("#env-edit-text").data("kendoEditor").value());
        for(var i=0; i<dataSource.data().length; i++) {
            if (dataSource.data()[i].guidID == view.element.find("#env-edit-id").val()) {
                EditEnvModelView(view.element.find("#env-edit-id").val());
                dataSource.data()[i].notes = view.element.find("#env-edit-text").data("kendoEditor").value();
                dataSource.data()[i].dirty = true;
            }
        }
        dataSource.one("change", function() {
            view.loader.hide();
            dataSource.read();
            kendo.mobile.application.navigate("#");
        });

        view.loader.show();
        dataSource.sync();
    });


    view.element.find("#envCancel").data("kendoMobileBackButton").bind("click", function(e) {
        e.preventDefault();
        dataSource.one("change", function() {
            view.loader.hide();
            kendo.mobile.application.navigate("#");
        });

        view.loader.show();
        dataSource.cancelChanges();
    });
}


var stickyDataSource = new kendo.data.DataSource({
    transport: {
        create: function(options){
            var localData = JSON.parse(window.localStorage[STICKYDATA]);
            localData.push(options.data);
            window.localStorage[STICKYDATA] = JSON.stringify(localData);
            options.success(options.data);
        },
        read: function(options){
            var localData = getStickyData();
            options.success(localData);
        },
        change: function (e) {
            console.log('Changed');
        },
        // read: {
        //     url: "http://syncnotesservice.azurewebsites.net/notesservice.svc/GetNotes/test11@test.com",
        //     dataType: "json",
        //     cache: false,
        //     type: 'GET',
        //     beforeSend: function (xhr) {
        //         // if (request.pass != '') {
        //         //     console.log('beforeSend Jobs');
        //         //     var username = request.user;
        //         //     var password = request.pass;
        //         //     console.log(btoa(username + ":" + password))
        //         //     xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
        //         //     xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        //         // }
        //     }
        // },
        update: function(options){
            var localData = JSON.parse(window.localStorage[STICKYDATA]);

            for(var i=0; i<localData.length; i++){
                if(localData[i].guidID == options.data.guidID){
                    localData[i].notes = options.data.notes;
                    localData[i].updateDate = new Date();
                }
            }
            window.localStorage[STICKYDATA] = JSON.stringify(localData);
            options.success(options.data);
        },
        destroy: function(options){
            var localData = JSON.parse(localStorage[STICKYDATA]);
            for(var i=0; i<localData.length; i++){
                if(localData[i].guidID === options.data.guidID){
                    localData.splice(i,1);
                    break;
                }
            }
            localStorage[STICKYDATA] = JSON.stringify(localData);
            options.success(localData);
        },
    },
    schema: {
        model: {
            id: "guidID",
            fields: {
                userID: { editable: false, nullable: false, type: "string" },
                guidID: { editable: false, nullable: false, type: "string" },
                notes: { editable: true, nullable: false, type: "string" },
                createdate: { editable: true, nullable: false, type: "date" },
                updateDate: { editable: true, nullable: false, type: "date" }
            }
        }
    }
});

