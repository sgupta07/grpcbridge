const grpc = require('@grpc/grpc-js');
const protoloader = require('@grpc/proto-loader');

const MAVSDK_ACTION_PROTO_PATH = __dirname + '/../MAVSDK-Proto/protos/action/action.proto';
console.log(MAVSDK_ACTION_PROTO_PATH);
const ACTION_PACKAGE_DEFINATION = protoloader.loadSync(
    MAVSDK_ACTION_PROTO_PATH,
    {
        keepCase:true,
        longs:String,
        enums:String,
        defaults:true,
        oneofs:true
    }
);


const MAVSDK_TELEMETRY_PROTO_PATH = __dirname + '/../MAVSDK-Proto/protos/telemetry/telemetry.proto';
console.log(MAVSDK_TELEMETRY_PROTO_PATH);
const Telemetry_PACKAGE_DEFINATION = protoloader.loadSync(
    MAVSDK_TELEMETRY_PROTO_PATH,
    {
        keepCase:true,
        longs:String,
        enums:String,
        defaults:true,
        oneofs:true
    }
);

const GRPC_HOST_NAME = '127.0.0.1:50000';

class MAVSDKDrone {

    constructor(){
        this.Action = grpc.loadPackageDefinition(ACTION_PACKAGE_DEFINATION).mavsdk.rpc.action;
        this.ActionClient = new this.Action.ActionService(GRPC_HOST_NAME, grpc.credentials.createInsecure());

        this.Telemetry = grpc.loadPackageDefinition(Telemetry_PACKAGE_DEFINATION).mavsdk.rpc.telemetry;
        this.TelemetryClient = new this.Telemetry.TelemetryService(GRPC_HOST_NAME, grpc.credentials.createInsecure());

        this.position = {}; //Inititalize empty object

        this.SubscribeToGps();
    }
 
    Arm(){
        this.ActionClient.arm({}, function(err, actionResponse){
            if(err){
                console.log("Unable to arm drone: ", err);
                return;
            }
        });
    }

    Disarm(){
        this.ActionClient.disarm({}, function(err, actionResponse){
            if(err){
                console.log("Unable to Disarm drone: ", err);
                return;
            }
        });
    }

    /*Takeoff(){
        this.ActionClient.takeoff({}, function(err, actionResponse){
            if(err){
                console.log("Unable to Takeoff drone: ", err);
                return;
            }
        });
    }*/

    Takeoff(targetAltitude) {
        const takeoffRequest = {
            type: 1,  // MAV_CMD_NAV_TAKEOFF
            param1: 0, // Pitch angle (not used for vertical takeoff)
            param2: 0, // Pitch angle (not used for vertical takeoff)
            param3: 0, // Yaw angle (not used for vertical takeoff)
            param4: 0, // Empty (not used for vertical takeoff)
            param5: 0, // Empty (not used for vertical takeoff)
            param6: 0, // Empty (not used for vertical takeoff)
            param7: targetAltitude, // Target altitude for takeoff
        };

        const actionRequest = {
            type: 22,  // MAV_ACTION_COMMAND_INT
            action: takeoffRequest,
        };

        this.ActionClient.takeoff(actionRequest, (err, actionResponse) => {
            if (err) {
                console.log('Unable to takeoff drone:', err);
            } else {
                console.log('Takeoff response:', actionResponse);
            }
        });
    }

    Land(){
        this.ActionClient.land({}, function(err, actionResponse){
            if(err){
                console.log("Unable to Takeoff drone: ", err);
                return;
            }
        });
    }

    SubscribeToGps(){
        const self = this;

        this.GpsCall = this.TelemetryClient.subscribePosition({});

        this.GpsCall.on('data', function(gpsInfoResponse){
            console.log(gpsInfoResponse);
            self.position = gpsInfoResponse.position;
            return;
        });

        this.GpsCall.on('end', function(){
            console.log('Subscribeposition has been ended!');
            return;
        });

        this.GpsCall.on('error', function(e){
            console.log(e);
            return;
        });

        this.GpsCall.on('status', function(status){
            console.log(status);
            return;
        });





    }

}

module.exports = MAVSDKDrone;