/**
 light.js
 Copyright (c) 2014 NTT DOCOMO,INC.
 Released under the MIT license
 http://opensource.org/licenses/mit-license.php
 */

/**
 * Light Group Menu.
 *
 * @param {String} deviceId デバイスID
 */
function showSearchLightGroup(deviceId) {
    initAll();
    
	closeLoading();
    showLoading();
	
	var btnStr = getBackButton('Light List', 'doSearchLightGroupBack', deviceId, "");
	reloadHeader(btnStr);
	reloadFooter(btnStr);
	
    var builder = new dConnect.URIBuilder();
    builder.setProfile("light");
    builder.setAttribute("group");
    builder.setDeviceId(deviceId);
    builder.setAccessToken(accessToken);
    var uri = builder.build();
	
	if (DEBUG) console.log("Uri: " + uri);
	
    setTitle("Light Group List");

    dConnect.execute('GET', uri, null, null, function(status, headerMap, responseText) {
        var json = JSON.parse(responseText);
        var lightGroups = json.lightGroups;
		console.log(responseText);
		var str = "";
        if (json.result == 0) {
        	var list = $("#list");
            list.empty();
            for (var i = 0; i < lightGroups.length; i++) {
            	var li = $("<li><a>" + lightGroups[i].name + "</a></li>");
            	li.data("group", lightGroups[i]);
            	li.on("click", function() {
            	    showLightGroup(deviceId, $(this).data("group"));
            	});
            	list.append(li);
            }
            list.listview("refresh");
            closeLoading();
            
    		var buttonDelete = $('<input data-icon="delete" data-inline="true" data-mini="true" type="button" value="Delete a group" />');
    		buttonDelete.data("groups", lightGroups);
    		buttonDelete.on("click", function() {
    			showDeleteLightGroupForm(deviceId, $(this).data("groups"));
    		});
    		var contents = $("#contents");
    		contents.append(buttonDelete);
    		contents.trigger('create');
        } else {
        	showError("GET light", json);
            showSearchLight(deviceId);
        }
    }, function(xhr, textStatus, errorThrown) {
    });
}

function showCreateLightGroupForm(deviceId, lights) {
	initAll();
	
	var btnStr = getBackButton('Light List', 'doCreateLightGroupFormBack', deviceId, "");
	reloadHeader(btnStr);
	reloadFooter(btnStr);
	
    setTitle("Create new light group");
    
    var contents = $("#contents");
    contents.empty();
    var div = $('<div>');
    div.append($('<label for="textfield-new-group-name">New group name:</label>'));
    div.append($('<input type="text" id="textfield-new-group-name" />'));
    contents.append(div);
    contents.append($('<p>Member(s) of new group:</p>'));
    for (var i = 0; i < lights.length; i++) {
    	var light = lights[i];
    	var id = "light-" + light.lightId;
    	var checkbox = $('<input type="checkbox" name="group-creation" id="' + id + '" value="' + light.lightId + '" class="custom" data-mini="true" />');
    	var label = $('<label for="' + id + '">' + light.name + '</label>');
        contents.append(checkbox);
        contents.append(label);
    }
    contents.append('<hr />');
    var buttonCreate = $('<input data-icon="plus" data-inline="true" data-mini="true" type="button" value="Submit to create"/>');
    buttonCreate.on("click", function() {
    	var lightIds = "";
    	$("[name='group-creation']:checked").each(function() {
    		if (lightIds !== "") {
    			lightIds += ",";
    		}
    		lightIds += $(this).attr("value");
    	});
    	
    	var groupName = $('#textfield-new-group-name').val();
    	if (groupName === "") {
    		alert("Please specify new group name.");
    		return;
    	}
    	
    	var builder = new dConnect.URIBuilder();
        builder.setProfile("light");
        builder.setInterface("group");
        builder.setAttribute("create");
        builder.setDeviceId(deviceId);
        builder.setAccessToken(accessToken);
        builder.addParameter("groupName", groupName);
        builder.addParameter("lightIds", lightIds);
        var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
        dConnect.execute('POST', uri, null, null, function(status, headerMap, responseText) {
            if (DEBUG) console.log("Response: " + responseText);
            var json = JSON.parse(responseText);
            var str = "";
            if (json.result == 0) {
				alert("Created Group: name=" + groupName + " lightIds=" + lightIds);
            } else {
				showError("POST /light/group/create", json);
            }
        });
    });
    contents.append(buttonCreate);
    contents.trigger("create");
}

