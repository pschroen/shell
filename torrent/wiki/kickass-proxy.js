/**
 * Headless KickassTorrents Proxy.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(require('./kickass').Script, module.id, "KickassTorrents Proxy");

module.exports = exports = new Script();
