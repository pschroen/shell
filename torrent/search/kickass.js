/**
 * Headless KickassTorrents.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(module.id, "KickassTorrents");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    exports.results = null;
    var page = webpage.create();
    page.settings.userAgent = ghost.userAgent;
    page.settings.loadImages = false;
    var url = probe.search[probe.searchid]+'/usearch/'+utils.searchTextQuality(probe)+'/';
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
    "use strict";
    // Clone to make results writable
    exports.results = utils.clone(page.evaluate(function (pattern) {
        var results = [];
        $("a[href^='magnet:']").each(function () {
            var href = $(this).attr('href');
            if ((new RegExp(pattern, 'i')).test(href)) {
                results.push({
                    filename: href,
                    size: $(this).closest('td').next().text()
                });
            }
        });
        return results;
    }, utils.searchTextToPatternQuality(probe)));
    if (exports.results.length) {
        if (probe.item.infobox) probe.item.infobox.boxes[probe.item.infobox.index].fields.info.credits = [{title:exports.name, href:url}];
        // Get name from dn
        exports.results.forEach(function (item) {
            var match = /dn=(.*?)[&$]/i.exec(item.filename);
            if (match) item.name = decodeURIComponent(match[1]).replace(/\+/g, '.').replace(/\./g, ' ');
            item.size = utils.filesize(item.size);
        });
        try {
            probe.type.parseResults(probe, page, exports.results);
        } catch (err) {
            shell.error(err);
            shell.exit();
        }
    } else {
        probe.error("["+exports.id+"] No results");
    }
    page.close();
}
Script.prototype.parseResults = parseResults;

module.exports = exports = new Script();
