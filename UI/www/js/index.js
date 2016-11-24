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
var STICKYDATA = "sticky";
var USERDATA = "user";
var TOKENKEY = "token";
var offline = false;
var pendingDeletes = [];
var pendingInserts = [];

var serviceurl = "https://notesapiservice.azurewebsites.net";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    kendo.mobile.ui.Drawer.current = null;
    app = new kendo.mobile.Application($(document.body), {skin: 'nova'});
    syncStickyData();
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

function getLocalStickyData()
{
    return jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));
}

function getStickyData() {
    if (!offline) {
        console.log('Get Online Data.');
        syncStickyData();
    }
    else {
        console.log('Get Offline Data.');
    }
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
        $("#envListView").data("kendoMobileListView").dataSource.read();
    }).fail(function (jqXHR){
        console.log('Login Error' + jqXHR.status + ': ' + jqXHR.statusText);
    });
}

function syncStickyData() {

    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    $("#logout-button").hide();
    if (token != null) {
        $("#login-modalview-open-button").hide();
        $("#logout-button").show();

        $.ajax
        ({
            type: "GET",
            contentType: 'application/json',
            url: serviceurl + '/api/notesdatas/' + usr,
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            timeout: 3000, // sets timeout to 3 seconds
            success: function (result) {

                var localStickyData = [];
                var localData = jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));

                if (result != null) {
                    debugger;
                    if(localData == null || (localData!=null && localData.length==0))
                    {
                        localStickyData = result;
                    }
                    else {
                        for (var i = 0; i < result.length; i++) {
                            var noteFound = false;
                            for (var j = 0; j < localData.length; j++) {
                                if (localData[j].guidID == result[i].guidID) {
                                    noteFound = true;
                                    if(localData[j].syncstatus==0)
                                    {
                                        localStickyData.push(result[i]);
                                        break;
                                    }
                                    else
                                    {
                                        localStickyData.push(localData[j]);
                                    }
                                }
                            }
                            if(!noteFound)
                            {
                                localStickyData.push(result[i]);
                            }
                        }
                    }
                }
                window.localStorage.setItem(STICKYDATA, JSON.stringify(localStickyData));
                cleanUpPendingRequests();

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(textStatus + "Error: " + errorThrown);
            }
        });
    }
    else {
        //not logged...get local data or login screen
        return;
    }
}


