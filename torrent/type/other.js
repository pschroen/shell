/**
 * Headless Torrent Generic-type (other).
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals shell */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent Generic-type (other)");

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
 * Parse results helper.
 *
 * Currently only the first result is supported.
 *
 * @param    {Probe} probe Instance
 * @param    {WebPage} page Instance
 * @param    {Object[]} results Download objects
 */
function parseResults(probe, page, results) {
    // Page not needed
    if (page) page.close();
    probe.log("["+exports.id+"] Parsing results");
    // Specific index
    var item = probe.item.index && results[probe.item.index] ? results[probe.item.index] : results[0];
    // Remember destination
    probe.remember({dest:shell.torrent.types[probe.item.type].dest});
    // Any torrent
    probe.log("["+exports.id+"] Torrent for "+item.name);
    item.dest = probe.memory.list[probe.item.text].dest;
    if (probe.item.infobox) {
        // Forget destination
        probe.remember({dest:undefined});
        probe.config.box(probe, [item]);
        probe.box("["+exports.id+"] Infobox");
    } else {
        probe.info.addTorrent(probe, [item], function () {
            probe.status = probe.item.type+' '+shell.torrent.types[probe.item.type].quality;
            probe.next("["+exports.id+"] Forking");
        });
    }
}
Script.prototype.parseResults = parseResults;

module.exports = exports = new Script();
