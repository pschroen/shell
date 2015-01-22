/**
 * Headless Torrent common utilities.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('../../modules/utils'),
    Utils = utils.__Utils__(utils.Utils);

/**
 * Terms to pattern.
 *
 * Lookahead and negated lookahead.
 * Alternatives can be specified in the terms.
 *
 * Example:  1080p x264|h264 -sbs
 * Output:   ^(?=.*(1080p))(?=.*(x264|h264))(?!.*(sbs))
 *
 * @param    {string} str Space delimited list of terms
 * @returns  {string}
 */
function termsToPattern(str) {
    "use strict";
    var out = '^',
        terms = str.split(' ');
    for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        if (/^-/.exec(term)) {
            out += '(?!.*('+term.substring(1)+'))';
        } else {
            out += '(?=.*('+term+'))';
        }
    }
    return out;
}
Utils.prototype.termsToPattern = termsToPattern;

/**
 * Text to pattern.
 *
 * Currently only greater than or equal to ranges are supported.
 * Greater than or equal to date, YYYY-MM-DD format.
 * Greater than or equal to integer.
 *
 * Example:  2014-02-28+
 * Output:   ([2-9][0-9][1-9][4-9].(02.[2-3][8-9]|[0-1][3-9].[0-3][1-9])|[2-9][0-9][1-9][5-9].[0-1][1-9].[0-3][1-9])
 *
 * Example:  s01+
 * Output:   s([0-9][1-9]|[1-9][0-9])
 *
 * @param    {string} str
 * @returns  {string}
 */
function textToPattern(str) {
    "use strict";
    var texts = str.split('.');
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        if (/\d{4}-\d{2}-\d{2}\+$/.test(text)) {
            var m = /(\d{4})-(\d{2})-(\d{2})/.exec(text),
                nextyear = (parseInt(m[1], 10)+1).toString(),
                nextmonth = (parseInt(m[2], 10)+1).toString();
            if (nextmonth.length < 2) {
                nextmonth = '0'+nextmonth;
            } else if (nextmonth === '13') {
                nextmonth = '01';
            }
            texts[i] = '(\
                ['+m[1][0]+'-9]['+m[1][1]+'-9]['+m[1][2]+'-9]['+m[1][3]+'-9].\
                ('+m[2][0]+m[2][1]+'.['+m[3][0]+'-3]['+m[3][1]+'-9]|['+nextmonth[0]+'-1]['+nextmonth[1]+'-9] [0-3][1-9])|\
                ['+nextyear[0]+'-9]['+nextyear[1]+'-9]['+nextyear[2]+'-9]['+nextyear[3]+'-9].\
                [0-1][1-9].[0-3][1-9]\
            )';
        } else if (/\d\+$/.test(text)) {
            var m = /(\d+)/.exec(text),
                number = m[1].replace(/(\d)/g, '[$1-9]'),
                next = ((parseInt(m[1][0], 10)+1).toString()+m[1].substring(1).replace(/(\d)/g, '0')).replace(/(\d)/g, '[$1-9]');
            texts[i] = text.replace(/(\d+\+)/g, '('+number+'|'+next+')');
        }
    }
    return texts.join('.');
}
Utils.prototype.textToPattern = textToPattern;

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
    return termsToPattern(textToPattern(searchTextPattern(probe))+' '+quality(probe));
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
    return textToPattern(searchTextPattern(probe));
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
    return probe.item.text.replace(/^(.*?),/, '$1');
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
