/**
 * Headless The Pirate Bay Proxy.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(require('./thepiratebay').Script, module.id, "The Pirate Bay Proxy");

module.exports = exports = new Script();
