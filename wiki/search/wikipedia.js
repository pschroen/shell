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
 * @param    {undefined|initCallback|extractCallback} [callback]
 * @param    {undefined|boolean} [extract]
 */
function init(probe, callback, extract) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    var url = probe.search[probe.searchid]+'/w/api.php?format=json&action=query&titles='+utils.searchText(probe)+'&prop=revisions|extracts&rvprop=content&continue';
    probe.get({url:url}, function (error, args) {
        if (!error) {
/**
 * Extract callback.
 *
 * @callback extractCallback
 * @param    {undefined|Infobox} [box]
 */
            exports.parseResults(probe, JSON.parse(args.body), url, extract ? function (box) {
                callback(box);
            } : null);
        } else {
            probe.error("["+exports.id+"] JSON endpoint "+url+" error: "+error);
            if (extract) callback();
        }
    });
    if (callback && !extract) callback();
}
Script.prototype.init = init;

/**
 * Parse results helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} response
 * @param    {string} url
 * @param    {undefined|extractCallback} [callback]
 */
function parseResults(probe, response, url, callback) {
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
            probe.log("["+exports.id+"] Found page "+title);
            match = /<p>(.*?)<\/p>/.exec(extract);
            var box = {
                fields: {
                    info: {
                        type: 'info',
                        title: title,
                        text: match[1],
                        credits: [{
                            title: exports.name,
                            href: probe.search[probe.searchid]+'/wiki/'+title.replace(/\s/g, '_')
                        }],
                        buttons: [{
                            label: "Escape (esc)"
                        }]
                    }
                }
            };
            if (callback) {
                callback(box);
            } else {
                probe.item.infobox = {boxes:[box]};
                probe.box("["+exports.id+"] Infobox");
            }
        }
    }
}
Script.prototype.parseResults = parseResults;

module.exports = exports = new Script();
