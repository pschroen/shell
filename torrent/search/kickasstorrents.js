/**
 * Headless KickassTorrents.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(require('./kickass').Script, module.id, "KickassTorrents");

module.exports = exports = new Script();
