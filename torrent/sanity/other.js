/**
 * Headless Torrent Generic-sanity (other).
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals fs, shell */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent Generic-sanity (other)");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|Object} [load] Payload
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, load, callback) {
    probe.log("["+exports.id+"] Loading "+exports.name);
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Check time helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} item Torrent item
 * @returns  {boolean}
 */
function time(probe, item) {
    var addedDate = item.addedDate*1000, // Unix epoch
        name = item.name;
    // Time passed since added date must be less than list run millisec
    if (Date.now()-addedDate > shell.list.run) {
        probe.log("["+exports.id+"] Sanity check timelapse for "+name);
        probe.length = 0;
        // Last thread
        if (shell.threadid >= shell.threads.length) shell.next();
        return true;
    }
    return false;
}
Script.prototype.time = time;

/**
 * Check name helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} item Torrent item
 * @returns  {boolean}
 */
function check(probe, item) {
    var name = item.name;
    // Search pattern must be in name
    var match = (new RegExp(utils.searchTextToPatternQuality(probe), 'i')).exec(name);
    if (!match) {
        probe.log("["+exports.id+"] Sanity check mismatch for "+name);
        return false;
    }
    return true;
}
Script.prototype.check = check;

/**
 * Complete helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} item Torrent item
 * @param    {function} callback Optional
 */
function complete(probe, item, callback) {
    var name = item.name,
        source = shell.download.path+'/'+name,
        dest = probe.memory.list[probe.item.text].dest || item.dest;
    var cleanup = function () {
        probe.log("["+exports.id+"] Cleaning up");
        probe.exec({command:'rm "'+shell.download.path+'/'+name+'.fastresume"'}, function (error, args) {
            if (probe.progress >= 100) {
                probe.log("["+exports.id+"] "+probe.length+" torrents completed");
                probe.length = 0;
                // Last thread
                if (shell.threadid >= shell.threads.length) shell.next();
            }
            if (callback) callback(item);
        });
    };
    var move = function () {
        probe.log("["+exports.id+"] Moving "+name+" to "+dest+"/");
        if (!fs.isDirectory(dest)) {
            probe.log("["+exports.id+"] Making directory "+dest+"/");
            probe.exec({command:'mkdir -p "'+dest+'"'}, function (error, args) {
                move();
            });
        } else {
            probe.exec({command:'mv "'+source+'" "'+dest+'/"'}, function (error, args) {
                cleanup();
            });
        }
    };
    if (dest) {
        move();
    } else {
        cleanup();
    }
}
Script.prototype.complete = complete;

module.exports = exports = new Script();
