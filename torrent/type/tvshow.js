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
    var pattern = new RegExp('(.*?).s?(\\d+)[Ex]?(\\d{2})?', 'i'),
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
            var title = match[1],
                season = match[2].length > 4 ? parseInt(match[2].substring(0, 1), 10) :
                    match[2].length > 3 ? parseInt(match[2].substring(0, 2), 10) :
                    match[2].length > 2 ? parseInt(match[2].substring(0, 1), 10) :
                    parseInt(match[2], 10),
                episode = match[3] ? parseInt(match[3], 10) :
                    match[2].length > 4 ? parseInt(match[2].substring(1, 2), 10) :
                    match[2].length > 3 ? parseInt(match[2].substring(2), 10) :
                    match[2].length > 2 ? parseInt(match[2].substring(1), 10) :
                    0;
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
                            var s = x[2].length > 4 ? parseInt(x[2].substring(0, 1), 10) :
                                    x[2].length > 3 ? parseInt(x[2].substring(0, 2), 10) :
                                    x[2].length > 2 ? parseInt(x[2].substring(0, 1), 10) :
                                    parseInt(x[2], 10),
                                e = x[3] ? parseInt(x[3], 10) :
                                    x[2].length > 4 ? parseInt(x[2].substring(1, 2), 10) :
                                    x[2].length > 3 ? parseInt(x[2].substring(2), 10) :
                                    x[2].length > 2 ? parseInt(x[2].substring(1), 10) :
                                    0;
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