function cleanUpPendingRequests() {
    console.log('cleanUpPendingRequests');

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

function closeNewEnvModalView() {
    $("#env-add-modalview").kendoMobileModalView("close");
}

function OnModalViewLogout()
{
    var localData = [];
    window.localStorage[STICKYDATA] = JSON.stringify(localData);
    window.localStorage.removeItem(USERDATA);
    window.localStorage.removeItem(TOKENKEY);
    $("#login-modalview-open-button").show();
    $("#logout-button").hide();
    $("#envListView").data("kendoMobileListView").dataSource.read();
    kendo.mobile.application.navigate("#");


    //logout-button
    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);
   
        // Log out from the cookie based logon.
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        /*
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

function deleteEnv(id)
{
    var header = {};
    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);

    var localData = getLocalStickyData();
 
    for(var i=0; i<localData.length; i++){
        if(localData[i].guidID === id){
            localData.splice(i, 1);
            window.localStorage.setItem(STICKYDATA, JSON.stringify(localData));
            console.log('Delete Local. Set offline.');
            offline = true;
            $("#envListView").data("kendoMobileListView").dataSource.read();
            break;
        }
    }


    if (!token) {
        return; //not logged, only local removed, if possible add a message for user to delete proceed in local, will it send to server?
    }

    $.ajax({
        method: "DELETE",
        contentType: 'application/json',
        url: serviceurl + "/api/notesdatas/" + usr + "/" + id,
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("Authorization", 'Bearer ' + token);
            xhr.guidid = settings.guidid;
        },
        success: function (result) {
            console.log('Deleted on Server. Set online.');
            offline = false;
            $("#envListView").data("kendoMobileListView").dataSource.read();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            offline = false;
            pendingDeletes.push(jqXHR.guidid);
            console.log(textStatus + "Error: " + errorThrown);
        }
    });

}



function UpdateEnvModelView(id, notes) {
    var header = {};

    var usr = window.localStorage.getItem(USERDATA);
    var token = window.localStorage.getItem(TOKENKEY);
    header.notes = notes;
    header.guidid = id;
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
        url: serviceurl + "/api/notesdatas/" + usr,   //userid
        data: JSON.stringify(header),   //array to JSON
        beforeSend: function(jqXHR, settings) {
            jqXHR.guidid = JSON.parse(settings.data).guidid;
        },
        success: function (result) {
            setStatus(result.guidID, 0);
            console.log('Update to Server Successful. Set online.');
            offline = false;
            $("#envListView").data("kendoMobileListView").dataSource.read();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            setStatus(jqXHR.guidid, 1);
            offline = false;
            console.log(textStatus + "Error: " + errorThrown);
            $("#envListView").data("kendoMobileListView").dataSource.read();
        }
    });

   
    //localData.push(data);
    //window.localStorage[STICKYDATA] = JSON.stringify(data);
    //$("#envListView").data("kendoMobileListView").dataSource.read();
    //$("#env-add-modalview").kendoMobileModalView("close");
}


function setStatus(guidid, status) {
    var localData = jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));

    for (var j = 0; j < localData.length; j++) {
        if (localData[j].guidID == guidid) {
            localData[j].syncstatus = status;
            break;
        }
    }
    window.localStorage[STICKYDATA] = JSON.stringify(localData);

}


function insertEnvModalView() {
    var header = {};

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
    $("#env-add-text").val('');
    $.ajax({
        method: "POST",
        contentType: 'application/json',
        url: serviceurl + "/api/notesdatas" ,   //no query string needed
        data: JSON.stringify(header),   //array to JSON
        beforeSend: function(jqXHR, settings) {
            jqXHR.guidid = JSON.parse(settings.data).guidid;
        },
        success: function (result) {
            syncStickyData();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            pendingInserts.push(jqXHR.guidid);
            console.log(textStatus + "Error: " + errorThrown);
        }
    });

    var data = { guidID: header.guidID, userID: header.userID, notes: header.notes, createdate:  new Date(), updateDate:  new Date()};
    var localData = JSON.parse(window.localStorage[STICKYDATA]);
    localData.push(data);
    window.localStorage[STICKYDATA] = JSON.stringify(localData);

    //window.localStorage[STICKYDATA] = JSON.stringify(data);
    $("#envListView").data("kendoMobileListView").dataSource.read();
    $("#env-add-modalview").kendoMobileModalView("close");
    kendo.mobile.application.navigate("#");

}

function envViewInit(e){

    e.view.element.find("#envListView").kendoMobileListView({
        dataSource: stickyDataSource,
        pullToRefresh: true,
        template: $("#environment-template").html()
    }).kendoTouch({
            filter: ">li",
            enableSwipe: true,
            touchstart: touchstart,
            tap: envNavigate,
            swipe: swipe
        });

    $("#log-out-button").kendoButton({
        click: function(e) {
            OnModalViewLogout();
        }
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
                dataSource.data()[i].notes = view.element.find("#env-edit-text").data("kendoEditor").value();
                dataSource.data()[i].dirty = true;
                $("#env-edit-text").blur();
                $("#envListView").focus();
                console.log('Update to Local. Set offline.');

                var localData = jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));

                for (var j = 0; j < localData.length; j++) {
                    if (localData[j].guidID == dataSource.data()[i].guidID) {
                        localData[j].notes = dataSource.data()[i].notes;
                        break;
                    }
                }
                window.localStorage[STICKYDATA] = JSON.stringify(localData);

                offline = true;
                UpdateEnvModelView(view.element.find("#env-edit-id").val(), view.element.find("#env-edit-text").val());
            }
        }
        dataSource.one("change", function() {
            view.loader.hide();
            dataSource.read();
            kendo.mobile.application.navigate("#index");
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
	    if(localData == null)
	    {
		localData = [];
	    }
            options.success(localData);
        },
        change: function (e) {
            console.log('Changed');
        },
        update: function(options){
            var localData = JSON.parse(window.localStorage[STICKYDATA]);

            for(var i=0; i<localData.length; i++){
                if(localData[i].guidID == options.data.guidID){
                    localData[i].notes = options.data.notes;
//                    localData[i].updateDate = new Date();
                }
            }
            window.localStorage[STICKYDATA] = JSON.stringify(localData);
            options.success(options.data);
        },
        /*
        destroy: function(options){
            console.log('deleting in datasource');
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
        */
    },
    schema: {
        model: {
            id: "guidID",
            fields: {
                userID: { editable: false, nullable: false, type: "string" },
                guidID: { editable: false, nullable: false, type: "string" },
                notes: { editable: true, nullable: false, type: "string" },
                title: { editable: true, nullable: false, type: "string" },
                syncstatus: { editable: true, nullable: false, type: "number" },
                createdate: { editable: true, nullable: false, type: "date" },
                updateDate: { editable: true, nullable: false, type: "date" }
            }
        }
    }
});

