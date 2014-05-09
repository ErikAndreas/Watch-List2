// check https://www.npmjs.org/package/browserify-shim for use as-is
// we're shimming this one
var Dropbox = require('./vendor/dropbox-datastores-1.0-latest');
// i.e this lib only works when require'd for browser use with browserify
// check e.g. dropbox-datastore-node on npm for node/server usage
var client = new Dropbox.Client({
  key: 'u76dx4vjx6bke01'
});
var Q = require('q');
var table;
var datastore;
var dropbox = {
  sendAuth: function () {
    client.authenticate();
  },
  // call this method on page loaded (after successful oath, redirect will lead to landing page)
  authenticate: function (cb) {
    var deferred = Q.defer();
    client.authenticate({
      interactive: false
    }, function (error, client) {
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(); // we could resolve w client?
      }
    });
    return deferred.promise.nodeify(cb);
  },
  // no need to expose this method
  getTable: function () {
    var d = Q.defer();
    if (!table) {
      console.log('will open');
      dropbox.getDS().then(function (ds) {
        table = ds.getTable('swl');
        d.resolve(table);
      }).fail(function (err) {
        d.reject(err);
      });
    } else {
      console.log('already got it');
      d.resolve(table);
    }
    return d.promise;
  },
  getDS: function () {
    var d = Q.defer();
    if (datastore) {
      d.resolve(datastore);
    } else {
      console.log('try open ds');
      var datastoreManager = client.getDatastoreManager();
      datastoreManager.openDefaultDatastore(function (error, ds) {
        if (error) {
          console.error('ds fail', error);
          d.reject(error);
        } else {
          console.log('ds open');
          datastore = ds;
          d.resolve(datastore);
        }
      });
    }
    return d.promise;
  },
  isAuth: function () {
    return client.isAuthenticated();
  },
  get: function () {
    return dropbox.getTable().then(function (t) {
      var rs = t.getOrInsert('1', {
        'data': '{"news":[],"artistAlbums":[],"ignoreReleaseList":[],"updatedAt":{}}'
      });
      var data = JSON.parse(rs.get('data'));
      console.log('get dropbox');
      //rs.deleteRecord();
      return data;
    });
  },
  set: function (data) {
    return dropbox.getTable().then(function (t) {
      var rs = t.get("1");
      rs.set('data', data);
      console.log('set dropbox');
    });
  },
  addListener: function (cb) {
    dropbox.getDS().then(function (ds) {
      ds.recordsChanged.addListener(cb);
      console.log('dbx listener added');
    });
  }
};
module.exports = dropbox;
