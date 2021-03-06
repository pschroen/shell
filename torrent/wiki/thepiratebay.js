/**
 * Headless The Pirate Bay.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals webpage, shell, ghost, $ */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "The Pirate Bay");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|Object} [load] Payload
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, load, callback) {
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    exports.results = null;
    var page = webpage.create();
    page.settings.userAgent = ghost.userAgent;
    page.settings.loadImages = false;
    var url = probe.search[probe.searchid]+'/search/'+utils.searchText(probe);
    page.onResourceError = function (resourceError) {
        page.errorString = resourceError.errorString;
        page.errorUrl = resourceError.url;
    };
    page.onLoadFinished = function (status) {
        if (status === 'success') {
            page.injectJs('lib/jquery.js');
            exports.parseResults(probe, page, url);
        } else {
            page.close();
            probe.error("["+exports.id+"] Page endpoint "+page.errorUrl+" error: "+page.errorString);
        }
    };
    page.open(url);
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Parse results helper.
 *
 * @param    {Probe} probe Instance
 * @param    {WebPage} page Instance
 * @param    {string} url
 */
function parseResults(probe, page, url) {
    exports.results = page.evaluate(function () {
        var results = [];
        $("a[href^='/browse/']").each(function () {
            results.push($(this).attr('href'));
        });
        return results;
    });
    if (exports.results.length) {
        exports.box(probe, url);
    } else {
        probe.error("["+exports.id+"] No results");
    }
    page.close();
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
    var types = {};
    exports.results.forEach(function (item) {
        switch (item) {
            case '/browse/208': // HD - TV shows
            case '/browse/205': // TV shows
                if (!types.tvshow) types.tvshow = 0;
                types.tvshow++;
                break;
            case '/browse/207': // HD - Movies
            case '/browse/201': // Movies
                if (!types.movie) types.movie = 0;
                types.movie++;
                break;
            case '/browse/101': // Music
                if (!types.music) types.music = 0;
                types.music++;
                break;
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
