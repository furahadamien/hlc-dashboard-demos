/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */

const express = require('express');
const path = require('path');


let router = express.Router();

router.route('/config')
  .get(function(req, res) {
    res.status(200).json({
        hlcServerUrl: "http://localhost:3001",
        environmentalBeaconId: "ac233fa08f5b",
        leftSeatBeaconId: "ac233fa09052",
        rightSeatBeaconId: "ac233fa0905c",
        displayBeaconId: "ac233fa0904f",
        updateGraphsMilliseconds: 60000
    });
  });

router.route('/hourofday')
  .get(function(req, res) {
    res.status(200).json({
        x: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'],
        y: [9, 10, 15, 50, 55, 42, 40, 65,55, 40, 43, 42, 57, 56, 60, 51, 48]
    });
  });

router.route('/dayofweek')
  .get(function(req, res) {
    res.status(200).json({
        x: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        y: [20, 14, 25, 16, 18, 22, 69]
    });
  });

router.route('/zonebytime')
  .get(function(req, res) {
    res.status(200).json({
        x: ['07:00', '08:00', '09:00', '10:00', '11:00'],
        y: ['Devant', 'Gauche','Centre', 'Droite', 'Derriere'],
        z: [
          [1, 20, 30, 50, 1],
          [20, 1, 60, 80, 30],
          [30, 60, 1, -10, 20],
          [20, 12, 1, 1, 20],
          [26, 56, 10, 13, 20]]
    });
  });


module.exports = router;
