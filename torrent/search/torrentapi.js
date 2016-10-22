/**
 * Headless Torrent Api.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals shell */
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
                    var response = JSON.parse(args.body),
                        results = [];
                    if (response.torrent_results) {
                        response.torrent_results.forEach(function (item) {
                            if ((new RegExp(utils.searchTextToPatternQuality(probe), 'i')).test(item.filename)) {
                                results.push({
                                    filename: item.download,
                                    name: item.filename
                                });
                            }
                        });
                    }
                    if (results.length) {
                        if (probe.item.infobox) probe.item.infobox.boxes[probe.item.infobox.index].fields.info.credits = [{title:exports.name, href:url}];
                        try {
                            probe.type.parseResults(probe, null, results);
                        } catch (err) {
                            shell.error(err);
                            shell.exit();
                        }
                    } else {
                        probe.error("["+exports.id+"] No results");
                    }
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

module.exports = exports = new Script();
