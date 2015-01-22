/**
 * Headless isoHunt.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(module.id, "isoHunt");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    var url = probe.search[probe.searchid]+'/js/json.php?ihq='+utils.searchTextQuality(probe);
    probe.get({url:url}, function (error, args) {
        if (!error) {
            var response = JSON.parse(args.body),
                results = [];
            if (response.total_results) {
                response.items.list.forEach(function (item) {
                    if ((new RegExp(utils.searchTextToPattern(probe), 'i')).test(item.title)) {
                        results.push({
                            filename: item.enclosure_url,
                            name: item.title,
                            text: item.exempts,
                            size: item.length,
                            hash: item.hash
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
    if (callback) callback();
}
Script.prototype.init = init;

module.exports = exports = new Script();
