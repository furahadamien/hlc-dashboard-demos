/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */


// Constants
const BASE_ROUTE = '/api/abribus';
const CONFIG_ROUTE = BASE_ROUTE + '/config';
const HOUR_OF_DAY_ROUTE = BASE_ROUTE + '/hourofday';
const DAY_OF_WEEK_ROUTE = BASE_ROUTE + '/dayofweek';
const ZONE_BY_TIME_ROUTE = BASE_ROUTE + '/zonebytime';
const SEAT_OCCUPANCY_RSSI_THRESHOLD = -75;


// DOM elements
let temperature = document.querySelector('#temperature');
let humidity = document.querySelector('#humidity');
let displayStatus = document.querySelector('#displaystatus');
let leftSeat = document.querySelector('#leftseat');
let rightSeat = document.querySelector('#rightseat');


// Other variables
let baseUrl = window.location.protocol + '//' + window.location.hostname +
              ':' + window.location.port;
let config = null;


// Other initialisation


// Initialise beaver to listen for raddecs on the websocket
function initialiseBeaver(hlcServerUrl) {
  let socket = io.connect(hlcServerUrl);
  beaver.listen(socket, true);

  // Non-disappearance events
  beaver.on([ 0, 1, 2, 3 ], function(raddec) {
    handleRaddec(raddec);
  });
}


// Handle incoming raddec
function handleRaddec(raddec) {
  switch(raddec.transmitterId) {
    case(config.environmentalBeaconId):
      handleEnvironmentalBeacon(raddec);
      break;
    case(config.leftSeatBeaconId):
      handleLeftSeatBeacon(raddec);
      break;
    case(config.rightSeatBeaconId):
      handleRightSeatBeacon(raddec);
      break;
    case(config.displayBeaconId):
      handleDisplayBeacon(raddec);
      break;
  }
}

function dispTime() {
  let now = new Date();
}

// Handle environmental beacon data
function handleEnvironmentalBeacon(raddec) {
  let packet = raddec.packets[0];
  let isSensorPacket = packet && (packet.length === 72);

  if(isSensorPacket) {
    let t = parseInt(packet.substr(44,2),16) +
            parseInt(packet.substr(46,2),16) / 256;
    let h = parseInt(packet.substr(48,2),16) +
            parseInt(packet.substr(50,2),16) / 256;
    temperature.textContent = t.toFixed(1);
    humidity.textContent = h.toFixed(1);
  }
}


// Handle left seat beacon data
function handleLeftSeatBeacon(raddec) {
  let rssi = raddec.rssiSignature[0].rssi;
  if(rssi > SEAT_OCCUPANCY_RSSI_THRESHOLD) {
    leftSeat.textContent = 'Vacant';
  }
  else {
    leftSeat.textContent = 'Occupe';
  }
}


// Handle right seat beacon data
function handleRightSeatBeacon(raddec) {
  let rssi = raddec.rssiSignature[0].rssi;
  if(rssi > SEAT_OCCUPANCY_RSSI_THRESHOLD) {
    rightSeat.textContent = 'Vacant';
  }
  else {
    rightSeat.textContent = 'Occupe';
  }
}


// Handle left seat beacon data
function handleDisplayBeacon(raddec) {
  let packet = raddec.packets[0];
  let isSensorPacket = packet && (packet.length === 58);

  if(isSensorPacket) {
    let isVisibleLight = (parseInt(packet.substr(44,2),16) > 0);
    if(isVisibleLight) {
      displayStatus.textContent = 'Allume';
    }
    else {
      displayStatus.textContent = 'Eteint';
    }
  }
}


// Update each of the graphs in sequence
function updateGraphs() {
  console.log('Updating graphs at', new Date().toLocaleTimeString());

  // Hour of Day graph
  getJson(baseUrl + HOUR_OF_DAY_ROUTE, function(response) {
    if(response) {
      let hourOfDay = response;
      const trace1 = {
        x: hourOfDay.x,
        y: hourOfDay.y,
        type: 'scatter',
        market : {
          opacity:0.7,
          color:'rgb(49,130,189)'
        }
      };
      const data = [trace1];
      const layout = {
        xaxis: {
          tickangle: -45
        }
      };
      Plotly.newPlot('linechart', data, layout, {showSendToCloud: true});
      // Day of Week graph
      getJson(baseUrl + DAY_OF_WEEK_ROUTE, function(response) {
        if(response) {
          let dayOfWeek = response;
          var trace1 = {
            x: dayOfWeek.x, 
            y: dayOfWeek.y,
            type: 'bar',
            name: 'Affluence Semaine',
            marker: {
              color: 'rgb(49,130,189)',
              opacity: 0.7
            }
          };
          var data = [trace1];
          var layout = {
            xaxis: {
              tickangle: -45
            }
          };
          Plotly.newPlot('barchart', data, layout, {showSendToCloud:true});

          // Zone by Time graph
          getJson(baseUrl + ZONE_BY_TIME_ROUTE, function(response) {
            if(response) {
              let zoneByTime = response;
              var data = [
                {
                  z:zoneByTime.z ,
                  x: zoneByTime.x,
                  y: zoneByTime.y,
                  type: 'heatmap'
                }
              ];
              var layout = {
                  xaxis: {
                    tickangle: -45
                  }
              }
              Plotly.newPlot('heatmap', data, layout, {showSendToCloud: true});
            }
          });
        }
      });
    }
  });
}


// GET the JSON response from the given URL
function getJson(url, callback) {
  let httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
      if(httpRequest.status === 200) {
        return callback(JSON.parse(httpRequest.responseText));
      }
      else {
        console.log('Error', httpRequest.status, 'on GET', url);
        return callback(null);
      }
    }
  };
  httpRequest.open('GET', url);
  httpRequest.setRequestHeader('Accept', 'application/json');
  httpRequest.send();
}


// The following code runs on startup...
getJson(baseUrl + CONFIG_ROUTE, function(response) {
  setInterval(() => {
    let mtn = new Date();
    let dateNode = document.getElementById('date');
    dateNode.innerText = `${mtn.getHours()}:${mtn.getMinutes()}:${mtn.getSeconds()}`;
  }, 1000)
  if(response) {
    config = response;
    initialiseBeaver(config.hlcServerUrl);
    updateGraphs();
    setInterval(updateGraphs, config.updateGraphsMilliseconds);
  }
  else {
    console.log('Unable to get config.  Refresh page to try again.');
  }
});
