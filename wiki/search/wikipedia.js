/**
 * Headless Wikipedia.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, node:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(module.id, "Wikipedia");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    var url = probe.search[probe.searchid]+'/w/api.php?format=json&action=query&titles='+utils.searchText(probe)+'&prop=revisions|extracts&rvprop=content&continue';
    probe.get({url:url}, function (error, args) {
        if (!error) {
            exports.parseResults(probe, JSON.parse(args.body), url);
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
    "use strict";
    for (var x in response.query.pages) {
        var page = response.query.pages[x],
            title = page.title,
            revision = page.revisions[0]['*'],
            extract = page.extract,
            match = /#REDIRECT \[\[(.*?)\]\]/.exec(revision);
        if (match) {
            probe.log("["+exports.id+"] Redirecting to "+match[1]);
            probe.item.text = match[1];
            probe.reload();
        } else {
            probe.log("["+exports.id+"] Found page "+page.title);
            match = /<p>(.*?)<\/p>/.exec(extract);
            // Build infobox
            probe.item.infobox = {
                boxes: [{
                    fields: {
                        info: {
                            type: 'info',
                            title: page.title,
                            text: match[1],
                            credits: [{title:exports.name, href:url}]
                        }
                    }
                }]
            };
            probe.box("["+exports.id+"] Infobox");
        }
    }
}
Script.prototype.parseResults = parseResults;

module.exports = exports = new Script();
