/**
 * Headless EZTV.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals webpage, shell, ghost, $ */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "EZTV");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    probe.log("["+exports.id+"] Loading "+exports.name+" and searching for "+probe.item.text);
    exports.results = null;
    var page = webpage.create();
    page.settings.userAgent = ghost.userAgent;
    page.settings.loadImages = false;
    var url = probe.search[probe.searchid]+'/';
    page.onResourceError = function (resourceError) {
        page.errorString = resourceError.errorString;
        page.errorUrl = resourceError.url;
    };
    page.onLoadFinished = function (status) {
        if (status === 'success') {
            page.injectJs('lib/jquery.js');
            if (!exports.results) {
                exports.getResults(probe, page, url);
            } else {
                exports.parseResults(probe, page, url);
            }
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
 * Get results helper.
 *
 * @param    {Probe} probe Instance
 * @param    {WebPage} page Instance
 * @param    {string} url
 */
function getResults(probe, page, url) {
    exports.results = page.evaluate(function (text) {
        var results = false;
        $("form#searchsearch_submit select option").each(function () {
            if ((new RegExp('^'+text, 'i')).exec($(this).text())) {
                results = true;
                $('form#searchsearch_submit select').val($(this).val());
                $('form#searchsearch_submit').submit();
            }
        });
        return results;
    // Strip 'the ' and season from search text
    }, probe.item.text.replace(/^the\s/i, '').replace(/^(.*?).s\d{2}.*/i, '$1'));
    if (!exports.results) {
        page.close();
        probe.error("["+exports.id+"] No search results");
    }
}
Script.prototype.getResults = getResults;

/**
 * Parse results helper.
 *
 * @param    {Probe} probe Instance
 * @param    {WebPage} page Instance
 * @param    {string} url
 */
function parseResults(probe, page, url) {
    exports.results = page.evaluate(function (pattern) {
        var results = [];
        $("a[href^='magnet:']").each(function () {
            // Get name from dn
            var href = $(this).attr('href'),
                match = /dn=(.*?)[&$]/i.exec(href);
            if (match) if ((new RegExp(pattern, 'i')).test(match[1])) results.push({
                filename: href,
                name: decodeURIComponent(match[1]).replace(/\+/g, '.').replace(/\./g, ' ')
            });
        });
        return results;
    // Strip search text
    }, utils.termsToPattern(utils.termsToPattern(utils.textToPattern(probe.item.text.replace(/^(.*?).?(s\d+.*)?$/i, '$2'))+' '+utils.quality(probe))));
    if (exports.results.length) {
        if (probe.item.infobox) probe.item.infobox.boxes[probe.item.infobox.index].fields.info.credits = [{title:exports.name, href:url}];
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