function showDeleteLightGroupForm(deviceId, lightGroups) {
	initAll();
	
	var btnStr = "";    
    btnStr += getBackButton('Light Group List', 'doDeleteLightGroupFormBack', deviceId, "");
	reloadHeader(btnStr);
	reloadFooter(btnStr);
	
    setTitle("Delete a light group");
    
    var contents = $("#contents");
    contents.empty();
    for (var i = 0; i < lightGroups.length; i++) {
    	var group = lightGroups[i];
    	var id = "group-" + group.groupId;
        var checkbox = $('<input type="radio" name="group-deletion" id="' + id + '" value="' + group.groupId + '" class="custom" data-mini="true" />');
        if (i == 0) {
        	checkbox.attr("checked", "checked");
        }
        var label = $('<label id="label-' + id + '" for="' + id + '">' + group.name + '</label>');
        contents.append(checkbox);
        contents.append(label);
    }
    contents.append('<hr />');
    var buttonDelete = $('<input data-icon="delete" data-inline="true" data-mini="true" type="button" value="Delete"/>');
    //buttonDelete.data("groups", lightGroups);
    buttonDelete.on("click", function() {
    	var selectedGroup = $("input[name='group-deletion']:checked");
    	if (selectedGroup === undefined) {
    		alert("Please select a group to be deleted.");
    		return;
    	}
    	var deletedGroupId = selectedGroup.attr("value");
    	console.log("deletedGroupId: " + deletedGroupId);
    
    	var builder = new dConnect.URIBuilder();
    	builder.setProfile("light");
    	builder.setInterface("group");
    	builder.setAttribute("clear");
    	builder.setDeviceId(deviceId);
    	builder.setAccessToken(accessToken);
    	builder.addParameter("groupId", deletedGroupId);
    	var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
		dConnect.execute('DELETE', uri, null, null, function(status, headerMap, responseText) {
            if (DEBUG) console.log("Response: " + responseText);
            var json = JSON.parse(responseText);
            var str = "";
            if (json.result == 0) {
            	$("#group-" + deletedGroupId).remove();
            	$("#label-group-" + deletedGroupId).remove();
            } else {
				showError("DELETE /light/group", json);
            }
        });
    });
    contents.append(buttonDelete);
    contents.trigger("create");
}

/**
 * Light Menu
 *
 * @param {String}deviceId デバイスID
 */
function showSearchLight(deviceId) {
    initAll();
    
	closeLoading();
    showLoading();
	
	var btnStr = "";    
    btnStr += getBackButton('Device Top', 'doSearchLightBack', deviceId, "");
	reloadHeader(btnStr);
	reloadFooter(btnStr);
	
    var builder = new dConnect.URIBuilder();
    builder.setProfile("light");
    builder.setDeviceId(deviceId);
    builder.setAccessToken(accessToken);
    var uri = builder.build();
	
	if(DEBUG) console.log("Uri:"+uri)
	
    setTitle("Light List");

    dConnect.execute('GET', uri, null, null, function(status, headerMap, responseText) {
        var json = JSON.parse(responseText);
		console.log(responseText);
        if (json.result == 0) {
            listLights(deviceId, json.lights);
            
            var buttonViewGroups = $('<input data-icon="search" data-inline="true" data-mini="true" type="button" value="View groups"/>');
    		buttonViewGroups.on("click", function() {
    			showSearchLightGroup(deviceId);
    		});
            var buttonCreate = $('<input data-icon="plus" data-inline="true" data-mini="true" type="button" value="Create a group"/>');
    		buttonCreate.data("lights", json.lights);
    		buttonCreate.on("click", function() {
    			showCreateLightGroupForm(deviceId, $(this).data("lights"));
    		});
    		var contents = $("#contents");
    		contents.append(buttonViewGroups);
    		contents.append(buttonCreate);
    		contents.trigger('create');
        } else {
            showError("GET light", json);
            reloadContent("");
            closeLoading();
        }
    }, function(xhr, textStatus, errorThrown) {
    });
}

