/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */


const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 3000;


let app = express();
let server = http.createServer(app);
let router = express.Router();

app.use(bodyParser.json());
app.use('/api', require('./routes/api'));
app.use('/', express.static(path.resolve(__dirname + '/../web')));

server.listen(PORT, function() {
  console.log('reelyActive hlc-dashboard-demos listening on port', PORT);
});
