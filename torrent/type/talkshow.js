/**
 * Headless Torrent Talk show.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals fs, shell */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent Talk show");

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
 * @param    {Probe} probe Instance
 * @param    {WebPage} page Instance
 * @param    {Object[]} results Download objects
 */
function parseResults(probe, page, results) {
    // Page not needed
    if (page) page.close();
    probe.log("["+exports.id+"] Parsing results");
    // YYYY-MM-DD naming convention
    var pattern = new RegExp('(.*?).(\\d{4}).(\\d{2}).(\\d{2}))', 'i'),
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
            var title = match[2].replace(/\./g, ' '),
                year = parseInt(match[3], 10),
                month = parseInt(match[4], 10),
                day = parseInt(match[5], 10);
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
                            var y = parseInt(x[3], 10),
                                m = parseInt(x[4], 10),
                                d = parseInt(x[5], 10);
                            if (!shows[y]) shows[y] = [];
                            if (!shows[y][m]) shows[y][m] = [];
                            shows[y][m][d] = fullpath;
                        }
                    }
                });
                destfiles = destfiles.join('|');
            }
            // Add new shows
            if (!(shows[year] && shows[year][month] && shows[year][month][day])) {
                probe.log("["+exports.id+"] Torrent for "+name);
                item.dest = probe.memory.list[probe.item.text].dest;
                torrents.push(item);
                if (!shows[year]) shows[year] = [];
                if (!shows[year][month]) shows[year][month] = [];
                shows[year][month][day] = item.filename;
            }
        }
    });
    if (torrents.length) {
        if (probe.item.infobox) {
            // Forget destination
            probe.remember({dest:undefined});
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
            // Forget destination
            probe.remember({dest:undefined});
            probe.item.infobox.boxes[probe.item.infobox.index].fields.info.buttons = [{label:"Nothing new", item:{type:probe.item.type}}];
            probe.box("["+exports.id+"] Infobox");
        } else {
            probe.next("["+exports.id+"] Nothing new");
        }
    }
}
Script.prototype.parseResults = parseResults;

module.exports = exports = new Script();
