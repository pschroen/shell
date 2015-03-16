/**
 * Headless Torrent Init.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, phantom:true, indent:4
*/

var utils = require('./utils'),
    Script = utils.Script(module.id, "Torrent Init");

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    probe.log("["+exports.id+"] Loading "+exports.name);
    // No type
    if (!probe.item.type) {
        // Wiki scripts
        probe.search = shell.torrent.wiki.split(/,\s?/g);
        probe.script = require(shell.path+'/shell/torrent/wiki/'+probe.search[probe.searchid].replace(/.*\//, '').replace(/(.*)\.(.*)\.(.*)/, '$2').replace(/(.*)\.(.*)/, '$1')+'.js');
        probe.script.init(probe);
    } else {
        // No infobox download action
        if (!(probe.item.infobox && probe.item.action === 'download' && probe.item.infobox.boxes[probe.item.infobox.index].data.torrents)) {
            // Search scripts
            probe.search = shell.torrent.types[probe.item.type].search.split(/,\s?/g);
            probe.script = require(shell.path+'/shell/torrent/search/'+probe.search[probe.searchid].replace(/.*\//, '').replace(/\..*/, '')+'.js');
            probe.script.init(probe, function () {
                // Type of media
                var fullpath = shell.path+'/shell/torrent/type/'+probe.item.type+'.js';
                if (!shell.exists(fullpath)) fullpath = shell.path+'/shell/torrent/type/other.js';
                probe.type = require(fullpath);
                probe.type.init(probe, function () {
                    // Torrent daemon
                    var fullpath = shell.path+'/shell/torrent/info/'+shell.torrent.info+'.js';
                    if (!shell.exists(fullpath)) fullpath = shell.path+'/shell/torrent/info/other.js';
                    probe.info = require(fullpath);
                    probe.info.init(probe, function () {
                        // Sanity checks and house cleaning
                        var fullpath = shell.path+'/shell/torrent/sanity/'+shell.torrent.types[probe.item.type].sanity+'.js';
                        if (!shell.exists(fullpath)) fullpath = shell.path+'/shell/torrent/sanity/other.js';
                        probe.sanity = require(fullpath);
                        probe.sanity.init(probe);
                    });
                });
            });
        } else {
            // Infobox download action
            var fullpath = shell.path+'/shell/torrent/info/'+shell.torrent.info+'.js';
            if (!shell.exists(fullpath)) fullpath = shell.path+'/shell/torrent/info/other.js';
            probe.info = require(fullpath);
            probe.info.init(probe, function () {
                var fullpath = shell.path+'/shell/torrent/sanity/'+shell.torrent.types[probe.item.type].sanity+'.js';
                if (!shell.exists(fullpath)) fullpath = shell.path+'/shell/torrent/sanity/other.js';
                probe.sanity = require(fullpath);
                probe.sanity.init(probe, function () {
                    var torrents = probe.item.infobox.boxes[probe.item.infobox.index].data.torrents;
                    // Specific index
                    if (torrents[probe.item.index]) torrents = [torrents[probe.item.index]];
                    probe.info.addTorrent(probe, torrents, function () {
                        // Cleanup
                        delete probe.item.infobox;
                        delete probe.item.action;
                        delete probe.item.index;
                        probe.merge();
                        // Next
                        probe.status = probe.item.type+' '+shell.torrent.types[probe.item.type].quality;
                        probe.next("["+exports.id+"] Forking from infobox");
                    });
                });
            });
        }
    }
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Infobox helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object[]} torrents Download objects
 */
function box(probe, torrents) {
    "use strict";
    var infobox = probe.item.infobox.boxes[probe.item.infobox.index];
    // Show first download object
    infobox.fields.info.title = torrents[0].name;
    infobox.fields.info.text = torrents[0].text;
    infobox.fields.info.buttons = [{
        label: "Download",
        item: {
            action: 'download',
            index: probe.item.index,
            type: probe.item.type
        }
    }];
    if (torrents.length > 1) {
        infobox.fields.info.buttons.push({
            label: "Download series",
            item: {
                action: 'download',
                index: -1,
                type: probe.item.type
            }
        });
    } else {
        infobox.fields.info.buttons.push({
            label: "Next torrent",
            item: {
                index: probe.item.index+1,
                type: probe.item.type
            }
        });
    }
    if (!infobox.data) infobox.data = {};
    infobox.data.torrents = torrents;
}
Script.prototype.box = box;

module.exports = exports = new Script();
