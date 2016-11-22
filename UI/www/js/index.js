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
    var localStickyData = jQuery.parseJSON(window.localStorage.getItem(STICKYDATA));
    if (localStickyData == null) {
        localStickyData = { "GetNotesResult": [] };

        window.localStorage.setItem(STICKYDATA, JSON.stringify(localStickyData));
    }
    if(localStickyData.GetNotesResult.length==0)
    {
        syncStickyData();
    }
    return localStickyData;
}
function closeModalViewLogin() {
    $("#modalview-login").kendoMobileModalView("close");
    $("#modalview-register").kendoMobileModalView("close");
}
function closeModalViewRegister() {
    $("#modalview-login").kendoMobileModalView("close");
    $("#modalview-register").kendoMobileModalView("close");
}

function openModalViewLogin()
{
    $("#modalview-register").kendoMobileModalView("close");
    $("#modalview-login").kendoMobileModalView("open");
}

function syncStickyData()
{
    $.ajax
    ({
        type: "GET",
        url: "http://syncnotesservice.azurewebsites.net/notesservice.svc/GetNotes/test11@test.com",
        async: false,
        beforeSend: function (xhr) {
            // if (request.pass != '') {
            //     console.log('beforeSend Build Details');
            //     var username = request.user;
            //     var password = request.pass;
            //     console.log(btoa(username + ":" + password))
            //     xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
            //     xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            // }
        },
        timeout: 3000, // sets timeout to 3 seconds
        success: function (result) {
            window.localStorage.setItem(STICKYDATA, JSON.stringify(result));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(textStatus + "Error: " + errorThrown);
        }
    });
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
}

function deleteEnv(id)
{
    var localData = getStickyData();

    for(var i=0; i<localData.GetNotesResult.length; i++){
        if(localData.GetNotesResult[i].GuidID === id){
            localData.GetNotesResult.splice(i,1);
            break;
        }
    }
    window.localStorage[STICKYDATA] = JSON.stringify(localData);
}

function saveEnvModalView() {
    var localData = getStickyData();
    var options = {
        data: {
            "GuidID": NewGuid(),
            "Notes": $("#env-add-text").val(),
            "UpdateDate":new Date()
        }
    };

    localData.GetNotesResult.push(options.data);
    window.localStorage[STICKYDATA] = JSON.stringify(localData);
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
            if (dataSource.data()[i].GuidID == view.element.find("#env-edit-id").val()) {
                dataSource.data()[i].Notes = view.element.find("#env-edit-text").data("kendoEditor").value();
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
            localData.GetNotesResult.push(options.data);
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

            for(var i=0; i<localData.GetNotesResult.length; i++){
                if(localData.GetNotesResult[i].GuidID == options.data.GuidID){
                    localData.GetNotesResult[i].Notes = options.data.Notes;
                    localData.GetNotesResult[i].UpdateDate = new Date();
                }
            }
            window.localStorage[STICKYDATA] = JSON.stringify(localData);
            options.success(options.data);
        },
        destroy: function(options){
            var localData = JSON.parse(localStorage[STICKYDATA]);
            for(var i=0; i<localData.GetNotesResult.length; i++){
                if(localData.GetNotesResult[i].GuidID === options.data.GuidID){
                    localData.GetNotesResult.splice(i,1);
                    break;
                }
            }
            localStorage[STICKYDATA] = JSON.stringify(localData);
            options.success(localData);
        },
    },
    schema: {
        data: "GetNotesResult",
        model: {
            id: "GuidID",
            fields: {
                GuidID: { editable: false, nullable: false, type: "string" },
                Notes: { editable: true, nullable: false, type: "string" },
                UpdateDate: { editable: true, nullable: false, type: "date" }
            }
        }
    }
});