function listLights(deviceId, lights) {
    var str = "";
    for (var i = 0; i < lights.length; i++) {
        var lightName = lights[i].name;
        if(lightName == "Dice+ 1"){
            lightName = "Dice+ [1]"
        } else if(lightName == "Dice+ 2"){
            lightName = "Dice+ [2]"
        } else if(lightName == "Dice+ 4"){
        	lightName = "Dice+ [3]"
        } else if(lightName == "Dice+ 8"){
        	lightName = "Dice+ [4]"
        } else if(lightName == "Dice+ 16"){
        	lightName = "Dice+ [5]"
        } else if(lightName == "Dice+ 32"){
        	lightName = "Dice+ [6]"
        } else if(lightName == "Dice+ -1"){
        	lightName = "Dice+ [All]"
        } 
        str += '<li><a href="javascript:showLight(\'' + deviceId + '\', \'' + lights[i].lightId + '\', \'' + lights[i].name + '\');" value="' + lights[i].name + '">' + lightName + '</a></li>';
    }
	reloadList(str);
    closeLoading();
}

/** 
 * Shows a light.
 */
function showLight(deviceId, lightId, lightName) {
    initAll();
    
    setTitle("Light Profile (Light)");
	
	var btnStr = getBackButton('Light List', 'doLightBack', deviceId, "");
	reloadHeader(btnStr);
	reloadFooter(btnStr);
	
	var contents = $("#contents");
	contents.empty();
	
	contents.append('<h3>Light Name</h3>');
	contents.append('<input type="text" id="light-name-form" data-inline="true" value="' + lightName + '" />');
	
	var originalLightName = lightName;
	var buttonChangeName = $('<input type="button" value="Change name" />');
	buttonChangeName.on("click", function() {
	    var newLightName = $('#light-name-form').val();
	    if (newLightName === "") {
	        alert("Please specify light name.");
	        return;
	    }
		showLoading();
		var builder = new dConnect.URIBuilder();
    	builder.setProfile("light");
    	builder.setDeviceId(deviceId);
    	builder.setAccessToken(accessToken);
    	builder.addParameter("lightId", lightId);
    	builder.addParameter("name", newLightName);
    	var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
    	dConnect.execute('PUT', uri, null, null, function(status, headerMap, responseText) {
    	    var json = JSON.parse(responseText);
			console.log(responseText);
    	    if (json.result == 0) {
    	        alert("Success");
     	    } else {
                showError("GET light", json);
                $('#light-name-form').val(originalLightName);
            }
            closeLoading();
    	}, function(xhr, textStatus, errorThrown) {
    	    $('#light-name-form').val(originalLightName);
    	    closeLoading();
    	});
	});
	contents.append(buttonChangeName);
	
	contents.append('<h3>Light Color</h3>');
	var divColor = $('<div />');
	contents.append(divColor);
	
	if (lightName == "Sphero CalibrationLED") {
		divColor.append($('<input type="hidden" id="red" value="255" min="0" max="255"  />'));
		divColor.append($('<input type="hidden" id="green" value="255" min="0" max="255"  />'));
		divColor.append($('<input type="hidden" id="blue" value="255" min="0" max="255"  />'));
	} else {
		divColor.append($('<label for="slider-0">Red:</label>'));
		divColor.append($('<input type="range" name="slider" id="red" value="25" min="0" max="255"  />'));
		divColor.append($('<label for="slider-0">Green:</label>'));
		divColor.append($('<input type="range" name="slider" id="green" value="25" min="0" max="255"  />'));
		divColor.append($('<label for="slider-0">Blue:</label>'));
		divColor.append($('<input type="range" name="slider" id="blue" value="25" min="0" max="255"  />'));
	}
	divColor.append($('<input type="button" onclick="javascript:doLight(\'' + deviceId + '\',\'' + lightId + '\', 1);" value="on" name="On" id="On"/>'));
	divColor.append($('<input type="button" onclick="javascript:doLight(\'' + deviceId + '\',\'' + lightId + '\', 0);" value="off" name="Off" id="off"/>'));

	contents.trigger('create');
}

/** 
 * Shows a light group.
 */
