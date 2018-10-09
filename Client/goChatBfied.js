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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlc19nbG9iYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnb0NoYXQuanMiLCJpbmRleDAuanMiLCIuLi8uLi9nby1qMmgvaW5kZXguanMiLCIuLi8uLi9nby1tc2cvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIGdvQ2hhdC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBQUklWQVRFIFByb3BlcnRpZXNcbnZhciB2ID0ge1xuXG4gICAgajJoOiByZXF1aXJlICgnZ28tajJoJykuZGlzcGxheU9iLFxuICAgIHdzU2VydmVyOiBudWxsLFxuICAgIHBvcnQ6IDM0NTYsXG5cbiAgICBpZFVzZXJOYW1lOiAndXNlcicsXG4gICAgaWRVc2VyRGl2OiAndXNlcmRpdicsXG4gICAgaWRVc2VyRm9ybTogJ3VzZXJmb3JtJyxcbiAgICBpZENoYXRGb3JtOiAnY2hhdGZvcm0nLFxuICAgIGlkQ2hhdEJveDogJ2NoYXRib3gnLFxuICAgIGlkQ2hhdE1zZzogJ2NoYXRtc2cnLFxuXG4gICAgSWRVc2VyTmFtZTogbnVsbCxcbiAgICBJZFVzZXJEaXY6IG51bGwsXG4gICAgSWRVc2VyRm9ybTogbnVsbCxcbiAgICBJZENoYXRGb3JtOiBudWxsLFxuICAgIElkQ2hhdEJveDogbnVsbCxcbiAgICBJZENoYXRNc2c6IG51bGwsXG5cbiAgICB1c2VyQmFkZ2VJZHg6IDAsXG4gICAgdXNlckJhZGdlczogWydiYWRnZS1wcmltYXJ5JywgJ2JhZGdlLXNlY29uZGFyeScsICdiYWRnZS1zdWNjZXNzJywgJ2JhZGdlLWRhbmdlcicsICdiYWRnZS13YXJuaW5nJywgJ2JhZGdlLWluZm8nLCAnYmFkZ2UtZGFyayddLFxuXG4gICAgdXNlclN5c3RlbTogJ1N5c3RlbScsXG4gICAgdXNlckFzc2lnbmVkOiB7fSxcblxufTsgIC8vIGVuZCBQUklWQVRFIHByb3BlcnRpZXNcblxuICAgIC8vIFBSSVZBVEUgRnVuY3Rpb25zXG5mID0ge307XG5cblxuZi5pbml0ID0gKCkgPT4ge1xuXG4gICAgICAgIC8vIG1ha2UganF1ZXJ5IGFkZHJlc3NhYmxlIHNlbGVjdG9yc1xuICAgIHYuSWRVc2VyTmFtZSA9IGYubWtJZCAodi5pZFVzZXJOYW1lKTtcbiAgICB2LklkVXNlckRpdiA9IGYubWtJZCAodi5pZFVzZXJEaXYpO1xuICAgIHYuSWRVc2VyRm9ybSA9IGYubWtJZCAodi5pZFVzZXJGb3JtKTtcbiAgICB2LklkQ2hhdEZvcm0gPSBmLm1rSWQgKHYuaWRDaGF0Rm9ybSk7XG4gICAgdi5JZENoYXRCb3ggPSBmLm1rSWQgKHYuaWRDaGF0Qm94KTtcbiAgICB2LklkQ2hhdE1zZyA9IGYubWtJZCAodi5pZENoYXRNc2cpO1xuXG4gICAgdi51c2VyQXNzaWduZWQuU3lzdGVtID0gJ2JhZGdlLWxpZ2h0JztcblxuICAgIHZhciBoZWFkZXIgPSB7XG4gICAgICAgIGRpdjoge2gzOiAnQ2hhdCBzZXNzaW9uIHdpdGggZ28tY2hhdCd9LCBcbiAgICAgICAgY2xhc3M6ICd0ZXh0LWNlbnRlcicsXG4gICAgfTtcblxuICAgIHZhciB1c2VyID0ge1xuICAgICAgICBkaXY6IHtcbiAgICAgICAgICAgIGZvcm06IFtcbiAgICAgICAgICAgICAgICB7bGFiZWw6ICdVc2VybmFtZTonfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiAwLCBcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHYuaWRVc2VyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLCBcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdmb3JtLWNvbnRyb2wnLCBcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdFbnRlciBVc2VybmFtZSB0byBnZXQgc3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7YnV0dG9uOiAnU3VibWl0JywgdHlwZTogJ3N1Ym1pdCcsIGNsYXNzOiAnYnRuIGJ0bi1wcmltYXJ5J30sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaWQ6IHYuaWRVc2VyRm9ybSxcbiAgICAgICAgICAgIGNsYXNzOiAnZm9ybS1pbmxpbmUnLFxuICAgICAgICB9LCBcbiAgICAgICAgaWQ6IHYuaWRVc2VyRGl2LFxuICAgICAgICBjbGFzczogJ2QtZmxleCBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyJyxcbiAgICB9O1xuXG4gICAgdi5qMmggKFtoZWFkZXIsIHVzZXJdKTtcblxuICAgICQodi5JZFVzZXJGb3JtKVxuICAgIC5zdWJtaXQgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2LnVzZXIwID0gJCh2LklkVXNlck5hbWUpLnZhbCgpO1xuICAgICAgICB2LnVzZXIwID0gdi51c2VyMC5yZXBsYWNlICgvXFxzKy9nLCBcIi1cIik7XG4gICAgICAgIHZhciB1cmwgPSBkb2N1bWVudC5VUkw7XG5cbiAgICAgICAgdmFyIGlzSHR0cHMgPSBmYWxzZTtcbiAgICAgICAgdmFyIGRvbWFpbiA9ICdsb2NhbGhvc3QnO1xuXG4gICAgICAgIHZhciBtYXRjaGVkID0gdXJsLm1hdGNoICgvKGh0dHBzPyk6Li4oW15cXC9dKykvKTtcbiAgICAgICAgICAgIC8vIGUuZy4gaHR0cHM6Ly9tb25nb3Njb3V0LmNvbS9nby1jaGF0XG5cbiAgICAgICAgaWYgKG1hdGNoZWQpIHtcblxuICAgICAgICAgICAgaXNIdHRwcyA9IG1hdGNoZWQgWzFdID09PSAnaHR0cHMnO1xuICAgICAgICAgICAgZG9tYWluID0gbWF0Y2hlZCBbMl07XG5cbiAgICAgICAgfSAvLyBlbmQgaWYgKG1hdGNoZWQpXG4gICAgICAgIFxuICAgICAgICB2YXIgcHJlZml4ID0gaXNIdHRwcyA/ICd3c3MnIDogJ3dzJztcblxuICAgICAgICB2YXIgdXJsV3MgPSBwcmVmaXggKyAnOi8vJyArIGRvbWFpbiArICc6JyArIHYucG9ydDtcbiAgICAgICAgdi53c1NlcnZlciA9IG5ldyBXZWJTb2NrZXQgKHVybFdzKTtcblxuICAgICAgICBzZXRUaW1lb3V0IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAvLyAxMDBtcyBkZWxheSB0byBjaGVjayByZWFkeVN0YXRlLCBiZWNhdXNlIHdoZW4gdi53c1NlcnZlciBpcyBpbml0aWFsbHkgYXNzaWduZWRcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGUgc3RhdGVtZW50IGFib3ZlLCByZWFkeVN0YXRlIGlzIDAuIFRoZXJlIGlzIHNtYWxsIGRlbGF5IChhIGZldyBtcykgYmVmb3JlIFxuICAgICAgICAgICAgICAgIC8vIGl0IGNoYW5nZXMgdG8gMSwgaWYgdGhlIHNlcnZlciBpcyBhdmFpbGFibGUuIFxuICAgICAgICAgICAgaWYgKHYud3NTZXJ2ZXIucmVhZHlTdGF0ZSAhPT0gMSkge1xuICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBub3QgYXZhaWxhYmxlIGFmdGVyIHRoZSAxMG1zIGRlbGF5LCB0aGVuIG91dHB1dCB1bmF2YWlsYWJsZSBtZXNzYWdlXG4gICAgICAgICAgICAgICAgdi5qMmggKFtcbiAgICAgICAgICAgICAgICAgICAge2VtcHR5OiB2LklkVXNlckRpdn0sXG4gICAgICAgICAgICAgICAgICAgIHt0ZXh0OiAnSGVsbG86ICcgKyB2LnVzZXIwICsgJy4gQ29ubmVjdGluZyB3aXRoIGNoYXQgc2VydmVyIC4uLicsIHBhcmVudDogdi5JZFVzZXJEaXZ9XG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IC8vIGVuZCBpZiAodi53c1NlcnZlci5yZWFkU3RhdGUgIT09IDEpXG4gICAgXG4gICAgICAgIH0sIDEwMCk7XG5cbiAgICAgICAgdi53c1NlcnZlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBtc2cgPSBKU09OLnBhcnNlIChldmVudC5kYXRhKTtcbiAgICAgICAgICAgIGYuZnJvbVNydnIgKG1zZyk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcbn07ICAvLyBlbmQgZi5pbml0XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmZyb21TcnZyID0gKG1zZykgPT4ge1xuICAgIFxuICAgIGlmIChBcnJheS5pc0FycmF5IChtc2cpKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaW0gPSAwOyBpbSA8IG1zZy5sZW5ndGg7IGltKyspIHtcblxuICAgICAgICAgICAgZi5mcm9tU3J2ciAobXNnIFtpbV0pO1xuXG4gICAgICAgIH0gLy8gZW5kIGZvciAodmFyIGltID0gMDsgaW0gPCBtc2cubGVuZ3RoOyBpbSsrKVxuICAgICAgICBcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgaWYgKG1zZy5oYXNPd25Qcm9wZXJ0eSAoJ2dldHVzZXInKSkge1xuICAgIFxuICAgICAgICAgICAgZi50b1NydnIgKHt1c2VyMDogdi51c2VyMH0pO1xuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKG1zZy5oYXNPd25Qcm9wZXJ0eSAoJ3NldHVzZXInKSkge1xuICAgIFxuICAgICAgICAgICAgdi51c2VyID0gbXNnLnNldHVzZXI7XG4gICAgXG4gICAgICAgICAgICB2LmoyaCAoW1xuICAgICAgICAgICAgICAgIHtlbXB0eTogdi5JZFVzZXJEaXZ9LFxuICAgICAgICAgICAgICAgIHt0ZXh0OiAnV2VsY29tZSAnICsgdi51c2VyLCBwYXJlbnQ6IHYuSWRVc2VyRGl2fVxuICAgICAgICAgICAgXSk7XG4gICAgXG4gICAgICAgICAgICB2YXIgY2hhdCA9IHtcbiAgICAgICAgICAgICAgICBkaXY6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGl2OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46ICdTeXN0ZW06JywgY2xhc3M6ICdiYWRnZSBiYWRnZS1waWxsIGJhZGdlLWxpZ2h0J30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46ICcmbmJzcDsnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogJ1dlbGNvbWUgdG8gdGhlIGNoYXQgc2Vzc2lvbiwgJyArIHYudXNlcn0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHYuaWRDaGF0Qm94LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdtYXJnaW4tdG9wOjMwcHg7Ym9yZGVyOjFweCBzb2xpZCBibGFjaztib3JkZXItcmFkaXVzOiA1cHg7bWF4LWhlaWdodDogNDAwcHg7b3ZlcmZsb3c6IGF1dG87JyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm06IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aW5wdXQ6IDAsIGlkOiB2LmlkQ2hhdE1zZywgc3R5bGU6ICd3aWR0aDogMTAwJTsnLCB0eXBlOiAndGV4dCcsIGF1dG9mb2N1czogJ2F1dG9mb2N1cycsIHBsYWNlaG9sZGVyOiAnRW50ZXIgQ2hhdCBNZXNzYWdlJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2J1dHRvbjogJ1NlbmQnLCB0eXBlOiAnc3VibWl0JywgY2xhc3M6ICdidG4gYnRuLXN1Y2Nlc3MnfVxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB2LmlkQ2hhdEZvcm0sXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNsYXNzOiAnY29udGFpbmVyJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAgICAgdi5qMmggKGNoYXQpO1xuICAgIFxuICAgICAgICAgICAgJCh2LklkQ2hhdEZvcm0pXG4gICAgICAgICAgICAuc3VibWl0IChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCAoKTtcbiAgICAgICAgICAgICAgICBmLnRvU3J2ciAoe1xuICAgICAgICAgICAgICAgICAgICBjaGF0bXNnOiAkKHYuSWRDaGF0TXNnKS52YWwoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgICAgICAgICAkKHYuSWRDaGF0TXNnKS52YWwgKCcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKG1zZy5oYXNPd25Qcm9wZXJ0eSAoJ2VjaG9tc2cnKSkge1xuICAgIFxuICAgICAgICAgICAgdmFyIGVjaG9tc2cgPSBtc2cuZWNob21zZztcbiAgICAgICAgICAgIHZhciB1c2VyID0gbXNnLnVzZXI7XG4gICAgICAgICAgICB2YXIgYmFkZ2UgPSBmLmdldEJhZGdlICh1c2VyKTtcbiAgICBcbiAgICAgICAgICAgIGlmICh1c2VyID09PSB2LnVzZXJTeXN0ZW0pIHtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlZCA9IGVjaG9tc2cubWF0Y2ggKC9Vc2VyIChcXFMrKSguKikvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlZCkge1xuICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgdXNlck90aGVyID0gbWF0Y2hlZCBbMV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWRnZU90aGVyID0gZi5nZXRCYWRnZSAodXNlck90aGVyKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1zZ1N1ZmZpeCA9IG1hdGNoZWQgWzJdO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBlY2hvbXNnID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46ICdVc2VyJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogJyZuYnNwOyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46IHVzZXJPdGhlciwgY2xhc3M6ICdiYWRnZSBiYWRnZS1waWxsICcgKyBiYWRnZU90aGVyfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiAnJm5ic3A7J30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogbXNnU3VmZml4fVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgIFxuICAgICAgICAgICAgICAgIH0gLy8gZW5kIGlmIChtYXRjaGVkKVxuICAgIFxuICAgICAgICAgICAgfSAvLyBlbmQgaWYgKHVzZXIgPT09IHYudXNlclN5c3RlbSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY2hhdE1zZyA9IHtkaXY6IFtcbiAgICAgICAgICAgICAgICB7c3BhbjogdXNlciArICc6JywgY2xhc3M6ICdiYWRnZSBiYWRnZS1waWxsICcgKyBiYWRnZX0sXG4gICAgICAgICAgICAgICAge3NwYW46ICcmbmJzcDsnfSxcbiAgICAgICAgICAgICAgICB7c3BhbjogZWNob21zZ30sXG4gICAgICAgICAgICBdLCBwYXJlbnQ6IHYuSWRDaGF0Qm94fTtcbiAgICBcbiAgICAgICAgICAgIHYuajJoIChjaGF0TXNnKVxuXG4gICAgICAgICAgICAgICAgLy8gc2Nyb2xsIHRvIGJvdHRvbSBzbyBsYXN0IG1lc3NhZ2VzIGFyZSB0aGUgb25lcyB2aXNpYmxlXG4gICAgICAgICAgICAgICAgLy8gcGVyIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM3NDIzNDYvdXNlLWpxdWVyeS10by1zY3JvbGwtdG8tdGhlLWJvdHRvbS1vZi1hLWRpdi13aXRoLWxvdHMtb2YtdGV4dC8yMjIzMjMyOCNhbnN3ZXItMjIyMzIzMjhcbiAgICAgICAgICAgICQodi5JZENoYXRCb3gpXG4gICAgICAgICAgICAuc2Nyb2xsVG9wICgxRTEwKTtcbiAgICBcbiAgICAgICAgfSAvLyBlbmQgaWYgKG1zZy5oYXNPd25Qcm9wZXJ0eSAoJ2dldHVzZXInKSlcblxuICAgIH0gLy8gZW5kIGlmIChBcnJheS5pc0FycmF5IChtc2cpKVxuICAgIFxuICAgIFxuXG59OyAvLyBlbmQgZi5mcm9tU3J2ciBcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYuZ2V0QmFkZ2UgPSAodXNlcikgPT4ge1xuXG4gICAgdmFyIGJhZGdlO1xuICAgIGlmICh2LnVzZXJBc3NpZ25lZC5oYXNPd25Qcm9wZXJ0eSAodXNlcikpIHtcblxuICAgICAgICBiYWRnZSA9IHYudXNlckFzc2lnbmVkIFt1c2VyXTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgYmFkZ2UgPSB2LnVzZXJCYWRnZXMgW3YudXNlckJhZGdlSWR4XTtcbiAgICAgICAgdi51c2VyQmFkZ2VJZHggPSAodi51c2VyQmFkZ2VJZHggKyAxKSAlIHYudXNlckJhZGdlcy5sZW5ndGg7XG4gICAgICAgIHYudXNlckFzc2lnbmVkIFt1c2VyXSA9IGJhZGdlO1xuXG4gICAgfSAvLyBlbmQgaWYgKHYudXNlckFzc2lnbmVkLmhhc093blByb3BlcnR5IChtc2cudXNlcikpXG5cbiAgICByZXR1cm4gYmFkZ2U7XG5cbn07IC8vIGVuZCBmLmdldEJhZGdlIFxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLm1rSWQgPSAoaWQpID0+IHtcbiAgICBcbiAgICByZXR1cm4gJyMnICsgaWQ7XG5cbn07IC8vIGVuZCBmLm1rSWQgXG5cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi50b1NydnIgPSAobXNnKSA9PiB7XG4gICAgXG4gICAgdi53c1NlcnZlci5zZW5kIChKU09OLnN0cmluZ2lmeSAobXNnKSk7XG5cbn07IC8vIGVuZCBmLnRvU3J2ciBcblxuXG5cbiAgICAvLyBQVUJMSUMgRnVuY3Rpb25zXG52YXIgUCA9IHt9O1xuXG4gICAgLy8gZW5kIFBVQkxJQyBGdW5jdGlvbnNcblxuZi5pbml0ICgpO1xuXG5yZXR1cm4gUDtcblxufSgpKTtcblxuIiwiXG4vLyBpbmRleDAuanNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbi8vIFBSSVZBVEUgUHJvcGVydGllcy9NZXRob2RzXG52YXIgdiA9IHtcbn07IC8vIGVuZCBQUklWQVRFIHByb3BlcnRpZXNcbnZhciBmPXt9O1xuXG5mLmluaXQgPSAoKSA9PiB7XG4gICAgXG4vLyAgICB2LndzID0gbmV3IHYud3MgKCdsb2NhbGhvc3QnLCAyODE5MiwgUC5kb0FjdGlvbiwgZmFsc2UpO1xuICAgICAgICAvLyBpcCwgcG9ydCwgY2xpZW50LCBkb0VuY3J5cHRpb25cblxuICAgIHJlcXVpcmUgKCcuL2dvQ2hhdC5qcycpO1xuXG59OyAvLyBlbmQgZi5pbml0XG5cbi8vIFBVQkxJQyBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciBQID0ge307XG5cbi8vIGVuZCBQVUJMSUMgc2VjdGlvblxuXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkgKGYuaW5pdCk7XG5cbn0pICgpO1xuXG5cblxucmV0dXJuIFA7XG5cbn0pICgpO1xuXG5cblxuXG5cbiIsIi8vIGdvLWoyaC9pbmRleC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbi8vIFBSSVZBVEUgUHJvcGVydGllcy9NZXRob2RzXG52YXIgdiA9IHtcblxuICAgIGlkOiAwLFxuICAgIHByaW1pdGl2ZVR5cGVzTm90TnVsbDogeydzdHJpbmcnOjEsICdudW1iZXInOjEsICdib29sZWFuJzoxLCAnc3ltYm9sJzogMX0sXG4gICAgICAgIC8vIHNpbmNlIHR5cGVvZiBudWxsIHlpZWxkcyAnb2JqZWN0JywgaXQncyBoYW5kbGVkIHNlcGFyYXRlbHlcblxuICAgIG1zZ1R5cGVzOiB7XG5cbiAgICAgICAgcHJpbWFyeToge1xuICAgICAgICAgICAgICAgIC8vIHZvaWQgdGFnc1xuICAgICAgICAgICAgYXJlYTogMCwgYmFzZTogMCwgYnI6IDAsIGNvbDogMCwgZW1iZWQ6IDAsIGhyOiAwLCBpbWc6IDAsIGlucHV0OiAwLCBrZXlnZW46IDAsIGxpbms6IDAsIG1ldGE6IDAsIHBhcmFtOiAwLCBzb3VyY2U6IDAsIHRyYWNrOiAwLCB3YnI6IDAsIFxuXG4gICAgICAgICAgICAgICAgLy8gbm9uLXZvaWQgdGFnc1xuICAgICAgICAgICAgYTogMSwgYWJicjogMSwgYWRkcmVzczogMSwgYXJ0aWNsZTogMSwgYXNpZGU6IDEsIGF1ZGlvOiAxLCBiOiAxLCBiZGk6IDEsIGJkbzogMSwgYmxvY2txdW90ZTogMSwgYm9keTogMSwgYnV0dG9uOiAxLCBjYW52YXM6IDEsIGNhcHRpb246IDEsIGNpdGU6IDEsIGNvZGU6IDEsIGNvbGdyb3VwOiAxLCBkYXRhbGlzdDogMSwgZGQ6IDEsIGRlbDogMSwgZGV0YWlsczogMSwgZGZuOiAxLCBkaWFsb2c6IDEsIGRpdjogMSwgZGw6IDEsIGR0OiAxLCBlbTogMSwgZmllbGRzZXQ6IDEsIGZpZ2NhcHRpb246IDEsIGZpZ3VyZTogMSwgZm9vdGVyOiAxLCBmb3JtOiAxLCBoMTogMSwgaDI6IDEsIGgzOiAxLCBoNDogMSwgaDU6IDEsIGg2OiAxLCBoZWFkOiAxLCBoZWFkZXI6IDEsIGhncm91cDogMSwgaHRtbDogMSwgaTogMSwgaWZyYW1lOiAxLCBpbnM6IDEsIGtiZDogMSwgbGFiZWw6IDEsIGxlZ2VuZDogMSwgbGk6IDEsIG1hcDogMSwgbWFyazogMSwgbWVudTogMSwgbWV0ZXI6IDEsIG5hdjogMSwgbm9zY3JpcHQ6IDEsIG9iamVjdDogMSwgb2w6IDEsIG9wdGdyb3VwOiAxLCBvcHRpb246IDEsIG91dHB1dDogMSwgcDogMSwgcHJlOiAxLCBwcm9ncmVzczogMSwgcTogMSwgcnA6IDEsIHJ0OiAxLCBydWJ5OiAxLCBzOiAxLCBzYW1wOiAxLCBzY3JpcHQ6IDEsIHNlY3Rpb246IDEsIHNlbGVjdDogMSwgc21hbGw6IDEsIHNwYW46IDEsIHN0cm9uZzogMSwgc3R5bGU6IDEsIHN1YjogMSwgc3VtbWFyeTogMSwgc3VwOiAxLCBzdmc6IDEsIHRhYmxlOiAxLCB0Ym9keTogMSwgdGQ6IDEsIHRleHRhcmVhOiAxLCB0Zm9vdDogMSwgdGg6IDEsIHRoZWFkOiAxLCB0aW1lOiAxLCB0aXRsZTogMSwgdHI6IDEsIHU6IDEsIHVsOiAxLCAndmFyJzogMSwgdmlkZW86IDEsXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2Vjb25kYXJ5OiB7c3R5bGU6IDF9LFxuICAgICAgICAgICAgLy8gZWxlbWVudHMgdGhhdCBjYW4gYmUgZWl0aGVyIGEgcHJpbWFyeSB0YWcgaXRzZWxmIG9yIGFuIGF0dHJpYnV0ZSBvZiBhbm90aGVyIHByaW1hcnkgdGFnXG4gICAgICAgICAgICAvLyBpZiBhbnkgb3RoZXIgcHJpbWFyeSB0YWdzIGlzIHByZXNlbnQsIHRoZW4gc2Vjb25kYXJ5IHRhZ3MgYXJlIHRyZWF0ZWQgYXNcbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXMgb2YgdGhlIG90aGVyIHByaW1hcnkgdGFnXG5cbiAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgZW1wdHk6IDEsIHJtOiAxLCBcbiAgICAgICAgICAgIHByZXBlbmQ6IDEsIGFwcGVuZDogMSwgYmVmb3JlOiAxLCBhZnRlcjogMSwgcGFyZW50OiAxLFxuICAgICAgICAgICAgYXR0cjogMSwgY29udGVudDogMSwgdGV4dDogMSwgXG4gICAgICAgIH0sXG5cbiAgICB9LFxuXG4gICAgbXNnMDogcmVxdWlyZSAoJ2dvLW1zZycpLFxuICAgIG1zZzogbnVsbCxcblxufTsgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xudmFyIGY9e307XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmluaXQgPSAoKSA9PiB7XG4gICAgXG4gICAgdi5tc2cgPSBuZXcgdi5tc2cwICh2Lm1zZ1R5cGVzKTtcblxufTsgLy8gZW5kIGYuaW5pdFxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmF0dHIgPSAoc2VsZWN0b3IsIGF0dHIpID0+IHtcbiAgICBcbiAgICAkKHNlbGVjdG9yKVxuICAgIC5hdHRyIChhdHRyKTtcblxufTsgLy8gZW5kIGYuYXR0ciBcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5lbXB0eSA9IChzZWxlY3RvcikgPT4ge1xuICAgIFxuICAgICQoc2VsZWN0b3IpXG4gICAgLmVtcHR5ICgpXG4gICAgLm9mZiAoJ2tleWRvd24nKTtcblxufTsgLy8gZW5kIGYuZW1wdHkgXG5cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5ybSA9IChzZWxlY3RvcikgPT4ge1xuXG4gICAgJChzZWxlY3RvcilcbiAgICAucmVtb3ZlICgpO1xuXG59OyAvLyBlbmQgZi5ybVxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmRpc3BsYXlPYkggPSAocGFyZW50LCBkaXNwT2IpID0+IHtcbiAgICBcbiAgICAgICAgLy8gLS0tLSAgZG9BcnJheSAtLS0tXG4gICAgdmFyIGRvQXJyYXkgPSBmdW5jdGlvbiAoZGlzcE9iKSB7XG5cbiAgICAgICAgdmFyIElkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BPYi5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICBJZHMucHVzaCAoZi5kaXNwbGF5T2JIIChwYXJlbnQsIGRpc3BPYiBbaV0pKTtcblxuICAgICAgICB9IC8vIGVuZCBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BPYi5sZW5ndGg7IGkrKylcblxuICAgICAgICAvL3JldHVybiBJZHM7XG4gICAgICAgIHJldHVybiBJZHMgW0lkcy5sZW5ndGggLSAxXTtcbiAgICAgICAgXG4gICAgfTsgIC8vIGVuZCBkb0FycmF5IFxuXG4gICAgICAgIC8vIC0tLS0gIGRvT2JqZWN0IC0tLS1cbiAgICB2YXIgZG9PYmplY3QgPSBmdW5jdGlvbiAoZGlzcE9iKSB7XG5cbiAgICAgICAgdmFyIGRpc3BPYlBhcnNlZCA9IHYubXNnLnBhcnNlTXNnIChkaXNwT2IpO1xuXG4gICAgICAgIHZhciBwcmltYXJ5S2V5ID0gZGlzcE9iUGFyc2VkLnA7XG5cbiAgICAgICAgdmFyIG1ldGEgPSBkaXNwT2JQYXJzZWQubTtcblxuICAgICAgICB2YXIgZGVsS2V5ID0gbnVsbDtcbiAgICAgICAgdmFyIHJlbExvYyA9ICdhcHBlbmQnO1xuXG4gICAgICAgIHZhciBhdHRyID0gbnVsbDtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSBudWxsO1xuICAgICAgICB2YXIgdGV4dCA9IG51bGw7XG5cbiAgICAgICAgaWYgKG1ldGEuaGFzT3duUHJvcGVydHkgKCdwYXJlbnQnKSkge1xuICAgICAgICAgICAgLy8gZW5zdXJlcyBwcm9jZXNzaW5nIG9mICdwYXJlbnQnIGJlZm9yZSByZW1haW5kZXIgb2YgbWV0YSBrZXlzXG5cbiAgICAgICAgICAgIHBhcmVudCA9IG1ldGEucGFyZW50O1xuICAgICAgICAgICAgZGVsZXRlIG1ldGEucGFyZW50O1xuXG4gICAgICAgIH0gLy8gZW5kIGlmIChtZXRhLmhhc093blByb3BlcnR5ICgncGFyZW50JykpXG4gICAgICAgIFxuICAgICAgICB2YXIgbWV0YUtleXMgPSBPYmplY3Qua2V5cyAobWV0YSk7XG4gICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IG1ldGFLZXlzLmxlbmd0aDsgaWR4KyspIHtcblxuICAgICAgICAgICAgdmFyIGtleSA9IG1ldGFLZXlzIFtpZHhdO1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2VtcHR5JzpcbiAgICAgICAgICAgICAgICBjYXNlICdybSc6XG4gICAgICAgICAgICAgICAgICAgIGRlbEtleSA9IGtleTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gbWV0YSBba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdhdHRyJzpcbiAgICAgICAgICAgICAgICAgICAgYXR0ciA9IG1ldGEuYXR0cjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdjb250ZW50JzpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IG1ldGEuY29udGVudDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBtZXRhLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncHJlcGVuZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYXBwZW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdiZWZvcmUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FmdGVyJzpcbiAgICAgICAgICAgICAgICAgICAgcmVsTG9jID0ga2V5O1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gbWV0YSBba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRvUGFyZW50ID0gdmFsICE9PSAxICYmIHZhbCAhPT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gZG9QYXJlbnQgPyB2YWwgOiBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB2YWwgaXMgb3RoZXIgdGhhbiAxIG9yIHRydWUsIHJlbExvYyBvdmVycmlkZXMgYm90aCBwYXJlbnQgdmFsdWVzIHBhc3NlZCBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGludG8gZGlzcGxheU9iSCBhbmQgZGVmaW5lZCBieSBvcHRpb25hbCBwYXJlbnQgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICB9IC8vIGVuZCBzd2l0Y2ggKGtleSlcbiAgICAgICAgICAgIFxuXG4gICAgICAgIH0gLy8gZW5kIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IG1ldGFLZXlzLmxlbmd0aDsgaWR4KyspXG4gICAgICAgIFxuXG4gICAgICAgIElkID0gbnVsbDtcblxuICAgICAgICBpZiAoZGVsS2V5KSB7XG5cbiAgICAgICAgICAgIGYgW2RlbEtleV0gKHBhcmVudCk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhdHRyKSB7XG5cbiAgICAgICAgICAgIGYuYXR0ciAocGFyZW50LCBhdHRyKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgICAgIC8vIHJlcGxhY2VzIGVudGlyZSBjb250ZW50IG9mIHBhcmVudCB3aXRoIG5ldyBjb250ZW50XG5cbiAgICAgICAgICAgICQocGFyZW50KVxuICAgICAgICAgICAgLmVtcHR5ICgpO1xuXG4gICAgICAgICAgICBmLmRpc3BsYXlPYkggKHBhcmVudCwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgLy8gd2l0aG91dCBlbXB0eWluZyBmaXJzdCwgd2lsbCBzaW1wbHkgYXBwZW5kIGNvbnRlbnQgdG8gZXhpc3RpbmcgY29udGVudFxuXG4gICAgICAgIH0gZWxzZSBpZiAodGV4dCkge1xuXG4gICAgICAgICAgICBJZCA9IGYudGV4dE1ha2UgKHBhcmVudCwgcmVsTG9jLCB0ZXh0KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBJZCA9IGYuZWxlbWVudE1ha2UgKHBhcmVudCwgcmVsTG9jLCBwcmltYXJ5S2V5LCBkaXNwT2JQYXJzZWQuYywgZGlzcE9iUGFyc2VkLnMpO1xuXG4gICAgICAgIH0gLy8gZW5kIGlmIChkZWxLZXkpXG5cbiAgICAgICAgcmV0dXJuIElkO1xuICAgICAgICBcbiAgICB9OyAgLy8gZW5kIGRvT2JqZWN0IFxuXG5cblxuICAgICAgIC8vIC0tLS0gbWFpbiAtLS0tXG4gICAgdmFyIElkO1xuICAgIHZhciBkaXNwT2JUeXBlID0gdHlwZW9mIGRpc3BPYjtcblxuICAgIGlmIChkaXNwT2JUeXBlID09PSAndW5kZWZpbmVkJyB8fCBkaXNwT2IgPT09IDAgfHwgZGlzcE9iID09PSBudWxsKSB7XG5cbiAgICAgICAgSWQgPSBudWxsO1xuXG4gICAgfSBlbHNlIGlmICh2LnByaW1pdGl2ZVR5cGVzTm90TnVsbC5oYXNPd25Qcm9wZXJ0eSAoZGlzcE9iVHlwZSkpIHtcblxuICAgICAgICBJZCA9IGYudGV4dE1ha2UgKHBhcmVudCwgJ2FwcGVuZCcsIGRpc3BPYik7XG4gICAgICAgICAgICAvLyBpZiB0ZXh0IHNob3VsZCBiZSBwbGFjZWQgYXQgb3RoZXIgdGhhbiAnYXBwZW5kJyBsb2NhdGlvbiwgdGhlbiB1c2VcbiAgICAgICAgICAgIC8vICd0ZXh0JyB0YWcgYW5kIHNwZWNpZnkgcHJlcGVuZCwgYWZ0ZXIgb3IgYmVmb3JlIGFzIG5lZWRlZFxuXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5IChkaXNwT2IpKSB7XG5cbiAgICAgICAgSWQgPSBkb0FycmF5IChkaXNwT2IpO1xuXG4gICAgfSBlbHNlIGlmIChkaXNwT2JUeXBlID09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgSWQgPSBkb09iamVjdCAoZGlzcE9iKTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgSWQgPSBudWxsO1xuXG4gICAgfSAvLyBlbmQgaWYgKHR5cGVvZiBkaXNwT2IgPT09ICd1bmRlZmluZWQnIHx8IGRpc3BPYiA9PT0gMCB8fCBkaXNwT2IgPT09IG51bGwpXG4gICAgXG4gICAgcmV0dXJuIElkO1xuXG59OyAvLyBlbmQgZi5kaXNwbGF5T2JIIFxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5lbGVtZW50TWFrZSA9IChwYXJlbnRPclNpYmxJZCwgcmVsTG9jLCBlbE5hbWUsIGNvbnRlbnQsIGF0dHJzKSA9PiB7XG4gICAgXG4gICAgdmFyIGlkO1xuICAgIHZhciBhdHRyS2V5cyA9IE9iamVjdC5rZXlzIChhdHRycyk7XG4gICAgdmFyIGhhc0F0dHJzID0gYXR0cktleXMubGVuZ3RoID4gMDtcblxuICAgIGlmIChoYXNBdHRycyAmJiBhdHRycy5oYXNPd25Qcm9wZXJ0eSAoJ2lkJykpIHtcblxuICAgICAgICBpZCA9IGF0dHJzLmlkO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBpZCA9IFAuZ2VuSWQgKCk7XG5cbiAgICB9IC8vIGVuZCBpZiAoaGFzQXR0cnMpXG4gICAgXG4gICAgdmFyIElkID0gJyMnICsgaWQ7XG4gICAgXG4gICAgaWYgKGVsTmFtZSA9PT0gJ3NjcmlwdCcgJiYgY29udGVudCAhPT0gMCkge1xuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85NDEzNzM3L2hvdy10by1hcHBlbmQtc2NyaXB0LXNjcmlwdC1pbi1qYXZhc2NyaXB0XG4gICAgICAgIC8vIGluc3BpcmVkIGJ5IFNPIHF1ZXN0aW9uLCBidXQgc2V0dGluZyBpbm5lckhUTUwgaXNuJ3Qgc3VwcG9zZWQgdG8gd29ya1xuICAgICAgICAvLyB0aGVyZWZvcmUsIHNldCBzcmMgYXR0cmlidXRlIHdpdGggcGF0aCB0byBmaWxlLCBpbnN0ZWFkIG9mIFxuICAgICAgICAvLyBzZXR0aW5nIGlubmVySFRNTCB0byBjb250ZW50IG9mIGZpbGVcblxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MTA5OTUvY2FudC1hcHBlbmQtc2NyaXB0LWVsZW1lbnRcbiAgICAgICAgLy8galF1ZXJ5IHdvbid0IGFkZCBzY3JpcHQgZWxlbWVudCBhcyBpdCBkb2VzIHdpdGggYW55IG90aGVyIGVsZW1lbnQuICBUaGVyZWZvcmUsIG11c3QgYmUgZG9uZVxuICAgICAgICAvLyB1c2luZyBvbmx5IGphdmFzY3JpcHQgYXMgZm9sbG93czpcbiAgICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG5cbiAgICAgICAgc2NyaXB0LnNyYyA9IGNvbnRlbnQ7XG4gICAgICAgIHNjcmlwdC5pZCA9IGF0dHJzLmlkO1xuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOyAgICAgXG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZhciBkaXZlbCA9ICc8JyArIGVsTmFtZSArICcgaWQ9XCInICsgaWQgKyAnXCInO1xuICAgIFxuICAgICAgICBpZiAoY29udGVudCkge1xuICAgIFxuICAgICAgICAgICAgZGl2ZWwgKz0gJz48LycgKyBlbE5hbWUgKyAnPic7XG4gICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgXG4gICAgICAgICAgICBkaXZlbCArPSAnPic7XG4gICAgXG4gICAgICAgIH0gLy8gZW5kIGlmIChjb250ZW50KVxuICAgIFxuICAgICAgICAkKHBhcmVudE9yU2libElkKVtyZWxMb2NdIChkaXZlbCk7XG5cbiAgICB9IC8vIGVuZCBpZiAoZWxOYW1lID09PSAnc2NyaXB0JylcbiAgICBcbiAgICBcbiAgICBpZiAoaGFzQXR0cnMpIHtcbiAgICAgICAgXG4gICAgICAgICQoSWQpXG4gICAgICAgIC5hdHRyIChhdHRycyk7XG5cbiAgICB9IC8vIGVuZCBpZiAoaGFzQXR0cnMpXG5cbiAgICBmLmRpc3BsYXlPYkggKElkLCBjb250ZW50KTtcbiAgICBcbiAgICBpZiAoZWxOYW1lID09PSAnZm9ybScpIHtcblxuICAgICAgICAkKHBhcmVudClcbiAgICAgICAgLmZvY3VzICgpO1xuXG4gICAgfSAvLyBlbmQgaWYgKGVsTmFtZSA9PT0gJ2Zvcm0nKVxuICAgIFxuICAgIHJldHVybiBJZDtcblxufTsgLy8gZW5kIGYuZWxlbWVudE1ha2VcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi50ZXh0TWFrZSA9IChwYXJlbnQsIHJlbExvYywgcHJpbWl0aXZlKSA9PiB7XG4gICAgXG4gICAgaWYgKHR5cGVvZiBwcmltaXRpdmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgc2luZ2xlcXVvdGUgPSAnJiN4MDAyNzsnO1xuICAgICAgICB2YXIgYmFja3NsYXNoID0gJyYjeDAwNWM7JztcbiAgICAgICAgdmFyIGRvdWJsZXF1b3RlID0gJyYjeDAwMjI7JztcbiAgICAgICAgdmFyIGx0ID0gJyZsdDsnO1xuICAgICAgICBcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC8nL2csIHNpbmdsZXF1b3RlKTtcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC9cIi9nLCBkb3VibGVxdW90ZSk7XG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvXFxcXC9nLCBiYWNrc2xhc2gpO1xuICAgICAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUucmVwbGFjZSAoLzwvZywgbHQpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJpbWl0aXZlID09PSAnc3ltYm9sJykge1xuXG4gICAgICAgIHByaW1pdGl2ZSA9ICdzeW1ib2wnO1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIHN0cmluZ2lmeSB3b3VsZCBwcm9kdWNlICd7fScgd2hpY2ggaXMgbGVzcyB1c2VmdWxcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgcHJpbWl0aXZlID0gSlNPTi5zdHJpbmdpZnkgKHByaW1pdGl2ZSk7XG5cbiAgICB9IC8vIGVuZCBpZiAodHlwZW9mIHByaW1pdGl2ZSA9PT0gJ3N0cmluZycpXG4gICAgXG5cbiAgICAkKHBhcmVudCkgW3JlbExvY10gKHByaW1pdGl2ZSk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gdGV4dCBvYnMgaGF2ZSBubyBpZCdzOiBvbmx5IHRleHQgaXMgYXBwZW5kZWQgd2l0aCBubyB3YXkgdG8gYWRkcmVzcyBpdFxuICAgICAgICAvLyBpZiBhZGRyZXNzaW5nIGlzIG5lY2Vzc2FyeSwgdXNlIHNwYW4gaW5zdGVhZCBvZiB0ZXh0XG5cbn07IC8vIGVuZCBmLnRleHRNYWtlIFxuXG5cblxuLy8gUFVCTElDIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIFAgPSB7fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAuZGlzcGxheU9iID0gKGRpc3BPYikgPT4ge1xuICAgIFxuICAgIHZhciBwYXJlbnQgPSAnYm9keSc7XG4gICAgICAgIC8vIGlmIHBhcmVudCBub3QgZm91bmQsIGFwcGVuZCB0byBib2R5XG5cbiAgICBpZiAodHlwZW9mIGRpc3BPYiA9PT0gJ29iamVjdCcgJiYgZGlzcE9iLmhhc093blByb3BlcnR5ICgncGFyZW50JykpIHtcblxuICAgICAgICBwYXJlbnQgPSBkaXNwT2IucGFyZW50O1xuXG4gICAgfSAvLyBlbmQgaWYgKHR5cGVvZiBkaXNwT2IgPT09ICdvYmplY3QnICYmIGRpc3BPYi5oYXNPd25Qcm9wZXJ0eSAoJ3BhcmVudCcpKVxuICAgIFxuICAgIHZhciBJZCA9IGYuZGlzcGxheU9iSCAocGFyZW50LCBkaXNwT2IpO1xuXG4gICAgcmV0dXJuIElkO1xuXG59OyAvLyBlbmQgUC5kaXNwbGF5T2IgXG5cblAuZGlzcGxheVBhZ2UgPSBQLmRpc3BsYXlPYjtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAuZ2VuSWQgPSAoKSA9PiB7XG5cbiAgICB2YXIgaWQgPSAnaScgKyB2LmlkKys7XG4gICAgcmV0dXJuIGlkO1xuXG59OyAvLyBlbmQgUC5nZW5JZFxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5QLmdlbklkcyA9ICgpID0+IHtcbiAgICBcbiAgICB2YXIgaWQgPSBQLmdlbklkICgpO1xuICAgIHZhciBJZCA9ICcjJyArIGlkO1xuXG4gICAgcmV0dXJuIFtpZCwgSWRdO1xuXG59OyAvLyBlbmQgUC5nZW5JZHNcblxuXG5cbi8vIGVuZCBQVUJMSUMgc2VjdGlvblxuXG5mLmluaXQgKCk7XG5cbnJldHVybiBQO1xuXG59KCkpO1xuXG5cblxuIiwiLy8gZ28tbXNnL2luZGV4LmpzXG4vLyBnby1tc2cgb2JqZWN0IGhhcyBhIHVuaXF1ZSBwcmltYXJ5IG1zZyBhbmQgemVybyBvciBtb3JlIG9wdGlvbmFsIGF0dHJpYnV0ZXNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwMCkge1xuXG4gICAgLy8gUFJJVkFURSBQcm9wZXJ0aWVzXG52YXIgdiA9IHtcblxuICAgIHByaW1hcnk6IG51bGwsXG4gICAgICAgIC8vIHByaW1hcnk6IHtjbWQ6IDF9IChjb250YWlucyBvcHRpb25hbCBjb250ZW50KSBvciB7Y21kOiAwfSAobm8gb3B0aW9uYWwgY29udGVudCBhbGxvd2VkKVxuXG4gICAgc2Vjb25kYXJ5OiBudWxsLFxuICAgICAgICAvLyBpZiBhIHByaW1hcnkgbWVzc2FnZSBoYXMgYW4gb3B0aW9uYWwgYXR0cmlidXRlIHRoYXQgY29uY2lkZW50YWxseSBpcyB0aGUgc2FtZSBhc1xuICAgICAgICAvLyBhbm90aGVyIHByaW1hcnkgbWVzc2FnZSwgaXQgc2hvdWxkIGJlIGhhdmUgYSBrZXkvdmFsdWUgcGFpciBpbiBzZWNvbmRhcnkge2F0dHI6IDF9XG4gICAgICAgIC8vIHRvIGVuc3VyZSB0aGF0IGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBhbiBhdHRyaWJ1dGUgaW4gY2FzZSBhIHByaW1hcnkgaXMgcHJlc2VudFxuICAgICAgICAvLyBTZWNvbmRhcnkgaXMgb25seSB0ZXN0ZWQgaWYgdGhlcmUgZXhpc3RzIGEgcHJpbWFyeSBrZXlcblxuICAgIG1ldGE6IG51bGwsXG4gICAgICAgIC8vIG1ldGEgcGFyYW1ldGVycyBpbnRlbmRlZCBmb3IgY3RybCBvciBvdGhlciBwdXJwb3NlIG91dHNpZGUgb2YgcHJpbWFyeSBhbmQgc2Vjb25kYXJ5IG1zZ1xuICAgICAgICAvLyBwYXJhbWV0ZXIgdXNhZ2VcblxufTsgIC8vIGVuZCBQUklWQVRFIHByb3BlcnRpZXNcblxuICAgIC8vIFBSSVZBVEUgRnVuY3Rpb25zXG5mID0ge307XG5cblxuZi5pbml0ID0gKCkgPT4ge1xuXG4gICAgdi5wcmltYXJ5ID0gcDAucHJpbWFyeTtcbiAgICB2LnNlY29uZGFyeSA9IHAwLmhhc093blByb3BlcnR5ICgnc2Vjb25kYXJ5JykgPyBwMC5zZWNvbmRhcnkgOiB7fTtcbiAgICB2Lm1ldGEgPSBwMC5oYXNPd25Qcm9wZXJ0eSAoJ21ldGEnKSA/IHAwLm1ldGEgOiB7fTtcbn07XG5cbiAgICAvLyBQVUJMSUMgRnVuY3Rpb25zXG52YXIgUCA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5wYXJzZU1zZyA9IChtc2dPYikgPT4ge1xuICAgIFxuICAgIHZhciByZXMgPSB7fTtcbiAgICB2YXIgbXNnS2V5cyA9IE9iamVjdC5rZXlzIChtc2dPYik7XG5cbiAgICB2YXIgcHJpbWFyeUNhbmRpZGF0ZXNPYiA9IHt9O1xuICAgIHZhciBhdHRyc09iID0ge307XG4gICAgdmFyIG1ldGFPYiA9IHt9O1xuXG4gICAgdmFyIGtleTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1zZ0tleXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBrZXkgPSBtc2dLZXlzIFtpXTtcbiAgICAgICAgXG4gICAgICAgIGlmICh2LnByaW1hcnkuaGFzT3duUHJvcGVydHkgKGtleSkpIHtcblxuICAgICAgICAgICAgcHJpbWFyeUNhbmRpZGF0ZXNPYiBba2V5XSA9IDE7XG5cbiAgICAgICAgfSBlbHNlIGlmICh2Lm1ldGEuaGFzT3duUHJvcGVydHkgKGtleSkpIHtcblxuICAgICAgICAgICAgbWV0YU9iIFtrZXldID0gbXNnT2IgW2tleV07XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgYXR0cnNPYiBba2V5XSA9IG1zZ09iIFtrZXldO1xuXG4gICAgICAgIH0gLy8gZW5kIGlmICh2LnByaW1hcnkuaGFzT3duUHJvcGVydHkgKGtleSkpXG4gICAgICAgIFxuICAgIH0gLy8gZW5kIGZvciAodmFyIGkgPSAwOyBpIDwgbXNnS2V5cy5sZW5ndGg7IGkrKylcblxuICAgIHZhciBwcmltYXJ5Q2FuZGlkYXRlc0EgPSBPYmplY3Qua2V5cyAocHJpbWFyeUNhbmRpZGF0ZXNPYik7XG5cbiAgICB2YXIgcHJpbWFyeUtleTtcbiAgICB2YXIgY29udGVudDtcblxuICAgIGlmIChwcmltYXJ5Q2FuZGlkYXRlc0EubGVuZ3RoID09PSAwKSB7XG5cbiAgICAgICAgcHJpbWFyeUtleSA9IG51bGw7XG5cbiAgICB9IGVsc2UgaWYgKHByaW1hcnlDYW5kaWRhdGVzQS5sZW5ndGggPT09IDEpIHtcblxuICAgICAgICBwcmltYXJ5S2V5ID0gcHJpbWFyeUNhbmRpZGF0ZXNBIFswXTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGhhbmRsZSBwcmltYXJ5L3NlY29uZGFyeSBrZXkgcmVzb2x1dGlvblxuXG4gICAgICAgIHByaW1hcnlLZXkgPSBudWxsO1xuICAgICAgICBmb3IgKGtleSBpbiBwcmltYXJ5Q2FuZGlkYXRlc09iKSB7XG5cbiAgICAgICAgICAgIGlmICh2LnNlY29uZGFyeS5oYXNPd25Qcm9wZXJ0eSAoa2V5KSkge1xuXG4gICAgICAgICAgICAgICAgYXR0cnNPYiBba2V5XSA9IG1zZ09iIFtrZXldO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKHByaW1hcnlLZXkgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5S2V5ID0ga2V5O1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICByZXMuZXJyID0gJ011bHRpcGxlIHByaW1hcnkga2V5cyBmb3VuZCBub3QgaW4gc2Vjb25kYXJ5IG9iamVjdDogJyArIEpTT04uc3RyaW5naWZ5IChtc2cpO1xuXG4gICAgICAgICAgICAgICAgfSAvLyBlbmQgaWYgKHByaW1hcnlLZXkgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIH0gLy8gZW5kIGlmICh2LnNlY29uZGFyeS5oYXNPd25Qcm9wZXJ0eSAoa2V5KSlcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICB9IC8vIGVuZCBpZiAocHJpbWFyeUNhbmRpZGF0ZXNBLmxlbmd0aCA9PT0gMClcblxuXG4gICAgaWYgKCFyZXMuaGFzT3duUHJvcGVydHkgKCdlcnInKSkge1xuXG4gICAgICAgIHJlcy5wID0gcHJpbWFyeUtleTtcbiAgICAgICAgcmVzLmMgPSBwcmltYXJ5S2V5ICYmIHYucHJpbWFyeSBbcHJpbWFyeUtleV0gIT09IDAgPyBtc2dPYiBbcHJpbWFyeUtleV0gOiBudWxsO1xuICAgICAgICAgICAgLy8gZXhhbXBsZSB2b2lkIGh0bWwgdGFnIGhhcyB6ZXJvIGNvbnRlbnQsIHNvIGNvbnRlbnQgaXMgZm9yY2VkIHRvIG51bGxcblxuICAgICAgICByZXMucyA9IGF0dHJzT2I7XG4gICAgICAgIHJlcy5tID0gbWV0YU9iO1xuXG4gICAgfSAvLyBlbmQgaWYgKCFyZXMuaGFzT3duUHJvcGVydHkgKCdlcnInKSlcbiAgICBcbiAgICBcbiAgICByZXR1cm4gcmVzO1xuXG59OyAvLyBlbmQgUC5wYXJzZU1zZyBcblxuXG5cbiAgICAvLyBlbmQgUFVCTElDIEZ1bmN0aW9uc1xuXG5mLmluaXQgKCk7XG5cbnJldHVybiBQO1xuXG59O1xuXG5cblxuIl19
