#!/usr/bin/node
// chatServer.js


module.exports = (function () {

    // PRIVATE Properties
var v = {
    ws0: require ('ws'),

    wsConnects: [],
    userSystem: 'System',
    users: {},
    port: 3456,

    msgHistory: [],
    isSecure: false,

        // used if secure connection
    fs: require ('fs'),
    https: require ('https'),
    privkeyFile: './sslcerts/privkey.pem',
    certFile: './sslcerts/cert.pem',

};  // end PRIVATE properties

    // PRIVATE Functions
f = {};


//---------------------
f.init = () => {

    if (process.argv.length === 3 && process.argv [2] === '--secure') {

        v.isSecure = true;
        console.log ('Secure websockets: assumes sslcerts directory exists in the "Server" directory and contains privkey.pem and cert.pem files');

    } // end if (process.argv.length === 3 && process.argv [2] === '--secure')
    
    v.users [v.userSystem] = 1;

    if (v.isSecure) {

        var privkey = v.fs.readFileSync (v.privkeyFile, 'utf8');
        var cert = v.fs.readFileSync (v.certFile, 'utf8');

        var credentials = {key: privkey, cert: cert};
        var httpsServer = v.https.createServer (credentials);
            // v.https = require ('https')
            // in v = {} section for private variables, above

        httpsServer.listen (v.port);

        var wss = new v.ws0.Server ({server: httpsServer});

    } else {

        var wss = new v.ws0.Server ({port: v.port});

    } // end if (v.isSecure)
    

    wss.on ('connection', f.initConnection);

};  // end f.init

//---------------------
f.initConnection = (ws, req) => {
    
    v.serverIp = ws.protocol;
    console.log ('Server ip: ' + v.serverIp);

    var wsConnect = {ws:ws, wsId: v.wsConnects.length, active: true};

    var wsId = wsConnect.wsId;

    v.wsConnects.push (wsConnect);

    ws.on('message', function (msg) {

        f.fromClient (wsId, JSON.parse (msg));
    });

    ws.on ('close', function () {
        wsConnect.active = false;

        f.broadcast (v.userSystem, 'User ' + wsConnect.user + ' left the conversation');
    });

    f.toClient (wsId, {getuser: 1});

}; // end f.initConnection 

//---------------------
f.broadcast = (userSrc, msg) => {
    
    var msgOut = {echomsg: msg, user: userSrc};

    v.msgHistory.push (msgOut);

    for (var wsId = 0; wsId < v.wsConnects.length; wsId++) {

        var wsConnect = v.wsConnects [wsId];

        if (wsConnect.active) {
    
            f.toClient (wsId, msgOut);

        } // end if (wsConnect.active)
        

    } // end for (var ix = 0; ix < v.wsConnects.length; ix++)

}; // end f.broadcast 

        
//---------------------
f.fromClient = (wsId, msgOb) => {
    console.log ('msg: ' + JSON.stringify (msgOb) + '\n');
    
    if (msgOb.hasOwnProperty ('user0')) {

        var wsConnect = v.wsConnects [wsId];
        var user = f.uniqUserName (msgOb.user0);
        wsConnect.user = user;

        f.broadcast (v.userSystem, 'User ' + user + ' joined the conversation');

        f.toClient (wsId, [{setuser: user}, v.msgHistory])
        

    } else if (msgOb.hasOwnProperty ('chatmsg')) {

        f.broadcast (v.wsConnects [wsId].user, msgOb.chatmsg);

    } // end if (msg.hasOwnProperty ('user0'))
    

}; // end f.fromClient 


//---------------------
f.toClient = (wsId, msg) => {
    
    var ws = v.wsConnects [wsId].ws;
    ws.send (JSON.stringify (msg));

}; // end f.toClient 

//---------------------
f.uniqUserName = (user0) => {
    
    var user;
    if (v.users.hasOwnProperty (user0)) {

        var suffix = v.users [user0];
        user = user0 + suffix;
        v.users [user0] = suffix + 1;

    } else {

        v.users [user0] = 1;
        user = user0;

    } // end if (v.users.hasOwnProperty (user0))

    return user;

}; // end f.uniqUserName 


f.init ();

}());




