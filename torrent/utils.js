/**
 * Headless Torrent common utilities.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('../../modules/utils'),
    Utils = utils.__Utils__(utils.Utils);

/**
 * Search text to pattern quality.
 *
 * Combines search text with quality terms.
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function searchTextToPatternQuality(probe) {
    "use strict";
    return utils.termsToPattern(utils.textToPattern(searchTextPattern(probe))+' '+quality(probe));
}
Utils.prototype.searchTextToPatternQuality = searchTextToPatternQuality;

/**
 * Search text to pattern.
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function searchTextToPattern(probe) {
    "use strict";
    return utils.termsToPattern(utils.textToPattern(searchTextPattern(probe)));
}
Utils.prototype.searchTextToPattern = searchTextToPattern;

/**
 * Search text pattern.
 *
 * Replace spaces and dashes with any single character (.).
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function searchTextPattern(probe) {
    "use strict";
    return text(probe).replace(/\s/g, '.').replace(/-/g, '.');
}
Utils.prototype.searchTextPattern = searchTextPattern;

/**
 * Search text quality.
 *
 * Combines search text with quality terms.
 * URI encode for query string searches.
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function searchTextQuality(probe) {
    "use strict";
    return encodeURIComponent(text(probe)+' '+quality(probe));
}
Utils.prototype.searchTextQuality = searchTextQuality;

/**
 * Search text.
 *
 * URI encode for query string searches.
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function searchText(probe) {
    "use strict";
    return encodeURIComponent(text(probe));
}
Utils.prototype.searchText = searchText;

/**
 * Search text filters.
 *
 * Only use search text part before comma (,).
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function text(probe) {
    "use strict";
    return probe.item.text.replace(/^(.*?),.*/, '$1');
}
Utils.prototype.text = text;

/**
 * Search quality filters.
 *
 * Strip file size from search quality.
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function quality(probe) {
    "use strict";
    return shell.torrent.types[probe.item.type].quality.replace(/.([0-9]gb)$/, '');
}
Utils.prototype.quality = quality;

module.exports = exports = new Utils();
