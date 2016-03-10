/**
 * Headless Transmission Web Interface.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, phantom:true, indent:4 */
/* globals shell */
"use strict";

var utils = require('./utils'),
    Script = utils.Script(module.id, "Transmission");

// 10 sec interval
Script.prototype.millisec = 10000;

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    probe.log("["+exports.id+"] Loading "+exports.name+" with "+(exports.millisec/1000)+" second interval");
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Add torrent helper.
 *
 * If there is no sid (session id), login.
 *
 * @param    {Probe} probe Instance
 * @param    {Object[]} torrents Download objects
 * @param    {function} callback
 */
function addTorrent(probe, torrents, callback) {
    if (!exports.sid) {
        exports.login(probe, null, function () {
            exports.addTorrent(probe, torrents, callback);
        });
    } else {
        probe.log("["+exports.id+"] Adding "+torrents.length+" torrents");
        var info = function (i) {
            var url = 'http://127.0.0.1:9091/transmission/rpc',
                form = JSON.stringify({
                    'method': 'torrent-add',
                    'arguments': {
                        'paused': false,
                        'download-dir': shell.download.path,
                        'filename': torrents[i].filename
                    }
                }),
                headers = {
                    'Content-Type': 'json; charset=UTF-8',
                    'X-Transmission-Session-Id': exports.sid
                };
            probe.post({url:url, form:form, headers:headers}, function (error, args) {
                if (!error) {
                    var response = JSON.parse(args.body);
                    if (response.result === 'success') {
                        torrents[i].hash = (function () {
                            for (var x in response.arguments) for (var y in response.arguments[x]) if (y === 'hashString') return response.arguments[x][y];
                            return null;
                        })();
                        if (torrents[i].hash) {
                            i++;
                            if (i < torrents.length) {
                                info(i);
                            } else {
                                probe.length = torrents.length;
                                exports.progress(probe, torrents);
                                callback();
                            }
                        } else {
                            probe.error("["+exports.id+"] Add torrent failed\n"+JSON.stringify(response));
                        }
                    } else {
                        probe.error("["+exports.id+"] Add torrent failed\n"+JSON.stringify(response));
                    }
                } else if (error === 409) {
                    exports.login(probe, args.headers, function () {
                        exports.addTorrent(probe, torrents, callback);
                    });
                } else if (error) {
                    probe.error("["+exports.id+"] API endpoint "+url+" failed with "+error);
                }
            });
        };
        info(0);
    }
}
Script.prototype.addTorrent = addTorrent;

/**
 * Progress helper.
 *
 * If there is no sid (session id), login.
 * If there is no torrent list, retreive it.
 * If there are no torrent ids, find ids with infohash.
 * If there are no torrents, find torrents with ids.
 *
 * @param    {Probe} probe Instance
 * @param    {Object[]} torrents Download objects
 */
function progress(probe, torrents) {
    if (!exports.sid) {
        exports.login(probe, null, function () {
            exports.progress(probe, torrents);
        });
    } else if (!probe.list.length) {
        exports.torrentList(probe, function () {
            exports.progress(probe, torrents);
        });
    } else if (!probe.memoryid.length) {
        exports.findTorrentHash(probe, torrents, function (objects) {
            exports.progress(probe, objects);
        });
    } else {
        var total = 0;
        for (var i = 0; i < probe.list.length; i++) {
            var item = probe.list[i];
            for (var j = 0; j < probe.memoryid.length; j++) {
                var id = probe.memoryid[j];
                if (id === item.id) {
                    var percentDone = item.percentDone*100,
                        complete = percentDone >= 100;
                    if (complete || probe.sanity.time(probe, item)) {
                        probe.memoryid.splice(j, 1);
                        exports.removeTorrent(probe, item, !complete, function (object) {
                            if (object.percentDone*100 >= 100) probe.sanity.complete(probe, object);
                        });
                    } else {
                        total += percentDone;
                    }
                }
            }
        }
        probe.progress = parseInt((total+((probe.length-probe.memoryid.length)*100))/probe.length, 10);
        if (probe.progress < 100) {
            probe.log("["+exports.id+"] "+probe.length+" torrents at "+probe.progress+"%");
            probe.list = [];
            shell.setTimeout(function () {
                exports.progress(probe, torrents);
            }, exports.millisec);
        }
    }
}
Script.prototype.progress = progress;

/**
 * Remove torrent helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object} item Torrent item
 * @param    {boolean} del Delete file
 * @param    {function} callback
 */
