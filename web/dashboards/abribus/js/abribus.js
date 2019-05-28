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


// DOM elements


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


// Handle environmental beacon data
function handleEnvironmentalBeacon(raddec) {
  // TODO: handle environmental beacon
}


// Handle left seat beacon data
function handleLeftSeatBeacon(raddec) {
  // TODO: handle left seat beacon
}


// Handle right seat beacon data
function handleRightSeatBeacon(raddec) {
  // TODO: handle right seat beacon
}


// Handle left seat beacon data
function handleDisplayBeacon(raddec) {
  // TODO: handle display beacon
}


// Update each of the graphs in sequence
function updateGraphs() {
  console.log('Updating graphs at', new Date().toLocaleTimeString());

  // Hour of Day graph
  getJson(baseUrl + HOUR_OF_DAY_ROUTE, function(response) {
    if(response) {
      let hourOfDay = response;
      // TODO: update hour of day graph

      // Day of Week graph
      getJson(baseUrl + DAY_OF_WEEK_ROUTE, function(response) {
        if(response) {
          let dayOfWeek = response;
          // TODO: update day of week graph

          // Zone by Time graph
          getJson(baseUrl + ZONE_BY_TIME_ROUTE, function(response) {
            if(response) {
              let zoneByTime = response;
              // TODO: update zone by time graph
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
