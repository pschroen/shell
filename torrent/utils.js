/**
 * Headless Torrent common utilities.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals shell */
"use strict";

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
    return utils.termsToPattern(utils.textToPattern(searchTextPattern(probe)));
}
Utils.prototype.searchTextToPattern = searchTextToPattern;

/**
 * Search text pattern.
 *
 * Replace spaces and dashes with any single character (.).
 * Single quotes are optional ('?).
 *
 * @param    {Probe} probe Instance
 * @returns  {string}
 */
function searchTextPattern(probe) {
    return text(probe).replace(/\s/g, '.').replace(/-/g, '.').replace(/'/g, '\'?');
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
    return shell.torrent.types[probe.item.type].quality.replace(/.([0-9]gb)$/, '');
}
Utils.prototype.quality = quality;

module.exports = exports = new Utils();