function removeTorrent(probe, item, del, callback) {
    var id = item.id,
        name = item.name;
    probe.log("["+exports.id+"] Removing torrent"+(del ? " and file" : "")+" for "+name);
    var url = 'http://127.0.0.1:9091/transmission/rpc',
        form = JSON.stringify({
            'method': 'torrent-remove',
            'arguments': {
                'delete-local-data': del,
                'ids': [id]
            }
        }),
        headers = {
            'Content-Type': 'json; charset=UTF-8',
            'X-Transmission-Session-Id': exports.sid
        };
    probe.post({url:url, form:form, headers:headers}, function (error, args) {
        if (!error) {
            var response = JSON.parse(args.body);
            if (response.result === 'success') {
                callback(item);
            } else {
                probe.error("["+exports.id+"] Remove torrent failed\n"+JSON.stringify(response));
            }
        } else if (error === 409) {
            exports.login(probe, args.headers, function () {
                exports.removeTorrent(probe, item, del, callback);
            });
        } else if (error) {
            probe.error("["+exports.id+"] API endpoint "+url+" failed with "+error);
        }
    });
}
Script.prototype.removeTorrent = removeTorrent;

/**
 * Find torrent helper.
 *
 * @param    {Probe} probe Instance
 * @param    {Object[]} torrents Download objects
 * @param    {function} callback
 */
function findTorrentHash(probe, torrents, callback) {
    for (var i = 0; i < probe.list.length; i++) {
        var item = probe.list[i];
        for (var j = 0; j < torrents.length; j++) {
            var torrent = torrents[j],
                hash = torrent.hash.toLowerCase();
            if (hash === item.hashString.toLowerCase()) {
                probe.log("["+exports.id+"] Found torrent "+(j+1)+" of "+probe.length+" with infohash "+hash);
                if (probe.sanity.check(probe, item)) {
                    var id = item.id;
                    torrent.id = id;
                    probe.memoryid.push(id);
                } else {
                    exports.removeTorrent(probe, item, true, function (object) {
                    });
                }
            }
        }
    }
    if (probe.memoryid.length !== torrents.length) {
        probe.log("["+exports.id+"] Memory mismatch");
        probe.list = [];
        probe.memoryid = [];
        probe.exit();
    }
    callback(torrents);
}
Script.prototype.findTorrentHash = findTorrentHash;

/**
 * Torrent list helper.
 *
 * @param    {Probe} probe Instance
 * @param    {function} callback
 */
function torrentList(probe, callback) {
    var url = 'http://127.0.0.1:9091/transmission/rpc',
        form = JSON.stringify({
            'method': 'torrent-get',
            'arguments': {
                'fields': [
                    'id',
                    'addedDate',
                    'name',
                    'percentDone',
                    'hashString'
                ]
            }
        }),
        headers = {
            'Content-Type': 'json; charset=UTF-8',
            'X-Transmission-Session-Id': exports.sid
        };
    probe.post({url:url, form:form, headers:headers}, function (error, args) {
        if (!error) {
            var response = JSON.parse(args.body);
            if (response.result === 'success') {
                response.arguments.torrents.forEach(function (item) {
                    probe.list.push(item);
                });
                if (probe.list.length) {
                    callback();
                } else {
                    probe.log("["+exports.id+"] No torrents");
                    probe.exit();
                }
            } else {
                probe.error("["+exports.id+"] Torrent list failed\n"+JSON.stringify(response));
            }
        } else if (error === 409) {
            exports.login(probe, args.headers, function () {
                exports.torrentList(probe, callback);
            });
        } else if (error) {
            probe.error("["+exports.id+"] API endpoint "+url+" failed with "+error);
        }
    });
}
Script.prototype.torrentList = torrentList;

/**
 * Login helper.
 *
 * @param    {Probe} probe Instance
 * @param    {null|Object[]} headers
 * @param    {function} callback
 */
function login(probe, headers, callback) {
    probe.log("["+exports.id+"] Getting session id");
    if (!headers) {
        var url = 'http://127.0.0.1:9091/transmission/rpc',
            form = JSON.stringify({
                'method': 'session-get'
            });
        headers = {
            'Content-Type': 'json; charset=UTF-8',
            'X-Transmission-Session-Id': ''
        };
        probe.post({url:url, form:form, headers:headers}, function (error, args) {
            if (error === 409) {
                exports.login(probe, args.headers, callback);
            } else if (error) {
                probe.error("["+exports.id+"] API endpoint "+url+" failed with "+error);
            }
        });
    } else {
        exports.sid = headers['x-transmission-session-id'];
        callback();
    }
}
Script.prototype.login = login;

module.exports = exports = new Script();
