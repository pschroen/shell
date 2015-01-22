/**
 * Headless ezRSS.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(module.id, "ezRSS");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    var url = probe.search[probe.searchid]+'/search/index.php?show_name='+utils.searchText(probe)+'&mode=rss';
    probe.get({url:url}, function (error, args) {
        if (!error) {
            var response = (new DOMParser()).parseFromString(args.body, 'text/xml').getElementsByTagName('magnetURI'),
                results = [];
            if (response.constructor === Array) {
                response.forEach(function (item) {
                    var value = item.childNodes[0].nodeValue;
                    if ((new RegExp(utils.searchTextToPattern(probe), 'i')).test(value)) {
                        // Get name from dn
                        var match = /dn=(.*?)[&$]/i.exec(value);
                        if (match) results.push({
                            filename: value,
                            name: decodeURIComponent(match[1]).replace(/\+/g, '.').replace(/\./g, ' ')
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
            probe.error("["+exports.id+"] RSS endpoint "+url+" error: "+error);
        }
    });
    if (callback) callback();
}
Script.prototype.init = init;

module.exports = exports = new Script();