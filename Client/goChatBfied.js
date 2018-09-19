(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
f = {};


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
        if (matched) {

            isHttps = matched [1] === 'https';
            domain = matched [2];

        } // end if (matched)
        
        var prefix = isHttps ? 'wss' : 'ws';

        var urlWs = prefix + '://' + domain + ':' + v.port;
        v.wsServer = new WebSocket (urlWs);

        setTimeout (function () {

                // 1000ms delay to check readyState, because when v.wsServer is initially assigned
                // in the statement above, readyState is 0. There is small delay (a few ms) before 
                // it changes to 1, if the server is available. So 1000ms is plenty of margin to wait
                // for readyState to change to 1 indicating chatServer.js is available
            if (v.wsServer.readyState !== 1) {
    
                    // if not available after the 10ms delay, then output unavailable message
                v.j2h ([
                    {empty: v.IdUserDiv},
                    {text: 'Hello: ' + v.user0 + '. Chat server not ready', parent: v.IdUserDiv}
                ]);
                
            } // end if (v.wsServer.readState !== 1)
    
        }, 1000);

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


},{"go-j2h":3}],2:[function(require,module,exports){

// index0.js


module.exports = (function () {

// PRIVATE Properties/Methods
var v = {
}; // end PRIVATE properties
var f={};

f.init = () => {
    
//    v.ws = new v.ws ('localhost', 28192, P.doAction, false);
        // ip, port, client, doEncryption

    require ('./goChat.js');

}; // end f.init

// PUBLIC Properties/Methods
var P = {};

// end PUBLIC section

(function () {

    $(document).ready (f.init);

}) ();



return P;

}) ();






},{"./goChat.js":1}],3:[function(require,module,exports){
// go-j2h/index.js

module.exports = (function () {

// PRIVATE Properties/Methods
var v = {

    id: 0,
    primitiveTypesNotNull: {'string':1, 'number':1, 'boolean':1, 'symbol': 1},
        // since typeof null yields 'object', it's handled separately

    msgTypes: {

        primary: {
                // void tags
            area: 0, base: 0, br: 0, col: 0, embed: 0, hr: 0, img: 0, input: 0, keygen: 0, link: 0, meta: 0, param: 0, source: 0, track: 0, wbr: 0, 

                // non-void tags
            a: 1, abbr: 1, address: 1, article: 1, aside: 1, audio: 1, b: 1, bdi: 1, bdo: 1, blockquote: 1, body: 1, button: 1, canvas: 1, caption: 1, cite: 1, code: 1, colgroup: 1, datalist: 1, dd: 1, del: 1, details: 1, dfn: 1, dialog: 1, div: 1, dl: 1, dt: 1, em: 1, fieldset: 1, figcaption: 1, figure: 1, footer: 1, form: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, head: 1, header: 1, hgroup: 1, html: 1, i: 1, iframe: 1, ins: 1, kbd: 1, label: 1, legend: 1, li: 1, map: 1, mark: 1, menu: 1, meter: 1, nav: 1, noscript: 1, object: 1, ol: 1, optgroup: 1, option: 1, output: 1, p: 1, pre: 1, progress: 1, q: 1, rp: 1, rt: 1, ruby: 1, s: 1, samp: 1, script: 1, section: 1, select: 1, small: 1, span: 1, strong: 1, style: 1, sub: 1, summary: 1, sup: 1, svg: 1, table: 1, tbody: 1, td: 1, textarea: 1, tfoot: 1, th: 1, thead: 1, time: 1, title: 1, tr: 1, u: 1, ul: 1, 'var': 1, video: 1,
        },

        secondary: {style: 1},
            // elements that can be either a primary tag itself or an attribute of another primary tag
            // if any other primary tags is present, then secondary tags are treated as
            // attributes of the other primary tag

        meta: {
            empty: 1, rm: 1, 
            prepend: 1, append: 1, before: 1, after: 1, parent: 1,
            attr: 1, content: 1, text: 1, 
        },

    },

    msg0: require ('go-msg'),
    msg: null,

}; // end PRIVATE properties
var f={};

//---------------------
f.init = () => {
    
    v.msg = new v.msg0 (v.msgTypes);

}; // end f.init


//---------------------
f.attr = (selector, attr) => {
    
    $(selector)
    .attr (attr);

}; // end f.attr 


//---------------------
f.empty = (selector) => {
    
    $(selector)
    .empty ()
    .off ('keydown');

}; // end f.empty 



//---------------------
f.rm = (selector) => {

    $(selector)
    .remove ();

}; // end f.rm


//---------------------
f.displayObH = (parent, dispOb) => {
    
        // ----  doArray ----
    var doArray = function (dispOb) {

        var Ids = [];
        for (var i = 0; i < dispOb.length; i++) {

            Ids.push (f.displayObH (parent, dispOb [i]));

        } // end for (var i = 0; i < dispOb.length; i++)

        //return Ids;
        return Ids [Ids.length - 1];
        
    };  // end doArray 

        // ----  doObject ----
    var doObject = function (dispOb) {

        var dispObParsed = v.msg.parseMsg (dispOb);

        var primaryKey = dispObParsed.p;

        var meta = dispObParsed.m;

        var delKey = null;
        var relLoc = 'append';

        var attr = null;
        var content = null;
        var text = null;

        if (meta.hasOwnProperty ('parent')) {
            // ensures processing of 'parent' before remainder of meta keys

            parent = meta.parent;
            delete meta.parent;

        } // end if (meta.hasOwnProperty ('parent'))
        
        var metaKeys = Object.keys (meta);
        for (var idx = 0; idx < metaKeys.length; idx++) {

            var key = metaKeys [idx];
            switch (key) {

                case 'empty':
                case 'rm':
                    delKey = key;
                    parent = meta [key];
                    break;

                case 'attr':
                    attr = meta.attr;
                    break;

                case 'content':
                    content = meta.content;
                    break;
                case 'text':
                    text = meta.text;
                    break;

                case 'prepend':
                case 'append':
                case 'before':
                case 'after':
                    relLoc = key;
                    var val = meta [key];
                    var doParent = val !== 1 && val !== true;
                    parent = doParent ? val : parent;
                        // if val is other than 1 or true, relLoc overrides both parent values passed 
                        // into displayObH and defined by optional parent attribute
                    break;

            } // end switch (key)
            

        } // end for (var idx = 0; idx < metaKeys.length; idx++)
        

        Id = null;

        if (delKey) {

            f [delKey] (parent);

        } else if (attr) {

            f.attr (parent, attr);

        } else if (content) {
            // replaces entire content of parent with new content

            $(parent)
            .empty ();

            f.displayObH (parent, content);
                // without emptying first, will simply append content to existing content

        } else if (text) {

            Id = f.textMake (parent, relLoc, text);

        } else {

            Id = f.elementMake (parent, relLoc, primaryKey, dispObParsed.c, dispObParsed.s);

        } // end if (delKey)

        return Id;
        
    };  // end doObject 



       // ---- main ----
    var Id;
    var dispObType = typeof dispOb;

    if (dispObType === 'undefined' || dispOb === 0 || dispOb === null) {

        Id = null;

    } else if (v.primitiveTypesNotNull.hasOwnProperty (dispObType)) {

        Id = f.textMake (parent, 'append', dispOb);
            // if text should be placed at other than 'append' location, then use
            // 'text' tag and specify prepend, after or before as needed

    } else if (Array.isArray (dispOb)) {

        Id = doArray (dispOb);

    } else if (dispObType == 'object') {

        Id = doObject (dispOb);

    } else {

        Id = null;

    } // end if (typeof dispOb === 'undefined' || dispOb === 0 || dispOb === null)
    
    return Id;

}; // end f.displayObH 

//---------------------
f.elementMake = (parentOrSiblId, relLoc, elName, content, attrs) => {
    
    var id;
    var attrKeys = Object.keys (attrs);
    var hasAttrs = attrKeys.length > 0;

    if (hasAttrs && attrs.hasOwnProperty ('id')) {

        id = attrs.id;

    } else {

        id = P.genId ();

    } // end if (hasAttrs)
    
    var Id = '#' + id;
    
    if (elName === 'script' && content !== 0) {
        // https://stackoverflow.com/questions/9413737/how-to-append-script-script-in-javascript
        // inspired by SO question, but setting innerHTML isn't supposed to work
        // therefore, set src attribute with path to file, instead of 
        // setting innerHTML to content of file

        // https://stackoverflow.com/questions/610995/cant-append-script-element
        // jQuery won't add script element as it does with any other element.  Therefore, must be done
        // using only javascript as follows:
        var script = document.createElement("script");

        script.src = content;
        script.id = attrs.id;
        
        document.head.appendChild(script);     

    } else {

        var divel = '<' + elName + ' id="' + id + '"';
    
        if (content) {
    
            divel += '></' + elName + '>';
    
        } else {
    
            divel += '>';
    
        } // end if (content)
    
        $(parentOrSiblId)[relLoc] (divel);

    } // end if (elName === 'script')
    
    
    if (hasAttrs) {
        
        $(Id)
        .attr (attrs);

    } // end if (hasAttrs)

    f.displayObH (Id, content);
    
    if (elName === 'form') {

        $(parent)
        .focus ();

    } // end if (elName === 'form')
    
    return Id;

}; // end f.elementMake


//---------------------
f.textMake = (parent, relLoc, primitive) => {
    
    if (typeof primitive === 'string') {
        
        var singlequote = '&#x0027;';
        var backslash = '&#x005c;';
        var doublequote = '&#x0022;';
        var lt = '&lt;';
        
        primitive = primitive.replace (/'/g, singlequote);
        primitive = primitive.replace (/"/g, doublequote);
        primitive = primitive.replace (/\\/g, backslash);
        primitive = primitive.replace (/</g, lt);

    } else if (typeof primitive === 'symbol') {

        primitive = 'symbol';
            // otherwise stringify would produce '{}' which is less useful

    } else {

        primitive = JSON.stringify (primitive);

    } // end if (typeof primitive === 'string')
    

    $(parent) [relLoc] (primitive);

    return null;
        // text obs have no id's: only text is appended with no way to address it
        // if addressing is necessary, use span instead of text

}; // end f.textMake 



// PUBLIC Properties/Methods
var P = {};

//---------------------
P.displayOb = (dispOb) => {
    
    var parent = 'body';
        // if parent not found, append to body

    if (typeof dispOb === 'object' && dispOb.hasOwnProperty ('parent')) {

        parent = dispOb.parent;

    } // end if (typeof dispOb === 'object' && dispOb.hasOwnProperty ('parent'))
    
    var Id = f.displayObH (parent, dispOb);

    return Id;

}; // end P.displayOb 

P.displayPage = P.displayOb;

//---------------------
P.genId = () => {

    var id = 'i' + v.id++;
    return id;

}; // end P.genId


//---------------------
P.genIds = () => {
    
    var id = P.genId ();
    var Id = '#' + id;

    return [id, Id];

}; // end P.genIds



// end PUBLIC section

f.init ();

return P;

}());




},{"go-msg":4}],4:[function(require,module,exports){
// go-msg/index.js
// go-msg object has a unique primary msg and zero or more optional attributes


module.exports = function (p0) {

    // PRIVATE Properties
var v = {

    primary: null,
        // primary: {cmd: 1} (contains optional content) or {cmd: 0} (no optional content allowed)

    secondary: null,
        // if a primary message has an optional attribute that concidentally is the same as
        // another primary message, it should be have a key/value pair in secondary {attr: 1}
        // to ensure that it will be treated as an attribute in case a primary is present
        // Secondary is only tested if there exists a primary key

    meta: null,
        // meta parameters intended for ctrl or other purpose outside of primary and secondary msg
        // parameter usage

};  // end PRIVATE properties

    // PRIVATE Functions
f = {};


f.init = () => {

    v.primary = p0.primary;
    v.secondary = p0.hasOwnProperty ('secondary') ? p0.secondary : {};
    v.meta = p0.hasOwnProperty ('meta') ? p0.meta : {};
};

    // PUBLIC Functions
var P = {};

//---------------------
P.parseMsg = (msgOb) => {
    
    var res = {};
    var msgKeys = Object.keys (msgOb);

    var primaryCandidatesOb = {};
    var attrsOb = {};
    var metaOb = {};

    var key;
    for (var i = 0; i < msgKeys.length; i++) {

        key = msgKeys [i];
        
        if (v.primary.hasOwnProperty (key)) {

            primaryCandidatesOb [key] = 1;

        } else if (v.meta.hasOwnProperty (key)) {

            metaOb [key] = msgOb [key];

        } else {

            attrsOb [key] = msgOb [key];

        } // end if (v.primary.hasOwnProperty (key))
        
    } // end for (var i = 0; i < msgKeys.length; i++)

    var primaryCandidatesA = Object.keys (primaryCandidatesOb);

    var primaryKey;
    var content;

    if (primaryCandidatesA.length === 0) {

        primaryKey = null;

    } else if (primaryCandidatesA.length === 1) {

        primaryKey = primaryCandidatesA [0];

    } else {
        // handle primary/secondary key resolution

        primaryKey = null;
        for (key in primaryCandidatesOb) {

            if (v.secondary.hasOwnProperty (key)) {

                attrsOb [key] = msgOb [key];

            } else {

                if (primaryKey === null) {

                    primaryKey = key;

                } else {

                    res.err = 'Multiple primary keys found not in secondary object: ' + JSON.stringify (msg);

                } // end if (primaryKey === null)
                

            } // end if (v.secondary.hasOwnProperty (key))
            
        }

    } // end if (primaryCandidatesA.length === 0)


    if (!res.hasOwnProperty ('err')) {

        res.p = primaryKey;
        res.c = primaryKey && v.primary [primaryKey] !== 0 ? msgOb [primaryKey] : null;
            // example void html tag has zero content, so content is forced to null

        res.s = attrsOb;
        res.m = metaOb;

    } // end if (!res.hasOwnProperty ('err'))
    
    
    return res;

}; // end P.parseMsg 



    // end PUBLIC Functions

f.init ();

return P;

};




},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlc19nbG9iYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnb0NoYXQuanMiLCJpbmRleDAuanMiLCIuLi8uLi9nby1qMmgvaW5kZXguanMiLCIuLi8uLi9nby1tc2cvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBnb0NoYXQuanNcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gUFJJVkFURSBQcm9wZXJ0aWVzXG52YXIgdiA9IHtcblxuICAgIGoyaDogcmVxdWlyZSAoJ2dvLWoyaCcpLmRpc3BsYXlPYixcbiAgICB3c1NlcnZlcjogbnVsbCxcbiAgICBwb3J0OiAzNDU2LFxuXG4gICAgaWRVc2VyTmFtZTogJ3VzZXInLFxuICAgIGlkVXNlckRpdjogJ3VzZXJkaXYnLFxuICAgIGlkVXNlckZvcm06ICd1c2VyZm9ybScsXG4gICAgaWRDaGF0Rm9ybTogJ2NoYXRmb3JtJyxcbiAgICBpZENoYXRCb3g6ICdjaGF0Ym94JyxcbiAgICBpZENoYXRNc2c6ICdjaGF0bXNnJyxcblxuICAgIElkVXNlck5hbWU6IG51bGwsXG4gICAgSWRVc2VyRGl2OiBudWxsLFxuICAgIElkVXNlckZvcm06IG51bGwsXG4gICAgSWRDaGF0Rm9ybTogbnVsbCxcbiAgICBJZENoYXRCb3g6IG51bGwsXG4gICAgSWRDaGF0TXNnOiBudWxsLFxuXG4gICAgdXNlckJhZGdlSWR4OiAwLFxuICAgIHVzZXJCYWRnZXM6IFsnYmFkZ2UtcHJpbWFyeScsICdiYWRnZS1zZWNvbmRhcnknLCAnYmFkZ2Utc3VjY2VzcycsICdiYWRnZS1kYW5nZXInLCAnYmFkZ2Utd2FybmluZycsICdiYWRnZS1pbmZvJywgJ2JhZGdlLWRhcmsnXSxcblxuICAgIHVzZXJTeXN0ZW06ICdTeXN0ZW0nLFxuICAgIHVzZXJBc3NpZ25lZDoge30sXG5cbn07ICAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG5cbiAgICAvLyBQUklWQVRFIEZ1bmN0aW9uc1xuZiA9IHt9O1xuXG5cbmYuaW5pdCA9ICgpID0+IHtcblxuICAgICAgICAvLyBtYWtlIGpxdWVyeSBhZGRyZXNzYWJsZSBzZWxlY3RvcnNcbiAgICB2LklkVXNlck5hbWUgPSBmLm1rSWQgKHYuaWRVc2VyTmFtZSk7XG4gICAgdi5JZFVzZXJEaXYgPSBmLm1rSWQgKHYuaWRVc2VyRGl2KTtcbiAgICB2LklkVXNlckZvcm0gPSBmLm1rSWQgKHYuaWRVc2VyRm9ybSk7XG4gICAgdi5JZENoYXRGb3JtID0gZi5ta0lkICh2LmlkQ2hhdEZvcm0pO1xuICAgIHYuSWRDaGF0Qm94ID0gZi5ta0lkICh2LmlkQ2hhdEJveCk7XG4gICAgdi5JZENoYXRNc2cgPSBmLm1rSWQgKHYuaWRDaGF0TXNnKTtcblxuICAgIHYudXNlckFzc2lnbmVkLlN5c3RlbSA9ICdiYWRnZS1saWdodCc7XG5cbiAgICB2YXIgaGVhZGVyID0ge1xuICAgICAgICBkaXY6IHtoMzogJ0NoYXQgc2Vzc2lvbiB3aXRoIGdvLWNoYXQnfSwgXG4gICAgICAgIGNsYXNzOiAndGV4dC1jZW50ZXInLFxuICAgIH07XG5cbiAgICB2YXIgdXNlciA9IHtcbiAgICAgICAgZGl2OiB7XG4gICAgICAgICAgICBmb3JtOiBbXG4gICAgICAgICAgICAgICAge2xhYmVsOiAnVXNlcm5hbWU6J30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dDogMCwgXG4gICAgICAgICAgICAgICAgICAgIGlkOiB2LmlkVXNlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JywgXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnZm9ybS1jb250cm9sJywgXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnRW50ZXIgVXNlcm5hbWUgdG8gZ2V0IHN0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge2J1dHRvbjogJ1N1Ym1pdCcsIHR5cGU6ICdzdWJtaXQnLCBjbGFzczogJ2J0biBidG4tcHJpbWFyeSd9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGlkOiB2LmlkVXNlckZvcm0sXG4gICAgICAgICAgICBjbGFzczogJ2Zvcm0taW5saW5lJyxcbiAgICAgICAgfSwgXG4gICAgICAgIGlkOiB2LmlkVXNlckRpdixcbiAgICAgICAgY2xhc3M6ICdkLWZsZXgganVzdGlmeS1jb250ZW50LWNlbnRlcicsXG4gICAgfTtcblxuICAgIHYuajJoIChbaGVhZGVyLCB1c2VyXSk7XG5cbiAgICAkKHYuSWRVc2VyRm9ybSlcbiAgICAuc3VibWl0IChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdi51c2VyMCA9ICQodi5JZFVzZXJOYW1lKS52YWwoKTtcbiAgICAgICAgdi51c2VyMCA9IHYudXNlcjAucmVwbGFjZSAoL1xccysvZywgXCItXCIpO1xuICAgICAgICB2YXIgdXJsID0gZG9jdW1lbnQuVVJMO1xuXG4gICAgICAgIHZhciBpc0h0dHBzID0gZmFsc2U7XG4gICAgICAgIHZhciBkb21haW4gPSAnbG9jYWxob3N0JztcblxuICAgICAgICB2YXIgbWF0Y2hlZCA9IHVybC5tYXRjaCAoLyhodHRwcz8pOi4uKFteXFwvXSspLyk7XG4gICAgICAgIGlmIChtYXRjaGVkKSB7XG5cbiAgICAgICAgICAgIGlzSHR0cHMgPSBtYXRjaGVkIFsxXSA9PT0gJ2h0dHBzJztcbiAgICAgICAgICAgIGRvbWFpbiA9IG1hdGNoZWQgWzJdO1xuXG4gICAgICAgIH0gLy8gZW5kIGlmIChtYXRjaGVkKVxuICAgICAgICBcbiAgICAgICAgdmFyIHByZWZpeCA9IGlzSHR0cHMgPyAnd3NzJyA6ICd3cyc7XG5cbiAgICAgICAgdmFyIHVybFdzID0gcHJlZml4ICsgJzovLycgKyBkb21haW4gKyAnOicgKyB2LnBvcnQ7XG4gICAgICAgIHYud3NTZXJ2ZXIgPSBuZXcgV2ViU29ja2V0ICh1cmxXcyk7XG5cbiAgICAgICAgc2V0VGltZW91dCAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgLy8gMTAwMG1zIGRlbGF5IHRvIGNoZWNrIHJlYWR5U3RhdGUsIGJlY2F1c2Ugd2hlbiB2LndzU2VydmVyIGlzIGluaXRpYWxseSBhc3NpZ25lZFxuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBzdGF0ZW1lbnQgYWJvdmUsIHJlYWR5U3RhdGUgaXMgMC4gVGhlcmUgaXMgc21hbGwgZGVsYXkgKGEgZmV3IG1zKSBiZWZvcmUgXG4gICAgICAgICAgICAgICAgLy8gaXQgY2hhbmdlcyB0byAxLCBpZiB0aGUgc2VydmVyIGlzIGF2YWlsYWJsZS4gU28gMTAwMG1zIGlzIHBsZW50eSBvZiBtYXJnaW4gdG8gd2FpdFxuICAgICAgICAgICAgICAgIC8vIGZvciByZWFkeVN0YXRlIHRvIGNoYW5nZSB0byAxIGluZGljYXRpbmcgY2hhdFNlcnZlci5qcyBpcyBhdmFpbGFibGVcbiAgICAgICAgICAgIGlmICh2LndzU2VydmVyLnJlYWR5U3RhdGUgIT09IDEpIHtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm90IGF2YWlsYWJsZSBhZnRlciB0aGUgMTBtcyBkZWxheSwgdGhlbiBvdXRwdXQgdW5hdmFpbGFibGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgIHYuajJoIChbXG4gICAgICAgICAgICAgICAgICAgIHtlbXB0eTogdi5JZFVzZXJEaXZ9LFxuICAgICAgICAgICAgICAgICAgICB7dGV4dDogJ0hlbGxvOiAnICsgdi51c2VyMCArICcuIENoYXQgc2VydmVyIG5vdCByZWFkeScsIHBhcmVudDogdi5JZFVzZXJEaXZ9XG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IC8vIGVuZCBpZiAodi53c1NlcnZlci5yZWFkU3RhdGUgIT09IDEpXG4gICAgXG4gICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIHYud3NTZXJ2ZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgbXNnID0gSlNPTi5wYXJzZSAoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICBmLmZyb21TcnZyIChtc2cpO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG59OyAgLy8gZW5kIGYuaW5pdFxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5mcm9tU3J2ciA9IChtc2cpID0+IHtcbiAgICBcbiAgICBpZiAoQXJyYXkuaXNBcnJheSAobXNnKSkge1xuXG4gICAgICAgIGZvciAodmFyIGltID0gMDsgaW0gPCBtc2cubGVuZ3RoOyBpbSsrKSB7XG5cbiAgICAgICAgICAgIGYuZnJvbVNydnIgKG1zZyBbaW1dKTtcblxuICAgICAgICB9IC8vIGVuZCBmb3IgKHZhciBpbSA9IDA7IGltIDwgbXNnLmxlbmd0aDsgaW0rKylcbiAgICAgICAgXG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlmIChtc2cuaGFzT3duUHJvcGVydHkgKCdnZXR1c2VyJykpIHtcbiAgICBcbiAgICAgICAgICAgIGYudG9TcnZyICh7dXNlcjA6IHYudXNlcjB9KTtcbiAgICBcbiAgICAgICAgfSBlbHNlIGlmIChtc2cuaGFzT3duUHJvcGVydHkgKCdzZXR1c2VyJykpIHtcbiAgICBcbiAgICAgICAgICAgIHYudXNlciA9IG1zZy5zZXR1c2VyO1xuICAgIFxuICAgICAgICAgICAgdi5qMmggKFtcbiAgICAgICAgICAgICAgICB7ZW1wdHk6IHYuSWRVc2VyRGl2fSxcbiAgICAgICAgICAgICAgICB7dGV4dDogJ1dlbGNvbWUgJyArIHYudXNlciwgcGFyZW50OiB2LklkVXNlckRpdn1cbiAgICAgICAgICAgIF0pO1xuICAgIFxuICAgICAgICAgICAgdmFyIGNoYXQgPSB7XG4gICAgICAgICAgICAgICAgZGl2OiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpdjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiAnU3lzdGVtOicsIGNsYXNzOiAnYmFkZ2UgYmFkZ2UtcGlsbCBiYWRnZS1saWdodCd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiAnJm5ic3A7J30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46ICdXZWxjb21lIHRvIHRoZSBjaGF0IHNlc3Npb24sICcgKyB2LnVzZXJ9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB2LmlkQ2hhdEJveCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnbWFyZ2luLXRvcDozMHB4O2JvcmRlcjoxcHggc29saWQgYmxhY2s7Ym9yZGVyLXJhZGl1czogNXB4O21heC1oZWlnaHQ6IDQwMHB4O292ZXJmbG93OiBhdXRvOycsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2lucHV0OiAwLCBpZDogdi5pZENoYXRNc2csIHN0eWxlOiAnd2lkdGg6IDEwMCU7JywgdHlwZTogJ3RleHQnLCBhdXRvZm9jdXM6ICdhdXRvZm9jdXMnLCBwbGFjZWhvbGRlcjogJ0VudGVyIENoYXQgTWVzc2FnZSd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtidXR0b246ICdTZW5kJywgdHlwZTogJ3N1Ym1pdCcsIGNsYXNzOiAnYnRuIGJ0bi1zdWNjZXNzJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdi5pZENoYXRGb3JtLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBjbGFzczogJ2NvbnRhaW5lcicsXG4gICAgICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgICAgIHYuajJoIChjaGF0KTtcbiAgICBcbiAgICAgICAgICAgICQodi5JZENoYXRGb3JtKVxuICAgICAgICAgICAgLnN1Ym1pdCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQgKCk7XG4gICAgICAgICAgICAgICAgZi50b1NydnIgKHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdG1zZzogJCh2LklkQ2hhdE1zZykudmFsKCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICAgICAgJCh2LklkQ2hhdE1zZykudmFsICgnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgfSBlbHNlIGlmIChtc2cuaGFzT3duUHJvcGVydHkgKCdlY2hvbXNnJykpIHtcbiAgICBcbiAgICAgICAgICAgIHZhciBlY2hvbXNnID0gbXNnLmVjaG9tc2c7XG4gICAgICAgICAgICB2YXIgdXNlciA9IG1zZy51c2VyO1xuICAgICAgICAgICAgdmFyIGJhZGdlID0gZi5nZXRCYWRnZSAodXNlcik7XG4gICAgXG4gICAgICAgICAgICBpZiAodXNlciA9PT0gdi51c2VyU3lzdGVtKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoZWQgPSBlY2hvbXNnLm1hdGNoICgvVXNlciAoXFxTKykoLiopLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZWQpIHtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVzZXJPdGhlciA9IG1hdGNoZWQgWzFdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFkZ2VPdGhlciA9IGYuZ2V0QmFkZ2UgKHVzZXJPdGhlcik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2dTdWZmaXggPSBtYXRjaGVkIFsyXTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgZWNob21zZyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiAnVXNlcid9LFxuICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46ICcmbmJzcDsnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiB1c2VyT3RoZXIsIGNsYXNzOiAnYmFkZ2UgYmFkZ2UtcGlsbCAnICsgYmFkZ2VPdGhlcn0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogJyZuYnNwOyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46IG1zZ1N1ZmZpeH1cbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICBcbiAgICAgICAgICAgICAgICB9IC8vIGVuZCBpZiAobWF0Y2hlZClcbiAgICBcbiAgICAgICAgICAgIH0gLy8gZW5kIGlmICh1c2VyID09PSB2LnVzZXJTeXN0ZW0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNoYXRNc2cgPSB7ZGl2OiBbXG4gICAgICAgICAgICAgICAge3NwYW46IHVzZXIgKyAnOicsIGNsYXNzOiAnYmFkZ2UgYmFkZ2UtcGlsbCAnICsgYmFkZ2V9LFxuICAgICAgICAgICAgICAgIHtzcGFuOiAnJm5ic3A7J30sXG4gICAgICAgICAgICAgICAge3NwYW46IGVjaG9tc2d9LFxuICAgICAgICAgICAgXSwgcGFyZW50OiB2LklkQ2hhdEJveH07XG4gICAgXG4gICAgICAgICAgICB2LmoyaCAoY2hhdE1zZylcblxuICAgICAgICAgICAgICAgIC8vIHNjcm9sbCB0byBib3R0b20gc28gbGFzdCBtZXNzYWdlcyBhcmUgdGhlIG9uZXMgdmlzaWJsZVxuICAgICAgICAgICAgICAgIC8vIHBlciBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNzQyMzQ2L3VzZS1qcXVlcnktdG8tc2Nyb2xsLXRvLXRoZS1ib3R0b20tb2YtYS1kaXYtd2l0aC1sb3RzLW9mLXRleHQvMjIyMzIzMjgjYW5zd2VyLTIyMjMyMzI4XG4gICAgICAgICAgICAkKHYuSWRDaGF0Qm94KVxuICAgICAgICAgICAgLnNjcm9sbFRvcCAoMUUxMCk7XG4gICAgXG4gICAgICAgIH0gLy8gZW5kIGlmIChtc2cuaGFzT3duUHJvcGVydHkgKCdnZXR1c2VyJykpXG5cbiAgICB9IC8vIGVuZCBpZiAoQXJyYXkuaXNBcnJheSAobXNnKSlcbiAgICBcbiAgICBcblxufTsgLy8gZW5kIGYuZnJvbVNydnIgXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmdldEJhZGdlID0gKHVzZXIpID0+IHtcblxuICAgIHZhciBiYWRnZTtcbiAgICBpZiAodi51c2VyQXNzaWduZWQuaGFzT3duUHJvcGVydHkgKHVzZXIpKSB7XG5cbiAgICAgICAgYmFkZ2UgPSB2LnVzZXJBc3NpZ25lZCBbdXNlcl07XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIGJhZGdlID0gdi51c2VyQmFkZ2VzIFt2LnVzZXJCYWRnZUlkeF07XG4gICAgICAgIHYudXNlckJhZGdlSWR4ID0gKHYudXNlckJhZGdlSWR4ICsgMSkgJSB2LnVzZXJCYWRnZXMubGVuZ3RoO1xuICAgICAgICB2LnVzZXJBc3NpZ25lZCBbdXNlcl0gPSBiYWRnZTtcblxuICAgIH0gLy8gZW5kIGlmICh2LnVzZXJBc3NpZ25lZC5oYXNPd25Qcm9wZXJ0eSAobXNnLnVzZXIpKVxuXG4gICAgcmV0dXJuIGJhZGdlO1xuXG59OyAvLyBlbmQgZi5nZXRCYWRnZSBcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5ta0lkID0gKGlkKSA9PiB7XG4gICAgXG4gICAgcmV0dXJuICcjJyArIGlkO1xuXG59OyAvLyBlbmQgZi5ta0lkIFxuXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYudG9TcnZyID0gKG1zZykgPT4ge1xuICAgIFxuICAgIHYud3NTZXJ2ZXIuc2VuZCAoSlNPTi5zdHJpbmdpZnkgKG1zZykpO1xuXG59OyAvLyBlbmQgZi50b1NydnIgXG5cblxuXG4gICAgLy8gUFVCTElDIEZ1bmN0aW9uc1xudmFyIFAgPSB7fTtcblxuICAgIC8vIGVuZCBQVUJMSUMgRnVuY3Rpb25zXG5cbmYuaW5pdCAoKTtcblxucmV0dXJuIFA7XG5cbn0oKSk7XG5cbiIsIlxuLy8gaW5kZXgwLmpzXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXG4vLyBQUklWQVRFIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIHYgPSB7XG59OyAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG52YXIgZj17fTtcblxuZi5pbml0ID0gKCkgPT4ge1xuICAgIFxuLy8gICAgdi53cyA9IG5ldyB2LndzICgnbG9jYWxob3N0JywgMjgxOTIsIFAuZG9BY3Rpb24sIGZhbHNlKTtcbiAgICAgICAgLy8gaXAsIHBvcnQsIGNsaWVudCwgZG9FbmNyeXB0aW9uXG5cbiAgICByZXF1aXJlICgnLi9nb0NoYXQuanMnKTtcblxufTsgLy8gZW5kIGYuaW5pdFxuXG4vLyBQVUJMSUMgUHJvcGVydGllcy9NZXRob2RzXG52YXIgUCA9IHt9O1xuXG4vLyBlbmQgUFVCTElDIHNlY3Rpb25cblxuKGZ1bmN0aW9uICgpIHtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5IChmLmluaXQpO1xuXG59KSAoKTtcblxuXG5cbnJldHVybiBQO1xuXG59KSAoKTtcblxuXG5cblxuXG4iLCIvLyBnby1qMmgvaW5kZXguanNcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuXG4vLyBQUklWQVRFIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIHYgPSB7XG5cbiAgICBpZDogMCxcbiAgICBwcmltaXRpdmVUeXBlc05vdE51bGw6IHsnc3RyaW5nJzoxLCAnbnVtYmVyJzoxLCAnYm9vbGVhbic6MSwgJ3N5bWJvbCc6IDF9LFxuICAgICAgICAvLyBzaW5jZSB0eXBlb2YgbnVsbCB5aWVsZHMgJ29iamVjdCcsIGl0J3MgaGFuZGxlZCBzZXBhcmF0ZWx5XG5cbiAgICBtc2dUeXBlczoge1xuXG4gICAgICAgIHByaW1hcnk6IHtcbiAgICAgICAgICAgICAgICAvLyB2b2lkIHRhZ3NcbiAgICAgICAgICAgIGFyZWE6IDAsIGJhc2U6IDAsIGJyOiAwLCBjb2w6IDAsIGVtYmVkOiAwLCBocjogMCwgaW1nOiAwLCBpbnB1dDogMCwga2V5Z2VuOiAwLCBsaW5rOiAwLCBtZXRhOiAwLCBwYXJhbTogMCwgc291cmNlOiAwLCB0cmFjazogMCwgd2JyOiAwLCBcblxuICAgICAgICAgICAgICAgIC8vIG5vbi12b2lkIHRhZ3NcbiAgICAgICAgICAgIGE6IDEsIGFiYnI6IDEsIGFkZHJlc3M6IDEsIGFydGljbGU6IDEsIGFzaWRlOiAxLCBhdWRpbzogMSwgYjogMSwgYmRpOiAxLCBiZG86IDEsIGJsb2NrcXVvdGU6IDEsIGJvZHk6IDEsIGJ1dHRvbjogMSwgY2FudmFzOiAxLCBjYXB0aW9uOiAxLCBjaXRlOiAxLCBjb2RlOiAxLCBjb2xncm91cDogMSwgZGF0YWxpc3Q6IDEsIGRkOiAxLCBkZWw6IDEsIGRldGFpbHM6IDEsIGRmbjogMSwgZGlhbG9nOiAxLCBkaXY6IDEsIGRsOiAxLCBkdDogMSwgZW06IDEsIGZpZWxkc2V0OiAxLCBmaWdjYXB0aW9uOiAxLCBmaWd1cmU6IDEsIGZvb3RlcjogMSwgZm9ybTogMSwgaDE6IDEsIGgyOiAxLCBoMzogMSwgaDQ6IDEsIGg1OiAxLCBoNjogMSwgaGVhZDogMSwgaGVhZGVyOiAxLCBoZ3JvdXA6IDEsIGh0bWw6IDEsIGk6IDEsIGlmcmFtZTogMSwgaW5zOiAxLCBrYmQ6IDEsIGxhYmVsOiAxLCBsZWdlbmQ6IDEsIGxpOiAxLCBtYXA6IDEsIG1hcms6IDEsIG1lbnU6IDEsIG1ldGVyOiAxLCBuYXY6IDEsIG5vc2NyaXB0OiAxLCBvYmplY3Q6IDEsIG9sOiAxLCBvcHRncm91cDogMSwgb3B0aW9uOiAxLCBvdXRwdXQ6IDEsIHA6IDEsIHByZTogMSwgcHJvZ3Jlc3M6IDEsIHE6IDEsIHJwOiAxLCBydDogMSwgcnVieTogMSwgczogMSwgc2FtcDogMSwgc2NyaXB0OiAxLCBzZWN0aW9uOiAxLCBzZWxlY3Q6IDEsIHNtYWxsOiAxLCBzcGFuOiAxLCBzdHJvbmc6IDEsIHN0eWxlOiAxLCBzdWI6IDEsIHN1bW1hcnk6IDEsIHN1cDogMSwgc3ZnOiAxLCB0YWJsZTogMSwgdGJvZHk6IDEsIHRkOiAxLCB0ZXh0YXJlYTogMSwgdGZvb3Q6IDEsIHRoOiAxLCB0aGVhZDogMSwgdGltZTogMSwgdGl0bGU6IDEsIHRyOiAxLCB1OiAxLCB1bDogMSwgJ3Zhcic6IDEsIHZpZGVvOiAxLFxuICAgICAgICB9LFxuXG4gICAgICAgIHNlY29uZGFyeToge3N0eWxlOiAxfSxcbiAgICAgICAgICAgIC8vIGVsZW1lbnRzIHRoYXQgY2FuIGJlIGVpdGhlciBhIHByaW1hcnkgdGFnIGl0c2VsZiBvciBhbiBhdHRyaWJ1dGUgb2YgYW5vdGhlciBwcmltYXJ5IHRhZ1xuICAgICAgICAgICAgLy8gaWYgYW55IG90aGVyIHByaW1hcnkgdGFncyBpcyBwcmVzZW50LCB0aGVuIHNlY29uZGFyeSB0YWdzIGFyZSB0cmVhdGVkIGFzXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGVzIG9mIHRoZSBvdGhlciBwcmltYXJ5IHRhZ1xuXG4gICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAgIGVtcHR5OiAxLCBybTogMSwgXG4gICAgICAgICAgICBwcmVwZW5kOiAxLCBhcHBlbmQ6IDEsIGJlZm9yZTogMSwgYWZ0ZXI6IDEsIHBhcmVudDogMSxcbiAgICAgICAgICAgIGF0dHI6IDEsIGNvbnRlbnQ6IDEsIHRleHQ6IDEsIFxuICAgICAgICB9LFxuXG4gICAgfSxcblxuICAgIG1zZzA6IHJlcXVpcmUgKCdnby1tc2cnKSxcbiAgICBtc2c6IG51bGwsXG5cbn07IC8vIGVuZCBQUklWQVRFIHByb3BlcnRpZXNcbnZhciBmPXt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5pbml0ID0gKCkgPT4ge1xuICAgIFxuICAgIHYubXNnID0gbmV3IHYubXNnMCAodi5tc2dUeXBlcyk7XG5cbn07IC8vIGVuZCBmLmluaXRcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5hdHRyID0gKHNlbGVjdG9yLCBhdHRyKSA9PiB7XG4gICAgXG4gICAgJChzZWxlY3RvcilcbiAgICAuYXR0ciAoYXR0cik7XG5cbn07IC8vIGVuZCBmLmF0dHIgXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYuZW1wdHkgPSAoc2VsZWN0b3IpID0+IHtcbiAgICBcbiAgICAkKHNlbGVjdG9yKVxuICAgIC5lbXB0eSAoKVxuICAgIC5vZmYgKCdrZXlkb3duJyk7XG5cbn07IC8vIGVuZCBmLmVtcHR5IFxuXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYucm0gPSAoc2VsZWN0b3IpID0+IHtcblxuICAgICQoc2VsZWN0b3IpXG4gICAgLnJlbW92ZSAoKTtcblxufTsgLy8gZW5kIGYucm1cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5kaXNwbGF5T2JIID0gKHBhcmVudCwgZGlzcE9iKSA9PiB7XG4gICAgXG4gICAgICAgIC8vIC0tLS0gIGRvQXJyYXkgLS0tLVxuICAgIHZhciBkb0FycmF5ID0gZnVuY3Rpb24gKGRpc3BPYikge1xuXG4gICAgICAgIHZhciBJZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXNwT2IubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgSWRzLnB1c2ggKGYuZGlzcGxheU9iSCAocGFyZW50LCBkaXNwT2IgW2ldKSk7XG5cbiAgICAgICAgfSAvLyBlbmQgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXNwT2IubGVuZ3RoOyBpKyspXG5cbiAgICAgICAgLy9yZXR1cm4gSWRzO1xuICAgICAgICByZXR1cm4gSWRzIFtJZHMubGVuZ3RoIC0gMV07XG4gICAgICAgIFxuICAgIH07ICAvLyBlbmQgZG9BcnJheSBcblxuICAgICAgICAvLyAtLS0tICBkb09iamVjdCAtLS0tXG4gICAgdmFyIGRvT2JqZWN0ID0gZnVuY3Rpb24gKGRpc3BPYikge1xuXG4gICAgICAgIHZhciBkaXNwT2JQYXJzZWQgPSB2Lm1zZy5wYXJzZU1zZyAoZGlzcE9iKTtcblxuICAgICAgICB2YXIgcHJpbWFyeUtleSA9IGRpc3BPYlBhcnNlZC5wO1xuXG4gICAgICAgIHZhciBtZXRhID0gZGlzcE9iUGFyc2VkLm07XG5cbiAgICAgICAgdmFyIGRlbEtleSA9IG51bGw7XG4gICAgICAgIHZhciByZWxMb2MgPSAnYXBwZW5kJztcblxuICAgICAgICB2YXIgYXR0ciA9IG51bGw7XG4gICAgICAgIHZhciBjb250ZW50ID0gbnVsbDtcbiAgICAgICAgdmFyIHRleHQgPSBudWxsO1xuXG4gICAgICAgIGlmIChtZXRhLmhhc093blByb3BlcnR5ICgncGFyZW50JykpIHtcbiAgICAgICAgICAgIC8vIGVuc3VyZXMgcHJvY2Vzc2luZyBvZiAncGFyZW50JyBiZWZvcmUgcmVtYWluZGVyIG9mIG1ldGEga2V5c1xuXG4gICAgICAgICAgICBwYXJlbnQgPSBtZXRhLnBhcmVudDtcbiAgICAgICAgICAgIGRlbGV0ZSBtZXRhLnBhcmVudDtcblxuICAgICAgICB9IC8vIGVuZCBpZiAobWV0YS5oYXNPd25Qcm9wZXJ0eSAoJ3BhcmVudCcpKVxuICAgICAgICBcbiAgICAgICAgdmFyIG1ldGFLZXlzID0gT2JqZWN0LmtleXMgKG1ldGEpO1xuICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBtZXRhS2V5cy5sZW5ndGg7IGlkeCsrKSB7XG5cbiAgICAgICAgICAgIHZhciBrZXkgPSBtZXRhS2V5cyBbaWR4XTtcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdlbXB0eSc6XG4gICAgICAgICAgICAgICAgY2FzZSAncm0nOlxuICAgICAgICAgICAgICAgICAgICBkZWxLZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IG1ldGEgW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnYXR0cic6XG4gICAgICAgICAgICAgICAgICAgIGF0dHIgPSBtZXRhLmF0dHI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBtZXRhLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gbWV0YS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3ByZXBlbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FwcGVuZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYmVmb3JlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdhZnRlcic6XG4gICAgICAgICAgICAgICAgICAgIHJlbExvYyA9IGtleTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IG1ldGEgW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBkb1BhcmVudCA9IHZhbCAhPT0gMSAmJiB2YWwgIT09IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IGRvUGFyZW50ID8gdmFsIDogcGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdmFsIGlzIG90aGVyIHRoYW4gMSBvciB0cnVlLCByZWxMb2Mgb3ZlcnJpZGVzIGJvdGggcGFyZW50IHZhbHVlcyBwYXNzZWQgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRvIGRpc3BsYXlPYkggYW5kIGRlZmluZWQgYnkgb3B0aW9uYWwgcGFyZW50IGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgfSAvLyBlbmQgc3dpdGNoIChrZXkpXG4gICAgICAgICAgICBcblxuICAgICAgICB9IC8vIGVuZCBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBtZXRhS2V5cy5sZW5ndGg7IGlkeCsrKVxuICAgICAgICBcblxuICAgICAgICBJZCA9IG51bGw7XG5cbiAgICAgICAgaWYgKGRlbEtleSkge1xuXG4gICAgICAgICAgICBmIFtkZWxLZXldIChwYXJlbnQpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYXR0cikge1xuXG4gICAgICAgICAgICBmLmF0dHIgKHBhcmVudCwgYXR0cik7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAvLyByZXBsYWNlcyBlbnRpcmUgY29udGVudCBvZiBwYXJlbnQgd2l0aCBuZXcgY29udGVudFxuXG4gICAgICAgICAgICAkKHBhcmVudClcbiAgICAgICAgICAgIC5lbXB0eSAoKTtcblxuICAgICAgICAgICAgZi5kaXNwbGF5T2JIIChwYXJlbnQsIGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIC8vIHdpdGhvdXQgZW1wdHlpbmcgZmlyc3QsIHdpbGwgc2ltcGx5IGFwcGVuZCBjb250ZW50IHRvIGV4aXN0aW5nIGNvbnRlbnRcblxuICAgICAgICB9IGVsc2UgaWYgKHRleHQpIHtcblxuICAgICAgICAgICAgSWQgPSBmLnRleHRNYWtlIChwYXJlbnQsIHJlbExvYywgdGV4dCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgSWQgPSBmLmVsZW1lbnRNYWtlIChwYXJlbnQsIHJlbExvYywgcHJpbWFyeUtleSwgZGlzcE9iUGFyc2VkLmMsIGRpc3BPYlBhcnNlZC5zKTtcblxuICAgICAgICB9IC8vIGVuZCBpZiAoZGVsS2V5KVxuXG4gICAgICAgIHJldHVybiBJZDtcbiAgICAgICAgXG4gICAgfTsgIC8vIGVuZCBkb09iamVjdCBcblxuXG5cbiAgICAgICAvLyAtLS0tIG1haW4gLS0tLVxuICAgIHZhciBJZDtcbiAgICB2YXIgZGlzcE9iVHlwZSA9IHR5cGVvZiBkaXNwT2I7XG5cbiAgICBpZiAoZGlzcE9iVHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgZGlzcE9iID09PSAwIHx8IGRpc3BPYiA9PT0gbnVsbCkge1xuXG4gICAgICAgIElkID0gbnVsbDtcblxuICAgIH0gZWxzZSBpZiAodi5wcmltaXRpdmVUeXBlc05vdE51bGwuaGFzT3duUHJvcGVydHkgKGRpc3BPYlR5cGUpKSB7XG5cbiAgICAgICAgSWQgPSBmLnRleHRNYWtlIChwYXJlbnQsICdhcHBlbmQnLCBkaXNwT2IpO1xuICAgICAgICAgICAgLy8gaWYgdGV4dCBzaG91bGQgYmUgcGxhY2VkIGF0IG90aGVyIHRoYW4gJ2FwcGVuZCcgbG9jYXRpb24sIHRoZW4gdXNlXG4gICAgICAgICAgICAvLyAndGV4dCcgdGFnIGFuZCBzcGVjaWZ5IHByZXBlbmQsIGFmdGVyIG9yIGJlZm9yZSBhcyBuZWVkZWRcblxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSAoZGlzcE9iKSkge1xuXG4gICAgICAgIElkID0gZG9BcnJheSAoZGlzcE9iKTtcblxuICAgIH0gZWxzZSBpZiAoZGlzcE9iVHlwZSA9PSAnb2JqZWN0Jykge1xuXG4gICAgICAgIElkID0gZG9PYmplY3QgKGRpc3BPYik7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIElkID0gbnVsbDtcblxuICAgIH0gLy8gZW5kIGlmICh0eXBlb2YgZGlzcE9iID09PSAndW5kZWZpbmVkJyB8fCBkaXNwT2IgPT09IDAgfHwgZGlzcE9iID09PSBudWxsKVxuICAgIFxuICAgIHJldHVybiBJZDtcblxufTsgLy8gZW5kIGYuZGlzcGxheU9iSCBcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYuZWxlbWVudE1ha2UgPSAocGFyZW50T3JTaWJsSWQsIHJlbExvYywgZWxOYW1lLCBjb250ZW50LCBhdHRycykgPT4ge1xuICAgIFxuICAgIHZhciBpZDtcbiAgICB2YXIgYXR0cktleXMgPSBPYmplY3Qua2V5cyAoYXR0cnMpO1xuICAgIHZhciBoYXNBdHRycyA9IGF0dHJLZXlzLmxlbmd0aCA+IDA7XG5cbiAgICBpZiAoaGFzQXR0cnMgJiYgYXR0cnMuaGFzT3duUHJvcGVydHkgKCdpZCcpKSB7XG5cbiAgICAgICAgaWQgPSBhdHRycy5pZDtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgaWQgPSBQLmdlbklkICgpO1xuXG4gICAgfSAvLyBlbmQgaWYgKGhhc0F0dHJzKVxuICAgIFxuICAgIHZhciBJZCA9ICcjJyArIGlkO1xuICAgIFxuICAgIGlmIChlbE5hbWUgPT09ICdzY3JpcHQnICYmIGNvbnRlbnQgIT09IDApIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvOTQxMzczNy9ob3ctdG8tYXBwZW5kLXNjcmlwdC1zY3JpcHQtaW4tamF2YXNjcmlwdFxuICAgICAgICAvLyBpbnNwaXJlZCBieSBTTyBxdWVzdGlvbiwgYnV0IHNldHRpbmcgaW5uZXJIVE1MIGlzbid0IHN1cHBvc2VkIHRvIHdvcmtcbiAgICAgICAgLy8gdGhlcmVmb3JlLCBzZXQgc3JjIGF0dHJpYnV0ZSB3aXRoIHBhdGggdG8gZmlsZSwgaW5zdGVhZCBvZiBcbiAgICAgICAgLy8gc2V0dGluZyBpbm5lckhUTUwgdG8gY29udGVudCBvZiBmaWxlXG5cbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjEwOTk1L2NhbnQtYXBwZW5kLXNjcmlwdC1lbGVtZW50XG4gICAgICAgIC8vIGpRdWVyeSB3b24ndCBhZGQgc2NyaXB0IGVsZW1lbnQgYXMgaXQgZG9lcyB3aXRoIGFueSBvdGhlciBlbGVtZW50LiAgVGhlcmVmb3JlLCBtdXN0IGJlIGRvbmVcbiAgICAgICAgLy8gdXNpbmcgb25seSBqYXZhc2NyaXB0IGFzIGZvbGxvd3M6XG4gICAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuXG4gICAgICAgIHNjcmlwdC5zcmMgPSBjb250ZW50O1xuICAgICAgICBzY3JpcHQuaWQgPSBhdHRycy5pZDtcbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTsgICAgIFxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgZGl2ZWwgPSAnPCcgKyBlbE5hbWUgKyAnIGlkPVwiJyArIGlkICsgJ1wiJztcbiAgICBcbiAgICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICBcbiAgICAgICAgICAgIGRpdmVsICs9ICc+PC8nICsgZWxOYW1lICsgJz4nO1xuICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgIFxuICAgICAgICAgICAgZGl2ZWwgKz0gJz4nO1xuICAgIFxuICAgICAgICB9IC8vIGVuZCBpZiAoY29udGVudClcbiAgICBcbiAgICAgICAgJChwYXJlbnRPclNpYmxJZClbcmVsTG9jXSAoZGl2ZWwpO1xuXG4gICAgfSAvLyBlbmQgaWYgKGVsTmFtZSA9PT0gJ3NjcmlwdCcpXG4gICAgXG4gICAgXG4gICAgaWYgKGhhc0F0dHJzKSB7XG4gICAgICAgIFxuICAgICAgICAkKElkKVxuICAgICAgICAuYXR0ciAoYXR0cnMpO1xuXG4gICAgfSAvLyBlbmQgaWYgKGhhc0F0dHJzKVxuXG4gICAgZi5kaXNwbGF5T2JIIChJZCwgY29udGVudCk7XG4gICAgXG4gICAgaWYgKGVsTmFtZSA9PT0gJ2Zvcm0nKSB7XG5cbiAgICAgICAgJChwYXJlbnQpXG4gICAgICAgIC5mb2N1cyAoKTtcblxuICAgIH0gLy8gZW5kIGlmIChlbE5hbWUgPT09ICdmb3JtJylcbiAgICBcbiAgICByZXR1cm4gSWQ7XG5cbn07IC8vIGVuZCBmLmVsZW1lbnRNYWtlXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYudGV4dE1ha2UgPSAocGFyZW50LCByZWxMb2MsIHByaW1pdGl2ZSkgPT4ge1xuICAgIFxuICAgIGlmICh0eXBlb2YgcHJpbWl0aXZlID09PSAnc3RyaW5nJykge1xuICAgICAgICBcbiAgICAgICAgdmFyIHNpbmdsZXF1b3RlID0gJyYjeDAwMjc7JztcbiAgICAgICAgdmFyIGJhY2tzbGFzaCA9ICcmI3gwMDVjOyc7XG4gICAgICAgIHZhciBkb3VibGVxdW90ZSA9ICcmI3gwMDIyOyc7XG4gICAgICAgIHZhciBsdCA9ICcmbHQ7JztcbiAgICAgICAgXG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvJy9nLCBzaW5nbGVxdW90ZSk7XG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvXCIvZywgZG91YmxlcXVvdGUpO1xuICAgICAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUucmVwbGFjZSAoL1xcXFwvZywgYmFja3NsYXNoKTtcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC88L2csIGx0KTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByaW1pdGl2ZSA9PT0gJ3N5bWJvbCcpIHtcblxuICAgICAgICBwcmltaXRpdmUgPSAnc3ltYm9sJztcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBzdHJpbmdpZnkgd291bGQgcHJvZHVjZSAne30nIHdoaWNoIGlzIGxlc3MgdXNlZnVsXG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIHByaW1pdGl2ZSA9IEpTT04uc3RyaW5naWZ5IChwcmltaXRpdmUpO1xuXG4gICAgfSAvLyBlbmQgaWYgKHR5cGVvZiBwcmltaXRpdmUgPT09ICdzdHJpbmcnKVxuICAgIFxuXG4gICAgJChwYXJlbnQpIFtyZWxMb2NdIChwcmltaXRpdmUpO1xuXG4gICAgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIHRleHQgb2JzIGhhdmUgbm8gaWQnczogb25seSB0ZXh0IGlzIGFwcGVuZGVkIHdpdGggbm8gd2F5IHRvIGFkZHJlc3MgaXRcbiAgICAgICAgLy8gaWYgYWRkcmVzc2luZyBpcyBuZWNlc3NhcnksIHVzZSBzcGFuIGluc3RlYWQgb2YgdGV4dFxuXG59OyAvLyBlbmQgZi50ZXh0TWFrZSBcblxuXG5cbi8vIFBVQkxJQyBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciBQID0ge307XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5QLmRpc3BsYXlPYiA9IChkaXNwT2IpID0+IHtcbiAgICBcbiAgICB2YXIgcGFyZW50ID0gJ2JvZHknO1xuICAgICAgICAvLyBpZiBwYXJlbnQgbm90IGZvdW5kLCBhcHBlbmQgdG8gYm9keVxuXG4gICAgaWYgKHR5cGVvZiBkaXNwT2IgPT09ICdvYmplY3QnICYmIGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ3BhcmVudCcpKSB7XG5cbiAgICAgICAgcGFyZW50ID0gZGlzcE9iLnBhcmVudDtcblxuICAgIH0gLy8gZW5kIGlmICh0eXBlb2YgZGlzcE9iID09PSAnb2JqZWN0JyAmJiBkaXNwT2IuaGFzT3duUHJvcGVydHkgKCdwYXJlbnQnKSlcbiAgICBcbiAgICB2YXIgSWQgPSBmLmRpc3BsYXlPYkggKHBhcmVudCwgZGlzcE9iKTtcblxuICAgIHJldHVybiBJZDtcblxufTsgLy8gZW5kIFAuZGlzcGxheU9iIFxuXG5QLmRpc3BsYXlQYWdlID0gUC5kaXNwbGF5T2I7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5QLmdlbklkID0gKCkgPT4ge1xuXG4gICAgdmFyIGlkID0gJ2knICsgdi5pZCsrO1xuICAgIHJldHVybiBpZDtcblxufTsgLy8gZW5kIFAuZ2VuSWRcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5nZW5JZHMgPSAoKSA9PiB7XG4gICAgXG4gICAgdmFyIGlkID0gUC5nZW5JZCAoKTtcbiAgICB2YXIgSWQgPSAnIycgKyBpZDtcblxuICAgIHJldHVybiBbaWQsIElkXTtcblxufTsgLy8gZW5kIFAuZ2VuSWRzXG5cblxuXG4vLyBlbmQgUFVCTElDIHNlY3Rpb25cblxuZi5pbml0ICgpO1xuXG5yZXR1cm4gUDtcblxufSgpKTtcblxuXG5cbiIsIi8vIGdvLW1zZy9pbmRleC5qc1xuLy8gZ28tbXNnIG9iamVjdCBoYXMgYSB1bmlxdWUgcHJpbWFyeSBtc2cgYW5kIHplcm8gb3IgbW9yZSBvcHRpb25hbCBhdHRyaWJ1dGVzXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocDApIHtcblxuICAgIC8vIFBSSVZBVEUgUHJvcGVydGllc1xudmFyIHYgPSB7XG5cbiAgICBwcmltYXJ5OiBudWxsLFxuICAgICAgICAvLyBwcmltYXJ5OiB7Y21kOiAxfSAoY29udGFpbnMgb3B0aW9uYWwgY29udGVudCkgb3Ige2NtZDogMH0gKG5vIG9wdGlvbmFsIGNvbnRlbnQgYWxsb3dlZClcblxuICAgIHNlY29uZGFyeTogbnVsbCxcbiAgICAgICAgLy8gaWYgYSBwcmltYXJ5IG1lc3NhZ2UgaGFzIGFuIG9wdGlvbmFsIGF0dHJpYnV0ZSB0aGF0IGNvbmNpZGVudGFsbHkgaXMgdGhlIHNhbWUgYXNcbiAgICAgICAgLy8gYW5vdGhlciBwcmltYXJ5IG1lc3NhZ2UsIGl0IHNob3VsZCBiZSBoYXZlIGEga2V5L3ZhbHVlIHBhaXIgaW4gc2Vjb25kYXJ5IHthdHRyOiAxfVxuICAgICAgICAvLyB0byBlbnN1cmUgdGhhdCBpdCB3aWxsIGJlIHRyZWF0ZWQgYXMgYW4gYXR0cmlidXRlIGluIGNhc2UgYSBwcmltYXJ5IGlzIHByZXNlbnRcbiAgICAgICAgLy8gU2Vjb25kYXJ5IGlzIG9ubHkgdGVzdGVkIGlmIHRoZXJlIGV4aXN0cyBhIHByaW1hcnkga2V5XG5cbiAgICBtZXRhOiBudWxsLFxuICAgICAgICAvLyBtZXRhIHBhcmFtZXRlcnMgaW50ZW5kZWQgZm9yIGN0cmwgb3Igb3RoZXIgcHVycG9zZSBvdXRzaWRlIG9mIHByaW1hcnkgYW5kIHNlY29uZGFyeSBtc2dcbiAgICAgICAgLy8gcGFyYW1ldGVyIHVzYWdlXG5cbn07ICAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG5cbiAgICAvLyBQUklWQVRFIEZ1bmN0aW9uc1xuZiA9IHt9O1xuXG5cbmYuaW5pdCA9ICgpID0+IHtcblxuICAgIHYucHJpbWFyeSA9IHAwLnByaW1hcnk7XG4gICAgdi5zZWNvbmRhcnkgPSBwMC5oYXNPd25Qcm9wZXJ0eSAoJ3NlY29uZGFyeScpID8gcDAuc2Vjb25kYXJ5IDoge307XG4gICAgdi5tZXRhID0gcDAuaGFzT3duUHJvcGVydHkgKCdtZXRhJykgPyBwMC5tZXRhIDoge307XG59O1xuXG4gICAgLy8gUFVCTElDIEZ1bmN0aW9uc1xudmFyIFAgPSB7fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAucGFyc2VNc2cgPSAobXNnT2IpID0+IHtcbiAgICBcbiAgICB2YXIgcmVzID0ge307XG4gICAgdmFyIG1zZ0tleXMgPSBPYmplY3Qua2V5cyAobXNnT2IpO1xuXG4gICAgdmFyIHByaW1hcnlDYW5kaWRhdGVzT2IgPSB7fTtcbiAgICB2YXIgYXR0cnNPYiA9IHt9O1xuICAgIHZhciBtZXRhT2IgPSB7fTtcblxuICAgIHZhciBrZXk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtc2dLZXlzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAga2V5ID0gbXNnS2V5cyBbaV07XG4gICAgICAgIFxuICAgICAgICBpZiAodi5wcmltYXJ5Lmhhc093blByb3BlcnR5IChrZXkpKSB7XG5cbiAgICAgICAgICAgIHByaW1hcnlDYW5kaWRhdGVzT2IgW2tleV0gPSAxO1xuXG4gICAgICAgIH0gZWxzZSBpZiAodi5tZXRhLmhhc093blByb3BlcnR5IChrZXkpKSB7XG5cbiAgICAgICAgICAgIG1ldGFPYiBba2V5XSA9IG1zZ09iIFtrZXldO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGF0dHJzT2IgW2tleV0gPSBtc2dPYiBba2V5XTtcblxuICAgICAgICB9IC8vIGVuZCBpZiAodi5wcmltYXJ5Lmhhc093blByb3BlcnR5IChrZXkpKVxuICAgICAgICBcbiAgICB9IC8vIGVuZCBmb3IgKHZhciBpID0gMDsgaSA8IG1zZ0tleXMubGVuZ3RoOyBpKyspXG5cbiAgICB2YXIgcHJpbWFyeUNhbmRpZGF0ZXNBID0gT2JqZWN0LmtleXMgKHByaW1hcnlDYW5kaWRhdGVzT2IpO1xuXG4gICAgdmFyIHByaW1hcnlLZXk7XG4gICAgdmFyIGNvbnRlbnQ7XG5cbiAgICBpZiAocHJpbWFyeUNhbmRpZGF0ZXNBLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICAgIHByaW1hcnlLZXkgPSBudWxsO1xuXG4gICAgfSBlbHNlIGlmIChwcmltYXJ5Q2FuZGlkYXRlc0EubGVuZ3RoID09PSAxKSB7XG5cbiAgICAgICAgcHJpbWFyeUtleSA9IHByaW1hcnlDYW5kaWRhdGVzQSBbMF07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBoYW5kbGUgcHJpbWFyeS9zZWNvbmRhcnkga2V5IHJlc29sdXRpb25cblxuICAgICAgICBwcmltYXJ5S2V5ID0gbnVsbDtcbiAgICAgICAgZm9yIChrZXkgaW4gcHJpbWFyeUNhbmRpZGF0ZXNPYikge1xuXG4gICAgICAgICAgICBpZiAodi5zZWNvbmRhcnkuaGFzT3duUHJvcGVydHkgKGtleSkpIHtcblxuICAgICAgICAgICAgICAgIGF0dHJzT2IgW2tleV0gPSBtc2dPYiBba2V5XTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmIChwcmltYXJ5S2V5ID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUtleSA9IGtleTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzLmVyciA9ICdNdWx0aXBsZSBwcmltYXJ5IGtleXMgZm91bmQgbm90IGluIHNlY29uZGFyeSBvYmplY3Q6ICcgKyBKU09OLnN0cmluZ2lmeSAobXNnKTtcblxuICAgICAgICAgICAgICAgIH0gLy8gZW5kIGlmIChwcmltYXJ5S2V5ID09PSBudWxsKVxuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICB9IC8vIGVuZCBpZiAodi5zZWNvbmRhcnkuaGFzT3duUHJvcGVydHkgKGtleSkpXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgfSAvLyBlbmQgaWYgKHByaW1hcnlDYW5kaWRhdGVzQS5sZW5ndGggPT09IDApXG5cblxuICAgIGlmICghcmVzLmhhc093blByb3BlcnR5ICgnZXJyJykpIHtcblxuICAgICAgICByZXMucCA9IHByaW1hcnlLZXk7XG4gICAgICAgIHJlcy5jID0gcHJpbWFyeUtleSAmJiB2LnByaW1hcnkgW3ByaW1hcnlLZXldICE9PSAwID8gbXNnT2IgW3ByaW1hcnlLZXldIDogbnVsbDtcbiAgICAgICAgICAgIC8vIGV4YW1wbGUgdm9pZCBodG1sIHRhZyBoYXMgemVybyBjb250ZW50LCBzbyBjb250ZW50IGlzIGZvcmNlZCB0byBudWxsXG5cbiAgICAgICAgcmVzLnMgPSBhdHRyc09iO1xuICAgICAgICByZXMubSA9IG1ldGFPYjtcblxuICAgIH0gLy8gZW5kIGlmICghcmVzLmhhc093blByb3BlcnR5ICgnZXJyJykpXG4gICAgXG4gICAgXG4gICAgcmV0dXJuIHJlcztcblxufTsgLy8gZW5kIFAucGFyc2VNc2cgXG5cblxuXG4gICAgLy8gZW5kIFBVQkxJQyBGdW5jdGlvbnNcblxuZi5pbml0ICgpO1xuXG5yZXR1cm4gUDtcblxufTtcblxuXG5cbiJdfQ==
