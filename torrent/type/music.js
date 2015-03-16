/**
 * Headless Torrent Music.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, node:true, phantom:true, indent:4
*/

// Use Torrent Generic-type (other)
var utils = require('./utils'),
    Script = utils.Script(require('./other').Script);

module.exports = exports = new Script();
