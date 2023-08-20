var cors  = require("cors");
var express = require("express");
var app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

const UNSAFE_FRONT_END_URL = "*";

app.use(cors(
    {
        origin : UNSAFE_FRONT_END_URL,
        methods : ["GET", "POST"]
    }
));

const http = require("http");


const server = http.createServer(app);

var MAVSDKDrone = require("./mavsdkrpc.js");
var drone = new MAVSDKDrone();




app.get('/arm', function(req, res){

    console.log("I am here in arm");

    drone.Arm();

    res.sendStatus(200);
});

app.get('/disarm', function(req, res){

    console.log("I am here in disarm");

    drone.Disarm();

    res.sendStatus(200);
});

app.get('/takeoff/:altitude', function(req, res){
    
    const targetAltitude = parseFloat(req.params.altitude);
    console.log("I am here and ready to take off with "+targetAltitude);

    if (isNaN(targetAltitude)) {
        res.status(400).send('Invalid altitude value');
        return;
    }

    drone.Takeoff(targetAltitude);
    
    res.sendStatus(200);
});


app.get('/land', function(req, res){

    console.log("I am here in ready to Land ");

    drone.Land();
    
    res.sendStatus(200);
});

app.get('/gps', function(req, res){

    console.log("I am here in gps");
    res.send(drone.position);
});

server.listen(8001, function(){

    var host = server.address().address;
    var port = server.address().port;
console.log('example app listening on http://%s:%s', host, port);
});





