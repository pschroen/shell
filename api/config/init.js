/**
 * Headless API Init.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals shell, user */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "API Init");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|Object} [load] Payload
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, load, callback) {
    probe.log("["+exports.id+"] Loading "+exports.name);
    probe.script = require(shell.path+'/users/'+user+'/apis/'+probe.item.text+'.js');
    probe.script.init(probe, load, function (out, type, stream) {
        callback(out, type, stream);
    });
}
Script.prototype.init = init;

module.exports = exports = new Script();
