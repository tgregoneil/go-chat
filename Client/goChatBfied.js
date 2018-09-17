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

        if (v.wsServer.readState !== 1) {

            v.j2h ([
                {empty: v.IdUserDiv},
                {text: 'Hello: ' + v.user0 + '. Chat server not ready', parent: v.IdUserDiv}
            ]);
            

        } // end if (v.wsServer.readState !== 1)
        

        v.wsServer.onmessage = f.fromSrvr;

    });
};  // end f.init

//---------------------
f.fromSrvr = (event) => {
    
    var msg = JSON.parse (event.data);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlc19nbG9iYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnb0NoYXQuanMiLCJpbmRleDAuanMiLCIuLi9ub2RlX21vZHVsZXMvZ28tajJoL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2dvLW1zZy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gZ29DaGF0LmpzXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIFBSSVZBVEUgUHJvcGVydGllc1xudmFyIHYgPSB7XG5cbiAgICBqMmg6IHJlcXVpcmUgKCdnby1qMmgnKS5kaXNwbGF5T2IsXG4gICAgd3NTZXJ2ZXI6IG51bGwsXG4gICAgcG9ydDogMzQ1NixcblxuICAgIGlkVXNlck5hbWU6ICd1c2VyJyxcbiAgICBpZFVzZXJEaXY6ICd1c2VyZGl2JyxcbiAgICBpZFVzZXJGb3JtOiAndXNlcmZvcm0nLFxuICAgIGlkQ2hhdEZvcm06ICdjaGF0Zm9ybScsXG4gICAgaWRDaGF0Qm94OiAnY2hhdGJveCcsXG4gICAgaWRDaGF0TXNnOiAnY2hhdG1zZycsXG5cbiAgICBJZFVzZXJOYW1lOiBudWxsLFxuICAgIElkVXNlckRpdjogbnVsbCxcbiAgICBJZFVzZXJGb3JtOiBudWxsLFxuICAgIElkQ2hhdEZvcm06IG51bGwsXG4gICAgSWRDaGF0Qm94OiBudWxsLFxuICAgIElkQ2hhdE1zZzogbnVsbCxcblxuICAgIHVzZXJCYWRnZUlkeDogMCxcbiAgICB1c2VyQmFkZ2VzOiBbJ2JhZGdlLXByaW1hcnknLCAnYmFkZ2Utc2Vjb25kYXJ5JywgJ2JhZGdlLXN1Y2Nlc3MnLCAnYmFkZ2UtZGFuZ2VyJywgJ2JhZGdlLXdhcm5pbmcnLCAnYmFkZ2UtaW5mbycsICdiYWRnZS1kYXJrJ10sXG5cbiAgICB1c2VyU3lzdGVtOiAnU3lzdGVtJyxcbiAgICB1c2VyQXNzaWduZWQ6IHt9LFxuXG59OyAgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xuXG4gICAgLy8gUFJJVkFURSBGdW5jdGlvbnNcbmYgPSB7fTtcblxuXG5mLmluaXQgPSAoKSA9PiB7XG5cbiAgICAgICAgLy8gbWFrZSBqcXVlcnkgYWRkcmVzc2FibGUgc2VsZWN0b3JzXG4gICAgdi5JZFVzZXJOYW1lID0gZi5ta0lkICh2LmlkVXNlck5hbWUpO1xuICAgIHYuSWRVc2VyRGl2ID0gZi5ta0lkICh2LmlkVXNlckRpdik7XG4gICAgdi5JZFVzZXJGb3JtID0gZi5ta0lkICh2LmlkVXNlckZvcm0pO1xuICAgIHYuSWRDaGF0Rm9ybSA9IGYubWtJZCAodi5pZENoYXRGb3JtKTtcbiAgICB2LklkQ2hhdEJveCA9IGYubWtJZCAodi5pZENoYXRCb3gpO1xuICAgIHYuSWRDaGF0TXNnID0gZi5ta0lkICh2LmlkQ2hhdE1zZyk7XG5cbiAgICB2LnVzZXJBc3NpZ25lZC5TeXN0ZW0gPSAnYmFkZ2UtbGlnaHQnO1xuXG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgZGl2OiB7aDM6ICdDaGF0IHNlc3Npb24gd2l0aCBnby1jaGF0J30sIFxuICAgICAgICBjbGFzczogJ3RleHQtY2VudGVyJyxcbiAgICB9O1xuXG4gICAgdmFyIHVzZXIgPSB7XG4gICAgICAgIGRpdjoge1xuICAgICAgICAgICAgZm9ybTogW1xuICAgICAgICAgICAgICAgIHtsYWJlbDogJ1VzZXJuYW1lOid9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IDAsIFxuICAgICAgICAgICAgICAgICAgICBpZDogdi5pZFVzZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsIFxuICAgICAgICAgICAgICAgICAgICBjbGFzczogJ2Zvcm0tY29udHJvbCcsIFxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0VudGVyIFVzZXJuYW1lIHRvIGdldCBzdGFydGVkJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtidXR0b246ICdTdWJtaXQnLCB0eXBlOiAnc3VibWl0JywgY2xhc3M6ICdidG4gYnRuLXByaW1hcnknfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpZDogdi5pZFVzZXJGb3JtLFxuICAgICAgICAgICAgY2xhc3M6ICdmb3JtLWlubGluZScsXG4gICAgICAgIH0sIFxuICAgICAgICBpZDogdi5pZFVzZXJEaXYsXG4gICAgICAgIGNsYXNzOiAnZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXInLFxuICAgIH07XG5cbiAgICB2LmoyaCAoW2hlYWRlciwgdXNlcl0pO1xuXG4gICAgJCh2LklkVXNlckZvcm0pXG4gICAgLnN1Ym1pdCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHYudXNlcjAgPSAkKHYuSWRVc2VyTmFtZSkudmFsKCk7XG4gICAgICAgIHYudXNlcjAgPSB2LnVzZXIwLnJlcGxhY2UgKC9cXHMrL2csIFwiLVwiKTtcbiAgICAgICAgdmFyIHVybCA9IGRvY3VtZW50LlVSTDtcblxuICAgICAgICB2YXIgaXNIdHRwcyA9IGZhbHNlO1xuICAgICAgICB2YXIgZG9tYWluID0gJ2xvY2FsaG9zdCc7XG5cbiAgICAgICAgdmFyIG1hdGNoZWQgPSB1cmwubWF0Y2ggKC8oaHR0cHM/KTouLihbXlxcL10rKS8pO1xuICAgICAgICBpZiAobWF0Y2hlZCkge1xuXG4gICAgICAgICAgICBpc0h0dHBzID0gbWF0Y2hlZCBbMV0gPT09ICdodHRwcyc7XG4gICAgICAgICAgICBkb21haW4gPSBtYXRjaGVkIFsyXTtcblxuICAgICAgICB9IC8vIGVuZCBpZiAobWF0Y2hlZClcbiAgICAgICAgXG4gICAgICAgIHZhciBwcmVmaXggPSBpc0h0dHBzID8gJ3dzcycgOiAnd3MnO1xuXG4gICAgICAgIHZhciB1cmxXcyA9IHByZWZpeCArICc6Ly8nICsgZG9tYWluICsgJzonICsgdi5wb3J0O1xuICAgICAgICB2LndzU2VydmVyID0gbmV3IFdlYlNvY2tldCAodXJsV3MpO1xuXG4gICAgICAgIGlmICh2LndzU2VydmVyLnJlYWRTdGF0ZSAhPT0gMSkge1xuXG4gICAgICAgICAgICB2LmoyaCAoW1xuICAgICAgICAgICAgICAgIHtlbXB0eTogdi5JZFVzZXJEaXZ9LFxuICAgICAgICAgICAgICAgIHt0ZXh0OiAnSGVsbG86ICcgKyB2LnVzZXIwICsgJy4gQ2hhdCBzZXJ2ZXIgbm90IHJlYWR5JywgcGFyZW50OiB2LklkVXNlckRpdn1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgXG5cbiAgICAgICAgfSAvLyBlbmQgaWYgKHYud3NTZXJ2ZXIucmVhZFN0YXRlICE9PSAxKVxuICAgICAgICBcblxuICAgICAgICB2LndzU2VydmVyLm9ubWVzc2FnZSA9IGYuZnJvbVNydnI7XG5cbiAgICB9KTtcbn07ICAvLyBlbmQgZi5pbml0XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmZyb21TcnZyID0gKGV2ZW50KSA9PiB7XG4gICAgXG4gICAgdmFyIG1zZyA9IEpTT04ucGFyc2UgKGV2ZW50LmRhdGEpO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkgKG1zZykpIHtcblxuICAgICAgICBmb3IgKHZhciBpbSA9IDA7IGltIDwgbXNnLmxlbmd0aDsgaW0rKykge1xuXG4gICAgICAgICAgICBmLmZyb21TcnZyIChtc2cgW2ltXSk7XG5cbiAgICAgICAgfSAvLyBlbmQgZm9yICh2YXIgaW0gPSAwOyBpbSA8IG1zZy5sZW5ndGg7IGltKyspXG4gICAgICAgIFxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAobXNnLmhhc093blByb3BlcnR5ICgnZ2V0dXNlcicpKSB7XG4gICAgXG4gICAgICAgICAgICBmLnRvU3J2ciAoe3VzZXIwOiB2LnVzZXIwfSk7XG4gICAgXG4gICAgICAgIH0gZWxzZSBpZiAobXNnLmhhc093blByb3BlcnR5ICgnc2V0dXNlcicpKSB7XG4gICAgXG4gICAgICAgICAgICB2LnVzZXIgPSBtc2cuc2V0dXNlcjtcbiAgICBcbiAgICAgICAgICAgIHYuajJoIChbXG4gICAgICAgICAgICAgICAge2VtcHR5OiB2LklkVXNlckRpdn0sXG4gICAgICAgICAgICAgICAge3RleHQ6ICdXZWxjb21lICcgKyB2LnVzZXIsIHBhcmVudDogdi5JZFVzZXJEaXZ9XG4gICAgICAgICAgICBdKTtcbiAgICBcbiAgICAgICAgICAgIHZhciBjaGF0ID0ge1xuICAgICAgICAgICAgICAgIGRpdjogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXY6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogJ1N5c3RlbTonLCBjbGFzczogJ2JhZGdlIGJhZGdlLXBpbGwgYmFkZ2UtbGlnaHQnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogJyZuYnNwOyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiAnV2VsY29tZSB0byB0aGUgY2hhdCBzZXNzaW9uLCAnICsgdi51c2VyfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdi5pZENoYXRCb3gsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ21hcmdpbi10b3A6MzBweDtib3JkZXI6MXB4IHNvbGlkIGJsYWNrO2JvcmRlci1yYWRpdXM6IDVweDttYXgtaGVpZ2h0OiA0MDBweDtvdmVyZmxvdzogYXV0bzsnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpbnB1dDogMCwgaWQ6IHYuaWRDaGF0TXNnLCBzdHlsZTogJ3dpZHRoOiAxMDAlOycsIHR5cGU6ICd0ZXh0JywgYXV0b2ZvY3VzOiAnYXV0b2ZvY3VzJywgcGxhY2Vob2xkZXI6ICdFbnRlciBDaGF0IE1lc3NhZ2UnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YnV0dG9uOiAnU2VuZCcsIHR5cGU6ICdzdWJtaXQnLCBjbGFzczogJ2J0biBidG4tc3VjY2Vzcyd9XG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHYuaWRDaGF0Rm9ybSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY2xhc3M6ICdjb250YWluZXInLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICAgICB2LmoyaCAoY2hhdCk7XG4gICAgXG4gICAgICAgICAgICAkKHYuSWRDaGF0Rm9ybSlcbiAgICAgICAgICAgIC5zdWJtaXQgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0ICgpO1xuICAgICAgICAgICAgICAgIGYudG9TcnZyICh7XG4gICAgICAgICAgICAgICAgICAgIGNoYXRtc2c6ICQodi5JZENoYXRNc2cpLnZhbCgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgICAgICQodi5JZENoYXRNc2cpLnZhbCAoJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIH0gZWxzZSBpZiAobXNnLmhhc093blByb3BlcnR5ICgnZWNob21zZycpKSB7XG4gICAgXG4gICAgICAgICAgICB2YXIgZWNob21zZyA9IG1zZy5lY2hvbXNnO1xuICAgICAgICAgICAgdmFyIHVzZXIgPSBtc2cudXNlcjtcbiAgICAgICAgICAgIHZhciBiYWRnZSA9IGYuZ2V0QmFkZ2UgKHVzZXIpO1xuICAgIFxuICAgICAgICAgICAgaWYgKHVzZXIgPT09IHYudXNlclN5c3RlbSkge1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBtYXRjaGVkID0gZWNob21zZy5tYXRjaCAoL1VzZXIgKFxcUyspKC4qKS8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciB1c2VyT3RoZXIgPSBtYXRjaGVkIFsxXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhZGdlT3RoZXIgPSBmLmdldEJhZGdlICh1c2VyT3RoZXIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbXNnU3VmZml4ID0gbWF0Y2hlZCBbMl07XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGVjaG9tc2cgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogJ1VzZXInfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiAnJm5ic3A7J30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7c3BhbjogdXNlck90aGVyLCBjbGFzczogJ2JhZGdlIGJhZGdlLXBpbGwgJyArIGJhZGdlT3RoZXJ9LFxuICAgICAgICAgICAgICAgICAgICAgICAge3NwYW46ICcmbmJzcDsnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzcGFuOiBtc2dTdWZmaXh9XG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgXG4gICAgICAgICAgICAgICAgfSAvLyBlbmQgaWYgKG1hdGNoZWQpXG4gICAgXG4gICAgICAgICAgICB9IC8vIGVuZCBpZiAodXNlciA9PT0gdi51c2VyU3lzdGVtKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjaGF0TXNnID0ge2RpdjogW1xuICAgICAgICAgICAgICAgIHtzcGFuOiB1c2VyICsgJzonLCBjbGFzczogJ2JhZGdlIGJhZGdlLXBpbGwgJyArIGJhZGdlfSxcbiAgICAgICAgICAgICAgICB7c3BhbjogJyZuYnNwOyd9LFxuICAgICAgICAgICAgICAgIHtzcGFuOiBlY2hvbXNnfSxcbiAgICAgICAgICAgIF0sIHBhcmVudDogdi5JZENoYXRCb3h9O1xuICAgIFxuICAgICAgICAgICAgdi5qMmggKGNoYXRNc2cpXG5cbiAgICAgICAgICAgICAgICAvLyBzY3JvbGwgdG8gYm90dG9tIHNvIGxhc3QgbWVzc2FnZXMgYXJlIHRoZSBvbmVzIHZpc2libGVcbiAgICAgICAgICAgICAgICAvLyBwZXIgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzc0MjM0Ni91c2UtanF1ZXJ5LXRvLXNjcm9sbC10by10aGUtYm90dG9tLW9mLWEtZGl2LXdpdGgtbG90cy1vZi10ZXh0LzIyMjMyMzI4I2Fuc3dlci0yMjIzMjMyOFxuICAgICAgICAgICAgJCh2LklkQ2hhdEJveClcbiAgICAgICAgICAgIC5zY3JvbGxUb3AgKDFFMTApO1xuICAgIFxuICAgICAgICB9IC8vIGVuZCBpZiAobXNnLmhhc093blByb3BlcnR5ICgnZ2V0dXNlcicpKVxuXG4gICAgfSAvLyBlbmQgaWYgKEFycmF5LmlzQXJyYXkgKG1zZykpXG4gICAgXG4gICAgXG5cbn07IC8vIGVuZCBmLmZyb21TcnZyIFxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZi5nZXRCYWRnZSA9ICh1c2VyKSA9PiB7XG5cbiAgICB2YXIgYmFkZ2U7XG4gICAgaWYgKHYudXNlckFzc2lnbmVkLmhhc093blByb3BlcnR5ICh1c2VyKSkge1xuXG4gICAgICAgIGJhZGdlID0gdi51c2VyQXNzaWduZWQgW3VzZXJdO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBiYWRnZSA9IHYudXNlckJhZGdlcyBbdi51c2VyQmFkZ2VJZHhdO1xuICAgICAgICB2LnVzZXJCYWRnZUlkeCA9ICh2LnVzZXJCYWRnZUlkeCArIDEpICUgdi51c2VyQmFkZ2VzLmxlbmd0aDtcbiAgICAgICAgdi51c2VyQXNzaWduZWQgW3VzZXJdID0gYmFkZ2U7XG5cbiAgICB9IC8vIGVuZCBpZiAodi51c2VyQXNzaWduZWQuaGFzT3duUHJvcGVydHkgKG1zZy51c2VyKSlcblxuICAgIHJldHVybiBiYWRnZTtcblxufTsgLy8gZW5kIGYuZ2V0QmFkZ2UgXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYubWtJZCA9IChpZCkgPT4ge1xuICAgIFxuICAgIHJldHVybiAnIycgKyBpZDtcblxufTsgLy8gZW5kIGYubWtJZCBcblxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLnRvU3J2ciA9IChtc2cpID0+IHtcbiAgICBcbiAgICB2LndzU2VydmVyLnNlbmQgKEpTT04uc3RyaW5naWZ5IChtc2cpKTtcblxufTsgLy8gZW5kIGYudG9TcnZyIFxuXG5cblxuICAgIC8vIFBVQkxJQyBGdW5jdGlvbnNcbnZhciBQID0ge307XG5cbiAgICAvLyBlbmQgUFVCTElDIEZ1bmN0aW9uc1xuXG5mLmluaXQgKCk7XG5cbnJldHVybiBQO1xuXG59KCkpO1xuXG4iLCJcbi8vIGluZGV4MC5qc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuLy8gUFJJVkFURSBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciB2ID0ge1xufTsgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xudmFyIGY9e307XG5cbmYuaW5pdCA9ICgpID0+IHtcbiAgICBcbi8vICAgIHYud3MgPSBuZXcgdi53cyAoJ2xvY2FsaG9zdCcsIDI4MTkyLCBQLmRvQWN0aW9uLCBmYWxzZSk7XG4gICAgICAgIC8vIGlwLCBwb3J0LCBjbGllbnQsIGRvRW5jcnlwdGlvblxuXG4gICAgcmVxdWlyZSAoJy4vZ29DaGF0LmpzJyk7XG5cbn07IC8vIGVuZCBmLmluaXRcblxuLy8gUFVCTElDIFByb3BlcnRpZXMvTWV0aG9kc1xudmFyIFAgPSB7fTtcblxuLy8gZW5kIFBVQkxJQyBzZWN0aW9uXG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeSAoZi5pbml0KTtcblxufSkgKCk7XG5cblxuXG5yZXR1cm4gUDtcblxufSkgKCk7XG5cblxuXG5cblxuIiwiLy8gZ28tajJoL2luZGV4LmpzXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblxuLy8gUFJJVkFURSBQcm9wZXJ0aWVzL01ldGhvZHNcbnZhciB2ID0ge1xuXG4gICAgaWQ6IDAsXG4gICAgcHJpbWl0aXZlVHlwZXNOb3ROdWxsOiB7J3N0cmluZyc6MSwgJ251bWJlcic6MSwgJ2Jvb2xlYW4nOjEsICdzeW1ib2wnOiAxfSxcbiAgICAgICAgLy8gc2luY2UgdHlwZW9mIG51bGwgeWllbGRzICdvYmplY3QnLCBpdCdzIGhhbmRsZWQgc2VwYXJhdGVseVxuXG4gICAgbXNnVHlwZXM6IHtcblxuICAgICAgICBwcmltYXJ5OiB7XG4gICAgICAgICAgICAgICAgLy8gdm9pZCB0YWdzXG4gICAgICAgICAgICBhcmVhOiAwLCBiYXNlOiAwLCBicjogMCwgY29sOiAwLCBlbWJlZDogMCwgaHI6IDAsIGltZzogMCwgaW5wdXQ6IDAsIGtleWdlbjogMCwgbGluazogMCwgbWV0YTogMCwgcGFyYW06IDAsIHNvdXJjZTogMCwgdHJhY2s6IDAsIHdicjogMCwgXG5cbiAgICAgICAgICAgICAgICAvLyBub24tdm9pZCB0YWdzXG4gICAgICAgICAgICBhOiAxLCBhYmJyOiAxLCBhZGRyZXNzOiAxLCBhcnRpY2xlOiAxLCBhc2lkZTogMSwgYXVkaW86IDEsIGI6IDEsIGJkaTogMSwgYmRvOiAxLCBibG9ja3F1b3RlOiAxLCBib2R5OiAxLCBidXR0b246IDEsIGNhbnZhczogMSwgY2FwdGlvbjogMSwgY2l0ZTogMSwgY29kZTogMSwgY29sZ3JvdXA6IDEsIGRhdGFsaXN0OiAxLCBkZDogMSwgZGVsOiAxLCBkZXRhaWxzOiAxLCBkZm46IDEsIGRpYWxvZzogMSwgZGl2OiAxLCBkbDogMSwgZHQ6IDEsIGVtOiAxLCBmaWVsZHNldDogMSwgZmlnY2FwdGlvbjogMSwgZmlndXJlOiAxLCBmb290ZXI6IDEsIGZvcm06IDEsIGgxOiAxLCBoMjogMSwgaDM6IDEsIGg0OiAxLCBoNTogMSwgaDY6IDEsIGhlYWQ6IDEsIGhlYWRlcjogMSwgaGdyb3VwOiAxLCBodG1sOiAxLCBpOiAxLCBpZnJhbWU6IDEsIGluczogMSwga2JkOiAxLCBsYWJlbDogMSwgbGVnZW5kOiAxLCBsaTogMSwgbWFwOiAxLCBtYXJrOiAxLCBtZW51OiAxLCBtZXRlcjogMSwgbmF2OiAxLCBub3NjcmlwdDogMSwgb2JqZWN0OiAxLCBvbDogMSwgb3B0Z3JvdXA6IDEsIG9wdGlvbjogMSwgb3V0cHV0OiAxLCBwOiAxLCBwcmU6IDEsIHByb2dyZXNzOiAxLCBxOiAxLCBycDogMSwgcnQ6IDEsIHJ1Ynk6IDEsIHM6IDEsIHNhbXA6IDEsIHNjcmlwdDogMSwgc2VjdGlvbjogMSwgc2VsZWN0OiAxLCBzbWFsbDogMSwgc3BhbjogMSwgc3Ryb25nOiAxLCBzdHlsZTogMSwgc3ViOiAxLCBzdW1tYXJ5OiAxLCBzdXA6IDEsIHN2ZzogMSwgdGFibGU6IDEsIHRib2R5OiAxLCB0ZDogMSwgdGV4dGFyZWE6IDEsIHRmb290OiAxLCB0aDogMSwgdGhlYWQ6IDEsIHRpbWU6IDEsIHRpdGxlOiAxLCB0cjogMSwgdTogMSwgdWw6IDEsICd2YXInOiAxLCB2aWRlbzogMSxcbiAgICAgICAgfSxcblxuICAgICAgICBzZWNvbmRhcnk6IHtzdHlsZTogMX0sXG4gICAgICAgICAgICAvLyBlbGVtZW50cyB0aGF0IGNhbiBiZSBlaXRoZXIgYSBwcmltYXJ5IHRhZyBpdHNlbGYgb3IgYW4gYXR0cmlidXRlIG9mIGFub3RoZXIgcHJpbWFyeSB0YWdcbiAgICAgICAgICAgIC8vIGlmIGFueSBvdGhlciBwcmltYXJ5IHRhZ3MgaXMgcHJlc2VudCwgdGhlbiBzZWNvbmRhcnkgdGFncyBhcmUgdHJlYXRlZCBhc1xuICAgICAgICAgICAgLy8gYXR0cmlidXRlcyBvZiB0aGUgb3RoZXIgcHJpbWFyeSB0YWdcblxuICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgICBlbXB0eTogMSwgcm06IDEsIFxuICAgICAgICAgICAgcHJlcGVuZDogMSwgYXBwZW5kOiAxLCBiZWZvcmU6IDEsIGFmdGVyOiAxLCBwYXJlbnQ6IDEsXG4gICAgICAgICAgICBhdHRyOiAxLCBjb250ZW50OiAxLCB0ZXh0OiAxLCBcbiAgICAgICAgfSxcblxuICAgIH0sXG5cbiAgICBtc2cwOiByZXF1aXJlICgnZ28tbXNnJyksXG4gICAgbXNnOiBudWxsLFxuXG59OyAvLyBlbmQgUFJJVkFURSBwcm9wZXJ0aWVzXG52YXIgZj17fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYuaW5pdCA9ICgpID0+IHtcbiAgICBcbiAgICB2Lm1zZyA9IG5ldyB2Lm1zZzAgKHYubXNnVHlwZXMpO1xuXG59OyAvLyBlbmQgZi5pbml0XG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYuYXR0ciA9IChzZWxlY3RvciwgYXR0cikgPT4ge1xuICAgIFxuICAgICQoc2VsZWN0b3IpXG4gICAgLmF0dHIgKGF0dHIpO1xuXG59OyAvLyBlbmQgZi5hdHRyIFxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmVtcHR5ID0gKHNlbGVjdG9yKSA9PiB7XG4gICAgXG4gICAgJChzZWxlY3RvcilcbiAgICAuZW1wdHkgKClcbiAgICAub2ZmICgna2V5ZG93bicpO1xuXG59OyAvLyBlbmQgZi5lbXB0eSBcblxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLnJtID0gKHNlbGVjdG9yKSA9PiB7XG5cbiAgICAkKHNlbGVjdG9yKVxuICAgIC5yZW1vdmUgKCk7XG5cbn07IC8vIGVuZCBmLnJtXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmYuZGlzcGxheU9iSCA9IChwYXJlbnQsIGRpc3BPYikgPT4ge1xuICAgIFxuICAgICAgICAvLyAtLS0tICBkb0FycmF5IC0tLS1cbiAgICB2YXIgZG9BcnJheSA9IGZ1bmN0aW9uIChkaXNwT2IpIHtcblxuICAgICAgICB2YXIgSWRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzcE9iLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIElkcy5wdXNoIChmLmRpc3BsYXlPYkggKHBhcmVudCwgZGlzcE9iIFtpXSkpO1xuXG4gICAgICAgIH0gLy8gZW5kIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzcE9iLmxlbmd0aDsgaSsrKVxuXG4gICAgICAgIC8vcmV0dXJuIElkcztcbiAgICAgICAgcmV0dXJuIElkcyBbSWRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBcbiAgICB9OyAgLy8gZW5kIGRvQXJyYXkgXG5cbiAgICAgICAgLy8gLS0tLSAgZG9PYmplY3QgLS0tLVxuICAgIHZhciBkb09iamVjdCA9IGZ1bmN0aW9uIChkaXNwT2IpIHtcblxuICAgICAgICB2YXIgZGlzcE9iUGFyc2VkID0gdi5tc2cucGFyc2VNc2cgKGRpc3BPYik7XG5cbiAgICAgICAgdmFyIHByaW1hcnlLZXkgPSBkaXNwT2JQYXJzZWQucDtcblxuICAgICAgICB2YXIgbWV0YSA9IGRpc3BPYlBhcnNlZC5tO1xuXG4gICAgICAgIHZhciBkZWxLZXkgPSBudWxsO1xuICAgICAgICB2YXIgcmVsTG9jID0gJ2FwcGVuZCc7XG5cbiAgICAgICAgdmFyIGF0dHIgPSBudWxsO1xuICAgICAgICB2YXIgY29udGVudCA9IG51bGw7XG4gICAgICAgIHZhciB0ZXh0ID0gbnVsbDtcblxuICAgICAgICBpZiAobWV0YS5oYXNPd25Qcm9wZXJ0eSAoJ3BhcmVudCcpKSB7XG4gICAgICAgICAgICAvLyBlbnN1cmVzIHByb2Nlc3Npbmcgb2YgJ3BhcmVudCcgYmVmb3JlIHJlbWFpbmRlciBvZiBtZXRhIGtleXNcblxuICAgICAgICAgICAgcGFyZW50ID0gbWV0YS5wYXJlbnQ7XG4gICAgICAgICAgICBkZWxldGUgbWV0YS5wYXJlbnQ7XG5cbiAgICAgICAgfSAvLyBlbmQgaWYgKG1ldGEuaGFzT3duUHJvcGVydHkgKCdwYXJlbnQnKSlcbiAgICAgICAgXG4gICAgICAgIHZhciBtZXRhS2V5cyA9IE9iamVjdC5rZXlzIChtZXRhKTtcbiAgICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbWV0YUtleXMubGVuZ3RoOyBpZHgrKykge1xuXG4gICAgICAgICAgICB2YXIga2V5ID0gbWV0YUtleXMgW2lkeF07XG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnZW1wdHknOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3JtJzpcbiAgICAgICAgICAgICAgICAgICAgZGVsS2V5ID0ga2V5O1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBtZXRhIFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2F0dHInOlxuICAgICAgICAgICAgICAgICAgICBhdHRyID0gbWV0YS5hdHRyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQnOlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gbWV0YS5jb250ZW50O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IG1ldGEudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdwcmVwZW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdhcHBlbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2JlZm9yZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYWZ0ZXInOlxuICAgICAgICAgICAgICAgICAgICByZWxMb2MgPSBrZXk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBtZXRhIFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZG9QYXJlbnQgPSB2YWwgIT09IDEgJiYgdmFsICE9PSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBkb1BhcmVudCA/IHZhbCA6IHBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHZhbCBpcyBvdGhlciB0aGFuIDEgb3IgdHJ1ZSwgcmVsTG9jIG92ZXJyaWRlcyBib3RoIHBhcmVudCB2YWx1ZXMgcGFzc2VkIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50byBkaXNwbGF5T2JIIGFuZCBkZWZpbmVkIGJ5IG9wdGlvbmFsIHBhcmVudCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIH0gLy8gZW5kIHN3aXRjaCAoa2V5KVxuICAgICAgICAgICAgXG5cbiAgICAgICAgfSAvLyBlbmQgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbWV0YUtleXMubGVuZ3RoOyBpZHgrKylcbiAgICAgICAgXG5cbiAgICAgICAgSWQgPSBudWxsO1xuXG4gICAgICAgIGlmIChkZWxLZXkpIHtcblxuICAgICAgICAgICAgZiBbZGVsS2V5XSAocGFyZW50KTtcblxuICAgICAgICB9IGVsc2UgaWYgKGF0dHIpIHtcblxuICAgICAgICAgICAgZi5hdHRyIChwYXJlbnQsIGF0dHIpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgLy8gcmVwbGFjZXMgZW50aXJlIGNvbnRlbnQgb2YgcGFyZW50IHdpdGggbmV3IGNvbnRlbnRcblxuICAgICAgICAgICAgJChwYXJlbnQpXG4gICAgICAgICAgICAuZW1wdHkgKCk7XG5cbiAgICAgICAgICAgIGYuZGlzcGxheU9iSCAocGFyZW50LCBjb250ZW50KTtcbiAgICAgICAgICAgICAgICAvLyB3aXRob3V0IGVtcHR5aW5nIGZpcnN0LCB3aWxsIHNpbXBseSBhcHBlbmQgY29udGVudCB0byBleGlzdGluZyBjb250ZW50XG5cbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0KSB7XG5cbiAgICAgICAgICAgIElkID0gZi50ZXh0TWFrZSAocGFyZW50LCByZWxMb2MsIHRleHQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIElkID0gZi5lbGVtZW50TWFrZSAocGFyZW50LCByZWxMb2MsIHByaW1hcnlLZXksIGRpc3BPYlBhcnNlZC5jLCBkaXNwT2JQYXJzZWQucyk7XG5cbiAgICAgICAgfSAvLyBlbmQgaWYgKGRlbEtleSlcblxuICAgICAgICByZXR1cm4gSWQ7XG4gICAgICAgIFxuICAgIH07ICAvLyBlbmQgZG9PYmplY3QgXG5cblxuXG4gICAgICAgLy8gLS0tLSBtYWluIC0tLS1cbiAgICB2YXIgSWQ7XG4gICAgdmFyIGRpc3BPYlR5cGUgPSB0eXBlb2YgZGlzcE9iO1xuXG4gICAgaWYgKGRpc3BPYlR5cGUgPT09ICd1bmRlZmluZWQnIHx8IGRpc3BPYiA9PT0gMCB8fCBkaXNwT2IgPT09IG51bGwpIHtcblxuICAgICAgICBJZCA9IG51bGw7XG5cbiAgICB9IGVsc2UgaWYgKHYucHJpbWl0aXZlVHlwZXNOb3ROdWxsLmhhc093blByb3BlcnR5IChkaXNwT2JUeXBlKSkge1xuXG4gICAgICAgIElkID0gZi50ZXh0TWFrZSAocGFyZW50LCAnYXBwZW5kJywgZGlzcE9iKTtcbiAgICAgICAgICAgIC8vIGlmIHRleHQgc2hvdWxkIGJlIHBsYWNlZCBhdCBvdGhlciB0aGFuICdhcHBlbmQnIGxvY2F0aW9uLCB0aGVuIHVzZVxuICAgICAgICAgICAgLy8gJ3RleHQnIHRhZyBhbmQgc3BlY2lmeSBwcmVwZW5kLCBhZnRlciBvciBiZWZvcmUgYXMgbmVlZGVkXG5cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkgKGRpc3BPYikpIHtcblxuICAgICAgICBJZCA9IGRvQXJyYXkgKGRpc3BPYik7XG5cbiAgICB9IGVsc2UgaWYgKGRpc3BPYlR5cGUgPT0gJ29iamVjdCcpIHtcblxuICAgICAgICBJZCA9IGRvT2JqZWN0IChkaXNwT2IpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBJZCA9IG51bGw7XG5cbiAgICB9IC8vIGVuZCBpZiAodHlwZW9mIGRpc3BPYiA9PT0gJ3VuZGVmaW5lZCcgfHwgZGlzcE9iID09PSAwIHx8IGRpc3BPYiA9PT0gbnVsbClcbiAgICBcbiAgICByZXR1cm4gSWQ7XG5cbn07IC8vIGVuZCBmLmRpc3BsYXlPYkggXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLmVsZW1lbnRNYWtlID0gKHBhcmVudE9yU2libElkLCByZWxMb2MsIGVsTmFtZSwgY29udGVudCwgYXR0cnMpID0+IHtcbiAgICBcbiAgICB2YXIgaWQ7XG4gICAgdmFyIGF0dHJLZXlzID0gT2JqZWN0LmtleXMgKGF0dHJzKTtcbiAgICB2YXIgaGFzQXR0cnMgPSBhdHRyS2V5cy5sZW5ndGggPiAwO1xuXG4gICAgaWYgKGhhc0F0dHJzICYmIGF0dHJzLmhhc093blByb3BlcnR5ICgnaWQnKSkge1xuXG4gICAgICAgIGlkID0gYXR0cnMuaWQ7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlkID0gUC5nZW5JZCAoKTtcblxuICAgIH0gLy8gZW5kIGlmIChoYXNBdHRycylcbiAgICBcbiAgICB2YXIgSWQgPSAnIycgKyBpZDtcbiAgICBcbiAgICBpZiAoZWxOYW1lID09PSAnc2NyaXB0JyAmJiBjb250ZW50ICE9PSAwKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzk0MTM3MzcvaG93LXRvLWFwcGVuZC1zY3JpcHQtc2NyaXB0LWluLWphdmFzY3JpcHRcbiAgICAgICAgLy8gaW5zcGlyZWQgYnkgU08gcXVlc3Rpb24sIGJ1dCBzZXR0aW5nIGlubmVySFRNTCBpc24ndCBzdXBwb3NlZCB0byB3b3JrXG4gICAgICAgIC8vIHRoZXJlZm9yZSwgc2V0IHNyYyBhdHRyaWJ1dGUgd2l0aCBwYXRoIHRvIGZpbGUsIGluc3RlYWQgb2YgXG4gICAgICAgIC8vIHNldHRpbmcgaW5uZXJIVE1MIHRvIGNvbnRlbnQgb2YgZmlsZVxuXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzYxMDk5NS9jYW50LWFwcGVuZC1zY3JpcHQtZWxlbWVudFxuICAgICAgICAvLyBqUXVlcnkgd29uJ3QgYWRkIHNjcmlwdCBlbGVtZW50IGFzIGl0IGRvZXMgd2l0aCBhbnkgb3RoZXIgZWxlbWVudC4gIFRoZXJlZm9yZSwgbXVzdCBiZSBkb25lXG4gICAgICAgIC8vIHVzaW5nIG9ubHkgamF2YXNjcmlwdCBhcyBmb2xsb3dzOlxuICAgICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcblxuICAgICAgICBzY3JpcHQuc3JjID0gY29udGVudDtcbiAgICAgICAgc2NyaXB0LmlkID0gYXR0cnMuaWQ7XG4gICAgICAgIFxuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7ICAgICBcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIGRpdmVsID0gJzwnICsgZWxOYW1lICsgJyBpZD1cIicgKyBpZCArICdcIic7XG4gICAgXG4gICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgXG4gICAgICAgICAgICBkaXZlbCArPSAnPjwvJyArIGVsTmFtZSArICc+JztcbiAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICBcbiAgICAgICAgICAgIGRpdmVsICs9ICc+JztcbiAgICBcbiAgICAgICAgfSAvLyBlbmQgaWYgKGNvbnRlbnQpXG4gICAgXG4gICAgICAgICQocGFyZW50T3JTaWJsSWQpW3JlbExvY10gKGRpdmVsKTtcblxuICAgIH0gLy8gZW5kIGlmIChlbE5hbWUgPT09ICdzY3JpcHQnKVxuICAgIFxuICAgIFxuICAgIGlmIChoYXNBdHRycykge1xuICAgICAgICBcbiAgICAgICAgJChJZClcbiAgICAgICAgLmF0dHIgKGF0dHJzKTtcblxuICAgIH0gLy8gZW5kIGlmIChoYXNBdHRycylcblxuICAgIGYuZGlzcGxheU9iSCAoSWQsIGNvbnRlbnQpO1xuICAgIFxuICAgIGlmIChlbE5hbWUgPT09ICdmb3JtJykge1xuXG4gICAgICAgICQocGFyZW50KVxuICAgICAgICAuZm9jdXMgKCk7XG5cbiAgICB9IC8vIGVuZCBpZiAoZWxOYW1lID09PSAnZm9ybScpXG4gICAgXG4gICAgcmV0dXJuIElkO1xuXG59OyAvLyBlbmQgZi5lbGVtZW50TWFrZVxuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mLnRleHRNYWtlID0gKHBhcmVudCwgcmVsTG9jLCBwcmltaXRpdmUpID0+IHtcbiAgICBcbiAgICBpZiAodHlwZW9mIHByaW1pdGl2ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBzaW5nbGVxdW90ZSA9ICcmI3gwMDI3Oyc7XG4gICAgICAgIHZhciBiYWNrc2xhc2ggPSAnJiN4MDA1YzsnO1xuICAgICAgICB2YXIgZG91YmxlcXVvdGUgPSAnJiN4MDAyMjsnO1xuICAgICAgICB2YXIgbHQgPSAnJmx0Oyc7XG4gICAgICAgIFxuICAgICAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUucmVwbGFjZSAoLycvZywgc2luZ2xlcXVvdGUpO1xuICAgICAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUucmVwbGFjZSAoL1wiL2csIGRvdWJsZXF1b3RlKTtcbiAgICAgICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlLnJlcGxhY2UgKC9cXFxcL2csIGJhY2tzbGFzaCk7XG4gICAgICAgIHByaW1pdGl2ZSA9IHByaW1pdGl2ZS5yZXBsYWNlICgvPC9nLCBsdCk7XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcmltaXRpdmUgPT09ICdzeW1ib2wnKSB7XG5cbiAgICAgICAgcHJpbWl0aXZlID0gJ3N5bWJvbCc7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2Ugc3RyaW5naWZ5IHdvdWxkIHByb2R1Y2UgJ3t9JyB3aGljaCBpcyBsZXNzIHVzZWZ1bFxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBwcmltaXRpdmUgPSBKU09OLnN0cmluZ2lmeSAocHJpbWl0aXZlKTtcblxuICAgIH0gLy8gZW5kIGlmICh0eXBlb2YgcHJpbWl0aXZlID09PSAnc3RyaW5nJylcbiAgICBcblxuICAgICQocGFyZW50KSBbcmVsTG9jXSAocHJpbWl0aXZlKTtcblxuICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyB0ZXh0IG9icyBoYXZlIG5vIGlkJ3M6IG9ubHkgdGV4dCBpcyBhcHBlbmRlZCB3aXRoIG5vIHdheSB0byBhZGRyZXNzIGl0XG4gICAgICAgIC8vIGlmIGFkZHJlc3NpbmcgaXMgbmVjZXNzYXJ5LCB1c2Ugc3BhbiBpbnN0ZWFkIG9mIHRleHRcblxufTsgLy8gZW5kIGYudGV4dE1ha2UgXG5cblxuXG4vLyBQVUJMSUMgUHJvcGVydGllcy9NZXRob2RzXG52YXIgUCA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5kaXNwbGF5T2IgPSAoZGlzcE9iKSA9PiB7XG4gICAgXG4gICAgdmFyIHBhcmVudCA9ICdib2R5JztcbiAgICAgICAgLy8gaWYgcGFyZW50IG5vdCBmb3VuZCwgYXBwZW5kIHRvIGJvZHlcblxuICAgIGlmICh0eXBlb2YgZGlzcE9iID09PSAnb2JqZWN0JyAmJiBkaXNwT2IuaGFzT3duUHJvcGVydHkgKCdwYXJlbnQnKSkge1xuXG4gICAgICAgIHBhcmVudCA9IGRpc3BPYi5wYXJlbnQ7XG5cbiAgICB9IC8vIGVuZCBpZiAodHlwZW9mIGRpc3BPYiA9PT0gJ29iamVjdCcgJiYgZGlzcE9iLmhhc093blByb3BlcnR5ICgncGFyZW50JykpXG4gICAgXG4gICAgdmFyIElkID0gZi5kaXNwbGF5T2JIIChwYXJlbnQsIGRpc3BPYik7XG5cbiAgICByZXR1cm4gSWQ7XG5cbn07IC8vIGVuZCBQLmRpc3BsYXlPYiBcblxuUC5kaXNwbGF5UGFnZSA9IFAuZGlzcGxheU9iO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuUC5nZW5JZCA9ICgpID0+IHtcblxuICAgIHZhciBpZCA9ICdpJyArIHYuaWQrKztcbiAgICByZXR1cm4gaWQ7XG5cbn07IC8vIGVuZCBQLmdlbklkXG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblAuZ2VuSWRzID0gKCkgPT4ge1xuICAgIFxuICAgIHZhciBpZCA9IFAuZ2VuSWQgKCk7XG4gICAgdmFyIElkID0gJyMnICsgaWQ7XG5cbiAgICByZXR1cm4gW2lkLCBJZF07XG5cbn07IC8vIGVuZCBQLmdlbklkc1xuXG5cblxuLy8gZW5kIFBVQkxJQyBzZWN0aW9uXG5cbmYuaW5pdCAoKTtcblxucmV0dXJuIFA7XG5cbn0oKSk7XG5cblxuXG4iLCIvLyBnby1tc2cvaW5kZXguanNcbi8vIGdvLW1zZyBvYmplY3QgaGFzIGEgdW5pcXVlIHByaW1hcnkgbXNnIGFuZCB6ZXJvIG9yIG1vcmUgb3B0aW9uYWwgYXR0cmlidXRlc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHAwKSB7XG5cbiAgICAvLyBQUklWQVRFIFByb3BlcnRpZXNcbnZhciB2ID0ge1xuXG4gICAgcHJpbWFyeTogbnVsbCxcbiAgICAgICAgLy8gcHJpbWFyeToge2NtZDogMX0gKGNvbnRhaW5zIG9wdGlvbmFsIGNvbnRlbnQpIG9yIHtjbWQ6IDB9IChubyBvcHRpb25hbCBjb250ZW50IGFsbG93ZWQpXG5cbiAgICBzZWNvbmRhcnk6IG51bGwsXG4gICAgICAgIC8vIGlmIGEgcHJpbWFyeSBtZXNzYWdlIGhhcyBhbiBvcHRpb25hbCBhdHRyaWJ1dGUgdGhhdCBjb25jaWRlbnRhbGx5IGlzIHRoZSBzYW1lIGFzXG4gICAgICAgIC8vIGFub3RoZXIgcHJpbWFyeSBtZXNzYWdlLCBpdCBzaG91bGQgYmUgaGF2ZSBhIGtleS92YWx1ZSBwYWlyIGluIHNlY29uZGFyeSB7YXR0cjogMX1cbiAgICAgICAgLy8gdG8gZW5zdXJlIHRoYXQgaXQgd2lsbCBiZSB0cmVhdGVkIGFzIGFuIGF0dHJpYnV0ZSBpbiBjYXNlIGEgcHJpbWFyeSBpcyBwcmVzZW50XG4gICAgICAgIC8vIFNlY29uZGFyeSBpcyBvbmx5IHRlc3RlZCBpZiB0aGVyZSBleGlzdHMgYSBwcmltYXJ5IGtleVxuXG4gICAgbWV0YTogbnVsbCxcbiAgICAgICAgLy8gbWV0YSBwYXJhbWV0ZXJzIGludGVuZGVkIGZvciBjdHJsIG9yIG90aGVyIHB1cnBvc2Ugb3V0c2lkZSBvZiBwcmltYXJ5IGFuZCBzZWNvbmRhcnkgbXNnXG4gICAgICAgIC8vIHBhcmFtZXRlciB1c2FnZVxuXG59OyAgLy8gZW5kIFBSSVZBVEUgcHJvcGVydGllc1xuXG4gICAgLy8gUFJJVkFURSBGdW5jdGlvbnNcbmYgPSB7fTtcblxuXG5mLmluaXQgPSAoKSA9PiB7XG5cbiAgICB2LnByaW1hcnkgPSBwMC5wcmltYXJ5O1xuICAgIHYuc2Vjb25kYXJ5ID0gcDAuaGFzT3duUHJvcGVydHkgKCdzZWNvbmRhcnknKSA/IHAwLnNlY29uZGFyeSA6IHt9O1xuICAgIHYubWV0YSA9IHAwLmhhc093blByb3BlcnR5ICgnbWV0YScpID8gcDAubWV0YSA6IHt9O1xufTtcblxuICAgIC8vIFBVQkxJQyBGdW5jdGlvbnNcbnZhciBQID0ge307XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5QLnBhcnNlTXNnID0gKG1zZ09iKSA9PiB7XG4gICAgXG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIHZhciBtc2dLZXlzID0gT2JqZWN0LmtleXMgKG1zZ09iKTtcblxuICAgIHZhciBwcmltYXJ5Q2FuZGlkYXRlc09iID0ge307XG4gICAgdmFyIGF0dHJzT2IgPSB7fTtcbiAgICB2YXIgbWV0YU9iID0ge307XG5cbiAgICB2YXIga2V5O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXNnS2V5cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGtleSA9IG1zZ0tleXMgW2ldO1xuICAgICAgICBcbiAgICAgICAgaWYgKHYucHJpbWFyeS5oYXNPd25Qcm9wZXJ0eSAoa2V5KSkge1xuXG4gICAgICAgICAgICBwcmltYXJ5Q2FuZGlkYXRlc09iIFtrZXldID0gMTtcblxuICAgICAgICB9IGVsc2UgaWYgKHYubWV0YS5oYXNPd25Qcm9wZXJ0eSAoa2V5KSkge1xuXG4gICAgICAgICAgICBtZXRhT2IgW2tleV0gPSBtc2dPYiBba2V5XTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBhdHRyc09iIFtrZXldID0gbXNnT2IgW2tleV07XG5cbiAgICAgICAgfSAvLyBlbmQgaWYgKHYucHJpbWFyeS5oYXNPd25Qcm9wZXJ0eSAoa2V5KSlcbiAgICAgICAgXG4gICAgfSAvLyBlbmQgZm9yICh2YXIgaSA9IDA7IGkgPCBtc2dLZXlzLmxlbmd0aDsgaSsrKVxuXG4gICAgdmFyIHByaW1hcnlDYW5kaWRhdGVzQSA9IE9iamVjdC5rZXlzIChwcmltYXJ5Q2FuZGlkYXRlc09iKTtcblxuICAgIHZhciBwcmltYXJ5S2V5O1xuICAgIHZhciBjb250ZW50O1xuXG4gICAgaWYgKHByaW1hcnlDYW5kaWRhdGVzQS5sZW5ndGggPT09IDApIHtcblxuICAgICAgICBwcmltYXJ5S2V5ID0gbnVsbDtcblxuICAgIH0gZWxzZSBpZiAocHJpbWFyeUNhbmRpZGF0ZXNBLmxlbmd0aCA9PT0gMSkge1xuXG4gICAgICAgIHByaW1hcnlLZXkgPSBwcmltYXJ5Q2FuZGlkYXRlc0EgWzBdO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaGFuZGxlIHByaW1hcnkvc2Vjb25kYXJ5IGtleSByZXNvbHV0aW9uXG5cbiAgICAgICAgcHJpbWFyeUtleSA9IG51bGw7XG4gICAgICAgIGZvciAoa2V5IGluIHByaW1hcnlDYW5kaWRhdGVzT2IpIHtcblxuICAgICAgICAgICAgaWYgKHYuc2Vjb25kYXJ5Lmhhc093blByb3BlcnR5IChrZXkpKSB7XG5cbiAgICAgICAgICAgICAgICBhdHRyc09iIFtrZXldID0gbXNnT2IgW2tleV07XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJpbWFyeUtleSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXkgPSBrZXk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lcnIgPSAnTXVsdGlwbGUgcHJpbWFyeSBrZXlzIGZvdW5kIG5vdCBpbiBzZWNvbmRhcnkgb2JqZWN0OiAnICsgSlNPTi5zdHJpbmdpZnkgKG1zZyk7XG5cbiAgICAgICAgICAgICAgICB9IC8vIGVuZCBpZiAocHJpbWFyeUtleSA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgfSAvLyBlbmQgaWYgKHYuc2Vjb25kYXJ5Lmhhc093blByb3BlcnR5IChrZXkpKVxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgIH0gLy8gZW5kIGlmIChwcmltYXJ5Q2FuZGlkYXRlc0EubGVuZ3RoID09PSAwKVxuXG5cbiAgICBpZiAoIXJlcy5oYXNPd25Qcm9wZXJ0eSAoJ2VycicpKSB7XG5cbiAgICAgICAgcmVzLnAgPSBwcmltYXJ5S2V5O1xuICAgICAgICByZXMuYyA9IHByaW1hcnlLZXkgJiYgdi5wcmltYXJ5IFtwcmltYXJ5S2V5XSAhPT0gMCA/IG1zZ09iIFtwcmltYXJ5S2V5XSA6IG51bGw7XG4gICAgICAgICAgICAvLyBleGFtcGxlIHZvaWQgaHRtbCB0YWcgaGFzIHplcm8gY29udGVudCwgc28gY29udGVudCBpcyBmb3JjZWQgdG8gbnVsbFxuXG4gICAgICAgIHJlcy5zID0gYXR0cnNPYjtcbiAgICAgICAgcmVzLm0gPSBtZXRhT2I7XG5cbiAgICB9IC8vIGVuZCBpZiAoIXJlcy5oYXNPd25Qcm9wZXJ0eSAoJ2VycicpKVxuICAgIFxuICAgIFxuICAgIHJldHVybiByZXM7XG5cbn07IC8vIGVuZCBQLnBhcnNlTXNnIFxuXG5cblxuICAgIC8vIGVuZCBQVUJMSUMgRnVuY3Rpb25zXG5cbmYuaW5pdCAoKTtcblxucmV0dXJuIFA7XG5cbn07XG5cblxuXG4iXX0=