function showLightGroup(deviceId, group) {
	initAll();
	
	var btnStr = getBackButton('Light Group List', 'doLightGroupBack', deviceId, "");
	reloadHeader(btnStr);
	reloadFooter(btnStr);
	
    setTitle("Light Profile (Light Group)");

	var contents = $("#contents");
	contents.empty();

    // グループ名変更UI
    contents.append('<h3>Group Name</h3>');
	var groupNameForm = $('<input type="text" id="group-name-form" data-inline="true" />');
	groupNameForm.val(group.name);
	contents.append(groupNameForm);
	var originalGroupName = group.name;
	var buttonChangeName = $('<input type="button" value="Change name" />');
	buttonChangeName.on("click", function() {
	    var newGroupName = $('#group-name-form').val();
	    if (newGroupName === "") {
	        alert("Please specify group name.");
	        return;
	    }
		showLoading();
		var builder = new dConnect.URIBuilder();
    	builder.setProfile("light");
    	builder.setAttribute("group");
    	builder.setDeviceId(deviceId);
    	builder.setAccessToken(accessToken);
    	builder.addParameter("groupId", group.groupId);
    	builder.addParameter("name", newGroupName);
    	var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
    	dConnect.execute('PUT', uri, null, null, function(status, headerMap, responseText) {
    	    var json = JSON.parse(responseText);
			console.log(responseText);
    	    if (json.result == 0) {
    	        alert("Success");
     	    } else {
                showError("GET light", json);
                $('#group-name-form').val(originalGroupName);
            }
            closeLoading();
    	}, function(xhr, textStatus, errorThrown) {
    	    $('#group-name-form').val(originalGroupName);
    	    closeLoading();
    	});
	});
	contents.append(buttonChangeName);
	
	// グループの色指定UI
	contents.append('<h3>Group Color</h3>');
	contents.append('<label for="slider-0">Red:</label>');
	contents.append('<input type="range" name="slider" id="red" value="25" min="0" max="255" />');
	contents.append('<label for="slider-0">Green:</label>');
	contents.append('<input type="range" name="slider" id="green" value="25" min="0" max="255" />');
	contents.append('<label for="slider-0">Blue:</label>');
	contents.append('<input type="range" name="slider" id="blue" value="25" min="0" max="255" />');
	var buttonOn = $('<input type="button" value="on" name="On" id="On" />');
	buttonOn.on("click", function() {
	    doLightGroup(deviceId, group.groupId, true);
	});
	var buttonOff = $('<input type="button" value="off" name="Off" id="off" />');
	buttonOff.on("click", function() {
	    doLightGroup(deviceId, group.groupId, false);
	});
	contents.append(buttonOn);
	contents.append(buttonOff);
	
	// ライト一覧UI
	var memberList = $('<ul data-role="listview" data-inset="true" />');
	for (var i = 0; i < group.lights.length; i++) {
		var light = group.lights[i];
		memberList.append($('<li><a href="javascript:showLight(\'' + deviceId + '\', \'' + light.lightId + '\', \'' + light.name + '\');" value="' + light.name + '">' + light.name + '</a></li>'));
	} 
	contents.append($('<h3>Light(s)</h3>'));
	contents.append(memberList);
	contents.trigger('create');
}

/**
 * Backボタン
 *
 * @param {String}deviceId デバイスID
 * @param {String}sessionKey セッションKEY
 */
function doSearchLightBack(deviceId, sessionKey){
	searchSystem(deviceId);
}

/**
 * Backボタン
 *
 * @param {String}deviceId デバイスID
 * @param {String}sessionKey セッションKEY
 */
function doSearchLightGroupBack(deviceId, sessionKey) {
	showSearchLight(deviceId);
}

/**
 * Backボタン
 *
 * @param {String}deviceId デバイスID
 * @param {String}sessionKey セッションKEY
 */
function doLightBack(deviceId, sessionKey){
	showSearchLight(deviceId);
}

/**
 * Backボタン
 *
 * @param {String}deviceId デバイスID
 * @param {String}sessionKey セッションKEY
 */
function doLightGroupBack(deviceId, sessionKey){
	showSearchLightGroup(deviceId);
}

