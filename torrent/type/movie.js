/**
 * Headless Torrent Movie.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals fs, shell */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent Movie");

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
    var item = probe.item.index && results[probe.item.index] ? results[probe.item.index] : (function () {
        // File size
        var result = null,
            size = /.([0-9]gb)$/.exec(shell.torrent.types[probe.item.type].quality);
        if (size) {
            size = utils.filesize(size[1]);
            for (var i = 0; i < results.length; i++) {
                if (results[i].size && utils.filesize(results[i].size) > size) {
                    result = results[i];
                    break;
                }
            }
        }
        return result ? result : results[0];
    })();
    // Add new movie
    var destfiles = fs.list(probe.memory.list[probe.item.text].dest || probe.remember({dest:shell.torrent.types[probe.item.type].dest}).dest).join('|');
    if (!(new RegExp('\\b'+utils.searchTextToPattern(probe)+'\\b', 'i')).test(destfiles)) {
        probe.log("["+exports.id+"] Torrent for "+item.name);
        if (probe.item.infobox) {
            probe.config.box(probe, [item]);
            probe.box("["+exports.id+"] Infobox");
        } else {
            probe.info.addTorrent(probe, [item], function () {
                probe.status = probe.item.type+' '+shell.torrent.types[probe.item.type].quality;
                probe.next("["+exports.id+"] Forking");
            });
        }
    } else {
        if (probe.item.infobox) {
            probe.item.infobox.boxes[probe.item.infobox.index].fields.info.buttons = [{label:"Nothing new", item:{type:probe.item.type}}];
            probe.box("["+exports.id+"] Infobox");
        } else {
            probe.next("["+exports.id+"] Nothing new");
        }
    }
}
Script.prototype.parseResults = parseResults;

module.exports = exports = new Script();
