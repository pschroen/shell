/**
 * Headless Torrent TV show.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent TV show");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name);
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Parse results helper.
 *
 * @param    {Probe} probe Instance
 * @param    {WebPage} page Instance
 * @param    {Object[]} results Download objects
 */
function parseResults(probe, page, results) {
    "use strict";
    // Page not needed
    if (page) page.close();
    probe.log("["+exports.id+"] Parsing results");
    // S01E01, S01, 1x01 and 101 naming convention
    // With or without 'the ' .{0,4}
    // Strip season, episode and date from search text
    var pattern = new RegExp('^((.{0,4}'+utils.searchTextPattern(probe).replace(/^(.*?).s\d{2}.*/i, '$1')+').*?.s?(\\d{1,2})[Ex]?(\\d{2})?)', 'i'),
        items = [],
        shows = [],
        destfiles = [],
        torrents = [];
    // Specific index
    if (probe.item.index && results[probe.item.index]) results = [results[probe.item.index]];
    // Build shows
    results.forEach(function (item) {
        var name = item.name,
            match = pattern.exec(name);
        if (match) {
            var title = match[2],
                season = parseInt(match[3], 10),
                episode = match[4] ? parseInt(match[4], 10) : 0;
            // Get shows from destination based on first result
            if (destfiles.constructor === Array) {
                var dest = probe.memory.list[probe.item.text].dest || probe.remember({dest:shell.torrent.types[probe.item.type].dest+'/'+title}).dest,
                    destlist = fs.list(dest);
                destlist.forEach(function (file) {
                    var fullpath = dest+'/'+file;
                    if (fs.isFile(fullpath)) {
                        destfiles.push(file);
                        var x = pattern.exec(file);
                        if (x) {
                            var s = parseInt(x[3], 10),
                                e = x[4] ? parseInt(x[4], 10) : 0;
                            if (!shows[s]) shows[s] = [];
                            shows[s][e] = fullpath;
                        }
                    }
                });
                destfiles = destfiles.join('|');
            }
            // Add new shows
            if (!(shows[season] && shows[season][episode])) {
                probe.log("["+exports.id+","+season+"x"+episode+"] Torrent for "+name);
                torrents.push(item);
                if (!shows[season]) shows[season] = [];
                shows[season][episode] = item.filename;
            }
        }
    });
    if (torrents.length) {
        if (probe.item.infobox) {
            probe.config.box(probe, torrents);
            probe.box("["+exports.id+"] Infobox");
        } else {
            probe.info.addTorrent(probe, torrents, function () {
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
