/**
 * Created by madlord on 16/5/4.
 */
var colors = require('colors');
var path = require('path');
var recombiner = require('cortex-recombiner');

var _opt = {};
function recombine(opt) {
    return recombiner(opt);
}

function CortexRecombinerPlugin(options) {
    _opt = Object.assign({base: __dirname}, options)
}

CortexRecombinerPlugin.prototype.apply = function (compiler) {

    // recombine();
    compiler.plugin('watch-run', function (compiler, cb) {
        recombine(_opt).then(function (r) {
            console.log("cortex recombination complete [watch mode]".green);
            cb();
        }, function (error) {
            console.log("cortex recombination error [watch mode]".red);
            cb(error);
        });
    })

    compiler.plugin('run', function (compiler, cb) {
        recombine().then(function (r) {
            console.log("cortex recombination complete".green);
            cb();
        }, function (error) {
            console.log("cortex recombination error".red);
            cb(error);
        });
    })

    compiler.plugin("after-environment", function () {
        compiler.watchFileSystem = new IgnoringWatchFileSystem(compiler.watchFileSystem, [path.resolve(_opt.base, _opt['target_path'] || "./node_modules/@cortex/")]);
    }.bind(this));
};

function IgnoringWatchFileSystem(wfs, paths) {
    this.wfs = wfs;
    this.paths = paths;
}

IgnoringWatchFileSystem.prototype.watch = function (files, dirs, missing, startTime, options, callback, callbackUndelayed) {
    var ignored = function (path) {
        return this.paths.some(function (p) {
            return p instanceof RegExp ? p.test(path) : path.indexOf(p) === 0;
        });
    }.bind(this);

    var notIgnored = function (path) {
        return !ignored(path);
    };

    var ignoredFiles = files.filter(ignored);
    var ignoredDirs = dirs.filter(ignored);

    this.wfs.watch(files.filter(notIgnored), dirs.filter(notIgnored), missing, startTime, options, function (err, filesModified, dirsModified, missingModified, fileTimestamps, dirTimestamps) {
        if (err) return callback(err);

        ignoredFiles.forEach(function (path) {
            fileTimestamps[path] = 1;
        });

        ignoredDirs.forEach(function (path) {
            dirTimestamps[path] = 1;
        });

        callback(err, filesModified, dirsModified, missingModified, fileTimestamps, dirTimestamps);

    }, callbackUndelayed);
};

module.exports = CortexRecombinerPlugin;


