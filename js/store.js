var dropbox = require('./dropbox');
var Q = require('q');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var cbfn = {};

eventEmitter.on('change', function (localEvt) {
  console.log('store changed', localEvt);
  cbfn(null, localEvt);
});

var store = {
  setStoreChangedListener: function (fn) {
    cbfn = fn;
  },
  setRemoteChangedListener: function (fn) {
    dropbox.addListener(fn);
  },

  events: {
    STORE: 'STORE',
    NEWS_ADDED: 'NEWS_ADDED',
    NEWS_REMOVED: 'NEWS_REMOVED',
    IGNORE_ADDED: 'IGNORE_ADDED',
    ALBUM_ADDED: 'ALBUM_ADDED',
    ALBUM_REMOVED: 'ALBUM_REMOVED'
  },

  // model to persist (local and remote)
  data: {
    news: [],
    artistAlbums: [],
    ignoreReleaseList: [],
    updatedAt: {}
  },

  auth: function () {
    return dropbox.authenticate();
  },

  // model
  getData: function () {
    // from dbx or ls
    var d = Q.defer();
    if (dropbox.isAuth()) {
      dropbox.get().then(function (data) {
        store.data = data;
        d.resolve();
        eventEmitter.emit('change', store.events.STORE);
      }).fail(function (err) {
        d.reject(err);
      });
    } else {
      var da = localStorage.getItem('WL-data');
      if (da) {
        store.data = JSON.parse(da);
      }
      d.resolve();
    }
    return d.promise;
  },

  save: function () {
    // save to dbx and ls
  },

  // access
  addNews: function (a) {
    var d = Q.defer();
    if (store.containsNews(a)) {
      d.reject(new Error('Already in list: ' + a));
    } else {
      store.data.news.push({
        "artist": a,
        "added": store.dformat()
      });
      eventEmitter.emit('change', store.events.NEWS_ADDED);
      d.resolve();
    }
    return d.promise;
  },
  rmNews: function (idx) {
    store.data.news.splice(idx, 1);
    eventEmitter.emit('change', store.events.NEWS_REMOVED);
  },
  addIgnore: function (href) {
    store.data.ignoreReleaseList.push(href);
    eventEmitter.emit('change', store.events.IGNORE_ADDED);
  },
  containsNews: function (a) {
    var n = store.data.news;
    for (var i = 0; i < n.length; i++) {
      if (a.toLowerCase() === n[i].artist.toLowerCase()) {
        return true;
      }
    }
    return false;
  },

  // access
  addArtistAlbum: function (ar, al) {
    var d = Q.defer();
    if (store.containsArtistAlbum(ar, al)) {
      d.reject(new Error('Already in list: ' + ar + ' - ' + al));
    } else {
      store.data.artistAlbums.push({
        "artist": ar,
        "album": al,
        "added": store.dformat()
      });
      eventEmitter.emit('change', store.events.ALBUM_ADDED);
      d.resolve();
    }
    return d.promise;
  },
  rmAristAlbum: function (idx) {
    store.data.artistAlbums.splice(idx, 1);
    eventEmitter.emit('change', store.events.ALBUM_REMOVED);
  },
  containsArtistAlbum: function (ar, al) {
    var n = store.data.artistAlbums;
    for (var i = 0; i < n.length; i++) {
      if (ar.toLowerCase() === n[i].artist.toLowerCase() && al.toLowerCase() === n[i].album.toLowerCase()) {
        return true;
      }
    }
    return false;
  },
  dformat: function (date) {
    if (!date) {
      date = new Date();
    }
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return yyyy + '-' + mm + '-' + dd;
  }

};
module.exports = store;
