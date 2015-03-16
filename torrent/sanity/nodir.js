/**
 * Headless Torrent No directory.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(require('./other').Script, module.id, "Torrent No directory");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name);
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Complete helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} item Torrent item
 * @param    {function} callback Optional
 */
function complete(probe, item, callback) {
    "use strict";
    var name = item.name,
        source = shell.download.path+'/'+name,
        dest = probe.memory.list[probe.item.text].dest;
    var cleanup = function () {
        probe.log("["+exports.id+"] Cleaning up");
        probe.exec({command:'rm "'+shell.download.path+'/'+name+'.fastresume"'}, function (error, args) {
            if (probe.progress >= 100) {
                probe.log("["+exports.id+"] "+probe.length+" torrents completed");
                probe.length = 0;
                // Last thread
                if (shell.threadid >= shell.threads.length) shell.next();
            }
            if (callback) callback(item);
        });
    };
    var move = function () {
        probe.log("["+exports.id+"] Moving "+name+" to "+dest+"/");
        if (!fs.isDirectory(dest)) {
            probe.log("["+exports.id+"] Making directory "+dest+"/");
            probe.exec({command:'mkdir -p "'+dest+'"'}, function (error, args) {
                move();
            });
        } else if (fs.isDirectory(source)) {
            var files = [],
                list = fs.list(source);
            list.forEach(function (file) {
                var fullpath = source+'/'+file;
                if (fs.isFile(fullpath)) {
                    // Type keywords must be in filename
                    var match = (new RegExp(shell[probe.item.info].types[probe.item.type].keywords.replace(/,\s?/g, '|'), 'i')).exec(file);
                    if (match) files.push(fullpath);
                }
            });
            files = files.join('" "');
            probe.exec({command:'mv "'+files+'" "'+dest+'/" && rm -rf "'+source+'"'}, function (error, args) {
                cleanup();
            });
        } else {
            probe.exec({command:'mv "'+source+'" "'+dest+'/"'}, function (error, args) {
                cleanup();
            });
        }
    };
    if (dest) {
        move();
    } else {
        cleanup();
    }
}
Script.prototype.complete = complete;

module.exports = exports = new Script();
