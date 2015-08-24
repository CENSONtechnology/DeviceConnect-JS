/**
 omnidirectionalimage.js
 Copyright (c) 2014 NTT DOCOMO,INC.
 Released under the MIT license
 http://opensource.org/licenses/mit-license.php
 */

 /**
 * Show Omnidirectional Image Menu
 *
 * @param {String} serviceId サービスID
 */
function showOmnidirectionalImage(serviceId) {
  var defaultWidth = 280;
  var defaultHeight = 210;
  var paramPatterns = [
    { id: 'patternX', name: 'x', type: 'number', min: -1.0, max: 1.0, by: 0.2 },
    { id: 'patternY', name: 'y', type: 'number', min: -1.0, max: 1.0, by: 0.2 },
    { id: 'patternZ', name: 'z', type: 'number', min: -1.0, max: 1.0, by: 0.2 },
    { id: 'patternRoll', name: 'roll', type: 'number', min: 0.0, max: 360.0, by: 45.0 },
    { id: 'patternYaw', name: 'yaw', type: 'number', min: 0.0, max: 360.0, by: 45.0 },
    { id: 'patternPitch', name: 'pitch', type: 'number', min: 0.0, max: 360.0, by: 45.0 },
    { id: 'patternFov', name: 'fov', type: 'number', min: 0.0, max: 180.0, by: 15.0 },
    { id: 'patternWidth', name: 'width', type: 'number', min: 100.0, max: 500.0, by: 50.0 },
    { id: 'patternHeight', name: 'height', type: 'number', min: 100.0, max: 500.0, by: 50.0 }
  ];

  initAll();
  setTitle('Omnidirectional Image Profile');

  var btnStr = getBackButton('Device Top', 'doOmnidirectionalImageBack', serviceId, '');
  reloadHeader(btnStr);
  reloadFooter(btnStr);

  var content = '';
  content += '<b>Omnidirectional Image:</b><br>';
  content += '<input id="omniUri" type="text">';
  content += '<button id="buttonShutter">Shot</button><br>';
  content += '<div id="updatedDate" style="font-size:0.5em"></div><br>';
  content += '<b>ROI Image Type:</b><br>';
  content += '<form>';
  content += '<select name="imgType">';
  content += '<option value="mjpeg" selected>MotionJPEG</option>';
  content += '<option value="jpeg">JPEG</option>';
  content += '</select>';
  content += '</form>';
  content += '<button id="buttonStartStop">Start</button><br>';
  content += '<b>ROI Image URI:</b><br><input id="roiUri" type="text"><br>';
  content += '<b>ROI Image Viewer:</b><br><center><img id="omniImg"></center>';
  content += '<button id="buttonShow">Show</button><br>';
  content += '<b>Params (Auto Increment):</b><br>';
  content += '<form>';
  content += '<select name="patterns">';
  content += '<option value="patternX" selected>Camera: X-coodinate</option>';
  content += '<option value="patternY">Camera: Y-coodinate</option>';
  content += '<option value="patternZ">Camera: Z-coodinate</option>';
  content += '<option value="patternRoll">Camera: Roll</option>';
  content += '<option value="patternYaw">Camera: Yaw</option>';
  content += '<option value="patternPitch">Camera: Pitch</option>';
  content += '<option value="patternFov">Camera: FOV</option>';
  content += '<option value="patternWidth">ROI Width</option>';
  content += '<option value="patternHeight">ROI Height</option>';
  content += '</select>';
  content += '</form>';
  content += '<button id="buttonStartPattern">Start Increment</button><br>';
  content += '<b>Params (Manual):</b><br>';
  content += '<button id="buttonSendParams">Send Params</button><br>';
  content += 'VR: ';
  content += '<form>';
  content += '<select name="vrMode">';
  content += '<option value="true">ON</option>';
  content += '<option value="false" selected>OFF</option>';
  content += '</select>';
  content += '</form>';
  content += 'Stereo: ';
  content += '<form>';
  content += '<select name="stereoMode">';
  content += '<option value="true">ON</option>';
  content += '<option value="false" selected>OFF</option>';
  content += '</select>';
  content += '</form>';
  content += 'X: <input id="paramX" type="text" value="0.25"><br>';
  content += 'Y: <input id="paramY" type="text" value="0"><br>';
  content += 'Z: <input id="paramZ" type="text" value="0"><br>';
  content += 'Roll: <input id="paramRoll" type="text" value="0"><br>';
  content += 'Yaw: <input id="paramYaw" type="text" value="0"><br>';
  content += 'Pitch: <input id="paramPitch" type="text" value="0"><br>';
  content += 'FOV: <input id="paramFov" type="text" value="90"><br>';
  content += 'Sphere Size: <input id="paramSphereSize" type="text" value="1.0"><br>';
  content += 'Width: <input id="paramWidth" type="text" value="' + defaultWidth + '"><br>';
  content += 'Height: <input id="paramHeight" type="text" value="' + defaultHeight + '"><br>';
　reloadContent(content);

  var omniUri;
  var roiUri;
  var imgType;
  var timerId;
  var isStarted = false;

  var omniImg = $('#omniImg');
  omniImg.css('width', defaultWidth + 'px');
  omniImg.css('height', defaultHeight + 'px');
  omniImg.css('border', '1px solid #000000');

  $('#buttonShutter').on('click', function() { shot(); });
  $('#buttonStartStop').on('click', function() { switchView(); });
  $('#buttonShow').on('click', function() { showViewImage(); });
  $('#buttonSendParams').on('click', function() { sendParams(); });
  $('#buttonStartPattern').on('click', function() { startSettingsPattern(); });

  // XXXX: For debug
  omniUri = 'http://192.168.1.58:8080/R0010162.JPG';
  $('#omniUri').val(omniUri);

  showOmniImageUpdatedDate();

  function shot() {
    searchTHETA({
      onfound: function(theta) {
        var uri = new dConnect.URIBuilder()
          .setProfile('mediastream_recording')
          .setAttribute('takephoto')
          .setServiceId(theta.id)
          .setAccessToken(accessToken)
          .build();
        dConnect.post(uri, null, null,
          function(json) {
            omniUri = json.uri;
            $('#omniUri').val(omniUri);

            showOmniImageUpdatedDate();
          },
          function(errorCode, errorMessage) {
            alert('Failed to take photo.');
          });
      },
      onnotfound: function() {
        alert('THETA is not found.');
      },
      onerror: function() {
        alert('Failed communication between Manager and this app.');
      }
    });
  }

  function searchTHETA(cb) {
    dConnect.discoverDevices(accessToken,
      function(json) {
        var i,
            devices = json.services;
        for (i = 0; i < devices.length; i++) {
          var id = devices[i].id;
          if (id.indexOf('theta') >= 0) {
            cb.onfound(devices[i]);
            return;
          }
        }
        cb.onnotfound();
      },
      function(errorCode, errorMessage) {
        console.error('Failed to search THETA: errorCode=' + errorCode + ' errorMessage=' + errorMessage);
        cb.onerror();
      });
  }

  function sendParams() {
    if (roiUri === undefined) {
      alert('ROI Image View is not started.');
      return;
    }
    var uri = new dConnect.URIBuilder()
      .setProfile('omnidirectional_image')
      .setInterface('roi')
      .setAttribute('settings')
      .setServiceId(serviceId)
      .setAccessToken(accessToken)
      .addParameter('uri', roiUri)
      .addParameter('vr', $('[name=vrMode]').val())
      .addParameter('stereo', $('[name=stereoMode]').val())
      .addParameter('x', $('#paramX').val())
      .addParameter('y', $('#paramY').val())
      .addParameter('z', $('#paramZ').val())
      .addParameter('roll', $('#paramRoll').val())
      .addParameter('yaw', $('#paramYaw').val())
      .addParameter('pitch', $('#paramPitch').val())
      .addParameter('fov', $('#paramFov').val())
      .addParameter('sphereSize', $('#paramSphereSize').val())
      .addParameter('width', $('#paramWidth').val())
      .addParameter('height', $('#paramHeight').val())
      .build();

    dConnect.put(uri, null, null,
      function(json) {
      },
      function(errorCode, errorMessage) {
        alert('Faile to send settings: errorCode=' + errorCode + ' errorMessage=' + errorMessage);
      });
  }

  function switchView() {
    isStarted = !isStarted;
    if (isStarted) {
      startView({
        onstart: function(uri, type) {
          roiUri = uri;
          imgType = type;
          changeToStop($('#buttonStartStop'));
          $('#roiUri').val(uri);
        }
      });
    } else {
      stopView({
        onstop: function() {
          changeToStart($('#buttonStartStop'));
        }
      });
    }
  }

  function showOmniImageUpdatedDate() {
    $('#updatedDate').text('Last Updated: ' + new Date().toString());
  }

  function showViewImage() {
    omniImg.attr('src', roiUri);
    omniImg.bind('error', function() {
      if (timerId !== undefined) {
        clearInterval(timerId);
        timerId = undefined;
      }
      alert('Failed to show ROI image.');
    });
    if (imgType === 'jpeg') {
      omniImg.bind('load', function() {
        timerId = scheduleToRefresh(roiUri, 200);
      });
    }
  }

  function scheduleToRefresh(uri, delay) {
    if (timerId) {
      return timerId;
    }
    return setInterval(function() {
      omniImg.attr('src', uri + '&timestamp=' + new Date().getTime());
    }, delay);
  }

  function startView(cb) {
    if ($('#omniUri').val() === '') {
      alert('Please push "Shot" button to take a photo.');
      return;
    }

    var imgType = $('[name=imgType]').val();
    var method;
    if (imgType === 'mjpeg') {
      method = 'PUT';
    } else if (imgType === 'jpeg') {
      method = 'GET';
    } else {
      alert('An unexpected error was occured.');
      return;
    }

    var uri = new dConnect.URIBuilder()
      .setProfile('omnidirectional_image')
      .setAttribute('roi')
      .setServiceId(serviceId)
      .setAccessToken(accessToken)
      .addParameter('source', $('#omniUri').val())
      .build();

    dConnect.sendRequest(method, uri, null, null,
      function(json) {
        cb.onstart(json.uri, imgType);
      },
      function(errorCode, errorMessage) {
      
      });
  }

  function stopView(cb) {
    if (roiUri === undefined) {
      return;
    }
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }

    var uri = new dConnect.URIBuilder()
      .setProfile('omnidirectional_image')
      .setAttribute('roi')
      .setServiceId(serviceId)
      .setAccessToken(accessToken)
      .addParameter('uri', roiUri)
      .build();

    dConnect.delete(uri, null,
      function(json) {
        cb.onstop();
      },
      function(errorCode, errorMessage) {
      
      });
  }

  function changeToStop(button) {
    button.text('Stop');
  }

  function changeToStart(button) {
    button.text('Start');
  }

  function findPattern(id) {
    var i, pattern;
    for (i = 0; i < paramPatterns.length; i++) {
      pattern = paramPatterns[i];
      if (pattern.id === id) {
        return pattern;
      }
    }
    return null;
  }

  function startSettingsPattern() {
    var patternId = $('[name=patterns]').val();
    var pattern = findPattern(patternId);
    if (!pattern) {
      return;
    }
    if (pattern.type === 'number') {
      pattern.execute = executePatternOfNumber;
    } else {
      alert('Fatal: specified type (' + pattern.type + ') of pattern is not defined.');
      return;
    }
    pattern.execute({
        pattern: pattern,
        onend: function() {
          alert('End of Auto Increment.');
        }
      });
  }

  function executePatternOfNumber(option, num) {
    if (num === undefined) {
      num = option.pattern.min;
    }
    var width = option.pattern.name === 'width' ? num : defaultWidth;
    var height = option.pattern.name === 'height' ? num : defaultHeight;
    var uri = new dConnect.URIBuilder()
      .setProfile('omnidirectional_image')
      .setInterface('roi')
      .setAttribute('settings')
      .setServiceId(serviceId)
      .setAccessToken(accessToken)
      .addParameter('uri', roiUri)
      .addParameter('width', width.toString())
      .addParameter('height', height.toString())
      .addParameter(option.pattern.name, num.toString())
      .build();
    dConnect.put(uri, null, null,
      function(json) {

        setTimeout(function() {
          var nextNum = num + option.pattern.by;
          if (nextNum > option.pattern.max) {
            option.onend();
            return;
          }
          executePatternOfNumber(option, nextNum);
        }, 500);
      },
      function(errorCode, errorMessage) {
        alert('ERROR: Failed to send settings param.');
      });

    $('#omniImg').css('width', width + 'px');
    $('#omniImg').css('height', height + 'px');
  }

}

/**
 * Backボタン
 *
 * @param {String} serviceId サービスID
 * @param {String} sessionKey セッションKEY
 */
function doOmnidirectionalImageBack(serviceId, sessionKey) {
  searchSystem(serviceId);
}