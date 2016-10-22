/**
 * Headless Torrent Api.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals webpage, shell, ghost, $ */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent Api");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|Object} [load] Payload
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, load, callback) {
    probe.log("["+exports.id+"] Loading "+exports.name+" and getting token");
    var url = probe.search[probe.searchid]+'/pubapi_v2.php?get_token=get_token';
    probe.get({url:url}, function (error, args) {
        if (!error) {
            var response = JSON.parse(args.body);
            probe.log("["+exports.id+"] Searching for "+probe.item.text);
            url = probe.search[probe.searchid]+'/pubapi_v2.php?mode=search&category=14;48;17;44;45;47;42;46;18;41;4&search_string='+utils.searchText(probe)+'&token='+response.token;
            probe.get({url:url}, function (error, args) {
                if (!error) {
                    exports.parseResults(probe, JSON.parse(args.body), url);
                } else {
                    probe.error("["+exports.id+"] JSON endpoint "+url+" error: "+error);
                }
            });
        } else {
            probe.error("["+exports.id+"] JSON endpoint "+url+" error: "+error);
        }
    });
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Parse results helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} response
 * @param    {string} url
 */
function parseResults(probe, response, url) {
    exports.results = response.torrent_results;
    if (exports.results) {
        exports.box(probe, url);
    } else {
        probe.error("["+exports.id+"] No results");
    }
}
Script.prototype.parseResults = parseResults;

/**
 * Infobox helper.
 *
 * @param    {Probe} probe Instance
 * @param    {string} url
 */
function box(probe, url) {
    // Map types
    var keywords = {
            tvshow: ['Episodes'],
            movie: ['Movies'],
            other: ['XXX']
        },
        types = {};
    exports.results.forEach(function (item) {
        for (var y in keywords) {
            for (var i = 0; i < keywords[y].length; i++) {
                if ((new RegExp(keywords[y][i], 'i')).test(item.category)) {
                    if (!types[y]) types[y] = 0;
                    types[y]++;
                }
            }
        }
    });
    // Sort by most popular
    var keys = Object.keys(types).sort(function (a, b) {
        return types[b]-types[a];
    });
    var sorted = {};
    for (var x in keys) {
        var key = keys[x];
        sorted[key] = types[key];
    }
    types = sorted;
    // Build infoboxes
    var boxes = [],
        count = 0;
    for (var x in types) {
        if (count === 0) {
            boxes.push({
                fields: {
                    info: {
                        type: 'info',
                        title: probe.item.text+" ("+shell.torrent.types[x].name.toLowerCase()+")",
                        text: "",
                        credits: [{
                            title: exports.name,
                            href: url
                        }],
                        buttons: [{
                            label: "Escape (esc)"
                        }]
                    }
                }
            });
        }
        boxes.push({
            fields: {
                info: {
                    type: 'info',
                    title: probe.item.text+" ("+shell.torrent.types[x].name.toLowerCase()+")",
                    text: "",
                    credits: [],
                    buttons: [{
                        label: "Find torrent",
                        item: {
                            index: 0,
                            type: x
                        }
                    }]
                }
            }
        });
        count++;
    }
    if (boxes.length) {
        boxes.push({
            fields: {
                info: {
                    type: 'info',
                    title: probe.item.text+" (other)",
                    text: "",
                    credits: [],
                    buttons: [{
                        label: "Find torrent",
                        item: {
                            index: 0,
                            type: 'other'
                        }
                    }]
                }
            }
        });
        probe.item.infobox = {
            text: probe.item.text,
            index: 1,
            boxes: boxes
        };
        probe.item.index = 0;
        probe.item.type = boxes[1].fields.info.buttons[0].item.type;
        probe.log("["+exports.id+"] Infobox searching for "+probe.item.type+" "+shell.torrent.types[probe.item.type].quality);
        probe.config.init(probe);
    } else {
        probe.error("["+exports.id+"] No results");
    }
}
Script.prototype.box = box;

module.exports = exports = new Script();
