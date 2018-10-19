// goChat.js

module.exports = (function () {

    // PRIVATE Properties
var v = {

    j2h: require ('go-j2h').displayOb,
    wsServer: null,
    port: 3456,

    idUserName: 'user',
    idUserDiv: 'userdiv',
    idUserForm: 'userform',
    idChatForm: 'chatform',
    idChatBox: 'chatbox',
    idChatMsg: 'chatmsg',

    IdUserName: null,
    IdUserDiv: null,
    IdUserForm: null,
    IdChatForm: null,
    IdChatBox: null,
    IdChatMsg: null,

    userBadgeIdx: 0,
    userBadges: ['badge-primary', 'badge-secondary', 'badge-success', 'badge-danger', 'badge-warning', 'badge-info', 'badge-dark'],

    userSystem: 'System',
    userAssigned: {},

};  // end PRIVATE properties

    // PRIVATE Functions
var f = {};


f.init = () => {

        // make jquery addressable selectors
    v.IdUserName = f.mkId (v.idUserName);
    v.IdUserDiv = f.mkId (v.idUserDiv);
    v.IdUserForm = f.mkId (v.idUserForm);
    v.IdChatForm = f.mkId (v.idChatForm);
    v.IdChatBox = f.mkId (v.idChatBox);
    v.IdChatMsg = f.mkId (v.idChatMsg);

    v.userAssigned.System = 'badge-light';

    var header = {
        div: {h3: 'Chat session with go-chat'}, 
        class: 'text-center',
    };

    var user = {
        div: {
            form: [
                {label: 'Username:'},
                {
                    input: 0, 
                    id: v.idUserName,
                    type: 'text', 
                    class: 'form-control', 
                    placeholder: 'Enter Username to get started',
                },
                {button: 'Submit', type: 'submit', class: 'btn btn-primary'},
            ],
            id: v.idUserForm,
            class: 'form-inline',
        }, 
        id: v.idUserDiv,
        class: 'd-flex justify-content-center',
    };

    v.j2h ([header, user]);

    $(v.IdUserForm)
    .submit (function (event) {
        event.preventDefault();
        v.user0 = $(v.IdUserName).val();
        v.user0 = v.user0.replace (/\s+/g, "-");
        var url = document.URL;

        var isHttps = false;
        var domain = 'localhost';

        var matched = url.match (/(https?):..([^\/]+)/);
            // e.g. https://mongoscout.com/go-chat

        if (matched) {

            isHttps = matched [1] === 'https';
            domain = matched [2];

        } // end if (matched)
        
        var prefix = isHttps ? 'wss' : 'ws';

        var urlWs = prefix + '://' + domain + ':' + v.port;
        v.wsServer = new WebSocket (urlWs);

        setTimeout (function () {

                // 100ms delay to check readyState, because when v.wsServer is initially assigned
                // in the statement above, readyState is 0. There is small delay (a few ms) before 
                // it changes to 1, if the server is available. 
            if (v.wsServer.readyState !== 1) {
    
                    // if not available after the 10ms delay, then output unavailable message
                v.j2h ([
                    {empty: v.IdUserDiv},
                    {text: 'Hello: ' + v.user0 + '. Connecting with chat server ...', parent: v.IdUserDiv}
                ]);
                
            } // end if (v.wsServer.readState !== 1)
    
        }, 100);

        v.wsServer.onmessage = function (event) {
            var msg = JSON.parse (event.data);
            f.fromSrvr (msg);
        };

    });
};  // end f.init

//---------------------
f.fromSrvr = (msg) => {
    
    if (Array.isArray (msg)) {

        for (var im = 0; im < msg.length; im++) {

            f.fromSrvr (msg [im]);

        } // end for (var im = 0; im < msg.length; im++)
        

    } else {

        if (msg.hasOwnProperty ('getuser')) {
    
            f.toSrvr ({user0: v.user0});
    
        } else if (msg.hasOwnProperty ('setuser')) {
    
            v.user = msg.setuser;
    
            v.j2h ([
                {empty: v.IdUserDiv},
                {text: 'Welcome ' + v.user, parent: v.IdUserDiv}
            ]);
    
            var chat = {
                div: [
                    {
                        div: [
                            {span: 'System:', class: 'badge badge-pill badge-light'},
                            {span: '&nbsp;'},
                            {span: 'Welcome to the chat session, ' + v.user},
                        ],
                        id: v.idChatBox,
                        style: 'margin-top:30px;border:1px solid black;border-radius: 5px;max-height: 400px;overflow: auto;',
                    },
        
                    {
                        form: [
                            {input: 0, id: v.idChatMsg, style: 'width: 100%;', type: 'text', autofocus: 'autofocus', placeholder: 'Enter Chat Message'},
                            {button: 'Send', type: 'submit', class: 'btn btn-success'}
                        ],
                        id: v.idChatForm,
                    }
                ],
                class: 'container',
            };
        
            v.j2h (chat);
    
            $(v.IdChatForm)
            .submit (function (event) {
                
                event.preventDefault ();
                f.toSrvr ({
                    chatmsg: $(v.IdChatMsg).val(),
                });
    
                $(v.IdChatMsg).val ('');
            });
    
        } else if (msg.hasOwnProperty ('echomsg')) {
    
            var echomsg = msg.echomsg;
            var user = msg.user;
            var badge = f.getBadge (user);
    
            if (user === v.userSystem) {
    
                var matched = echomsg.match (/User (\S+)(.*)/);
                if (matched) {
    
                    var userOther = matched [1];
                    var badgeOther = f.getBadge (userOther);
                    var msgSuffix = matched [2];
    
                    echomsg = [
                        {span: 'User'},
                        {span: '&nbsp;'},
                        {span: userOther, class: 'badge badge-pill ' + badgeOther},
                        {span: '&nbsp;'},
                        {span: msgSuffix}
                    ];
    
                } // end if (matched)
    
            } // end if (user === v.userSystem)
            
            
            var chatMsg = {div: [
                {span: user + ':', class: 'badge badge-pill ' + badge},
                {span: '&nbsp;'},
                {span: echomsg},
            ], parent: v.IdChatBox};
    
            v.j2h (chatMsg)

                // scroll to bottom so last messages are the ones visible
                // per https://stackoverflow.com/questions/3742346/use-jquery-to-scroll-to-the-bottom-of-a-div-with-lots-of-text/22232328#answer-22232328
            $(v.IdChatBox)
            .scrollTop (1E10);
    
        } // end if (msg.hasOwnProperty ('getuser'))

    } // end if (Array.isArray (msg))
    
    

}; // end f.fromSrvr 

//---------------------
f.getBadge = (user) => {

    var badge;
    if (v.userAssigned.hasOwnProperty (user)) {

        badge = v.userAssigned [user];

    } else {

        badge = v.userBadges [v.userBadgeIdx];
        v.userBadgeIdx = (v.userBadgeIdx + 1) % v.userBadges.length;
        v.userAssigned [user] = badge;

    } // end if (v.userAssigned.hasOwnProperty (msg.user))

    return badge;

}; // end f.getBadge 


//---------------------
f.mkId = (id) => {
    
    return '#' + id;

}; // end f.mkId 



//---------------------
f.toSrvr = (msg) => {
    
    v.wsServer.send (JSON.stringify (msg));

}; // end f.toSrvr 



    // PUBLIC Functions
var P = {};

    // end PUBLIC Functions

f.init ();

return P;

}());

