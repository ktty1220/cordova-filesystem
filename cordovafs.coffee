###
# CordovaFileSystem v0.1.1
# (c) 2014 ktty1220
# License: MIT
###

class CordovaFileSystem
  constructor: (@root) ->
    @fs = window.requestFileSystem
    @PERSISTENT = LocalFileSystem?.PERSISTENT
    @flg =
      create: true
      exclusive: false
    @mkdir @root

  init: () =>
    new RSVP.Promise (res, rej) =>
      return rej new Error 'filesystem not found' unless @fs?
      @fs @PERSISTENT, 0, ((fileSystem) => res fileSystem), rej

  _gotDir: (fileSystem, dir, flg = @flg) =>
    new RSVP.Promise (res, rej) => fileSystem.root.getDirectory dir, flg, res, rej

  _removeDirectory: (dirEntry) =>
    new RSVP.Promise (res, rej) => dirEntry.removeRecursively res, rej

  _gotFile: (fileSystem, file, flg = @flg) =>
    new RSVP.Promise (res, rej) => fileSystem.root.getFile file, flg, res, rej

  _gotFileReader: (fileEntry) =>
    new RSVP.Promise (res, rej) => fileEntry.file res, rej

  _readFile: (file) =>
    new RSVP.Promise (res, rej) =>
      try
        reader = new FileReader()
        reader.onloadend = (ev) => res ev.target.result
        reader.readAsText file
      catch e
        rej e

  _gotFileWrite: (fileEntry) =>
    new RSVP.Promise (res, rej) => fileEntry.createWriter res, rej

  _writeFile: (writer, data) ->
    new RSVP.Promise (res, rej) =>
      try
        writer.onwriteend = res
        writer.write data
      catch e
        rej e

  _removeFile: (fileEntry) =>
    new RSVP.Promise (res, rej) => fileEntry.remove res, rej

  _fileList: (dirEntry) =>
    new RSVP.Promise (res, rej) =>
      dirReader = dirEntry.createReader()
      dirReader.readEntries res, rej

  read: (file, cb) =>
    if file.substr(0, 1) isnt '/'
      file = "#{@root}/#{file}"
    else
      file = file.substr 1
    @init()
    .then (fileSystem) => @_gotFile fileSystem, file, { create: false }
    .then (fileEntry) => @_gotFileReader fileEntry
    .then (file) => @_readFile file
    .then (data) => cb null, data
    .catch (ev) => cb(ev?.target?.error ? ev)

  write: (file, data, cb) =>
    file = "#{@root}/#{file}"
    @mkdir file, true, (err) =>
      return cb err if err?
      @init()
      .then (fileSystem) => @_gotFile fileSystem, file
      .then (fileEntry) => @_gotFileWrite fileEntry
      .then (writer) => @_writeFile writer, data
      .then () => cb()
      .catch (ev) => cb(ev?.target?.error ? ev)

  remove: (file, cb) =>
    file = "#{@root}/#{file}"
    @init()
    .then (fileSystem) => @_gotFile fileSystem, file, { create: false }
    .then (fileEntry) => @_removeFile fileEntry
    .then () => cb()
    .catch (err) => cb err

  fileExists: (file, cb) =>
    if file.substr(0, 1) isnt '/'
      file = "#{@root}/#{file}"
    else
      file = file.substr 1
    @init()
    .then (fileSystem) => @_gotFile fileSystem, file, { create: false }
    .then (fileEntry) => cb null
    .catch (err) => cb err

  dirExists: (dir, cb) =>
    dir = "#{@root}/#{dir}"
    @init()
    .then (fileSystem) => @_gotDir fileSystem, dir, { create: false }
    .then () => cb null
    .catch (err) => cb err

  mkdir: (dir, isFile, cb) =>
    if isFile instanceof Function
      cb = isFile
      isFile = false
    path = ''
    dirsp = dir.split('/')
    dirsp.pop() if isFile
    async.eachSeries dirsp, (item, next) =>
      path += '/' if path.length > 0
      path += item
      @init()
      .then (fileSystem) => @_gotDir fileSystem, path
      .then (dirEntry) => next()
      .catch (ev) => next(ev?.target?.error ? ev)
    , cb?()

  rmdir: (dir, cb) =>
    dir = "#{@root}/#{dir}"
    @init()
    .then (fileSystem) => @_gotDir fileSystem, dir, { create: false }
    .then (dirEntry) => @_removeDirectory dirEntry
    .then () => cb()
    .catch (ev) => cb(ev?.target?.error ? ev)

  list: (dir, cb) =>
    if dir.substr(0, 1) isnt '/'
      dir = "#{@root}/#{dir}"
    else
      dir = dir.substr 1
    @init()
    .then (fileSystem) => @_gotDir fileSystem, dir
    .then (dirEntry) => @_fileList dirEntry
    .then (entries) =>
      entries.sort (a, b) ->
        return 1 if not a.isDirectory and b.isDirectory
        return -1 if a.isDirectory and not b.isDirectory
        if a.name > b.name then 1 else -1
      cb null, entries
    .catch (ev) => cb(ev?.target?.error ? ev)

window.CordovaFileSystem = CordovaFileSystem
