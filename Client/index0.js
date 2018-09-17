#!/usr/bin/node
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





