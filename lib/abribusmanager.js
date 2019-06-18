/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */


/**
 * AbribusManager Class
 * Manages the abribus demo.
 */
class AbribusManager {

  /**
   * AbribusManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {DatabaseManager} database The database manager.
   * @constructor
   */
  constructor(options, database) {
    options = options || {};

    this.esClient = options.esClient;
    this.database = database;
  }

  /**
   * Retrieve an Abribus query.
   * @param {String} type The type of query.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(type, callback) {
    switch(type) {
      case 'hourofday':
        queryHourOfDay(this.esClient, callback);
        break;
      case 'dayofweek':
        queryDayOfWeek(this.esClient, callback);
        break;
      case 'zonebytime':
        queryZoneByTime(this.esClient, callback);
        break;
      default:
        console.log('Unhandled abribus query:', type);
        return callback();
    }
  }

}


/**
 * Run the Hour of Day query in Elasticsearch.
 * @param {Elasticsearch} esClient The Elasticsearch client.
 * @param {function} callback The function to call on completion.
 */
function queryHourOfDay(esClient, callback) {
  //let data = {
  //    x: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'],
  //    y: [9, 10, 15, 50, 55, 42, 40, 65,55, 40, 43, 42, 57, 56, 60, 51, 48]
  //};
  let now = new Date();
  let startTimestamp = new Date(now.getFullYear(), now.getMonth(),
                                now.getDate(), 5, 0, 0).getTime();
  let endTimestamp = new Date(now.getFullYear(), now.getMonth(),
                                now.getDate(), 21, 0, 0).getTime();
  let body = {
      "size": 0,
      "aggs": {
        "date": {
          "date_histogram": {
            "field": "timestamp",
            "interval": "1h"
          },
          "aggs": {
            "count": {
              "cardinality": {
                "field": "transmitterId.keyword"
              }
            }
          }
        }     
      },
      "query": {
        "range": {
          "timestamp" : {
            "gte" : startTimestamp,
            "lt" :  endTimestamp
          }
        }
      }
  };

  let query = { index: 'raddec', body: body };
  esClient.search(query, function(err, result) {
    let data = { x: [], y: [] };
    if(err) {
     console.log('Abribus queryHourOfDay error:', err);
    }
    else {
      let buckets = result.body.aggregations.date.buckets;
      buckets.forEach(function(item) {
        let date = new Date(item.key);
        let hour = date.getHours() + ':00';
        let count = item.count.value;
        data.x.push(hour);
        data.y.push(count);
      });
    }
    return callback(data);
  });
}


/**
 * Run the Day of Week query in Elasticsearch.
 * @param {Elasticsearch} esClient The Elasticsearch client.
 * @param {function} callback The function to call on completion.
 */
function queryDayOfWeek(esClient, callback) {
  let data = {
      x: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      y: [20, 14, 25, 16, 18, 22, 69]
  };
  return callback(data);
}


/**
 * Run the Zone by Time query in Elasticsearch.
 * @param {Elasticsearch} esClient The Elasticsearch client.
 * @param {function} callback The function to call on completion.
 */
function queryZoneByTime(esClient, callback) {
  let data = {
      x: ['07:00', '08:00', '09:00', '10:00', '11:00'],
      y: ['Devant', 'Gauche','Centre', 'Droite', 'Derriere'],
      z: [ [1, 20, 30, 50, 1],
           [20, 1, 60, 80, 30],
           [30, 60, 1, -10, 20],
           [20, 12, 1, 1, 20],
           [26, 56, 10, 13, 20] ]
  };
  return callback(data);
}


module.exports = AbribusManager;
