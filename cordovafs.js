// Generated by CoffeeScript 1.7.1

/*
 * CordovaFileSystem v0.1.0
 * (c) 2014 ktty1220
 * License: MIT
 */

(function() {
  var CordovaFileSystem,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CordovaFileSystem = (function() {
    function CordovaFileSystem(root) {
      this.root = root;
      this.list = __bind(this.list, this);
      this.rmdir = __bind(this.rmdir, this);
      this.mkdir = __bind(this.mkdir, this);
      this.dirExists = __bind(this.dirExists, this);
      this.fileExists = __bind(this.fileExists, this);
      this.remove = __bind(this.remove, this);
      this.write = __bind(this.write, this);
      this.read = __bind(this.read, this);
      this._fileList = __bind(this._fileList, this);
      this._removeFile = __bind(this._removeFile, this);
      this._gotFileWrite = __bind(this._gotFileWrite, this);
      this._readFile = __bind(this._readFile, this);
      this._gotFileReader = __bind(this._gotFileReader, this);
      this._gotFile = __bind(this._gotFile, this);
      this._removeDirectory = __bind(this._removeDirectory, this);
      this._gotDir = __bind(this._gotDir, this);
      this.init = __bind(this.init, this);
      this.fs = window.requestFileSystem;
      this.PERSISTENT = typeof LocalFileSystem !== "undefined" && LocalFileSystem !== null ? LocalFileSystem.PERSISTENT : void 0;
      this.flg = {
        create: true,
        exclusive: false
      };
      this.mkdir(this.root);
    }

    CordovaFileSystem.prototype.init = function() {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          if (_this.fs == null) {
            return rej(new Error('filesystem not found'));
          }
          return _this.fs(_this.PERSISTENT, 0, (function(fileSystem) {
            return res(fileSystem);
          }), rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._gotDir = function(fileSystem, dir, flg) {
      if (flg == null) {
        flg = this.flg;
      }
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          return fileSystem.root.getDirectory(dir, flg, res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._removeDirectory = function(dirEntry) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          return dirEntry.removeRecursively(res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._gotFile = function(fileSystem, file, flg) {
      if (flg == null) {
        flg = this.flg;
      }
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          return fileSystem.root.getFile(file, flg, res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._gotFileReader = function(fileEntry) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          return fileEntry.file(res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._readFile = function(file) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          var e, reader;
          try {
            reader = new FileReader();
            reader.onloadend = function(ev) {
              return res(ev.target.result);
            };
            return reader.readAsText(file);
          } catch (_error) {
            e = _error;
            return rej(e);
          }
        };
      })(this));
    };

    CordovaFileSystem.prototype._gotFileWrite = function(fileEntry) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          return fileEntry.createWriter(res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._writeFile = function(writer, data) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          var e;
          try {
            writer.onwriteend = res;
            return writer.write(data);
          } catch (_error) {
            e = _error;
            return rej(e);
          }
        };
      })(this));
    };

    CordovaFileSystem.prototype._removeFile = function(fileEntry) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          return fileEntry.remove(res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype._fileList = function(dirEntry) {
      return new RSVP.Promise((function(_this) {
        return function(res, rej) {
          var dirReader;
          dirReader = dirEntry.createReader();
          return dirReader.readEntries(res, rej);
        };
      })(this));
    };

    CordovaFileSystem.prototype.read = function(file, cb) {
      if (file.substr(0, 1) !== '/') {
        file = "" + this.root + "/" + file;
      } else {
        file = file.substr(1);
      }
      return this.init().then((function(_this) {
        return function(fileSystem) {
          return _this._gotFile(fileSystem, file, {
            create: false
          });
        };
      })(this)).then((function(_this) {
        return function(fileEntry) {
          return _this._gotFileReader(fileEntry);
        };
      })(this)).then((function(_this) {
        return function(file) {
          return _this._readFile(file);
        };
      })(this)).then((function(_this) {
        return function(data) {
          return cb(null, data);
        };
      })(this))["catch"]((function(_this) {
        return function(ev) {
          var _ref, _ref1;
          return cb((_ref = ev != null ? (_ref1 = ev.target) != null ? _ref1.error : void 0 : void 0) != null ? _ref : ev);
        };
      })(this));
    };

    CordovaFileSystem.prototype.write = function(file, data, cb) {
      file = "" + this.root + "/" + file;
      return this.mkdir(file, true, (function(_this) {
        return function(err) {
          if (err != null) {
            return cb(err);
          }
          return _this.init().then(function(fileSystem) {
            return _this._gotFile(fileSystem, file);
          }).then(function(fileEntry) {
            return _this._gotFileWrite(fileEntry);
          }).then(function(writer) {
            return _this._writeFile(writer, data);
          }).then(function() {
            return cb();
          })["catch"](function(ev) {
            var _ref, _ref1;
            return cb((_ref = ev != null ? (_ref1 = ev.target) != null ? _ref1.error : void 0 : void 0) != null ? _ref : ev);
          });
        };
      })(this));
    };

    CordovaFileSystem.prototype.remove = function(file, cb) {
      file = "" + this.root + "/" + file;
      return this.init().then((function(_this) {
        return function(fileSystem) {
          return _this._gotFile(fileSystem, file, {
            create: false
          });
        };
      })(this)).then((function(_this) {
        return function(fileEntry) {
          return _this._removeFile(fileEntry);
        };
      })(this)).then((function(_this) {
        return function() {
          return cb();
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          return cb(err);
        };
      })(this));
    };

    CordovaFileSystem.prototype.fileExists = function(file, cb) {
      if (file.substr(0, 1) !== '/') {
        file = "" + this.root + "/" + file;
      } else {
        file = file.substr(1);
      }
      return this.init().then((function(_this) {
        return function(fileSystem) {
          return _this._gotFile(fileSystem, file, {
            create: false
          });
        };
      })(this)).then((function(_this) {
        return function(fileEntry) {
          return cb(null);
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          return cb(err);
        };
      })(this));
    };

    CordovaFileSystem.prototype.dirExists = function(dir, cb) {
      dir = "" + this.root + "/" + dir;
      return this.init().then((function(_this) {
        return function(fileSystem) {
          return _this._gotDir(fileSystem, dir, {
            create: false
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return cb(null);
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          return cb(err);
        };
      })(this));
    };

    CordovaFileSystem.prototype.mkdir = function(dir, isFile, cb) {
      var dirsp, path;
      if (isFile instanceof Function) {
        cb = isFile;
        isFile = false;
      }
      path = '';
      dirsp = dir.split('/');
      if (isFile) {
        dirsp.pop();
      }
      return async.eachSeries(dirsp, (function(_this) {
        return function(item, next) {
          if (path.length > 0) {
            path += '/';
          }
          path += item;
          return _this.init().then(function(fileSystem) {
            return _this._gotDir(fileSystem, path);
          }).then(function(dirEntry) {
            return next();
          })["catch"](function(ev) {
            var _ref, _ref1;
            return next((_ref = ev != null ? (_ref1 = ev.target) != null ? _ref1.error : void 0 : void 0) != null ? _ref : ev);
          });
        };
      })(this), typeof cb === "function" ? cb() : void 0);
    };

    CordovaFileSystem.prototype.rmdir = function(dir, cb) {
      dir = "" + this.root + "/" + dir;
      return this.init().then((function(_this) {
        return function(fileSystem) {
          return _this._gotDir(fileSystem, dir, {
            create: false
          });
        };
      })(this)).then((function(_this) {
        return function(dirEntry) {
          return _this._removeDirectory(dirEntry);
        };
      })(this)).then((function(_this) {
        return function() {
          return cb();
        };
      })(this))["catch"]((function(_this) {
        return function(ev) {
          var _ref, _ref1;
          return cb((_ref = ev != null ? (_ref1 = ev.target) != null ? _ref1.error : void 0 : void 0) != null ? _ref : ev);
        };
      })(this));
    };

    CordovaFileSystem.prototype.list = function(dir, cb) {
      if (dir.substr(0, 1) !== '/') {
        dir = "" + this.root + "/" + dir;
      } else {
        dir = dir.substr(1);
      }
      return this.init().then((function(_this) {
        return function(fileSystem) {
          return _this._gotDir(fileSystem, dir);
        };
      })(this)).then((function(_this) {
        return function(dirEntry) {
          return _this._fileList(dirEntry);
        };
      })(this)).then((function(_this) {
        return function(entries) {
          entries.sort(function(a, b) {
            if (!a.isDirectory && b.isDirectory) {
              return 1;
            }
            if (a.isDirectory && !b.isDirectory) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            } else {
              return -1;
            }
          });
          return cb(null, entries);
        };
      })(this))["catch"]((function(_this) {
        return function(ev) {
          var _ref, _ref1;
          return cb((_ref = ev != null ? (_ref1 = ev.target) != null ? _ref1.error : void 0 : void 0) != null ? _ref : ev);
        };
      })(this));
    };

    return CordovaFileSystem;

  })();

  window.CordovaFileSystem = CordovaFileSystem;

}).call(this);