/**
 * Backボタン
 *
 * @param {String}deviceId デバイスID
 * @param {String}sessionKey セッションKEY
 */
function doCreateLightGroupFormBack(deviceId, sessionKey){
	showSearchLight(deviceId);
}

/**
 * Backボタン
 *
 * @param {String}deviceId デバイスID
 * @param {String}sessionKey セッションKEY
 */
function doDeleteLightGroupFormBack(deviceId, sessionKey){
	showSearchLightGroup(deviceId);
}

function doLightGroup(deviceId, groupId, on) {
    if (on) {
        var red = document.getElementById('red').value;
        var green = document.getElementById('green').value;
        var blue = document.getElementById('blue').value;
        red = parseInt(red);
        green = parseInt(green);
        blue = parseInt(blue);
        red = zeroPadding(red.toString(16));
        green = zeroPadding(green.toString(16));
        blue = zeroPadding(blue.toString(16));
        var col = red + green + blue;

        var builder = new dConnect.URIBuilder();
        builder.setProfile("light");
        builder.setAttribute("group");
        builder.setDeviceId(deviceId);
        builder.setAccessToken(accessToken);
        builder.addParameter("color", col);
        builder.addParameter("groupId", groupId);
        var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
        dConnect.execute('POST', uri, null, null, function(status, headerMap, responseText) {
            if (DEBUG) console.log("Response: " + responseText);
            var json = JSON.parse(responseText);
            var str = "";
            if (json.result == 0) {
				alert("Success");
            } else {
				showError("POST /light/group", json);
            }
        });
    } else {
        var builder = new dConnect.URIBuilder();
        builder.setProfile("light");
        builder.setAttribute("group");
        builder.setDeviceId(deviceId);
        builder.setAccessToken(accessToken);
        builder.addParameter("groupId", groupId);
        var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
        dConnect.execute('DELETE', uri, null, null, function(status, headerMap, responseText) {
            if (DEBUG) console.log("Response: " + responseText);
            var json = JSON.parse(responseText);
            var str = "";
            if (json.result == 0) {
				alert("Success");
            } else {
				showError("DELETE /light/group", json);
            }
        });
    }
}

/** 
 * 指定したライトを点灯または消灯する.
 *
 * @param {String} deviceId デバイスID
 * @param {String} lightId 操作するライトID
 * @param {String} value 1の場合は点灯、0の場合は消灯
 */
function doLight(deviceId, lightId, value) {
    if (value == "1") {
        var red = document.getElementById('red').value;
        var green = document.getElementById('green').value;
        var blue = document.getElementById('blue').value;
        red = parseInt(red);
        green = parseInt(green);
        blue = parseInt(blue);
        red = zeroPadding(red.toString(16));
        green = zeroPadding(green.toString(16));
        blue = zeroPadding(blue.toString(16));
        var col = red + green + blue;

        var builder = new dConnect.URIBuilder();
        builder.setProfile("light");
        builder.setDeviceId(deviceId);
        builder.setAccessToken(accessToken);
        builder.addParameter("color", col);
        builder.addParameter("lightId", lightId);
        var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
        dConnect.execute('POST', uri, null, null, function(status, headerMap, responseText) {
            if (DEBUG) console.log("Response: " + responseText);
            var json = JSON.parse(responseText);
            if (json.result == 0) {
				alert("Success");
            } else {
				showError("POST light", json);
            }
        });
    } else {
        var builder = new dConnect.URIBuilder();
        builder.setProfile("light");
        builder.setDeviceId(deviceId);
        builder.setAccessToken(accessToken);
        builder.addParameter("lightId", lightId);
        var uri = builder.build();
		if (DEBUG) console.log("Uri: " + uri);
        dConnect.execute('DELETE', uri, null, null, function(status, headerMap, responseText) {
            if (DEBUG) console.log("Response: " + responseText);
            var json = JSON.parse(responseText);
            if (json.result == 0) {
				alert("Success");
            } else {
				showError("DELETE light", json);
            }
        });
    }
}

/**
 * 1桁の場合は、0を先頭につける
 *
 * @param value 
 */
function zeroPadding(value){
    if (value.length == 1){ 
        return "0" + value;
    } else {
        return value;
    }
}
	