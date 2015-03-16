/**
 * Headless Wiki search utilities.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, node:true, phantom:true, indent:4
*/

var utils = require('../utils'),
    Utils = utils.__Utils__(utils.Utils);

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
    return probe.item.text.replace(/^(.*?),/, '$1');
}
Utils.prototype.text = text;

module.exports = exports = new Utils();
