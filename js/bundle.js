(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Ractive = require('ractive');
var fetcher = require('./fetcher');
var store = require('./store');
var dropbox = require('./dropbox');
var ractivedrop = require('./ractivedrop');
var spotify = require('./spotify');

//notifications
var notc = {
  r: {},
  nots: [],
  init: function () {
    notc.r = new Ractive({
      el: 'notificationsc',
      template: '#notifications',
      data: {
        nots: notc.nots
      }
    });
    console.log('nots init');
  },
  // {'msg':msg, 'type':level}
  add: function (m, l) {
    notc.nots.push({
      'msg': m,
      'type': l
    });
    window.setTimeout(function () {
      notc.nots.splice(0, 1);
    }, 3000);
  }
};

var nc = {
  rnews: {},
  setNews: function () {
    nc.rnews = new Ractive({
      //el: 'newscon',
      el: 'main',
      template: '#news',
      data: {
        news: [], //store.data.news,
        newsImgs: [], //fetcher.artistNewsModel.imgs,
        findings: [] //fetcher.artistNewsModel.artistNewsFindings
      }
    });

    nc.rnews.on({
      add: function () {
        store.addNews(nc.rnews.get('addnews')).then(function () {
          notc.add('Added ' + nc.rnews.get('addnews'), 'info');
          nc.rnews.set('addnews', '');
        }).fail(function (err) {
          console.log(err);
          notc.add(err.message, 'error');
        });
      },
      rm: function (evt) {
        evt.original.preventDefault();
        var idx = evt.node.getAttribute('data-index');
        console.log('rm at ' + idx);
        store.rmNews(idx);
        notc.add('Removed', 'info');

      }
    });
    console.log('setNews complete');
  },
  populate: function () {
    console.log('start pop news');
    mc.rmenu.set('loading', true);
    nc.rnews.set('news', store.data.news);
    fetcher.populateNews(store.data.news, store.data.ignoreReleaseList, function () {      
      nc.rnews.set('newsImgs', fetcher.artistNewsModel.imgs);
      nc.rnews.set('findings', fetcher.artistNewsModel.artistNewsFindings);
      mc.rmenu.set('loading', false);
      console.log('pop news');
    });
  },
  addNews: function (artist) {
    store.addNews(artist).then(function () {
      notc.add('Added ' + artist, 'info');
    }).fail(function (err) {
      console.log(err);
      notc.add(err.message, 'error');
    });
  }
};

var aac = {
  ralbums: {},
  setAA: function () {
    aac.ralbums = new Ractive({
      //el: 'albumscon',
      el: 'main',
      template: '#albums',
      data: {
        albums: store.data.artistAlbums,
        albumImgs: fetcher.artistAlbumModel.imgs,
        findings: fetcher.artistAlbumModel.artistAlbumsFindings
      }
    });

    aac.ralbums.on({
      add: function () {
        store.addArtistAlbum(aac.ralbums.get('addartist'), aac.ralbums.get('addalbum')).then(function () {
          notc.add('Added ' + nc.rnews.get('addnews') + ' - ' + nc.rnews.get('addalbum'), 'info');
          aac.ralbums.set('addartist', '');
          aac.ralbums.set('addalbum', '');
        }).fail(function (err) {
          console.log(err);
        });
      },
      rm: function (evt) {
        evt.original.preventDefault();
        var idx = evt.node.getAttribute('data-index');
        console.log('rm at ' + idx);
        notc.add('Removed', 'info');
        store.rmAristAlbum(idx);
      }
    });
    console.log('setAA complete');
  },
  populate: function () {
    console.log('start pop AA');
    mc.rmenu.set('loading', true);
    aac.ralbums.set('albums', store.data.artistAlbums);
    fetcher.populateArtistAlbums(store.data.artistAlbums, function () {      
      aac.ralbums.set('albumImgs', fetcher.artistAlbumModel.imgs);
      aac.ralbums.set('findings', fetcher.artistAlbumModel.artistAlbumsFindings);
      mc.rmenu.set('loading', false);
      console.log('pop ralbums');
    });
  }
};

var lfmc = {
  rlfm: {},
  setLastFM: function () {
    lfmc.rlfm = new Ractive({
      //el: 'lfmcon',
      el: 'main',
      template: '#lfm',
      data: {
        albumsOn: [],
        albumsSuggs: [],
        lastfmusername: ''
      }
    });

    lfmc.rlfm.on('setlfmun', function () {
      console.log(lfmc.rlfm.get('lastfmusername'));
    });

    lfmc.rlfm.on('addAA', function (evt) {
      evt.original.preventDefault();
      console.log('add', evt.node.getAttribute('data-artist'), evt.node.getAttribute('data-album'));
    });
  },
  populate: function () {
    mc.rmenu.set('loading', true);
    fetcher.getSuggsOnSpot('saerdnakire').then(function (onSuggs) {
      lfmc.rlfm.set('albumsOn', onSuggs.onspot);
      lfmc.rlfm.set('albumsSuggs', onSuggs.suggs);
      mc.rmenu.set('loading', false);
    }).fail(function (err) {
      console.log(err);
    });
  }
};

var sc = {
  rs: {},
  set: function () {
    sc.rs = new Ractive({
      el: 'main',
      template: '#settings',
      data: {
        exportdata: JSON.stringify(store.data),
        importdata: '',
        conBtnTxt: dropbox.isAuth() ? 'Connected' : 'Connect'
      }
    });

    sc.rs.on({
      connect: function () {
        dropbox.sendAuth();
      },
      importData: function () {
        console.log(sc.rs.get('importdata'));
      },
      dragExport: function (evt) {
        evt.node.focus();
        evt.node.select();
        evt.node.draggable = true;
        evt.node.addEventListener('dragstart', function (e) {
          var d = store.dformat();
          //console.log(evt.node.value);
          e.dataTransfer.setData("DownloadURL", "text/plain; charset=UTF-8:WatchList.backup." + d + ".txt:data:image/png;base64," + btoa(window.unescape(encodeURIComponent(evt.node.value))));
        });
      },
      filedrop: function (evt) {
        sc.rs.set('importdata', evt.contents);
      }
    });
  }
};

var mc = {
  rmenu: {},
  set: function () {
    mc.rmenu = new Ractive({
      el: 'menu',
      template: '#menutpl',
      data: {
        active: '',
        loading: false
      }
    });

    mc.rmenu.on('filedrop', function (evt) {
      console.log(evt.contents);
      var fc = evt.contents;
      var uri = fc.substring(fc.lastIndexOf('/') + 1);
      spotify.lookup('spotify:artist:' + uri).then(function (res) {
        console.log(res);
        nc.addNews(res.artist);
      }).fail(function (err) {
        console.log(err);
      });
    });
  }
};

module.exports.nc = nc;
module.exports.aac = aac;
module.exports.lfmc = lfmc;
module.exports.sc = sc;
module.exports.notc = notc;
module.exports.mc = mc;

},{"./dropbox":2,"./fetcher":3,"./ractivedrop":6,"./spotify":7,"./store":8,"ractive":17}],2:[function(require,module,exports){
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

},{"./vendor/dropbox-datastores-1.0-latest":9,"q":16}],3:[function(require,module,exports){
var spotify = require('./spotify');
var lastfm = require('./lastfm');
var Q = require('q');

var fetcher = {
  // in-memory model
  artistNewsModel: {
    /*news: {},
    ignoreReleaseList: {},*/
    imgs: [],
    artistNewsFindings: []
  },
  // in-memory model
  artistAlbumModel: {
    /*artistAlbums: [],*/
    imgs: [],
    artistAlbumsFindings: []
  },
  populateNews: function (news, ignoreReleaseList, cb) {
    var tot = news.length;
    var cnt = 0;
    fetcher.artistNewsModel.imgs = [];
    fetcher.artistNewsModel.artistNewsFindings = [];
    for (var i = 0; i < news.length; i++) {
      spotify.searchNews(news[i].artist, ignoreReleaseList, i).then(function (finding) {
        if (finding.findings && finding.findings.length > 0) {
          fetcher.artistNewsModel.imgs[finding.ref] = 'img/spotify32bw.png';
          for (var j = 0; j < finding.findings.length; j++) {
            if (j > 0) {
              tot++;
            }
            console.log('will push', finding.findings);
            fetcher.artistNewsModel.artistNewsFindings.push(finding.findings[j]);
            console.log('pushed');
            lastfm.albumCover('00198b31b392d0750f88819830e49680', finding.findings[j].artist, finding.findings[j].album, fetcher.artistNewsModel.artistNewsFindings.length).then(function (img) {
              if (img.img && img.img.length > 0) {
                fetcher.artistNewsModel.artistNewsFindings[img.ref - 1].img = img.img;
              }
              cnt++;
              console.log(cnt, tot);
              if (tot === cnt) {
                cb();
              }
            }).fail(function (err) {
              console.log('lfm', err);
            });
          }
        } else {
          fetcher.artistNewsModel.imgs[finding.ref] = 'img/delete-32.png';
          cnt++;
          if (tot === cnt) {
            cb();
          }
        }
      }).fail(function (err) {
        console.error(err);
      });
    }
  },
  populateArtistAlbums: function (albums, cb) {
    var tot = albums.length;
    var cnt = 0;
    fetcher.artistAlbumModel.imgs = [];
    fetcher.artistAlbumModel.artistAlbumsFindings = [];
    for (var i = 0; i < albums.length; i++) {
      spotify.searchArtistAlbum(albums[i], i).then(function (finding) {
        if (finding.findings && finding.findings.length > 0) {
          fetcher.artistAlbumModel.imgs[finding.ref] = 'img/spotify32bw.png';
          for (var j = 0; j < finding.findings.length; j++) {
            if (j > 0) {
              tot++;
            }
            fetcher.artistAlbumModel.artistAlbumsFindings.push(finding.findings[j]);
            lastfm.albumCover('00198b31b392d0750f88819830e49680', finding.findings[j].artist, finding.findings[j].album, fetcher.artistAlbumModel.artistAlbumsFindings.length).then(function (img) {
              if (img.img && img.img.length > 0) {
                fetcher.artistAlbumModel.artistAlbumsFindings[img.ref - 1].img = img.img;
              }
              cnt++;
              if (tot === cnt) {
                cb();
              }
            });
          }
        } else {
          fetcher.artistAlbumModel.imgs[finding.ref] = 'img/delete-32.png';
          cnt++;
          if (tot === cnt) {
            cb();
          }
        }
      }).fail(function (err) {
        console.error(err);
      });
    }
  },
  getSuggsOnSpot: function (un, cb) {
    var p = lastfm.getNews(un, '00198b31b392d0750f88819830e49680').then(function (d) {
      var onSpot = [];
      var suggs = [];
      var handler = function (o) {
        var r = o.findings;
        var artistAlbum = o.artistAlbum;
        if (r.length > 0) {
          for (var i = 0; i < r.length; i++) {
            onSpot.push({
              'artist': r[i].artist,
              'album': r[i].album,
              'href': r[i].href,
              'img': r[i].img
            });
          }
        } else {
          suggs.push({
            'artist': artistAlbum.artist,
            'album': artistAlbum.album,
            'img': artistAlbum.img
          });
        }
      };
      var proms = [];
      for (var i = 0; i < d.length; i++) {
        proms.push(spotify.searchArtistAlbum({
          'artist': d[i].artist,
          'album': d[i].album,
          'img': d[i].image
        }));
      }
      return Q.all(proms).then(function (pd) {
        for (var i = 0; i < pd.length; i++) {
          handler(pd[i]);
        }
        return ({
          'suggs': suggs,
          'onspot': onSpot
        });
      });
    });
    return p.nodeify(cb);
  }
};
module.exports = fetcher;

},{"./lastfm":5,"./spotify":7,"q":16}],4:[function(require,module,exports){
/*var lfm = require('./lastfm');
lfm.getNews('saerdnakir', '00198b31b392d0750f88819830e49680', function (err, res) {
  if (err) {
    throw err;
  }
  console.log(res);
});
*/
/*
var spotify = require('./spotify');
spotify.lookupNews('vampire').then(function (data) {
  console.log('res', data);
});
*/
/*
var spotify = require('./spotify');
spotify.lookupArtistAlbum({'artist':'carcass','album':'heartwork'}).then(function(d) {
	console.log(d);
});*/
/*
var lastFMOnSpotify = require('./lastFMOnSpotify');
lastFMOnSpotify.getSuggsOnSpot('saerdnakire').then(function(arr) {
	console.log(arr);
});*/

/*
var dropbox = require('./dropbox');
document.getElementById('connect').addEventListener("click", function() {
	dropbox.sendAuth();
});
function recChanged(event) {
	var records = event.affectedRecordsForTable('swl');
    console.log(event.isLocal(), records);
}
document.addEventListener("DOMContentLoaded", function() {
	dropbox.authenticate().fail(function (err) {
      console.log('fail', err);
    });
	console.log('domloaded '+dropbox.isAuth());	
	if (dropbox.isAuth()) {
		dropbox.get().then(function(data) {
			console.log(data);
		}).fail(function (err) {
			console.error(err);
		});
		dropbox.addListener(recChanged);
	}
}, false);
*/
var Ractive = require('ractive');
var fetcher = require('./fetcher');
var store = require('./store');
var routie = require('./vendor/routie');
var controller = require('./controller');
/*
rmenu.on({
  setLastFM: setLastFM,
  setNews: setNews,
  setAA: setAA
});*/

function hasChanged(remoteEvt, localEvt) {
  console.log(remoteEvt, localEvt);
  if (remoteEvt) {
    var records = remoteEvt.affectedRecordsForTable('swl');
    console.log(remoteEvt.isLocal(), records);
    store.getData(); // will emit localEvt STORE
  } else {
    if (localEvt === store.events.STORE) {
      if (window.location.hash === '#/albums') {
        controller.aac.populate();
      } else if (window.location.hash === '#/news') {
        controller.nc.populate();
      } else if (window.location.hash === '#/') {
        controller.lfmc.populate();
      } else if (window.location.hash === '#/settings') {
        controller.sc.set();
      }
      console.log('has changed populated');
    } else if (localEvt === store.events.ALBUM_ADDED || localEvt === store.events.ALBUM_REMOVED) {
      controller.aac.setAA();
      controller.aac.populate();
    } else if (localEvt === store.events.NEWS_ADDED || localEvt === store.events.NEWS_REMOVED) {
      controller.nc.setNews();
      controller.nc.populate();
    }
  }
}

store.auth().then(function () {
  console.log('authed');
  //controller.sc.rs.set('conBtnTxt', 'Connected');
}).fail(function (err) {
  console.log('auth fail', err);
});

store.getData().then(function () {
  store.setRemoteChangedListener(hasChanged);
  console.log('index done getData');
});

store.setStoreChangedListener(hasChanged);

controller.mc.set();

controller.notc.init();

routie({
  '/albums': function () {
    console.log('route: albums');
    controller.aac.setAA();
    controller.aac.populate();
    controller.mc.rmenu.set('active', 'albums');
  },
  '/news': function () {
    console.log('route: news');
    controller.nc.setNews();
    controller.nc.populate();
    controller.mc.rmenu.set('active', 'news');
  },
  '/settings': function () {
    console.log('route: settings');
    controller.sc.set();
    controller.mc.rmenu.set('active', 'settings');
  },
  '*': function () {
    console.log('route: *');
    controller.lfmc.setLastFM();
    controller.lfmc.populate();
    controller.mc.rmenu.set('active', '/');
  }
});

},{"./controller":1,"./fetcher":3,"./store":8,"./vendor/routie":10,"ractive":17}],5:[function(require,module,exports){
var req = require('superagent');
var Q = require('q');

function LfmError(msg, error) {
  this.message = msg;
  this.error = error;
}
LfmError.prototype = new Error();

var lfm = {
  rejectResolve: function (err, res, deferred) {
    if (err) {
      deferred.reject(err);
    } else {
      if (res.error) {
        // superagent res.error is instanceof Error
        deferred.reject(res.error);
      } else if (res.body.error) {
        deferred.reject(new LfmError(res.body.message, res.body.error));
      } else {
        deferred.resolve(res.body);
      }
    }
  },
  getNews: function (un, apiKey, cb) {
    var deferred0 = Q.defer();
    req.get('https://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=0&user=' + un + '&api_key=' + apiKey, function (err, res) {
      lfm.rejectResolve(err, res, deferred0);
    });
    var deferred1 = Q.defer();
    req.get('https://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&format=json&userecs=1&user=' + un + '&api_key=' + apiKey, function (err, res) {
      lfm.rejectResolve(err, res, deferred1);
    });
    var p = Q.all([deferred0.promise, deferred1.promise]).then(function (d) {
      var findings = [];
      for (var i = 0; i < d.length; i++) {
        for (var j = 0; d[i].albums && d[i].albums.album && j < d[i].albums.album.length; j++) {
          findings.push({
            'artist': d[i].albums.album[j].artist.name,
            'album': d[i].albums.album[j].name,
            'image': d[i].albums.album[j].image[2]['#text']
          });
        }
      }
      return findings;
    });
    return p.nodeify(cb);
  },
  albumCover: function (apiKey, artist, album, ref, cb) {
    var d = Q.defer();
    req.get('//ws.audioscrobbler.com/2.0/?method=album.getInfo&format=json&artist=' + artist.replace(/&/g, '%26') + '&album=' + album.replace(/&/g, '%26') + '&api_key=' + apiKey, function (err, res) {
      if (err) {
        d.reject(err);
      } else {
        if (res.error) {
          // superagent res.error is instanceof Error
          d.reject(res.error);
        } else if (res.body.error) {
          d.reject(new LfmError(res.body.message, res.body.error));
        } else {
          var img = {};
          if (res.body.album && res.body.album.image[2]["#text"].length > 0) {
            img = res.body.album.image[2]["#text"];
          } else {
            img = 'img/vinyl.png';
          }
          d.resolve({
            'img': img,
            'ref': ref
          });
        }
      }
    });
    return d.promise.nodeify(cb);
  }
};
module.exports = lfm;

},{"q":16,"superagent":18}],6:[function(require,module,exports){
var Ractive = require('ractive');

Ractive.events.filedrop = function (node, fire) {

  function drag(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  function drop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log('drop');
    var files = evt.dataTransfer.files; // FileList object.
    var f = files[0];
    if (f) {
      console.log('filename', f.name);
      var r = new FileReader();
      r.onload = function (e) {
        var contents = e.target.result;
        //console.log('contents', contents);
        fire({
          node: node,
          contents: contents
        });
      };
      r.onerror = function (e) {
        console.log(e);
      };
      r.readAsText(f); // takes optional 2nd param encoding
    } else {
      //console.log(evt.dataTransfer.getData('text/uri-list'));
      fire({
        node: node,
        contents: evt.dataTransfer.getData('text/uri-list')
      });
    }
  }

  node.addEventListener('dragenter', drag);
  node.addEventListener('dragover', drag);
  node.addEventListener('drop', drop);

  return {
    teardown: function () {
      node.removeEventListener('dragenter', drag);
      node.removeEventListener('dragover', drag);
      node.removeEventListener('drop', drop);
    }
  };
};

module.exports.filedrop = Ractive.events.filedrop;

},{"ractive":17}],7:[function(require,module,exports){
var req = require('superagent');
var Q = require('q');

var spotify = {
  userCountry: 'SE',
  searchNews: function (artist, ignoreReleaseList, ref, cb) {
    var deferred = Q.defer();
    req.get('http://ws.spotify.com/search/1/album.json?q=tag:new%20AND%20artist:%22' + artist.replace(/&/g, '%26') + '%22', function (err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        if (res.error) {
          // superagent res.error is instanceof Error
          deferred.reject(res.error);
        } else {
          var data = res.body;
          /* jshint camelcase: false */
          var findings = [];
          if (data.info.num_results > 0) {
            for (var j = 0; j < data.albums.length; j++) {
              if (data.albums[j].artists[0].name.toLowerCase() === artist.toLowerCase() &&
                spotify.checkAvail(data.albums[j].availability.territories) && !spotify.shouldIgnore(ignoreReleaseList, data.albums[j].href)) {
                findings.push({
                  'artist': data.albums[j].artists[0].name,
                  'album': data.albums[j].name,
                  'href': data.albums[j].href
                });
              }
            }
          }
          deferred.resolve({
            'findings': findings,
            'ref': ref
          });
        }
      }
    });
    return deferred.promise.nodeify(cb);
  },
  searchArtistAlbum: function (artistAlbum, ref, cb) {
    var deferred = Q.defer();
    req.get('http://ws.spotify.com/search/1/album.json?q=' + artistAlbum.album.replace(/&/g, '%26') + '%20AND%20artist:%22' + artistAlbum.artist.replace(/&/g, '%26') + '%22', function (err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        if (res.error) {
          // superagent res.error is instanceof Error
          deferred.reject(res.error);
        } else {
          var data = res.body;
          /* jshint camelcase: false */
          var findings = [];
          if (data.info.num_results > 0) {
            for (var j = 0; j < data.albums.length; j++) {
              if (data.albums[j].artists[0].name.toLowerCase() === artistAlbum.artist.toLowerCase() &&
                spotify.checkAvail(data.albums[j].availability.territories)
              ) {
                findings.push({
                  'artist': data.albums[j].artists[0].name,
                  'album': data.albums[j].name,
                  'href': data.albums[j].href,
                  'img': artistAlbum.img
                });
              }
            }
          }
          deferred.resolve({
            'findings': findings,
            'artistAlbum': artistAlbum,
            'ref': ref
          });
        }
      }
    });
    return deferred.promise.nodeify(cb);
  },
  lookup: function (uri, callback) {
    var deferred = Q.defer();
    req.get('http://ws.spotify.com/lookup/1/.json?uri=' + uri, function (err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        if (res.error) {
          // superagent res.error is instanceof Error
          deferred.reject(res.error);
        } else {
          if (res.body.artist) {
            deferred.resolve({
              'artist': res.body.artist.name
            });
          } else if (res.body.album) {
            deferred.resolve({
              'artist': res.body.album.artist,
              'album': res.body.album.name
            });
          }
        }
      }
    });
    return deferred.promise.nodeify(callback);
  },
  checkAvail: function (cs) {
    return cs.indexOf(spotify.userCountry) >= 0 || cs === 'worldwide';
  },
  shouldIgnore: function (ignoreReleaseList, href) {
    for (var i = 0; ignoreReleaseList && i < ignoreReleaseList.length; i++) {
      if (href && ignoreReleaseList[i].toLowerCase() === href.toLowerCase()) {
        console.log('ignoring release ' + href);
        return true;
      }
    }
    return false;
  }
};
module.exports = spotify;

},{"q":16,"superagent":18}],8:[function(require,module,exports){
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

},{"./dropbox":2,"events":14,"q":16}],9:[function(require,module,exports){
(function (process,global,Buffer){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
// dropbox-datastores-1.0.0.js
!function(){var t,e,r,n,i,o,s,a,u,l,h,c,p,d,f,_,y,g,m,v,w,b,S,D,E,A,x,O,U,T,C,k,I,R,P,L,N,F,z,j,B,M,X,H,V,q,J,G,W,K,$,Z,Q,Y,te,ee,re,ne,ie,oe,se={}.hasOwnProperty,ae=[].indexOf||function(t){for(var e=0,r=this.length;r>e;e++)if(e in this&&this[e]===t)return e;return-1},ue=function(t,e){function r(){this.constructor=t}for(var n in e)se.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},le=[].slice;if(x=function(){function t(){}return t}(),x.Util=function(){function t(){}return t}(),x.Http=function(){function t(){}return t}(),x.File=function(){function t(){}return t}(),u="1.0.0","undefined"!=typeof global&&"undefined"!=typeof module&&"exports"in module)f=global,_=module.require.bind(module),module.exports=x;else if("undefined"!=typeof window&&"undefined"!=typeof navigator)f=window,_=null,window.Dropbox&&function(){var t,e,r,n;r=window.Dropbox,n=[];for(t in r)se.call(r,t)&&(e=r[t],n.push(x[t]=e));return n}(),window.Dropbox=x;else{if("undefined"==typeof self||"undefined"==typeof navigator)throw new Error("dropbox.js loaded in an unsupported JavaScript environment.");f=self,_=self.importScripts.bind(self),self.Dropbox=x}if(x.Env=function(){function t(){}return t.global=f,t.require=_,t}(),x.Util.EventSource=function(){function t(t){this._cancelable=t&&t.cancelable,this._listeners=[]}return t.prototype.addListener=function(t){if("function"!=typeof t)throw new TypeError("Invalid listener type; expected function");return ae.call(this._listeners,t)<0&&this._listeners.push(t),this},t.prototype.removeListener=function(t){var e,r,n,i,o,s;if(this._listeners.indexOf)r=this._listeners.indexOf(t),-1!==r&&this._listeners.splice(r,1);else for(s=this._listeners,e=i=0,o=s.length;o>i;e=++i)if(n=s[e],n===t){this._listeners.splice(e,1);break}return this},t.prototype.dispatch=function(t){var e,r,n,i,o;for(o=this._listeners,n=0,i=o.length;i>n;n++)if(e=o[n],r=e(t),this._cancelable&&r===!1)return!1;return!0},t}(),x.AccountInfo=function(){function t(t){var e;this._json=t,this.name=t.display_name,this.email=t.email,this.countryCode=t.country||null,this.uid=t.uid.toString(),t.public_app_url?(this.publicAppUrl=t.public_app_url,e=this.publicAppUrl.length-1,e>=0&&"/"===this.publicAppUrl.substring(e)&&(this.publicAppUrl=this.publicAppUrl.substring(0,e))):this.publicAppUrl=null,this.referralUrl=t.referral_link,this.quota=t.quota_info.quota,this.privateBytes=t.quota_info.normal||0,this.sharedBytes=t.quota_info.shared||0,this.usedQuota=this.privateBytes+this.sharedBytes}return t.parse=function(t){return t&&"object"==typeof t?new x.AccountInfo(t):t},t.prototype.name=null,t.prototype.email=null,t.prototype.countryCode=null,t.prototype.uid=null,t.prototype.referralUrl=null,t.prototype.publicAppUrl=null,t.prototype.quota=null,t.prototype.usedQuota=null,t.prototype.privateBytes=null,t.prototype.sharedBytes=null,t.prototype.json=function(){return this._json},t}(),x.ApiError=function(){function t(t,e,r){var n,i;if(this.method=e,this.url=r,this.status=t.status,t.responseType)try{n=t.response||t.responseText}catch(o){i=o;try{n=t.responseText}catch(o){i=o,n=null}}else try{n=t.responseText}catch(o){i=o,n=null}if(n)try{this.responseText=n.toString(),this.response=JSON.parse(n)}catch(o){i=o,this.response=null}else this.responseText="(no response)",this.response=null}return t.prototype.status=null,t.prototype.method=null,t.prototype.url=null,t.prototype.responseText=null,t.prototype.response=null,t.NETWORK_ERROR=0,t.NO_CONTENT=304,t.INVALID_PARAM=400,t.INVALID_TOKEN=401,t.OAUTH_ERROR=403,t.NOT_FOUND=404,t.INVALID_METHOD=405,t.NOT_ACCEPTABLE=406,t.CONFLICT=409,t.RATE_LIMITED=429,t.SERVER_ERROR=503,t.OVER_QUOTA=507,t.prototype.toString=function(){return"Dropbox API error "+this.status+" from "+this.method+" "+this.url+" :: "+this.responseText},t.prototype.inspect=function(){return this.toString()},t}(),x.AuthDriver=function(){function t(){}return t.prototype.authType=function(){return"code"},t.prototype.url=function(){return"https://some.url"},t.prototype.doAuthorize=function(t,e,r,n){return n({code:"access-code"})},t.prototype.getStateParam=function(t,e){return e(x.Util.Oauth.randomAuthStateParam())},t.prototype.resumeAuthorize=function(t,e,r){return r({code:"access-code"})},t.prototype.onAuthStateChange=function(t,e){return e()},t.oauthQueryParams=["access_token","expires_in","scope","token_type","code","error","error_description","error_uri","mac_key","mac_algorithm"].sort(),t}(),x.AuthDriver.autoConfigure=function(t){if("undefined"!=typeof chrome&&(chrome.extension||chrome.app&&chrome.app.runtime))return t.authDriver(new x.AuthDriver.Chrome),void 0;if("undefined"!=typeof window){if(window.cordova)return t.authDriver(new x.AuthDriver.Cordova),void 0;window&&window.navigator&&t.authDriver(new x.AuthDriver.Redirect)}},x.AuthDriver.BrowserBase=function(){function t(t){t?(this.rememberUser="rememberUser"in t?t.rememberUser:!0,this.scope=t.scope||"default"):(this.rememberUser=!0,this.scope="default"),this.storageKey=null,this.stateRe=/^[^#]+\#(.*&)?state=([^&]+)(&|$)/}return t.prototype.authType=function(){return"token"},t.prototype.onAuthStepChange=function(t,e){var r=this;switch(this.setStorageKey(t),t.authStep){case x.Client.RESET:return this.loadCredentials(function(n){return n?(t.setCredentials(n),t.authStep!==x.Client.DONE?e():r.rememberUser?(t.setCredentials(n),t.getAccountInfo(function(n){return n&&n.status===x.ApiError.INVALID_TOKEN?(t.reset(),r.forgetCredentials(e)):e()})):r.forgetCredentials(e)):e()});case x.Client.DONE:return this.rememberUser?this.storeCredentials(t.credentials(),e):this.forgetCredentials(e);case x.Client.SIGNED_OUT:return this.forgetCredentials(e);case x.Client.ERROR:return this.forgetCredentials(e);default:return e(),this}},t.prototype.setStorageKey=function(t){return this.storageKey="dropbox-auth:"+this.scope+":"+t.appHash(),this},t.prototype.storeCredentials=function(t,e){return localStorage.setItem(this.storageKey,JSON.stringify(t)),e(),this},t.prototype.loadCredentials=function(t){var e,r;if(r=localStorage.getItem(this.storageKey),!r)return t(null),this;try{t(JSON.parse(r))}catch(n){e=n,t(null)}return this},t.prototype.forgetCredentials=function(t){return localStorage.removeItem(this.storageKey),t(),this},t.prototype.locationStateParam=function(t){var e,r;return e=t||x.AuthDriver.BrowserBase.currentLocation(),r=this.stateRe.exec(e),r?decodeURIComponent(r[2]):null},t.prototype.replaceUrlBasename=function(t,e){var r,n,i;return n=t.indexOf("#"),-1!==n&&(t=t.substring(0,n)),i=t.indexOf("?"),-1!==i&&(t=t.substring(0,i)),r=t.split("/"),r[r.length-1]=e,r.join("/")},t.currentLocation=function(){return window.location.href},t.cleanupLocation=function(){var t,e;window.history&&window.history.replaceState?(e=this.currentLocation(),t=e.indexOf("#"),window.history.replaceState({},document.title,e.substring(0,t))):window.location.hash=""},t}(),x.AuthDriver.Redirect=function(t){function e(t){e.__super__.constructor.call(this,t),this.receiverUrl=this.baseUrl(t)}return ue(e,t),e.prototype.baseUrl=function(t){var e,r;if(r=x.AuthDriver.BrowserBase.currentLocation(),t){if(t.redirectUrl)return t.redirectUrl;if(t.redirectFile)return this.replaceUrlBasename(r,t.redirectFile)}return e=r.indexOf("#"),-1!==e&&(r=r.substring(0,e)),r},e.prototype.url=function(){return this.receiverUrl},e.prototype.doAuthorize=function(t,e,r){return this.storeCredentials(r.credentials(),function(){return window.location.assign(t)})},e.prototype.resumeAuthorize=function(t,e,r){var n;return this.locationStateParam()===t?(n=x.AuthDriver.BrowserBase.currentLocation(),x.AuthDriver.BrowserBase.cleanupLocation(),r(x.Util.Oauth.queryParamsFromUrl(n))):this.forgetCredentials(function(){return r({error:"Authorization error"})})},e}(x.AuthDriver.BrowserBase),x.AuthDriver.Popup=function(t){function e(t){e.__super__.constructor.call(this,t),this.receiverUrl=this.baseUrl(t)}return ue(e,t),e.prototype.url=function(){return this.receiverUrl},e.prototype.doAuthorize=function(t,e,r,n){return this.listenForMessage(e,n),this.openWindow(t)},e.prototype.baseUrl=function(t){var e;if(e=x.AuthDriver.BrowserBase.currentLocation(),t){if(t.receiverUrl)return t.receiverUrl;if(t.receiverFile)return this.replaceUrlBasename(e,t.receiverFile)}return e},e.prototype.openWindow=function(t){return window.open(t,"_dropboxOauthSigninWindow",this.popupWindowSpec(980,700))},e.prototype.popupWindowSpec=function(t,e){var r,n,i,o,s,a,u,l,h,c;return s=null!=(u=window.screenX)?u:window.screenLeft,a=null!=(l=window.screenY)?l:window.screenTop,o=null!=(h=window.outerWidth)?h:document.documentElement.clientWidth,r=null!=(c=window.outerHeight)?c:document.documentElement.clientHeight,n=Math.round(s+(o-t)/2),i=Math.round(a+(r-e)/2.5),s>n&&(n=s),a>i&&(i=a),"width="+t+",height="+e+","+("left="+n+",top="+i)+"dialog=yes,dependent=yes,scrollbars=yes,location=yes"},e.prototype.listenForMessage=function(t,e){var r,n=this;return r=function(i){var o,s,a;o=i.data?i.data:i;try{a=JSON.parse(o)._dropboxjs_oauth_info}catch(u){return s=u,void 0}if(a)return n.locationStateParam(a)===t?(t=!1,window.removeEventListener("message",r),x.AuthDriver.Popup.onMessage.removeListener(r),e(x.Util.Oauth.queryParamsFromUrl(o))):void 0},window.addEventListener("message",r,!1),x.AuthDriver.Popup.onMessage.addListener(r)},e.locationOrigin=function(t){var e;return(e=/^(file:\/\/[^\?\#]*)(\?|\#|$)/.exec(t))?e[1]:(e=/^([^\:]+\:\/\/[^\/\?\#]*)(\/|\?|\#|$)/.exec(t),e?e[1]:t)},e.oauthReceiver=function(){window.addEventListener("load",function(){var t,e,r,n,i,o;if(o=window.location.href,r=JSON.stringify({_dropboxjs_oauth_info:o}),x.AuthDriver.BrowserBase.cleanupLocation(),n=window.opener,window.parent!==window.top&&(n||(n=window.parent)),n){try{i=window.location.origin||locationOrigin(o),n.postMessage(r,i),window.close()}catch(s){e=s}try{return n.Dropbox.AuthDriver.Popup.onMessage.dispatch(r),window.close()}catch(s){t=s}}})},e.onMessage=new x.Util.EventSource,e}(x.AuthDriver.BrowserBase),c=null,p=null,"undefined"!=typeof chrome&&null!==chrome&&(chrome.runtime&&(chrome.runtime.onMessage&&(c=chrome.runtime.onMessage),chrome.runtime.sendMessage&&(p=chrome.runtime.sendMessage.bind(chrome.runtime))),chrome.extension&&(chrome.extension.onMessage&&(c||(c=chrome.extension.onMessage)),chrome.extension.sendMessage&&(p||(p=chrome.extension.sendMessage.bind(chrome.extension))))),x.AuthDriver.Chrome=function(t){function e(t){var r;e.__super__.constructor.call(this,t),r=t&&t.receiverPath||"chrome_oauth_receiver.html",this.useQuery=!0,this.receiverUrl=this.expandUrl(r),this.storageKey="dropbox_js_"+this.scope+"_credentials"}return ue(e,t),e.prototype.onMessage=c,e.prototype.sendMessage=p,e.prototype.expandUrl=function(t){return chrome.runtime&&chrome.runtime.getURL?chrome.runtime.getURL(t):chrome.extension&&chrome.extension.getURL?chrome.extension.getURL(t):t},e.prototype.onAuthStepChange=function(t,e){var r=this;switch(t.authStep){case x.Client.RESET:return this.loadCredentials(function(n){if(n){if(n.authStep)return r.forgetCredentials(e);t.setCredentials(n)}return e()});case x.Client.DONE:return this.storeCredentials(t.credentials(),e);case x.Client.SIGNED_OUT:return this.forgetCredentials(e);case x.Client.ERROR:return this.forgetCredentials(e);default:return e()}},e.prototype.doAuthorize=function(t,e,r,n){var i,o,s,a,u=this;return(null!=(o=chrome.identity)?o.launchWebAuthFlow:void 0)?chrome.identity.launchWebAuthFlow({url:t,interactive:!0},function(t){return u.locationStateParam(t)===e?(e=!1,n(x.Util.Oauth.queryParamsFromUrl(t))):void 0}):(null!=(s=chrome.experimental)?null!=(a=s.identity)?a.launchWebAuthFlow:void 0:void 0)?chrome.experimental.identity.launchWebAuthFlow({url:t,interactive:!0},function(t){return u.locationStateParam(t)===e?(e=!1,n(x.Util.Oauth.queryParamsFromUrl(t))):void 0}):(i={handle:null},this.listenForMessage(e,i,n),this.openWindow(t,function(t){return i.handle=t}))},e.prototype.openWindow=function(t,e){return chrome.tabs&&chrome.tabs.create?(chrome.tabs.create({url:t,active:!0,pinned:!1},function(t){return e(t)}),this):this},e.prototype.closeWindow=function(t){return chrome.tabs&&chrome.tabs.remove&&t.id?(chrome.tabs.remove(t.id),this):chrome.app&&chrome.app.window&&t.close?(t.close(),this):this},e.prototype.url=function(){return this.receiverUrl},e.prototype.listenForMessage=function(t,e,r){var n,i=this;return n=function(o,s){var a;if((!s||!s.tab||s.tab.url.substring(0,i.receiverUrl.length)===i.receiverUrl)&&o.dropbox_oauth_receiver_href)return a=o.dropbox_oauth_receiver_href,i.locationStateParam(a)===t?(t=!1,e.handle&&i.closeWindow(e.handle),i.onMessage.removeListener(n),r(x.Util.Oauth.queryParamsFromUrl(a))):void 0},this.onMessage.addListener(n)},e.prototype.storeCredentials=function(t,e){var r;return r={},r[this.storageKey]=t,chrome.storage.local.set(r,e),this},e.prototype.loadCredentials=function(t){var e=this;return chrome.storage.local.get(this.storageKey,function(r){return t(r[e.storageKey]||null)}),this},e.prototype.forgetCredentials=function(t){return chrome.storage.local.remove(this.storageKey,t),this},e.oauthReceiver=function(){return window.addEventListener("load",function(){var t,e;return t=new x.AuthDriver.Chrome,e=window.location.href,window.location.hash="",t.sendMessage({dropbox_oauth_receiver_href:e}),window.close?window.close():void 0})},e}(x.AuthDriver.BrowserBase),x.AuthDriver.Cordova=function(t){function e(t){e.__super__.constructor.call(this,t)}return ue(e,t),e.prototype.url=function(){return"https://www.dropbox.com/1/oauth2/redirect_receiver"},e.prototype.doAuthorize=function(t,e,r,n){var i,o,s,a,u,l=this;return o=window.open(t,"_blank","location=yes,closebuttoncaption=Cancel"),a=!1,i=/^[^/]*\/\/[^/]*\//.exec(t)[0],u=!1,s=function(t){if(t.url&&l.locationStateParam(t.url)===e){if(u)return;return o.removeEventListener("loadstart",s),o.removeEventListener("loaderror",s),o.removeEventListener("loadstop",s),o.removeEventListener("exit",s),u=!0,window.setTimeout(function(){return o.close()},10),n(x.Util.Oauth.queryParamsFromUrl(t.url)),void 0}if("exit"===t.type){if(u)return;o.removeEventListener("loadstart",s),o.removeEventListener("loaderror",s),o.removeEventListener("loadstop",s),o.removeEventListener("exit",s),u=!0,n(new AuthError("error=access_denied&error_description=User+closed+browser+window"))}},o.addEventListener("loadstart",s),o.addEventListener("loaderror",s),o.addEventListener("loadstop",s),o.addEventListener("exit",s)},e}(x.AuthDriver.BrowserBase),x.AuthDriver.NodeServer=function(){function t(t){this._port=(null!=t?t.port:void 0)||8912,(null!=t?t.tls:void 0)?(this._tlsOptions=t.tls,("string"==typeof this._tlsOptions||this._tlsOptions instanceof Buffer)&&(this._tlsOptions={key:this._tlsOptions,cert:this._tlsOptions})):this._tlsOptions=null,this._fs=x.Env.require("fs"),this._http=x.Env.require("http"),this._https=x.Env.require("https"),this._open=x.Env.require("open"),this._callbacks={},this._nodeUrl=x.Env.require("url"),this.createApp()}return t.prototype.authType=function(){return"code"},t.prototype.url=function(){var t;return t=null===this._tlsOptions?"http":"https",""+t+"://localhost:"+this._port+"/oauth_callback"},t.prototype.doAuthorize=function(t,e,r,n){return this._callbacks[e]=n,this.openBrowser(t)},t.prototype.openBrowser=function(t){if(!t.match(/^https?:\/\//))throw new Error("Not a http/https URL: "+t);return"BROWSER"in process.env?this._open(t,process.env.BROWSER):this._open(t)},t.prototype.createApp=function(){var t=this;return this._app=this._tlsOptions?this._https.createServer(this._tlsOptions,function(e,r){return t.doRequest(e,r)}):this._http.createServer(function(e,r){return t.doRequest(e,r)}),this._app.listen(this._port)},t.prototype.closeServer=function(){return this._app.close()},t.prototype.doRequest=function(t,e){var r,n,i,o=this;return i=this._nodeUrl.parse(t.url,!0),"/oauth_callback"===i.pathname&&(n=i.query.state,this._callbacks[n]&&(this._callbacks[n](i.query),delete this._callbacks[n])),r="",t.on("data",function(t){return r+=t}),t.on("end",function(){return o.closeBrowser(e)})},t.prototype.closeBrowser=function(t){var e;return e='<!doctype html>\n<script type="text/javascript">window.close();</script>\n<p>Please close this window.</p>',t.writeHead(200,{"Content-Length":e.length,"Content-Type":"text/html"}),t.write(e),t.end()},t}(),x.AuthError=function(){function t(t){var e;if(!t.error)throw new Error("Not an OAuth 2.0 error: "+JSON.stringify(t));e="object"==typeof t.error&&t.error.error?t.error:t,this.code=e.error,this.description=e.error_description||null,this.uri=e.error_uri||null}return t.prototype.code=null,t.prototype.description=null,t.prototype.uri=null,t.ACCESS_DENIED="access_denied",t.INVALID_REQUEST="invalid_request",t.UNAUTHORIZED_CLIENT="unauthorized_client",t.INVALID_GRANT="invalid_grant",t.INVALID_SCOPE="invalid_scope",t.UNSUPPORTED_GRANT_TYPE="unsupported_grant_type",t.UNSUPPORTED_RESPONSE_TYPE="unsupported_response_type",t.SERVER_ERROR="server_error",t.TEMPORARILY_UNAVAILABLE="temporarily_unavailable",t.prototype.toString=function(){return"Dropbox OAuth error "+this.code+" :: "+this.description},t.prototype.inspect=function(){return this.toString()},t}(),x.Client=function(){function t(t){var e=this;this.serverRoot=t.server||this.defaultServerRoot(),this.maxApiServer="maxApiServer"in t?t.maxApiServer:this.defaultMaxApiServer(),this.authServer=t.authServer||this.defaultAuthServer(),this.fileServer=t.fileServer||this.defaultFileServer(),this.downloadServer=t.downloadServer||this.defaultDownloadServer(),this.onXhr=new x.Util.EventSource({cancelable:!0}),this.onError=new x.Util.EventSource,this.onAuthStepChange=new x.Util.EventSource,this.xhrOnErrorHandler=function(t,r){return e.handleXhrError(t,r)},this.oauth=new x.Util.Oauth(t),this.uid=t.uid||null,this.authStep=this.oauth.step(),this.driver=null,this.filter=null,this.authError=null,this._credentials=null,this._datastoreManager=null,this.setupUrls()}return t.prototype.onXhr=null,t.prototype.onError=null,t.prototype.onAuthStepChange=null,t.prototype.authDriver=function(t){return this.driver=t,this},t.prototype.dropboxUid=function(){return this.uid},t.prototype.credentials=function(){return this._credentials||this.computeCredentials(),this._credentials},t.prototype.authenticate=function(t,e){var r,n,i,o,s,a=this;if(e||"function"!=typeof t||(e=t,t=null),r=t&&"interactive"in t?t.interactive:!0,!this.driver&&this.authStep!==d.DONE&&(x.AuthDriver.autoConfigure(this),!this.driver))throw new Error("OAuth driver auto-configuration failed. Call authDriver.");if(this.authStep===d.ERROR)throw new Error("Client got in an error state. Call reset() to reuse it!");return o=function(){return a.authStep=a.oauth.step(),a.authStep===d.ERROR&&(a.authError=a.oauth.error()),a._credentials=null,a.onAuthStepChange.dispatch(a),s()},i=function(){return a.authStep=d.ERROR,a._credentials=null,a.onAuthStepChange.dispatch(a),s()},n=null,s=function(){var t;if(n!==a.authStep&&(n=a.authStep,a.driver&&a.driver.onAuthStepChange))return a.driver.onAuthStepChange(a,s),void 0;switch(a.authStep){case d.RESET:return r?(a.driver.getStateParam&&a.driver.getStateParam(function(t){return a.client.authStep===d.RESET&&a.oauth.setAuthStateParam(t),o()}),a.oauth.setAuthStateParam(x.Util.Oauth.randomAuthStateParam()),o()):(e&&e(null,a),void 0);case d.PARAM_SET:return r?(t=a.authorizeUrl(),a.driver.doAuthorize(t,a.oauth.authStateParam(),a,function(t){return a.oauth.processRedirectParams(t),t.uid&&(a.uid=t.uid),o()})):(e&&e(null,a),void 0);case d.PARAM_LOADED:return a.driver.resumeAuthorize?a.driver.resumeAuthorize(a.oauth.authStateParam(),a,function(t){return a.oauth.processRedirectParams(t),t.uid&&(a.uid=t.uid),o()}):(a.oauth.setAuthStateParam(a.oauth.authStateParam()),o(),void 0);case d.AUTHORIZED:return a.getAccessToken(function(t,e){return t?(a.authError=t,i()):(a.oauth.processRedirectParams(e),a.uid=e.uid,o())});case d.DONE:e&&e(null,a);break;case d.SIGNED_OUT:return a.authStep=d.RESET,a.reset(),s();case d.ERROR:e&&e(a.authError,a)}},s(),this},t.prototype.isAuthenticated=function(){return this.authStep===d.DONE},t.prototype.signOut=function(t,e){var r,n,i=this;if(e||"function"!=typeof t||(e=t,t=null),r=t&&t.mustInvalidate,this.authStep!==d.DONE)throw new Error("This client doesn't have a user's token");return n=new x.Util.Xhr("POST",this.urls.signOut),n.signWithOauth(this.oauth),this.dispatchXhr(n,function(t){if(t)if(t.status===x.ApiError.INVALID_TOKEN)t=null;else if(r)return e&&e(t),void 0;return i.authStep=d.RESET,i.reset(),i.authStep=d.SIGNED_OUT,i.onAuthStepChange.dispatch(i),i.driver&&i.driver.onAuthStepChange?i.driver.onAuthStepChange(i,function(){return e?e(null):void 0}):e?e(null):void 0})},t.prototype.signOff=function(t,e){return this.signOut(t,e)},t.prototype.getAccountInfo=function(t,e){var r,n;return e||"function"!=typeof t||(e=t,t=null),r=!1,t&&t.httpCache&&(r=!0),n=new x.Util.Xhr("GET",this.urls.accountInfo),n.signWithOauth(this.oauth,r),this.dispatchXhr(n,function(t,r){return e(t,x.AccountInfo.parse(r),r)})},t.prototype.getUserInfo=function(t,e){return this.getAccountInfo(t,e)},t.prototype.readFile=function(t,e,r){var n,i,o,s,a,u,l;return r||"function"!=typeof e||(r=e,e=null),i={},u="text",s=null,n=!1,e&&(e.versionTag?i.rev=e.versionTag:e.rev&&(i.rev=e.rev),e.arrayBuffer?u="arraybuffer":e.blob?u="blob":e.buffer?u="buffer":e.binary&&(u="b"),e.length?(null!=e.start?(a=e.start,o=e.start+e.length-1):(a="",o=e.length),s="bytes="+a+"-"+o):null!=e.start&&(s="bytes="+e.start+"-"),e.httpCache&&(n=!0)),l=new x.Util.Xhr("GET",""+this.urls.getFile+"/"+this.urlEncodePath(t)),l.setParams(i).signWithOauth(this.oauth,n),l.setResponseType(u),s&&(s&&l.setHeader("Range",s),l.reportResponseHeaders()),this.dispatchXhr(l,function(t,e,n,i){var o;return o=i?x.Http.RangeInfo.parse(i["content-range"]):null,r(t,e,x.File.Stat.parse(n),o)})},t.prototype.writeFile=function(t,e,r,n){var i;return n||"function"!=typeof r||(n=r,r=null),i=x.Util.Xhr.canSendForms&&"object"==typeof e,i?this.writeFileUsingForm(t,e,r,n):this.writeFileUsingPut(t,e,r,n)},t.prototype.writeFileUsingForm=function(t,e,r,n){var i,o,s,a;return s=t.lastIndexOf("/"),-1===s?(i=t,t=""):(i=t.substring(s),t=t.substring(0,s)),o={file:i},r&&(r.noOverwrite&&(o.overwrite="false"),r.lastVersionTag?o.parent_rev=r.lastVersionTag:(r.parentRev||r.parent_rev)&&(o.parent_rev=r.parentRev||r.parent_rev)),a=new x.Util.Xhr("POST",""+this.urls.postFile+"/"+this.urlEncodePath(t)),a.setParams(o).signWithOauth(this.oauth).setFileField("file",i,e,"application/octet-stream"),delete o.file,this.dispatchXhr(a,function(t,e){return n?n(t,x.File.Stat.parse(e)):void 0})},t.prototype.writeFileUsingPut=function(t,e,r,n){var i,o;return i={},r&&(r.noOverwrite&&(i.overwrite="false"),r.lastVersionTag?i.parent_rev=r.lastVersionTag:(r.parentRev||r.parent_rev)&&(i.parent_rev=r.parentRev||r.parent_rev)),o=new x.Util.Xhr("POST",""+this.urls.putFile+"/"+this.urlEncodePath(t)),o.setBody(e).setParams(i).signWithOauth(this.oauth),this.dispatchXhr(o,function(t,e){return n?n(t,x.File.Stat.parse(e)):void 0})},t.prototype.resumableUploadStep=function(t,e,r){var n,i;return e?(n={offset:e.offset},e.tag&&(n.upload_id=e.tag)):n={offset:0},i=new x.Util.Xhr("POST",this.urls.chunkedUpload),i.setBody(t).setParams(n).signWithOauth(this.oauth),this.dispatchXhr(i,function(t,e){return t&&t.status===x.ApiError.INVALID_PARAM&&t.response&&t.response.upload_id&&t.response.offset?r(null,x.Http.UploadCursor.parse(t.response)):r(t,x.Http.UploadCursor.parse(e))})},t.prototype.resumableUploadFinish=function(t,e,r,n){var i,o;return n||"function"!=typeof r||(n=r,r=null),i={upload_id:e.tag},r&&(r.lastVersionTag?i.parent_rev=r.lastVersionTag:(r.parentRev||r.parent_rev)&&(i.parent_rev=r.parentRev||r.parent_rev),r.noOverwrite&&(i.overwrite="false")),o=new x.Util.Xhr("POST",""+this.urls.commitChunkedUpload+"/"+this.urlEncodePath(t)),o.setParams(i).signWithOauth(this.oauth),this.dispatchXhr(o,function(t,e){return n?n(t,x.File.Stat.parse(e)):void 0})},t.prototype.stat=function(t,e,r){var n,i,o;return r||"function"!=typeof e||(r=e,e=null),i={},n=!1,e&&(e.versionTag?i.rev=e.versionTag:e.rev&&(i.rev=e.rev),e.contentHash?i.hash=e.contentHash:e.hash&&(i.hash=e.hash),(e.removed||e.deleted)&&(i.include_deleted="true"),e.readDir&&(i.list="true",e.readDir!==!0&&(i.file_limit=e.readDir.toString())),e.cacheHash&&(i.hash=e.cacheHash),e.httpCache&&(n=!0)),i.include_deleted||(i.include_deleted="false"),i.list||(i.list="false"),o=new x.Util.Xhr("GET",""+this.urls.metadata+"/"+this.urlEncodePath(t)),o.setParams(i).signWithOauth(this.oauth,n),this.dispatchXhr(o,function(t,e){var n,i,o;return o=x.File.Stat.parse(e),n=(null!=e?e.contents:void 0)?function(){var t,r,n,o;for(n=e.contents,o=[],t=0,r=n.length;r>t;t++)i=n[t],o.push(x.File.Stat.parse(i));return o}():void 0,r(t,o,n)})},t.prototype.readdir=function(t,e,r){var n;return r||"function"!=typeof e||(r=e,e=null),n={readDir:!0},e&&(null!=e.limit&&(n.readDir=e.limit),e.versionTag?n.versionTag=e.versionTag:e.rev&&(n.versionTag=e.rev),e.contentHash?n.contentHash=e.contentHash:e.hash&&(n.contentHash=e.hash),(e.removed||e.deleted)&&(n.removed=e.removed||e.deleted),e.httpCache&&(n.httpCache=e.httpCache)),this.stat(t,n,function(t,e,n){var i,o;return i=n?function(){var t,e,r;for(r=[],t=0,e=n.length;e>t;t++)o=n[t],r.push(o.name);return r}():null,r(t,i,e,n)})},t.prototype.metadata=function(t,e,r){return this.stat(t,e,r)},t.prototype.makeUrl=function(t,e,r){var n,i,o,s,a,u=this;return r||"function"!=typeof e||(r=e,e=null),i=e&&(e["long"]||e.longUrl||e.downloadHack)?{short_url:"false"}:{},t=this.urlEncodePath(t),o=""+this.urls.shares+"/"+t,n=!1,s=!1,e&&(e.downloadHack?(n=!0,s=!0):e.download&&(n=!0,o=""+this.urls.media+"/"+t)),a=new x.Util.Xhr("POST",o).setParams(i).signWithOauth(this.oauth),this.dispatchXhr(a,function(t,e){return s&&(null!=e?e.url:void 0)&&(e.url=e.url.replace(u.authServer,u.downloadServer)),r(t,x.File.ShareUrl.parse(e,n))})},t.prototype.history=function(t,e,r){var n,i,o;return r||"function"!=typeof e||(r=e,e=null),i={},n=!1,e&&(null!=e.limit&&(i.rev_limit=e.limit),e.httpCache&&(n=!0)),o=new x.Util.Xhr("GET",""+this.urls.revisions+"/"+this.urlEncodePath(t)),o.setParams(i).signWithOauth(this.oauth,n),this.dispatchXhr(o,function(t,e){var n,i;return i=e?function(){var t,r,i;for(i=[],t=0,r=e.length;r>t;t++)n=e[t],i.push(x.File.Stat.parse(n));return i}():void 0,r(t,i)})},t.prototype.revisions=function(t,e,r){return this.history(t,e,r)},t.prototype.thumbnailUrl=function(t,e){var r;return r=this.thumbnailXhr(t,e),r.paramsToUrl().url},t.prototype.readThumbnail=function(t,e,r){var n,i;return r||"function"!=typeof e||(r=e,e=null),n="b",e&&(e.blob&&(n="blob"),e.arrayBuffer&&(n="arraybuffer"),e.buffer&&(n="buffer")),i=this.thumbnailXhr(t,e),i.setResponseType(n),this.dispatchXhr(i,function(t,e,n){return r(t,e,x.File.Stat.parse(n))})},t.prototype.thumbnailXhr=function(t,e){var r,n;return r={},e&&(e.format?r.format=e.format:e.png&&(r.format="png"),e.size&&(r.size=e.size)),n=new x.Util.Xhr("GET",""+this.urls.thumbnails+"/"+this.urlEncodePath(t)),n.setParams(r).signWithOauth(this.oauth)},t.prototype.revertFile=function(t,e,r){var n;return n=new x.Util.Xhr("POST",""+this.urls.restore+"/"+this.urlEncodePath(t)),n.setParams({rev:e}).signWithOauth(this.oauth),this.dispatchXhr(n,function(t,e){return r?r(t,x.File.Stat.parse(e)):void 0})},t.prototype.restore=function(t,e,r){return this.revertFile(t,e,r)},t.prototype.findByName=function(t,e,r,n){var i,o,s;return n||"function"!=typeof r||(n=r,r=null),o={query:e},i=!1,r&&(null!=r.limit&&(o.file_limit=r.limit),(r.removed||r.deleted)&&(o.include_deleted=!0),r.httpCache&&(i=!0)),s=new x.Util.Xhr("GET",""+this.urls.search+"/"+this.urlEncodePath(t)),s.setParams(o).signWithOauth(this.oauth,i),this.dispatchXhr(s,function(t,e){var r,i;return i=e?function(){var t,n,i;for(i=[],t=0,n=e.length;n>t;t++)r=e[t],i.push(x.File.Stat.parse(r));return i}():void 0,n(t,i)})},t.prototype.search=function(t,e,r,n){return this.findByName(t,e,r,n)},t.prototype.makeCopyReference=function(t,e){var r;return r=new x.Util.Xhr("GET",""+this.urls.copyRef+"/"+this.urlEncodePath(t)),r.signWithOauth(this.oauth),this.dispatchXhr(r,function(t,r){return e(t,x.File.CopyReference.parse(r))})},t.prototype.copyRef=function(t,e){return this.makeCopyReference(t,e)},t.prototype.pullChanges=function(t,e){var r,n;return e||"function"!=typeof t||(e=t,t=null),r=t?t.cursorTag?{cursor:t.cursorTag}:{cursor:t}:{},n=new x.Util.Xhr("POST",this.urls.delta),n.setParams(r).signWithOauth(this.oauth),this.dispatchXhr(n,function(t,r){return e(t,x.Http.PulledChanges.parse(r))})},t.prototype.delta=function(t,e){return this.pullChanges(t,e)},t.prototype.mkdir=function(t,e){var r;return r=new x.Util.Xhr("POST",this.urls.fileopsCreateFolder),r.setParams({root:"auto",path:this.normalizePath(t)}).signWithOauth(this.oauth),this.dispatchXhr(r,function(t,r){return e?e(t,x.File.Stat.parse(r)):void 0})},t.prototype.remove=function(t,e){var r;return r=new x.Util.Xhr("POST",this.urls.fileopsDelete),r.setParams({root:"auto",path:this.normalizePath(t)}).signWithOauth(this.oauth),this.dispatchXhr(r,function(t,r){return e?e(t,x.File.Stat.parse(r)):void 0})},t.prototype.unlink=function(t,e){return this.remove(t,e)},t.prototype["delete"]=function(t,e){return this.remove(t,e)},t.prototype.copy=function(t,e,r){var n,i,o;return r||"function"!=typeof n||(r=n,n=null),i={root:"auto",to_path:this.normalizePath(e)},t instanceof x.File.CopyReference?i.from_copy_ref=t.tag:i.from_path=this.normalizePath(t),o=new x.Util.Xhr("POST",this.urls.fileopsCopy),o.setParams(i).signWithOauth(this.oauth),this.dispatchXhr(o,function(t,e){return r?r(t,x.File.Stat.parse(e)):void 0})},t.prototype.move=function(t,e,r){var n,i;return r||"function"!=typeof n||(r=n,n=null),i=new x.Util.Xhr("POST",this.urls.fileopsMove),i.setParams({root:"auto",from_path:this.normalizePath(t),to_path:this.normalizePath(e)}).signWithOauth(this.oauth),this.dispatchXhr(i,function(t,e){return r?r(t,x.File.Stat.parse(e)):void 0})},t.prototype.appInfo=function(t,e){var r;return e||"function"!=typeof t||(e=t,t=this.oauth.credentials().key),r=new x.Util.Xhr("GET",this.urls.appsInfo),r.setParams({app_key:t}),this.dispatchXhr(r,function(r,n){return e(r,x.Http.AppInfo.parse(n,t))})},t.prototype.isAppDeveloper=function(t,e,r){var n;return"object"==typeof t&&"uid"in t&&(t=t.uid),r||"function"!=typeof e?"object"==typeof e&&"key"in e&&(e=e.key):(r=e,e=this.oauth.credentials().key),n=new x.Util.Xhr("GET",this.urls.appsCheckDeveloper),n.setParams({app_key:e,uid:t}),this.dispatchXhr(n,function(t,e){return e?r(t,e.is_developer):r(t)})},t.prototype.hasOauthRedirectUri=function(t,e,r){var n;return r||"function"!=typeof e?"object"==typeof e&&"key"in e&&(e=e.key):(r=e,e=this.oauth.credentials().key),n=new x.Util.Xhr("GET",this.urls.appsCheckRedirectUri),n.setParams({app_key:e,redirect_uri:t}),this.dispatchXhr(n,function(t,e){return e?r(t,e.has_redirect_uri):r(t)})},t.prototype.reset=function(){var t;return this.uid=null,this.oauth.reset(),t=this.authStep,this.authStep=this.oauth.step(),t!==this.authStep&&this.onAuthStepChange.dispatch(this),this.authError=null,this._credentials=null,this},t.prototype.setCredentials=function(t){var e;return e=this.authStep,this.oauth.setCredentials(t),this.authStep=this.oauth.step(),this.uid=t.uid||null,this.authError=null,this._credentials=null,e!==this.authStep&&this.onAuthStepChange.dispatch(this),this},t.prototype.appHash=function(){return this.oauth.appHash()},t.prototype.setupUrls=function(){return this.apiServer=this.chooseApiServer(),this.urls={authorize:""+this.authServer+"/1/oauth2/authorize",token:""+this.apiServer+"/1/oauth2/token",signOut:""+this.apiServer+"/1/unlink_access_token",accountInfo:""+this.apiServer+"/1/account/info",getFile:""+this.fileServer+"/1/files/auto",postFile:""+this.fileServer+"/1/files/auto",putFile:""+this.fileServer+"/1/files_put/auto",metadata:""+this.apiServer+"/1/metadata/auto",delta:""+this.apiServer+"/1/delta",revisions:""+this.apiServer+"/1/revisions/auto",restore:""+this.apiServer+"/1/restore/auto",search:""+this.apiServer+"/1/search/auto",shares:""+this.apiServer+"/1/shares/auto",media:""+this.apiServer+"/1/media/auto",copyRef:""+this.apiServer+"/1/copy_ref/auto",thumbnails:""+this.fileServer+"/1/thumbnails/auto",chunkedUpload:""+this.fileServer+"/1/chunked_upload",commitChunkedUpload:""+this.fileServer+"/1/commit_chunked_upload/auto",fileopsCopy:""+this.apiServer+"/1/fileops/copy",fileopsCreateFolder:""+this.apiServer+"/1/fileops/create_folder",fileopsDelete:""+this.apiServer+"/1/fileops/delete",fileopsMove:""+this.apiServer+"/1/fileops/move",appsInfo:""+this.apiServer+"/1/apps/info",appsCheckDeveloper:""+this.apiServer+"/1/apps/check_developer",appsCheckRedirectUri:""+this.apiServer+"/1/apps/check_redirect_uri",getDb:""+this.apiServer+"/r5/datastores/get_datastore",getOrCreateDb:""+this.apiServer+"/r5/datastores/get_or_create_datastore",createDb:""+this.apiServer+"/r5/datastores/create_datastore",listDbs:""+this.apiServer+"/r5/datastores/list_datastores",deleteDb:""+this.apiServer+"/r5/datastores/delete_datastore",getSnapshot:""+this.apiServer+"/r5/datastores/get_snapshot",getDeltas:""+this.apiServer+"/r5/datastores/get_deltas",putDelta:""+this.apiServer+"/r5/datastores/put_delta",datastoreAwait:""+this.apiServer+"/r5/datastores/await"},this
},t.prototype.chooseApiServer=function(){var t,e;return e=Math.floor(Math.random()*(this.maxApiServer+1)),t=0===e?"":e.toString(),this.serverRoot.replace("$",t)},t.prototype.authStep=null,t.ERROR=0,t.RESET=1,t.PARAM_SET=2,t.PARAM_LOADED=3,t.AUTHORIZED=4,t.DONE=5,t.SIGNED_OUT=6,t.prototype.urlEncodePath=function(t){return x.Util.Xhr.urlEncodeValue(this.normalizePath(t)).replace(/%2F/gi,"/")},t.prototype.normalizePath=function(t){var e;if("/"===t.substring(0,1)){for(e=1;"/"===t.substring(e,e+1);)e+=1;return t.substring(e)}return t},t.prototype.authorizeUrl=function(){var t;return t=this.oauth.authorizeUrlParams(this.driver.authType(),this.driver.url()),this.urls.authorize+"?"+x.Util.Xhr.urlEncode(t)},t.prototype.getAccessToken=function(t){var e,r;return e=this.oauth.accessTokenParams(this.driver.url()),r=new x.Util.Xhr("POST",this.urls.token).setParams(e).addOauthParams(this.oauth),this.dispatchXhr(r,function(e,r){return e&&e.status===x.ApiError.INVALID_PARAM&&e.response&&e.response.error&&(e=new x.AuthError(e.response)),t(e,r)})},t.prototype.dispatchLongPollXhr=function(t,e,r){return null==r&&(r=6e4),this.dispatchXhr(t,e,r)},t.prototype.dispatchXhr=function(t,e,r){var n,i,o=this;return null==r&&(r=1e4),n=setTimeout(function(){return o.handleLongRequest(t)},2*r),t.setCallback(function(t,r,i,o){return clearTimeout(n),e(t,r,i,o)}),t.onError=this.xhrOnErrorHandler,t.prepare(),i=t.xhr,this.onXhr.dispatch(t)&&t.send(),i},t.prototype.handleXhrError=function(t,e){var r=this;return t.status===x.ApiError.INVALID_TOKEN&&this.authStep===d.DONE&&(this.authError=t,this.authStep=d.ERROR,this.onAuthStepChange.dispatch(this),this.driver&&this.driver.onAuthStepChange)?(this.driver.onAuthStepChange(this,function(){return r.onError.dispatch(t),e(t)}),null):(this.onError.dispatch(t),e(t),void 0)},t.prototype.handleLongRequest=function(){return this.setupUrls()},t.prototype.defaultServerRoot=function(){return"https://api$.dropbox.com"},t.prototype.defaultAuthServer=function(){return this.serverRoot.replace("api$","www")},t.prototype.defaultFileServer=function(){return this.serverRoot.replace("api$","api-content")},t.prototype.defaultDownloadServer=function(){return"https://dl.dropboxusercontent.com"},t.prototype.defaultWsServer=function(){return this.serverRoot.replace(/^https?:/,"wss:")},t.prototype.defaultMaxApiServer=function(){return 30},t.prototype.computeCredentials=function(){var t;t=this.oauth.credentials(),this.uid&&(t.uid=this.uid),this.serverRoot!==this.defaultServerRoot()&&(t.server=this.serverRoot),this.maxApiServer!==this.defaultMaxApiServer()&&(t.maxApiServer=this.maxApiServer),this.authServer!==this.defaultAuthServer()&&(t.authServer=this.authServer),this.fileServer!==this.defaultFileServer()&&(t.fileServer=this.fileServer),this.downloadServer!==this.defaultDownloadServer()&&(t.downloadServer=this.downloadServer),this._credentials=t},t}(),d=x.Client,x.Datastore=function(){function t(t,e){var r=this;this._datastore_manager=t,this._managed_datastore=e,this._dsid=this._managed_datastore.get_dsid(),this._handle=this._managed_datastore.get_handle(),this._record_cache=new G(this),this._last_used_timestamp=0,this.recordsChanged=new x.Util.EventSource,this.syncStatusChanged=new x.Util.EventSource,this._timeoutWrapper=function(t){return t},this._evt_mgr=new O,this._evt_mgr.register(this._managed_datastore.syncStateChanged,function(){return r._syncSoon(),r.syncStatusChanged.dispatch(null)}),this._syncPending=!1,this._closed=!1,this._metadata_table=new x.Datastore.Table(this,":info"),this._metadata_table.setResolutionRule("mtime","max")}return t.prototype.recordsChanged=null,t.prototype.syncStatusChanged=null,t.int64=function(t){var e,r;if(te.is_number(t)&&null!=t[ie.INT64_TAG])return ie.validateInt64(t);if(te.is_string(t)){if(!ie.is_valid_int64_string(t))throw new Error("Not a valid int64 in string form: "+t);return r=new Number(parseInt(t,10)),r[ie.INT64_TAG]=t,ie.validateInt64(r)}if(!te.is_number(t)||!isFinite(t))throw new Error("Not a finite number: "+t);if(Number(t)!==Math.round(t))throw new Error("Number is not an integer: "+t);if(e=t.toFixed(),!ie.is_valid_int64_string(e))throw new Error("Number not in int64 range: "+t);return r=new Number(t),r[ie.INT64_TAG]=e,ie.validateInt64(r)},t.isInt64=function(t){return ie.isInt64(t)},t.prototype.getModifiedTime=function(){var t;return t=this._metadata_table.getOrInsert("info",{}),t.get("mtime")},t.prototype.getTitle=function(){var t;return t=this._metadata_table.getOrInsert("info",{}),t.get("title")},t.prototype.setTitle=function(t){var e;if(null!=t&&!te.string(t))throw new Error("Title must be a string or null!");return e=this._metadata_table.getOrInsert("info",{}),e.set("title",t)},t.prototype.getTable=function(t){if(this._checkNotClosed(),!x.Datastore.Table.isValidId(t))throw new Error("Invalid table ID: "+t);return new x.Datastore.Table(this,t)},t.prototype.listTableIds=function(){return this._checkNotClosed(),this._managed_datastore.list_tables()},t.prototype.toString=function(){var t;return t=this._closed?"[closed] ":"","Datastore("+t+this._dsid+" ["+this._handle+"])"},t.prototype.close=function(){return this._closed=!0,this._evt_mgr.unregister_all(),this._listeners=[],this._datastore_manager._datasync.obj_manager.close(this._dsid),void 0},t.prototype.getId=function(){return this._dsid},t.prototype.getSyncStatus=function(){return{uploading:this._managed_datastore.get_outgoing_delta_count()>0}},t.isValidId=function(t){var e;return e=new RegExp(te.DS_ID_REGEX),te.is_string(t)&&e.test(t)},t.prototype._generateRid=function(){var t,e,r,n;for(n="_",e="_js_",r=Math.round(1e3*Date.now()),r<=this._last_used_timestamp&&(r=this._last_used_timestamp+1),this._last_used_timestamp=r,t=r.toString(32);t.length<11;)t="0"+t;return n+t+e+ie.randomWeb64String(5)},t.prototype._syncSoon=function(){var t=this;if(this._managed_datastore.is_deleted())throw new Error("Cannot sync deleted datastore "+this._dsid);return this._checkNotClosed(),this._syncPending||(this._syncPending=!0,setTimeout(this._timeoutWrapper(function(){return t._syncPending=!1,t._sync()}),0)),void 0},t.prototype._sync=function(){var t,e,r,n,i,o,s,a,u;this._checkNotClosed(),i=this._managed_datastore.sync(),n=this._resolveAffectedRecordMap(i),t=!1;for(s in n)for(r=n[s],a=0,u=r.length;u>a;a++)e=r[a],ne(s===e._tid,"tid mismatch"),t=!0,o=e._rid,this._managed_datastore.query(s,o)||(e._deleted=!0,this._record_cache.remove(s,o));return t&&this.recordsChanged.dispatch(new K(n,!1)),void 0},t.prototype._resolveAffectedRecordMap=function(t){var e,r,n,i,o;r={};for(o in t){i=t[o];for(n in i)e=this._record_cache.getOrCreate(o,n),null==r[o]&&(r[o]=[]),r[o].push(e)}return r},t.prototype._recordsChangedLocally=function(t){return t.length>0&&(this.recordsChanged.dispatch(K._fromRecordList(t,!0)),this._syncSoon()),void 0},t.prototype._checkNotClosed=function(){if(this._closed||!this._managed_datastore._open)throw new Error("Datastore is already closed: "+this);return void 0},t}(),ie=x.Datastore.impl={},te=x.Datastore.impl.T={},te.identity=function(t){return t},te.get_coerce_fn=function(t){return null!=t.coerce?t.coerce:null!=t.load_json?function(e){return e instanceof t?e:t.load_json(e)}:te.identity},te.get_T_fn=function(t){return null!=t.Type?t.Type:t},te.str=function(t){return te.is_string(t)?t:te.is_function(t)?t():JSON.stringify(t)},te.assert=function(t,e){if(!t)throw new Error(te.str(e))},ne=te.assert,te.check=function(t,e,r,n,i,o){if(t)return r;throw te.fail(e,r,n,i,o),new Error("unreachable")},te.safe_to_string=function(t){var e,r;try{if(r=t.toString(),"[object Object]"!==r)return r}catch(n){e=n}try{return JSON.stringify(t)}catch(n){e=n}try{if(r=t.constructor.name,null!=r?r.match(/^[A-Za-z0-9_]+$/):void 0)return r}catch(n){e=n}return"[T.safe_to_string failed]"},te.fail=function(t,e,r,n,i){var o,s;throw s=null!=r?null!=n?null!=i?"Wanted "+te.str(n)+", but "+te.str(r)+" in "+te.str(i)+" "+te.str(t):"Wanted "+te.str(n)+", but "+te.str(r)+" "+te.str(t):""+te.str(r)+" "+te.str(t):null!=n?null!=i?"Wanted "+te.str(n)+", but in "+te.str(i)+" "+te.str(t):"Wanted "+te.str(n)+", but "+te.str(t):""+te.str(t),o=new Error(""+s+": "+te.safe_to_string(e)),console.error(o),o},te.any=function(t){return t},te.defined=function(t,e,r,n){return null==r&&(r="defined"),te.check("undefined"!=typeof t,"is undefined",t,e,r,n),t},te.nonnull=function(t,e,r,n){return null==r&&(r="nonnull"),te.defined(t,e,r,n),te.check(null!=t,"is null",t,e,r,n),t},te.member=function(t){var e,r;return r="value in "+JSON.stringify(t),e="not in "+JSON.stringify(t),function(n,i,o,s){return null==o&&(o=r),te.check(ae.call(t,n)>=0,e,n,i,o,s)}},te.object=function(t,e,r,n){return null==r&&(r="object"),te.nonnull(t,e,r,n),te.check("object"==typeof t,"not an object",t,e,r,n),t},te.bool=function(t,e,r,n){return null==r&&(r="bool"),te.nonnull(t,e,r,n),te.check(t===!0||t===!1,"is not bool",t,e,r,n),t},te.string=function(t,e,r,n){return null==r&&(r="string"),te.nonnull(t,e,r,n),te.check(te.is_string(t),"is not a string",t,e,r,n),t},te.num=function(t,e,r,n){return null==r&&(r="num"),te.nonnull(t,e,r,n),te.check("number"==typeof t,"is not numeric",t,e,r,n),t},te.int=function(t,e,r,n){return null==r&&(r="int"),te.num(t,e,r,n),te.check(0===t%1,"is not an integer",t,e,r,n),t},te.uint=function(t,e,r,n){return null==r&&(r="uint"),te.int(t,e,r,n),te.check(t>=0,"is negative",t,e,r,n),t},te.nullable=function(t){var e,r;return r="nullable("+t+")",e=function(e,n,i,o){return null==i&&(i=function(){return r}),te.defined(e,n,i,o),null!=e&&te.get_T_fn(t)(e,n,i,o),e},e.toString=function(){return r},e.coerce=function(e){return null!=e?te.get_coerce_fn(t)(e):null},e.fromJSON=function(r){return null!=r?null!=t.fromJSON?t.fromJSON(r):e.coerce(r):null},e},te.array=function(t,e,r,n){return null==r&&(r="array"),te.nonnull(t,e,r,n),te.check(te.is_array(t),"is not an array",t,e,r,n),t},te.arrayOf=function(t){var e,r;return r="arrayOf("+t+")",e=function(e,n,i,o){var s,a,u,l,h;for(null==i&&(i=r),te.array(e,n,i,o),u=l=0,h=e.length;h>l;u=++l)s=e[u],a=function(){return null!=n?"element "+u+" of "+te.str(n):"element "+u},te.get_T_fn(t)(s,a,i,o);return e},e.toString=function(){return r},e.coerce=function(e){var n,i,o,s;for(te.array(e,null,r),s=[],i=0,o=e.length;o>i;i++)n=e[i],s.push(te.get_coerce_fn(t)(n));return s},e.fromJSON=function(n){var i,o,s,a;if(te.array(n,"fromJSON input",r),null!=t.fromJSON){for(a=[],o=0,s=n.length;s>o;o++)i=n[o],a.push(t.fromJSON(i));return a}return e.coerce(n)},e},te.instance=function(t,e,r,n,i){var o;if(!(e instanceof Function))throw new Error("Invalid type given: "+e);return t instanceof e||(null==n&&(n=e.name),te.check(!1,"got instance of "+(null!=t?null!=(o=t.constructor)?o.name:void 0:void 0),t,r,n,i)),t},te.unimplemented=function(t){return function(){throw new Error("unimplemented "+t)}},te.startsWith=function(t,e){return 0===t.lastIndexOf(e,0)},te.string_matching=function(t){var e;return te.string(t),te.check(/^[^].*[$]$/.test(t),"does not start with ^ and end with $",t),e="does not match regex "+t,function(r,n,i,o){return te.string(r,n,i,o),te.check(new RegExp(t).test(r),e,r,n,i,o),r}},te.is_defined=function(t){return"undefined"!=typeof t},te.is_bool=function(t){return t===!0||t===!1||t&&"object"==typeof t&&t.constructor===Boolean},te.is_number=function(t){return"number"==typeof t||t&&"object"==typeof t&&t.constructor===Number},te.is_json_number=function(t){return te.is_number(t)&&!isNaN(t)&&isFinite(t)},te.is_string=function(t){return"string"==typeof t||t&&"object"==typeof t&&t.constructor===String},te.is_function=function(t){return"function"==typeof t},te.is_object=function(t){return null!=t&&"object"==typeof t},te.is_array=function(t){return"[object Array]"===Object.prototype.toString.call(t)},te.is_empty=function(t){return 0===Object.keys(t).length},te.is_date=function(t){return"[object Date]"===Object.prototype.toString.call(t)},te.isUint8Array=function(t){return"[object Uint8Array]"===Object.prototype.toString.call(t)},te.is_simple_map=function(t){var e,r;if(null==t||"object"!=typeof t)return!1;for(e in t)if(r=t[e],!Object.prototype.hasOwnProperty.call(t,e))return!1;return!0},te.simple_map=function(t,e,r,n){var i,o;null==r&&(r="simple map"),te.object(t,e,r,n);for(i in t)o=t[i],te.check(Object.prototype.hasOwnProperty.call(t,i),function(){return"property "+i+" is inherited"},t,e,r,t);return t},te.simple_typed_map=function(t,e,r){var n,i,o;return n=te.get_coerce_fn(e),i=te.get_coerce_fn(r),o=function(n,i,o,s){var a,u;null==o&&(o=t),te.simple_map(n,i,o,s);for(a in n)u=n[a],te.get_T_fn(e)(a,"property",null,n),te.get_T_fn(r)(u,function(){return"value of property "+a},null,n);return n},o.coerce=function(e){var r,o,s;te.simple_map(e,null,t),o={};for(r in e)s=e[r],o[n(r)]=i(s);return o},o.fromJSON=function(e){var i,o,s;te.simple_map(e,null,t),o={};for(i in e)s=e[i],o[n(i)]=null!=r.fromJSON?r.fromJSON(s):s;return o},o},te.DS_ID_REGEX="^[-_a-z0-9]([-_a-z0-9.]{0,30}[-_a-z0-9])?$|^[.][-_a-zA-Z0-9]{1,100}$",te.dsid=function(t,e,r,n){return null==r&&(r="dsid"),te.string_matching(te.DS_ID_REGEX)(t,e,r,n),t},te.SS_ID_REGEX="^[-:._+/=a-zA-Z0-9][-._+/=a-zA-Z0-9]{0,31}$",te.tid=function(t,e,r,n){return null==r&&(r="tid"),te.string_matching(te.SS_ID_REGEX)(t,e,r,n),t},te.rowid=function(t,e,r,n){return null==r&&(r="rowid"),te.string_matching(te.SS_ID_REGEX)(t,e,r,n),t},te.field_name=function(t,e,r,n){return null==r&&(r="field name"),te.string_matching(te.SS_ID_REGEX)(t,e,r,n),t},function(){var t,e,r;r=[];for(t in te)e=te[t],te.hasOwnProperty(t)?r.push(function(t){return e.toString=function(){return"T."+t}}(t)):r.push(void 0);return r}(),ie.struct=oe={},oe.define=function(t,e){var r,n,i,o,s,a,u,l,h,c,p,d,f,_,y,g;for(te.string(t,"struct name"),te.array(e,"fields"),_=[],f={},s=y=0,g=e.length;g>y;s=++y){i=e[s],te.array(i,"field","field descriptor",e),te.check(2<=i.length&&i.length<=3,"does not have length 2 or 3",i,"field descriptor"),c=te.string(i[0],"field name","field descriptor",e),d=te.nonnull(i[1],"field type","field descriptor",e),p=i.length<=2?{}:te.nonnull(i[2],"map of field options","field descriptor",e);for(l in p)"init"!==l&&"initFn"!==l&&te.fail("unknown option "+l,p,"field options","field descrptor",e);ae.call(p,"init")>=0&&ae.call(p,"initFn")>=0&&te.fail("both 'init' and 'initFn' specified",p,"field options","field descriptor",e),u="initFn"in p?p.initFn:"init"in p?(a=p.init,function(t){return function(){return t}}(a)):null,r={name:c,type:d,initFn:u},o="undefined"!=typeof Z&&null!==Z?new Z(r):r,_.push(o),f[c]=o}return h="initializer for "+t+" (fields "+function(){var t,e,r;for(r=[],t=0,e=_.length;e>t;t++)i=_[t],r.push(i.name);return r}().join(", ")+")",n=function(t){var e,r,i;te.defined(t,"x","initializer");for(c in t)e=t[c],t.hasOwnProperty(c)&&te.check(null!=f[c],function(){return"has an unexpected field "+c},t,"initializer");for(r=0,i=_.length;i>r;r++)o=_[r],t[o.name]&&!t.hasOwnProperty(o.name)&&te.fail("Has an indirect property "+o.name,t,"initializer"),t.hasOwnProperty(o.name)?(e=t[o.name],this[o.name]=te.get_coerce_fn(o.type)(e)):null!=o.initFn?this[o.name]=o.initFn():te.fail("lacks the field "+o.name,t,"initializer");return n.Type(this,"initializer",h,this),this},n.Type=function(e,r,i,s){var a,u,l;for(te.defined(e,r,i,s),te.check(e instanceof n,function(){return"is not an instance of "+t},e,r,i,s),u=0,l=_.length;l>u;u++)o=_[u],te.check(e.hasOwnProperty(o.name),function(){return"lacks the field "+o.name},e,r,i,s),te.get_T_fn(o.type)(e[o.name],o.name,i,s);for(c in e)a=e[c],e.hasOwnProperty(c)&&te.check(null!=f[c],"has an unexpected field",c,r,i,s);return e},n.coerce=function(t){return t instanceof n?(n.Type(t),t):new n(t)},n.prototype.toString=function(){var t,e,r,n,i;for(e=this,t=[],n=0,i=_.length;i>n;n++)o=_[n],r=e[o.name],t.push(""+o.name+": "+(te.is_object(r)&&te.is_function(r.toString)?r.toString():JSON.stringify(r)));return"{"+t.join(", ")+"}"},n.prototype.toJSON=function(){var t,e,r,n;for(t=this,e=function(){return""+t},r=0,n=_.length;n>r;r++)o=_[r],te.get_T_fn(o.type)(this[o.name],o.name,null,e);return this},n.fromJSON=function(e){var r,i,o;te.simple_map(e,"input"),i=[];for(l in e)o=e[l],null==f[l]&&(i.push(""+l+": "+JSON.stringify(o)),delete e[l]);i.length>0&&console.info("Ignoring unknown fields while deserializing "+t+": "+i.join(", ")),r={};for(l in e)o=e[l],d=f[l].type,r[l]=null!=d.fromJSON?d.fromJSON(o):o;return new n(r)},n.toString=function(){return"struct "+t},n},Z=oe.define("StructField",[["name",te.string],["type",te.defined],["initFn",te.defined]]),oe.toJSO=function(t){var e,r,n,i;if("object"!=typeof t)return t;if(te.is_array(t))return function(){var r,n,i;for(i=[],r=0,n=t.length;n>r;r++)e=t[r],i.push(oe.toJSO(e));return i}();n={};for(r in t)i=t[r],t.hasOwnProperty(r)&&(n[r]=oe.toJSO(i));return n},oe.union_as_list=function(t,e){var r,n,i,o,s,a,u,l,h,c,p;for(te.string(t,"union name"),te.array(e,"variants"),n=function(){throw new Error("Use "+t+".from_array instead")},l={},u=[],h=function(e,r,i){var o;return o=oe.define(""+t+"."+e,i),o.prototype.tag=function(){return e},o.prototype.toString=function(){return""+t+"."+e+"("+JSON.stringify(this)+")"},o.prototype.toJSON=function(){var t,n,i,o,s,a;for(t=[e],s=0,a=r.length;a>s;s++)n=r[s],i=n[0],o=n[1],te.get_T_fn(o)(this[i],i),t.push(this[i]);return t},o.from_array=function(n){var i,s,a,u,l,h,c;for(l="initializer for "+t,te.array(n,"initializer",l),te.check(n.length===r.length+1,"does not have length "+(r.length+1),n,"initializer",l),te.check(n[0]===e,"does not have tag "+e,n,"initializer",l),i={_tag:e},a=h=0,c=r.length;c>h;a=++h)s=r[a],u=s[0],i[u]=n[a+1];return new o(i)},o.fromJSON=function(t){return t.length>r.length+1&&(t=t.slice(0,r.length+1)),o.from_array(t)},o.coerce=function(t){return t instanceof o?(o.Type(t),t):o.from_array(t)},l[e]=o,n[e]=o},c=0,p=e.length;p>c;c++)i=e[c],te.array(i,"variant","variant descriptor",e),te.check(2===i.length,"does not have length 2",i,"variant descriptor",e),a=te.string(i[0],"tag","tag",e),o=te.array(i[1],"fields","variant descriptor",e),s=o.slice(0),s.unshift(["_tag",te.member([a])]),h(a,o,s),u.push(a);return r="initializer for "+t+" (variants "+u.join(", ")+")",n.from_array=function(e){var r,n;return n="initializer for "+t,te.array(e,"initializer",n),te.check(e.length>=1,"lacks a tag",e,"initializer",n),r=e[0],te.string(r,"tag",n,e),te.member(u)(r),l[r].from_array(e)},n.fromJSON=function(e){var r,n;return n="initializer for "+t,te.array(e,"initializer",n),te.check(e.length>=1,"lacks a tag",e,"initializer",n),r=e[0],te.string(r,"tag",n,e),te.member(u)(r),l[r].fromJSON(e)},n.Type=function(e,r,n,i){var o;return null==n&&(n=""+t+".Type"),te.defined(e,r,n,i),te.defined(e.tag,"tag",n,i),o=e.tag(),te.string(o,"tag","initializer",e),te.member(u)(o),l[o].Type(e,null,"object of type "+t),e},n.coerce=function(t){var e,r;for(r in l)if(e=l[r],t instanceof e)return e.Type(t),t;return n.from_array(t)},n.toString=function(){return"union "+t},n},ie.nonzero_int64_approximate_regex=new RegExp("^-?[1-9][0-9]{0,18}$"),ie.int64_max_str="9223372036854775807",ie.int64_min_str="-9223372036854775808",ie.int64_string_less_than=function(t,e){var r,n,i;return t===e?!1:(n="0"===t.charAt(0),i="0"===e.charAt(0),n&&!i?!0:i&&!n?!1:(r=t.length===e.length?t>e:t.length>e.length,n&&i?r:!r))},ie.is_valid_int64_string=function(t){return te.is_string(t)?"0"===t?!0:ie.nonzero_int64_approximate_regex.test(t)?"-"===t.charAt(0)?t.length<ie.int64_min_str.length||t<=ie.int64_min_str:t.length<ie.int64_max_str.length||t<=ie.int64_max_str:!1:!1},ie.is_wrapped_atomic_field_value=function(t){var e,r,n,i;if(!te.is_simple_map(t))return!1;if(e=Object.keys(t),1!==e.length)return!1;switch(e[0]){case"B":return te.is_string(t.B);case"N":return"nan"===(n=t.N)||"+inf"===n||"-inf"===n;case"I":case"T":return r=null!=(i=t.I)?i:t.T,ie.is_valid_int64_string(r);default:return!1}},ie.is_atomic_field_value=function(t){return te.is_bool(t)||te.is_json_number(t)||te.is_string(t)||ie.is_wrapped_atomic_field_value(t)},ie.is_list_value=function(t){var e,r,n;if(te.is_array(t)){for(r=0,n=t.length;n>r;r++)if(e=t[r],!ie.is_atomic_field_value(e))return!1;return!0}return!1},ie.is_compound_field_value=function(t){return ie.is_atomic_field_value(t)||ie.is_list_value(t)},ie.atomic_field_value=function(t,e,r,n){return null==r&&(r="atomic field value"),te.check(ie.is_atomic_field_value(t),"is not an atomic field value",t,e,r,n),t},ie.list_value=function(t,e,r,n){return null==r&&(r="list value"),te.arrayOf(ie.atomic_field_value)(t,e,r,n),t},ie.compound_field_value=function(t,e,r,n){return null==r&&(r="field value"),te.is_array(t)?ie.list_value(t,e,r,n):ie.atomic_field_value(t,e,r,n)},ie.FieldOp=T=oe.union_as_list("FieldOp",[["P",[["value",ie.compound_field_value]]],["D",[]],["LC",[]],["LP",[["at",te.uint],["value",ie.atomic_field_value]]],["LI",[["before",te.uint],["value",ie.atomic_field_value]]],["LD",[["at",te.uint]]],["LM",[["from",te.uint],["to",te.uint]]]]),ie.datadict=te.simple_typed_map("datadict",te.field_name,ie.compound_field_value),ie.update_datadict=te.simple_typed_map("update_datadict",te.field_name,T),ie.Change=n=oe.union_as_list("Change",[["I",[["tid",te.tid],["rowid",te.rowid],["fields",ie.datadict]]],["U",[["tid",te.tid],["rowid",te.rowid],["updates",ie.update_datadict]]],["D",[["tid",te.tid],["rowid",te.rowid]]]]),ie.Delta=A=oe.define("Delta",[["rev",te.uint],["changes",te.arrayOf(n)],["nonce",te.string]]),F=oe.define("ListDatastoresResponseItem",[["dsid",te.string],["handle",te.string],["rev",te.uint],["info",te.nullable(ie.datadict),{init:null}]]),N=oe.define("ListDatastoresResponse",[["token",te.string],["datastores",te.arrayOf(F)]]),L=oe.define("GetSnapshotResponseRow",[["tid",te.string],["rowid",te.string],["data",ie.datadict]]),P=oe.define("GetSnapshotResponse",[["rev",te.uint],["rows",te.arrayOf(L)]]),s=oe.define("CreateDatastoreResponse",[["handle",te.string],["rev",te.uint],["created",te.bool]]),I=oe.define("GetDatastoreResponse",[["handle",te.string],["rev",te.uint]]),E=oe.define("DeleteDatastoresResponse",[]),q=oe.define("PutDeltasResponse",[["rev",te.nullable(te.uint),{init:null}],["conflict",te.nullable(te.string),{init:null}]]),R=oe.define("GetDeltasResponse",[["deltas",te.nullable(te.arrayOf(A)),{init:null}],["notfound",te.nullable(te.string),{init:null}]]),e=oe.define("AwaitResponseDeltas",[["deltas",te.simple_typed_map("deltas map",te.string,R)]]),ie.AwaitResponse=t=oe.define("AwaitResponse",[["get_deltas",te.nullable(e),{init:null}],["list_datastores",te.nullable(N),{init:null}]]),h=function(){function t(t){this.obj_manager=e(t)}var e;return e=function(t){var e,r;return r=new U(t),e=new H(r,t)},t.changeFromArray=function(t){return n.from_array(t)},t.prototype.close=function(){return this.obj_manager.destroy()},t.prototype.get_or_create=function(t,e){var r=this;return this.obj_manager.flob_client.get_or_create_db(t,function(n,i){return n?e(n):r.obj_manager.open(t,i.handle,function(t,r){return null!=t?e(t):e(null,r,i.created)})})},t.prototype.create=function(t,e,r){var n=this;return this.obj_manager.flob_client.create_db(t,e,function(e,i){return e?r(e):n.obj_manager.open(t,i.handle,function(t,e){return null!=t?r(t):r(null,e,i.created)})})},t.prototype.get_by_dsid=function(t,e){var r=this;return this.obj_manager.flob_client.get_db(t,function(n,i){return n?e(n):r.obj_manager.open(t,i.handle,function(t,r){return null!=t?e(t):e(null,r)})})},t.prototype.get=function(t,e){return this.obj_manager.open(t,function(t,r){return null!=t?e(t):e(null,r)})},t}(),r=function(){function t(){this.min_delay_millis=500,this.max_delay_millis=9e4,this.base=1.5,this._failures=0,this.log=!1}return t.prototype.set_log=function(t){this.log=t},t.prototype.set_max_delay_millis=function(t){this.max_delay_millis=t},t.prototype.get_backoff_millis=function(){var t,e;return this._failures+=1,e=Math.min(this.max_delay_millis,this.min_delay_millis*Math.pow(this.base,this._failures-1)),t=(.5+Math.random())*e,this.log&&console.log("get_backoff_millis: failures="+this._failures+", target_delay_millis="+e+", delay_millis="+t),t},t.prototype.reset=function(){return this._failures=0},t}(),$=function(){function t(){this.backoff=new r}var e,n;return n=6e4,e=0,t.prototype.run=function(t,e,r){var i,o,s,a,u,l,h,c=this;return s=null!=(l=e.do_retry)?l:function(){return!0},a=null!=(h=e.giveup_after_ms)?h:n,u=Date.now()+a,o=!1,i=function(){return o?void 0:t(function(){var t,e,n;return t=arguments[0],e=2<=arguments.length?le.call(arguments,1):[],o?void 0:t&&s(t)?Date.now()>u?(console.error("Giving up due to error",t),r(t)):(n=c.backoff.get_backoff_millis(),console.warn("Retrying in "+n+" ms due to error",t),setTimeout(i,n)):r.apply(null,[t].concat(le.call(e)))})},i(),function(){return o=!0}},t}(),k=function(){function t(t){this.client=t,this._retry=new $}var e,r;return r=10,e=2419200,t.prototype._run_with_retries=function(t,e,r){var n;return n={giveup_after_ms:1e3*t,do_retry:function(t){var e;return 0===t.status||500<=(e=t.status)&&600>e}},this._retry.run(r,n,e)},t.prototype.delete_db=function(t,e){var n=this;return this._run_with_retries(r,e,function(e){return n.client._deleteDatastore(t,function(t){return null!=t?e(t):e(null)})})},t.prototype.list_dbs=function(t){var r=this;return this._run_with_retries(e,t,function(t){return r.client._listDatastores(function(e,r){return null!=e?t(e):t(null,r)})})},t.prototype.get_or_create_db=function(t,e){var n=this;return this._run_with_retries(r,e,function(e){return n.client._getOrCreateDatastore(t,function(t,r){return null!=t?e(t):e(null,r)})})},t.prototype.create_db=function(t,e,n){var i=this;return this._run_with_retries(r,n,function(r){return i.client._createDatastore(t,e,function(t,e){return null!=t?r(t):r(null,e)})})},t.prototype.get_db=function(t,e){var n=this;return this._run_with_retries(r,e,function(e){return n.client._getDatastore(t,function(t,r){return null!=t?e(t):e(null,r)})})},t.prototype.await=function(t,r,n){var i,o=this;return i=this._run_with_retries(e,n,function(e){return o.client._datastoreAwait(t,r,function(t,r){return null!=t?e(t):e(null,r)})})},t.prototype.put_delta=function(t,r,n){var i,o=this;return i=function(t,e){return n(e)},this._run_with_retries(e,n,function(e){return o.client._putDelta(t,r,function(t){return null!=t?e(t):e(null)})})},t.prototype.get_snapshot=function(t,e){var n=this;return this._run_with_retries(r,e,function(e){return n.client._getSnapshot(t,function(t,r){return null!=t?e(t):e(null,r)})})},t}(),z=function(){function t(t,e,r){this.changes=t,this.undo_extras=e,this.finalized=null!=r?r:!1}var e;return e=function(t,e){var r,i,o,s,a;switch(s=null,i=null,t.tag()){case"I":s="D";break;case"U":s="U",i={};for(o in e)a=e[o],i[o]=null==a?["D"]:["P",a];break;case"D":s="I",i=ie.clone(e);break;default:throw new Error("Unknown change tag: "+t.tag())}return r=[s,t.tid,t.rowid],null!=i&&r.push(i),n.from_array(r)},t.prototype.add_change=function(t,e){return ne(!this.finalized,"add_change: already finalized"),this.changes.push(t),this.undo_extras.push(e)},t.prototype["package"]=function(t,e){return ne(this.finalized,"package: not finalized"),new A({changes:this.changes.slice(),nonce:t,rev:e})},t.prototype.inverse_changes=function(){var t,r,n,i,o,s;for(n=[],s=this.changes,r=i=0,o=s.length;o>i;r=++i)t=s[r],n.push(e(t,this.undo_extras[r]));return n.reverse(),n},t}(),ie.value_size=function(t){var e,r,n,i;if(te.is_string(t))return x.Util.countUtf8Bytes(t);if(te.is_bool(t))return 0;if(te.is_number(t))return 0;if(te.is_array(t)){for(e=20*t.length,n=0,i=t.length;i>n;n++)r=t[n],e+=ie.value_size(r);return e}if("object"!=typeof t)throw new Error("Unexpected value: "+t);if(null!=t.I)return 0;if(null!=t.N)return 0;if(null!=t.B)return Math.ceil(3*t.B.length/4);if(null!=t.T)return 0;throw new Error("Unexpected object: "+JSON.stringify(t))},M=102400,j=10485760,B=2097152,ie.size_difference_for_field_op=function(t,e,r){var n,i,o,s;switch(n=t.get(e),r.tag()){case"P":return i=r.value,n?ie.value_size(i)-ie.value_size(n):100+ie.value_size(i);case"D":return null!=n?-(100+ie.value_size(n)):0;case"LC":return ne(null==n,"can't create list for field that already exists"),100;case"LP":return ne(te.is_array(n),"LP on non-list"),ne(0<=(o=r.at)&&o<n.length,"bad index for LP"),ie.value_size(r.value)-ie.value_size(n[r.at]);case"LI":return null!=n?20+ie.value_size(r.value):120+ie.value_size(r.value);case"LD":return ne(te.is_array(n),"LD on non-list"),ne(0<=(s=r.at)&&s<n.length,"bad index for LD"),-(20+ie.value_size(n[r.at]));case"LM":return 0;default:throw new Error("unexpected field op type "+r.tag())}},ie.size_difference_for_change=function(t,e){var r,n,i,o,s,a,u;return s=function(){var s,l;switch(e.tag()){case"I":o=100,s=e.fields;for(r in s)u=s[r],o+=100+ie.value_size(u);return o;case"U":i=t.get_record(e.tid,e.rowid),te.assert(null!=i,function(){return"record not found: "+JSON.stringify(e)}),a=0,l=e.updates;for(r in l)n=l[r],a+=ie.size_difference_for_field_op(i,r,n);return a;case"D":return-t.get_record(e.tid,e.rowid)._size;default:throw new Error("unrecognized tag "+e.tag())}}()},W=function(){function t(t,e,r){var n,i;this._tid=t,this._rid=e,null==r&&(r={}),this._fields={},this._size=100;for(n in r)i=r[n],this._fields[n]=ie.clone(i),this._size+=100+ie.value_size(i)}return t.prototype.get=function(t){return this._fields[t]},t.prototype.get_all=function(){return this._fields},t.prototype.put=function(t,e){return null!=e?this._fields[t]=ie.clone(e):delete this._fields[t],void 0},t.prototype.apply_field_op=function(t,e){var r,n,i,o,s,a,u;switch(r=this._fields[t],e.tag()){case"P":this._fields[t]=ie.clone(e.value);break;case"D":delete this._fields[t];break;case"LC":ne(null==r,"can't create list for field that already exists"),this._fields[t]=[];break;case"LP":ne(te.is_array(r),"LP on non-list"),ne(0<=(i=e.at)&&i<r.length,"bad index for LP"),r[e.at]=ie.clone(e.value);break;case"LI":null!=r?(ne(te.is_array(r),"LI on non-list"),ne(0<=(o=e.before)&&o<=r.length,"bad index for LI"),r.splice(e.before,0,ie.clone(e.value))):(ne(0===e.before,"bad index for LI on nonexistent field"),this._fields[t]=[ie.clone(e.value)]);break;case"LD":ne(te.is_array(r),"LD on non-list"),ne(0<=(s=e.at)&&s<r.length,"bad index for LD"),r.splice(e.at,1);break;case"LM":ne(te.is_array(r),"LM on non-list"),ne(0<=(a=e.from)&&a<r.length,"bad from index for LM"),ne(0<=(u=e.to)&&u<r.length,"bad to index for LM"),n=r[e.from],r.splice(e.from,1),r.splice(e.to,0,n);break;default:throw new Error("unexpected field op type "+e.tag())}return void 0},t}(),ee=function(){function t(){this._records={}}return t.prototype.get=function(t){return this._records[t]},t.prototype.put=function(t,e){return null!=e?this._records[t]=e:delete this._records[t],void 0},t.prototype.has=function(t){return null!=this._records[t]},t.prototype.is_empty=function(){var t;for(t in this._records)return!1;return!0},t.prototype.list_record_ids=function(){var t,e;e=[];for(t in this._records)e.push(t);return e},t}(),l=function(){function t(t,e){var r,n,i,o,s,a;this._tables={},this._size=1e3;for(a in e){i=e[a],s=this._get_table(a);for(o in i)r=i[o],n=new W(a,o,r),this._check_record_size(t,a,o,n._size),s.put(o,n),this._size+=n._size}this._check_datastore_size(t,this._size)}return t.from_get_snapshot_resp=function(e){var r,n,i,o,s,a;for(r={},a=e.rows,i=0,o=a.length;o>i;i++)n=a[i],r[s=n.tid]||(r[s]={}),r[n.tid][n.rowid]=n.data;return new t(!1,r)},t.prototype._size_limit_exceeded=function(t,e){var r;if(t)throw r=new Error(e),r.code="SIZE_LIMIT_EXCEEDED",r;return console.warn(e),void 0},t.prototype._check_record_size=function(t,e,r,n){return n>M&&this._size_limit_exceeded(t,"Record ("+e+", "+r+") too large: "+n+" bytes"),void 0},t.prototype._check_datastore_size=function(t,e){return e>j&&this._size_limit_exceeded(t,"Datastore too large: "+e+" bytes"),void 0},t.prototype._TEST_calculate_size_from_scratch=function(){var t,e,r,n,i,o,s,a,u,l,h,c;n=0,l=this._tables;for(o in l)for(i=l[o],h=i.list_record_ids(),a=0,u=h.length;u>a;a++){r=h[a],e=i.get(r),n+=100,c=e.get_all();for(t in c)s=c[t],n+=100+ie.value_size(s)}return n},t.prototype.raw_data=function(){var t,e,r,n,i,o,s,a;
t={},s=this._tables;for(n in s)for(r=s[n],t[n]={},a=r.list_record_ids(),i=0,o=a.length;o>i;i++)e=a[i],t[n][e]=ie.clone(r.get(e).get_all());return t},t.prototype.get_record=function(t,e){var r;return null!=(r=this._tables[t])?r.get(e):void 0},t.prototype.apply_change=function(t,e){var r,n,i;switch(r=ie.size_difference_for_change(this,e),r>=0&&this._check_datastore_size(t,this._size+r),e.tag()){case"I":this._check_record_size(t,e.tid,e.rowid,r),i=this._apply_insert(e);break;case"U":n=this.get_record(e.tid,e.rowid),te.assert(null!=n,function(){return"apply_change: record does not exist: "+JSON.stringify(e)}),r>=0&&this._check_record_size(t,e.tid,e.rowid,n._size+r),i=this._apply_update(n,e),n._size+=r;break;case"D":i=this._apply_delete(e);break;default:throw new Error("unrecognized tag "+e.tag())}return this._size+=r,i},t.prototype._get_table=function(t){return null==this._tables[t]&&(this._tables[t]=new ee),this._tables[t]},t.prototype._apply_insert=function(t){var e,r;return r=this._get_table(t.tid),te.assert(!r.has(t.rowid),function(){return"_apply_insert: record already exists: "+JSON.stringify(t)}),e=new W(t.tid,t.rowid,t.fields),r.put(t.rowid,e),null},t.prototype._apply_update=function(t,e){var r,n,i,o,s,a,u;o={};try{a=e.updates;for(n in a)i=a[n],s=ie.clone(null!=(u=t.get(n))?u:null),t.apply_field_op(n,i),o[n]=s}catch(l){r=l;for(n in o)s=o[n],t.put(!1,n,s);throw r}return o},t.prototype._apply_delete=function(t){var e,r,n;return n=this._get_table(t.tid),te.assert(n.has(t.rowid),function(){return"_apply_delete: record does not exist: "+JSON.stringify(t)}),r=n.get(t.rowid),e=ie.clone(r.get_all()),n.put(t.rowid,null),n.is_empty()&&delete this._tables[t.tid],e},t.prototype.query=function(t,e){var r,n;return n=this._tables[t],null==n?null:(r=n.get(e),null==r?null:ie.clone(r.get_all()))},t.prototype.list_tables=function(){var t,e;return t=function(){var t;t=[];for(e in this._tables)t.push(e);return t}.call(this),t.sort(),t},t.prototype.list_rows_for_table=function(t){var e,r;return r=this._tables[t],null==r?[]:(e=r.list_record_ids(),e.sort(),e)},t.prototype.size=function(){return this._size},t}(),X=function(){function t(t,e,r,n,i,o){this.dbid=t,this.handle=e,this.datastore_model=r,this.resolver=n,this.sync_state=i,this.flob_client=o,this.syncStateChanged=new x.Util.EventSource,this._deleted=!1,this._open=!0,this._commit_queue=new Q}return t.fresh_managed_datastore=function(e,r,n,i,o,s){var a,u;return a=ie.randomWeb64String(10),u=new Y(a,null,i,[],[]),new t(e,r,n,o,u,s)},t.prototype.get_dsid=function(){return this.dbid},t.prototype.get_handle=function(){return this.handle},t.prototype.is_deleted=function(){return this._deleted},t.prototype.mark_deleted=function(){return this._deleted=!0},t.prototype.open=function(){if(this._open)throw new Error("Attempt to open datastore multiple times");return this._open=!0},t.prototype.close=function(){if(!this._open)throw new Error("Attempt to close datastore multiple times");return this._open=!1},t.prototype._do_sync=function(){var t,e,r,n,i,o,s,a,u,l,h,c,p,d,f,_,y,g,m,v,w,b,S;if(0===this.sync_state.server_deltas.length)return{};for(i=this.resolver.resolve(this.sync_state.unsynced_deltas,this.sync_state.server_deltas),n=i.rebased_deltas,t=i.affected_records,o=this.sync_state.unsynced_deltas.slice().reverse(),a=0,c=o.length;c>a;a++)for(r=o[a],v=r.inverse_changes(),u=0,p=v.length;p>u;u++)e=v[u],this.datastore_model.apply_change(!1,e);for(w=this.sync_state.server_deltas,l=0,d=w.length;d>l;l++)for(r=w[l],b=r.changes,h=0,f=b.length;f>h;h++)e=b[h],this.datastore_model.apply_change(!1,e);for(g=0,_=n.length;_>g;g++)for(r=n[g],r.undo_extras=[],S=r.changes,m=0,y=S.length;y>m;m++)e=S[m],s=this.datastore_model.apply_change(!1,e),r.undo_extras.push(s);return this.sync_state.update_unsynced_deltas(n),t},t.prototype._do_commit=function(){var t,e=this;if(!this.sync_state.delta_pending()&&(t=this.sync_state.get_next_commit(),null!=t))return this._commit_queue.request(function(){return e.flob_client.put_delta(e.handle,t,function(){return e._commit_queue.finish()})})},t.prototype._apply_and_queue_local_change=function(t,e){var r;return r=this.datastore_model.apply_change(t,e),this.sync_state.add_unsynced_change(e,r),void 0},t.prototype._update_mtime=function(){return null},t.prototype.perform_local_change=function(t){return this._apply_and_queue_local_change(!0,t),this._update_mtime(),this.syncStateChanged.dispatch(null)},t.prototype.sync=function(){var t;return this.has_unfinalized_changes&&this.sync_state.finalize(),t=this._do_sync(),this._do_commit(),t},t.prototype.get_outgoing_delta_count=function(){return this.sync_state.unsynced_deltas.length},t.prototype.get_incoming_delta_count=function(){return this.sync_state.server_deltas.length},t.prototype.has_unfinalized_changes=function(){return this.sync_state.has_unfinalized_changes()},t.prototype.receive_server_delta=function(t){return this.sync_state.receive_server_delta(t)?this.syncStateChanged.dispatch(null):this.syncStateChanged.dispatch(null)},t.prototype.query=function(t,e){return this.datastore_model.query(t,e)},t.prototype.list_tables=function(){var t;return function(){var e,r,n,i;for(n=this.datastore_model.list_tables(),i=[],e=0,r=n.length;r>e;e++)t=n[e],":info"!==t&&i.push(t);return i}.call(this)},t.prototype.list_rows_for_table=function(t){return this.datastore_model.list_rows_for_table(t)},t}(),Y=function(){function t(t,e,r,n,i){this.last_nonce=t,this.pending_delta=e,this.last_rev=r,this.unsynced_deltas=n,this.server_deltas=i,te.uint(this.last_rev,"last_rev")}return t.prototype.is_current=function(){return 0===this.unsynced_deltas.length&&0===this.server_deltas.length},t.prototype.add_unsynced_change=function(t,e){var r;return r=this.unsynced_deltas.length,0===r||this.unsynced_deltas[r-1].finalized?this.unsynced_deltas.push(new z([t],[e])):this.unsynced_deltas[r-1].add_change(t,e)},t.prototype._compact_deltas=function(){var t,e,r,n,i,o,s,a,u,l,h,c,p,d;if(n=this.unsynced_deltas.length,!(1>=n)){for(e=[],o=[],r=s=0,c=n-1;c>=0?c>s:s>c;r=c>=0?++s:--s){for(p=this.unsynced_deltas[r].changes,a=0,l=p.length;l>a;a++)t=p[a],e.push(t);for(d=this.unsynced_deltas[r].undo_extras,u=0,h=d.length;h>u;u++)i=d[u],o.push(i)}return this.unsynced_deltas=[new z(e,o,!0),this.unsynced_deltas[n-1]]}},t.prototype.get_next_commit=function(){var t,e,r;return ne(null==this.pending_delta,"delta pending"),t=this.unsynced_deltas.length,0===t?null:(this._compact_deltas(),e=this.unsynced_deltas[0],e.finalized?(r=this.last_nonce,this.pending_delta=e["package"](r,this.last_rev),this.pending_delta):null)},t.prototype.clear_pending=function(){return this.pending_delta=null},t.prototype.delta_pending=function(){return null!=this.pending_delta},t.prototype.has_unfinalized_changes=function(){var t,e;return e=this.unsynced_deltas.length,0===e?!1:(t=this.unsynced_deltas[e-1],!t.finalized)},t.prototype.finalize=function(){var t;if(this.has_unfinalized_changes())return t=this.unsynced_deltas[this.unsynced_deltas.length-1],ne(!t.finalized,"last delta already finalized"),t.finalized=!0},t.prototype.update_unsynced_deltas=function(t){return this.unsynced_deltas=t,this.last_rev+=this.server_deltas.length,this.server_deltas=[]},t.prototype.is_ours=function(t){return this.last_nonce===t.nonce},t.prototype.ack=function(t){return ne(this.is_ours(t),"not ours"),ne(null!=this.pending_delta,"no pending delta"),ne(0===this.server_deltas.length,"server deltas exist"),this.pending_delta=null,this.unsynced_deltas.shift(),this.last_rev++},t.prototype.receive_server_delta=function(t){var e,r;return r=this.server_deltas.length,e=r>0?this.server_deltas[r-1].rev+1:this.last_rev,ne(t.rev<=e,"was expecting rev "+e+", but got "+t.rev+" instead!"),t.rev<e?(console.warn("received old delta!"),!1):this.is_ours(t)?(this.ack(t),!1):(this.server_deltas.push(t),this.pending_delta=null,!0)},t}(),ie.DatastoreModel=l,V=function(){function t(t){this.update_manager=t,this.cancelled=!1,this.cancel_fn=null}return t.prototype.cancel=function(){return null!=this.cancel_fn&&this.cancel_fn(),this.cancelled=!0},t.prototype.poll=function(){var t,e=this;return t=function(){var r;if(!e.cancelled)return r=ie.clone(e.update_manager._handle_version_map),e.cancel_fn=e.update_manager.flob_client.await(r,e.update_manager._last_dslist_token,function(n,i){var o,s,a,u,l,h,c,p,d,f;if(e.cancel_fn=null,n)return 0===n.status?(console.log("await deltas failed (offline):",n),setTimeout(t,1e4)):n.status&&500<=(p=n.status)&&599>=p?(console.log("server error:",n),setTimeout(t,2e3)):(console.error("Got error in longpoll:",n),setTimeout(t,1e4));if(null!=i.get_deltas){d=i.get_deltas.deltas;for(u in d)if(s=d[u],null!=s.notfound)e.update_manager._data_queue.push({handle:u,notfound:s.notfound}),delete e.update_manager._handle_version_map[u];else if(null!=s.deltas){for(f=s.deltas,h=0,c=f.length;c>h;h++)a=f[h],e.update_manager._data_queue.push({handle:u,delta:a});l=r[u]+s.deltas.length,o=e.update_manager._handle_version_map[u],null!=o&&(e.update_manager._handle_version_map[u]=Math.max(o,l))}}return null!=i.list_datastores&&(e.update_manager._last_dslist_token=i.list_datastores.token,e.update_manager._data_queue.push({dslist:i.list_datastores})),setTimeout(t,0)})},t()},t}(),U=function(){function t(t){this.flob_client=t,this._data_queue=null,this._handle_version_map={},this._last_dslist_token=".",this._pending_poll=null,this._running=!1}return t.prototype.run=function(t){return this._data_queue=new o(t),this._running=!0,this._do_longpoll()},t.prototype.stop=function(){return this._pending_poll?this._pending_poll.cancel():void 0},t.prototype.add_poll=function(t,e){var r,n;return ne(this._running,"update manager is not running"),r=this._handle_version_map[t],n=e,null!=r&&(n=Math.max(e,r)),this._handle_version_map[t]=n,this._do_longpoll()},t.prototype.remove_poll=function(t){return ne(this._running,"update manager is not running"),t in this._handle_version_map?(delete this._handle_version_map[t],this._do_longpoll()):void 0},t.prototype._do_longpoll=function(){return ne(this._running,"update manager is not running"),this._pending_poll&&(this._pending_poll.cancel(),this._pending_poll=null),this._pending_poll=new V(this),this._pending_poll.poll()},t}(),H=function(){function t(t,e){this.update_manager=t,this.flob_client=e,this.update_manager.run(this._handle_server_update.bind(this)),this._cached_objects={},this._dslist_listener=null,this._handle_to_dsid_map={}}return t.prototype.destroy=function(){var t;for(t in this._cached_objects)this._cached_objects[t].close();return this.update_manager.stop()},t.prototype.set_dslist_listener=function(t){return this._dslist_listener=t},t.prototype._evict=function(t){var e;return e=this._handle_to_dsid_map[t],null!=e?(delete this._handle_to_dsid_map[t],e in this._cached_objects&&this._cached_objects[e].mark_deleted(),this.update_manager.remove_poll(t)):void 0},t.prototype.close=function(t){var e;if(t in this._cached_objects)return e=this._cached_objects[t].get_handle(),this._cached_objects[t].close();throw new Error("Attempt to close unknown datastore: "+t)},t.prototype._handle_server_update=function(t,e){var r,n,i;return t.dslist?(this._dslist_listener&&this._dslist_listener(t.dslist),e(null)):(i=t.handle,r=this._handle_to_dsid_map[i],null==r?(console.log("unknown handle "+i+" (maybe datastore was evicted)",t,this._handle_to_dsid_map,this._cached_objects),e(null)):(n=t.delta,null!=t.notfound?(this._evict(i),e(null)):this._retrieve(r,i,function(t,r){return t?e(t):(r.receive_server_delta(n),e(null))})))},t.prototype.open=function(t,e,r){return this._cached_objects[t]&&this._cached_objects[t].open(),this._retrieve(t,e,r)},t.prototype._retrieve=function(t,e,r){var n,i=this;return n=this._cached_objects[t],null!=n?r(null,n):(this._handle_to_dsid_map[e]=t,this.flob_client.get_snapshot(e,function(n,o){var s,a,u;return null!=n?r(n):null!=i._cached_objects[t]?r(null,i._cached_objects[t]):(s=l.from_get_snapshot_resp(o),u=new D,a=X.fresh_managed_datastore(t,e,s,o.rev,u,i.flob_client),i.update_manager.add_poll(e,a.sync_state.last_rev),i._cached_objects[t]=a,r(null,a))}))},t}(),ie.FieldOpTransformer=C=function(){function t(t){var i,o,s,a,l,h,c,p,d,g,m,v=this;for(this.rule_name=null!=t?t:"default",this.precedence=n[this.rule_name],this._transforms={},s=0,h=r.length;h>s;s++)o=r[s],this._transforms[o]={};for(m=["P","D"],a=0,c=m.length;c>a;a++)for(o=m[a],l=0,p=e.length;p>l;l++)i=e[l],this._transforms[o][i]=f,this._transforms[i][o]=_;for(g=0,d=e.length;d>g;g++)i=e[g],"LC"===i?this._transforms.LC.LC=function(){return[null,null]}:(this._transforms.LC[i]=_,this._transforms[i].LC=f);this._transforms.P.P=function(t,e){var r;return r=v.precedence(t.value,e.value),"left"===r?[t,null]:[null,e]},this._transforms.P.D=function(t,e){var r;return r=v.precedence(t.value,null),"left"===r?[t,null]:[null,e]},this._transforms.D.P=function(t,e){var r;return r=v.precedence(null,e.value),"left"===r?[t,null]:[null,e]},this._transforms.D.D=function(t,e){var r;return r=v.precedence(null,null),"left"===r?[t,null]:[null,e]},this._transforms.LP.LP=function(t,e){var r;return t.at!==e.at?[t,e]:(r=v.precedence(t.value,e.value),"left"===r?[t,null]:[null,e])},this._transforms.LP.LI=function(t,e){var r;return r=u(t),r.at+=e.before<=t.at?1:0,[r,e]},this._transforms.LP.LD=function(t,e){var r;return t.at===e.at?[null,e]:(r=u(t),r.at-=e.at<t.at?1:0,[r,e])},this._transforms.LP.LM=function(t,e){var r;return r=u(t),t.at===e.from?r.at=e.to:(r.at-=e.from<r.at?1:0,r.at+=e.to<=r.at?1:0),[r,e]},this._transforms.LI.LP=y(this._transforms.LP.LI),this._transforms.LI.LI=function(t,e){var r,n,i;return i=[u(t),u(e)],r=i[0],n=i[1],t.before<e.before?n.before+=1:r.before+=1,[r,n]},this._transforms.LI.LD=function(t,e){var r,n,i;return i=[u(t),u(e)],r=i[0],n=i[1],r.before-=e.at<t.before?1:0,n.at+=t.before<=e.at?1:0,[r,n]},this._transforms.LI.LM=function(t,e){var r,n,i,o;return o=[u(t),u(e)],n=o[0],i=o[1],t.before===e.to+1&&e.from<=e.to?[t,e]:t.before===e.to&&e.from>e.to?(n.before++,i.from++,[n,i]):(r=e.from<t.before?t.before-1:t.before,i.from+=t.before<=e.from?1:0,n.before=e.to<r?r+1:r,i.to+=r<=e.to?1:0,[n,i])},this._transforms.LD.LP=y(this._transforms.LP.LD),this._transforms.LD.LI=y(this._transforms.LI.LD),this._transforms.LD.LD=function(t,e){var r,n,i;return t.at===e.at?[null,null]:(i=[u(t),u(e)],r=i[0],n=i[1],t.at<e.at?n.at-=1:r.at-=1,[r,n])},this._transforms.LD.LM=function(t,e){var r,n,i;return t.at===e.from?(r=u(t),r.at=e.to,[r,null]):(i=[u(t),u(e)],r=i[0],n=i[1],r.at-=e.from<r.at?1:0,r.at+=e.to<=r.at?1:0,n.to+=n.from<n.to?1:0,n.from-=t.at<n.from?1:0,n.to-=t.at<n.to?1:0,n.to-=n.from<n.to?1:0,[r,n])},this._transforms.LM.LP=y(this._transforms.LP.LM),this._transforms.LM.LI=function(t,e){var r,n,i,o;return o=[u(t),u(e)],n=o[0],i=o[1],e.before===t.to+1&&t.from<=t.to?[t,e]:e.before===t.to&&t.from>t.to?(n.from++,n.to++,[n,i]):(r=t.from<e.before?e.before-1:e.before,n.from+=e.before<=t.from?1:0,i.before=t.to<r?r+1:r,n.to+=r<=t.to?1:0,[n,i])},this._transforms.LM.LD=y(this._transforms.LD.LM),this._transforms.LM.LM=function(t,e){var r,n,i,o,s,a,l,h,c,p,d;return t.from===e.from?t.to===e.to?[null,null]:e.from===e.to?[t,e]:(o=u(e),o.from=t.to,[null,o]):t.to===t.from?(i=u(t),i.from+=(e.to<=t.from)-(e.from<t.from),t.from===e.to&&e.from<e.to&&i.from--,i.to=i.from,[i,e]):e.to===e.from?(o=u(e),o.from+=(t.to<=e.from)-(t.from<e.from),o.to=o.from,[t,o]):(l=[u(t),u(e)],i=l[0],o=l[1],t.to===e.to&&t.from>t.to&&e.from>e.to?(i.to++,e.from>t.from?i.from++:o.from++,[i,o]):t.from===e.to&&e.from===t.to&&t.from<t.to?(o.from--,i.from++,[i,o]):t.from>t.to&&e.from<e.to&&e.to+1===t.to?[t,e]:(h=[t.to,t.from],s=h[0],r=h[1],s+=t.from<s?1:0,s-=e.from<s?1:0,s+=e.to<s?1:0,r-=e.from<r?1:0,r+=e.to<=r?1:0,s-=s>r?1:0,c=[e.to,e.from],a=c[0],n=c[1],a+=e.from<a?1:0,a-=t.from<a?1:0,a+=t.to<=a?1:0,n-=t.from<n?1:0,n+=t.to<=n?1:0,a-=a>n?1:0,p=[s,r],i.to=p[0],i.from=p[1],d=[a,n],o.to=d[0],o.from=d[1],[i,o]))}}var e,r,n,i,o,s,a,u,l,h,c,p,d,f,_,y,g,m,v;for(y=function(t){return ne(null!=t),function(e,r){var n,i,o;return o=t(r,e),n=o[0],i=o[1],[i,n]}},i=["null","bool","num","str","blob","ts","list"],o={},h=m=0,v=i.length;v>m;h=++m)g=i[h],o[g]=h;return l=function(t){if(null==t)return"null";if(te.is_bool(t))return"bool";if(null!=t.I||te.is_number(t))return"num";if(te.is_string(t))return"str";if(null!=t.B)return"blob";if(null!=t.T)return"ts";if(te.is_array(t))return"list";throw new Error("Unrecognized value "+t)},d=function(t){return te.is_number(t)||null!=t.I},s=function(t){return null!=t.I?parseInt(t.I):t},p=function(t,e){var r,n,i;for(r=n=0,i=t.length;i>=0?i>n:n>i;r=i>=0?++n:--n){if(r>=e.length)return!1;if(c(t[r],e[r]))return!0;if(c(e[r],t[r]))return!1}return e.length>t.length},t._is_less_than=c=function(t,e){var r,n;if(r=l(t),n=l(e),r!==n)return o[r]<o[n];if("null"===r)return!1;if("bool"===r)return e&&!t;if("num"===r)return null!=t.I&&null!=e.I?ie.int64_string_less_than(t.I,e.I):s(t)<s(e);if("str"===r)return e>t;if("blob"===r)return t.B<e.B;if("ts"===r)return parseInt(t.T,10)<parseInt(e.T,10);if("list"===r)return p(t,e);throw new Error("unknown type "+r)},t._compute_sum=a=function(t,e,r){var n,i,o,s,a,u;return n=null!=t.I&&null!=e.I&&null!=r.I,null!=t.I&&(t=parseInt(t.I)),null!=e.I&&(e=parseInt(e.I)),null!=r.I&&(r=parseInt(r.I)),s=0x8000000000000000,a=0x10000000000000000,u=0xfffffffffffff800,i=e-t,o=r+i,n&&(o>=s&&(o-=u),-s>o&&(o+=u),o={I:""+o}),o},_=function(t,e){return[null,e]},f=function(t){return[t,null]},r=["P","D","LC","LP","LI","LD","LM"],e=["LC","LP","LI","LD","LM"],t.copy=u=function(t){return T.from_array(JSON.parse(JSON.stringify(t)))},n={"default":function(){return"right"},remote:function(){return"right"},local:function(){return"left"},min:function(t,e){return c(t,e)?"left":"right"},max:function(t,e){return c(t,e)?"right":"left"},sum:function(){return"right"}},t.prototype.transform=function(t,e,r){var n,i,o,s,u;return null==r&&(r=null),"sum"===this.rule_name&&"P"===t.tag()&&"P"===e.tag()&&(null==r&&(r={I:"0"}),d(r)&&d(t.value)&&d(e.value))?(o=a(r,t.value,e.value),n=i=T.from_array(["P",o]),[n,i,e.value]):(s=this._transforms[t.tag()][e.tag()](t,e),u=function(){switch(e.tag()){case"P":return e.value;case"D":return null;default:return{L:!0}}}(),s.push(u),s)},t}(),ie.ChangeTransformer=i=function(){function t(){this._transform_rules={},this._default_transformer=new C}var e,r,i,o,s,a,u,l;for(e={},l=["default","local","remote","min","max","sum"],a=0,u=l.length;u>a;a++)i=l[a],e[i]=new C(i);return s=function(t){return ne(null!=t),function(e,r){var n,i,o;return o=t(r,e),n=o[0],i=o[1],[i,n]}},r=function(t){return t instanceof Array?t.slice():t},o=function(t,e){return t.tid===e.tid&&t.rowid===e.rowid},t.is_no_op=function(t){var e,r,n;if("U"!==t.tag())return!1;n=t.updates;for(r in n)return e=n[r],!1;return!0},t.compact=function(t){var e,r,n,i;for(e=[],n=0,i=t.length;i>n;n++)r=t[n],this.is_no_op(r)||e.push(r);return e},t.prototype.set_field_transformer=function(t,r,n){var i;return null==(i=this._transform_rules)[t]&&(i[t]={}),this._transform_rules[t][r]=e[n]},t.prototype.get_field_transformer=function(t,r){var n;return t in this._transform_rules?null!=(n=this._transform_rules[t][r])?n:this._default_transformer:e["default"]},t.prototype.transform_ii=function(t,e){var i,s,a;return o(t,e)?(i=function(t){var e,i,o,s,a;o={},a=t.fields;for(i in a)s=a[i],o[i]=T.from_array(["P",r(s)]);return e=n.from_array(["U",t.tid,t.rowid,o]),e.undo_extra={},e},s=i(t),a=i(e),this.transform_uu(s,a)):[[t],[e]]},t.prototype.transform_iu=function(t,e){return o(t,e)?ne(!1,"Couldn't have updated a row that hasn't been inserted yet!"):[[t],[e]]},t.prototype.transform_id=function(t,e){return o(t,e)?ne(!1,"Couldn't have deleted a row that hasn't been inserted yet!"):[[t],[e]]},t.prototype.transform_ui=s(t.prototype.transform_iu),t.prototype.transform_uu=function(t,e){var r,i,s,a,u,l,h,c,p,d,f,_,y,g,m,v,w,b,S;if(!o(t,e))return[[t],[e]];g=[{},{}],p=g[0],d=g[1],c={},m=t.updates;for(s in m)r=m[s],s in e.updates?(i=e.updates[s],f=null!=(w=t.undo_extra[s])?w:null,_=this.get_field_transformer(t.tid,s),b=_.transform(r,i,f),a=b[0],u=b[1],y=b[2],null!=a&&(p[s]=a,c[s]=null!=y?y:null),null!=u&&(d[s]=u)):(p[s]=r,c[s]=null!=(v=t.undo_extra[s])?v:null);S=e.updates;for(s in S)i=S[s],s in t.updates||(d[s]=i);return l=n.from_array(["U",t.tid,t.rowid,p]),l.undo_extra=c,h=n.from_array(["U",e.tid,e.rowid,d]),[[l],[h]]},t.prototype.transform_ud=function(t,e){return o(t,e)?[[],[e]]:[[t],[e]]},t.prototype.transform_di=s(t.prototype.transform_id),t.prototype.transform_du=s(t.prototype.transform_ud),t.prototype.transform_dd=function(t,e){return o(t,e)?[[],[]]:[[t],[e]]},t}(),ie.DefaultResolver=D=function(){function t(){this._change_transformer=new i}return t.prototype.add_resolution_rule=function(t,e,r){return this._change_transformer.set_field_transformer(t,e,r)},t.prototype._transform_one=function(t,e){var r,n,o,s,a;return r=function(t){switch(t.tag()){case"I":return"i";case"U":return"u";case"D":return"d";default:throw new Error("unrecognized op type "+t.tag())}},s="transform_"+r(t)+r(e),a=this._change_transformer[s](t,e),n=a[0],o=a[1],n=i.compact(n),o=i.compact(o),[n,o]},t.prototype._transform_list=function(t,e){var r,n,i,o,s,a,u,l,h,c,p,d,f,_;if(0===t.length)return[[],e];if(0===e.length)return[t,[]];for(r=t[0],n=e[0],d=this._transform_one(r,n),o=d[0],s=d[1],f=this._transform_list(t.slice(1),s),i=f[0],s=f[1],l=0,c=i.length;c>l;l++)a=i[l],o.push(a);for(_=this._transform_list(o,e.slice(1)),o=_[0],u=_[1],h=0,p=u.length;p>h;h++)a=u[h],s.push(a);return[o,s]},t.prototype._resolve=function(t,e){var r,n,i,o,s,a,u;for(o=e.slice(),n=[],s=0,a=t.length;a>s;s++)i=t[s],u=this._transform_list(i,o),r=u[0],o=u[1],n.push(r);return[n,o]},t.prototype.resolve=function(t,e){var r,i,o,s,a,u,l,h,c,p,d,f,_,y,g,m,v,w,b,S,D,E,A,x,O,U,T,C,k,I,R,P;for(d=[],m=0,S=t.length;S>m;m++){for(h=t[m],i=[],I=h.changes,p=v=0,D=I.length;D>v;p=++v)s=I[p],u=n.from_array(JSON.parse(JSON.stringify(s))),u.undo_extra=ie.clone(h.undo_extras[p]),i.push(u);d.push(i)}for(y=[],w=0,E=e.length;E>w;w++)for(h=e[w],R=h.changes,b=0,A=R.length;A>b;b++)o=R[b],y.push(o);for(P=this._resolve(d,y),f=P[0],l=P[1],_=[],p=T=0,x=f.length;x>T;p=++T){for(a=f[p],g=null,c=t[p].finalized,C=0,O=a.length;O>C;C++)s=a[C],delete s.undo_extra;a.length>0&&_.push(new z(a,g,c))}for(r={},k=0,U=l.length;U>k;k++)o=l[k],o.tid in r||(r[o.tid]={}),r[o.tid][o.rowid]=!0;return{rebased_deltas:_,affected_records:r}},t}(),Q=function(){function t(){this._waiting=[],this._running=!1}return t.prototype._run_next=function(){var t;this._running||this._waiting.length>0&&(t=this._waiting[0],this._waiting.shift(),this._running=!0,t())},t.prototype.request=function(t){return this._waiting.push(t),this._run_next()},t.prototype.finish=function(){return this._running=!1,setTimeout(this._run_next.bind(this),0)},t}(),o=function(){function t(t){this.consumer=t,this.items=[],this.sync_queue=new Q}return t.prototype.consume=function(){var t=this;return this.sync_queue.request(function(){var e;return 0===t.items.length?t.sync_queue.finish():(e=t.items.shift(),t.consumer(e,function(e){if(e)throw e;return t.sync_queue.finish(),t.consume()}))})},t.prototype.push=function(t){return this.items.push(t),this.consume()},t.prototype.run=function(){return this.consume()},t}(),ie.clone=function(t){var e,r,n,i,o,s,a;if(t instanceof Array){for(a=[],o=0,s=t.length;s>o;o++)e=t[o],a.push(ie.clone(e));return a}if(null!=t&&"object"==typeof t){n={};for(r in t)i=t[r],n[r]=ie.clone(i);return n}return t},ie.WEB64_ALPHABET="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",ie.randomElement=function(t){return t[Math.floor(Math.random()*t.length)]},ie.randomWeb64String=function(t){var e;return function(){var r,n;for(n=[],e=r=0;t>=0?t>r:r>t;e=t>=0?++r:--r)n.push(ie.randomElement(ie.WEB64_ALPHABET));return n}().join("")},ie.uint8ArrayFromBase64String=function(t){var e,r,n,i,o;for(t=t.replace("-","+").replace("_","/"),e=x.Util.atob(t),n=e.length,i=new Uint8Array(n),r=o=0;n>=0?n>o:o>n;r=n>=0?++o:--o)i[r]=e.charCodeAt(r);return i},ie.dbase64FromBase64=function(t){return t.replace(/[+]/g,"-").replace(/[/]/g,"_").replace(/[\=]+$/g,"")},ie.base64StringFromUint8Array=function(t){var e,r,n,i,o;for(r="",i=0,o=t.length;o>i;i++)e=t[i],r+=String.fromCharCode(e);return n=x.Util.btoa(r),ie.dbase64FromBase64(n)},ie.INT64_TAG="dbxInt64",ie.isInt64=function(t){var e;return t&&"object"==typeof t&&t.constructor===Number&&isFinite(t)?(e=t[ie.INT64_TAG],!te.is_string(e)||"0"!==e&&!ie.nonzero_int64_approximate_regex.test(e)?!1:!0):!1},ie.validateInt64=function(t){var e,r;if(!t&&"object"==typeof t&&t.constructor===Number&&isFinite(t))throw new Error("Not a finite boxed number: "+t);if(r=t[ie.INT64_TAG],!te.is_string(r)||"0"!==r&&!ie.nonzero_int64_approximate_regex.test(r))throw new Error("Missing or invalid tag in int64: "+r);if(e=parseInt(r,10),e!==Number(t))throw new Error("Tag in int64 does not match value "+Number(t)+": "+r);return t},ie.toDsValue=function(t,e){var r,n;if(null==e&&(e=!0),null===t||"undefined"==typeof t)throw new Error("Bad value: "+t);if(te.is_string(t))return t;if(te.is_bool(t))return t;if(te.is_number(t)){if(null!=t[ie.INT64_TAG])return ie.validateInt64(t),{I:t[ie.INT64_TAG]};if(isFinite(t))return t;if(isNaN(t))return{N:"nan"};if(1/0===Number(t))return{N:"+inf"};if(Number(t)===-1/0)return{N:"-inf"};throw new Error("Unexpected number: "+t)}if(te.is_array(t)){if(e)return function(){var e,r,i;for(i=[],e=0,r=t.length;r>e;e++)n=t[e],i.push(ie.toDsValue(n,!1));return i}();throw new Error("Nested array not allowed: "+JSON.stringify(t))}if(te.is_date(t))return r=Math.round(t.getTime()),{T:""+r};if(te.isUint8Array(t))return{B:ie.base64StringFromUint8Array(t)};throw new Error("Unexpected object: "+JSON.stringify(t))},ie.fromDsValue=function(t,e,r,n){if(te.is_string(n))return n;if(te.is_bool(n))return n;if(te.is_number(n))return n;if(te.is_array(n))return new x.Datastore.List(t,e,r);if("object"!=typeof n)throw new Error("Unexpected value: "+n);if(null!=n.I)return x.Datastore.int64(n.I);if(null==n.N){if(null!=n.B)return ie.uint8ArrayFromBase64String(n.B);if(null!=n.T)return new Date(parseInt(n.T,10));throw new Error("Unexpected object: "+JSON.stringify(n))}switch(n.N){case"nan":return 0/0;case"+inf":return 1/0;case"-inf":return-1/0;default:throw new Error("Unexpected object: "+JSON.stringify(n))}},ie.matchDsValues=function(t,e){var r,n,i,o,s;n=function(t,e){if(null==t)throw new Error("Unexpected object: "+t);return null==e?!1:r(t,e)},r=function(t,e){var r,i,o,s,a,u;if(ie.toDsValue(t),te.is_string(t)&&te.is_string(e))return String(t)===String(e);if(te.is_bool(t)&&te.is_bool(e))return"object"==typeof t&&(t=t.valueOf()),"object"==typeof e&&(e=e.valueOf()),Boolean(t)===Boolean(e);if(te.is_number(t)&&(te.is_number(e)||null!=e.N||null!=e.I))return e=ie.fromDsValue(void 0,void 0,void 0,e),t[ie.INT64_TAG]&&e[ie.INT64_TAG]?(s=[x.Datastore.int64(t),x.Datastore.int64(e)],t=s[0],e=s[1],String(t[ie.INT64_TAG])===String(e[ie.INT64_TAG])):isNaN(t)&&isNaN(e)?!0:Number(t)===Number(e);if(te.is_array(t)&&te.is_array(e)){if(t.length!==e.length)return!1;for(r=i=0,a=t.length-1;a>=0?a>=i:i>=a;r=a>=0?++i:--i)if(!n(t[r],e[r]))return!1;return!0}if(te.is_date(t)&&(te.is_date(e)||null!=e.T))return null!=e.T&&(e=ie.fromDsValue(void 0,void 0,void 0,e)),t-0===e-0;if(te.isUint8Array(t)&&(te.isUint8Array(e)||null!=e.B)){if(null!=e.B&&(e=ie.fromDsValue(void 0,void 0,void 0,e)),t.length!==e.length)return!1;for(r=o=0,u=t.length-1;u>=0?u>=o:o>=u;r=u>=0?++o:--o)if(t[r]!==e[r])return!1;return!0}return!1};for(i in t)if(s=t[i],o=n(s,e[i]),!o)return o;return!0},G=function(){function t(t){this._datastore=t,this._cache={}}return t.prototype.get=function(t,e){return null==this._cache[t]?null:this._cache[t][e]},t.prototype.getOrCreate=function(t,e){var r;return null==this._cache[t]&&(this._cache[t]={}),r=this._cache[t][e],null==r&&(r=this._cache[t][e]=new x.Datastore.Record(this._datastore,t,e)),r},t.prototype.remove=function(t,e){return delete this._cache[t][e],te.is_empty(this._cache[t])&&delete this._cache[t],void 0},t}(),O=function(){function t(){this._registered_handlers=[]}return t.prototype.register=function(t,e){return t.addListener(e),this._registered_handlers.push([t,e]),void 0},t.prototype.unregister_all=function(){var t,e,r,n,i,o;for(i=this._registered_handlers,r=0,n=i.length;n>r;r++)o=i[r],e=o[0],t=o[1],e.removeListener(t);return void 0},t}(),x.Datastore.DatastoreInfo=function(){function t(t,e,r){this._dsid=t,this._handle=e,this._info_record_data=r}return t.prototype.toString=function(){return"Datastore.DatastoreInfo("+this._dsid+")"},t.prototype.getId=function(){return this._dsid},t.prototype.getHandle=function(){return this._handle},t.prototype.getTitle=function(){var t;return null!=(t=this._info_record_data)?t.title:void 0},t.prototype.getModifiedTime=function(){var t;return null!=(t=this._info_record_data)?t.mtime:void 0},t}(),x.Datastore.DatastoreListChanged=function(){function t(t){this._dsinfos=t}return t.prototype.toString=function(){return"Datastore.DatastoreListChanged("+this._dsinfos.length+" datastores)"},t.prototype.getDatastoreInfos=function(){return this._dsinfos},t}(),x.Datastore.impl.EventSourceWithInitialData=function(t){function e(t){this.options=t,e.__super__.constructor.call(this,t),this._have_event=!1,this._last_event=null,this._listenersChanged=new x.Util.EventSource}return ue(e,t),e.prototype._clearLastEvent=function(){return this._have_event=!1,this._last_event=null},e.prototype.addListener=function(t){var r;return r=e.__super__.addListener.call(this,t),this._have_event&&t(event),this._listenersChanged.dispatch(this._listeners),r},e.prototype.removeListener=function(t){var r;return r=e.__super__.removeListener.call(this,t),this._listenersChanged.dispatch(this._listeners),r},e.prototype.dispatch=function(t){return this._last_event=t,this._have_event=!0,e.__super__.dispatch.call(this,t)},e}(x.Util.EventSource),a="default",x.Datastore.DatastoreManager=function(){function t(t){var e=this;if(!t.isAuthenticated())throw new Error("DatastoreManager requires an authenticated Dropbox.Client!");this._flob_client=new k(t),this._datasync=new h(this._flob_client),this._dslist_initialized=!1,this.datastoreListChanged=new x.Datastore.impl.EventSourceWithInitialData,this.datastoreListChanged._listenersChanged.addListener(function(t){return 0!==t.length?e._init_live_dslist():void 0})}return t.prototype.datastoreListChanged=null,t.prototype.close=function(){return this._datasync.close()},t.prototype.toString=function(){return"Datastore.DatastoreManager()"},t.prototype._datastoreInfoFromListDatastoresResponseItem=function(t){var e,r,n,i,o;if(null!=t.info){e={},o=t.info;for(r in o)i=o[r],e[r]=te.is_array(i)?function(){var t,e,r;for(r=[],t=0,e=i.length;e>t;t++)n=i[t],r.push(ie.fromDsValue(null,null,null,n));return r}():ie.fromDsValue(null,null,null,i)}else e=null;return new x.Datastore.DatastoreInfo(t.dsid,t.handle,e)},t.prototype._getDatastoreInfosFromListResponse=function(t){var e;return function(){var r,n,i,o;for(i=t.datastores,o=[],r=0,n=i.length;n>r;r++)e=i[r],o.push(this._datastoreInfoFromListDatastoresResponseItem(e));return o}.call(this)},t.prototype._init_live_dslist=function(){var t,e=this;if(!this._dslist_initialized)return this._dslist_initialized=!0,t=function(t){return e.datastoreListChanged.dispatch(new x.Datastore.DatastoreListChanged(e._getDatastoreInfosFromListResponse(t)))},this._datasync.obj_manager.set_dslist_listener(t),this._flob_client.list_dbs(function(e,r){return e?(console.warn("Failed to get datastore list"),void 0):t(r)})},t.prototype._wrapDatastore=function(t,e){return e&&(t._update_mtime(),t.sync()),new x.Datastore(this,t)},t.prototype._getOrCreateDatastoreByDsid=function(t,e){var r=this;return this._datasync.get_or_create(t,function(t,n,i){return null!=t?e(t):e(null,r._wrapDatastore(n,i))}),void 0},t.prototype._createDatastore=function(t,e,r){var n=this;return this._datasync.create(t,e,function(t,e,i){return null!=t?r(t):r(null,n._wrapDatastore(e,i))}),void 0},t.prototype._getExistingDatastoreByDsid=function(t,e){var r=this;
return this._datasync.get_by_dsid(t,function(t,n){return null!=t?e(t):e(null,new x.Datastore(r,n))}),void 0},t.prototype.openDefaultDatastore=function(t){return this._getOrCreateDatastoreByDsid(a,t)},t.prototype.openDatastore=function(t,e){return this._getExistingDatastoreByDsid(t,e),void 0},t.prototype.createDatastore=function(t){var e,r;return r=ie.randomWeb64String(Math.ceil(256/6)),e="."+ie.dbase64FromBase64(x.Util.sha256(r)),this._createDatastore(e,r,t),void 0},t.prototype.deleteDatastore=function(t,e){var r=this;return this._flob_client.get_db(t,function(t,n){return null!=t?e(t):r._flob_client.delete_db(n.handle,function(t){return t?e(t):e(null)})}),void 0},t.prototype.listDatastores=function(t){var e=this;return this.datastoreListChanged._have_event?t(null,this.datastoreListChanged._last_event.getDatastoreInfos()):(this._flob_client.list_dbs(function(r,n){return r?t(r):t(null,e._getDatastoreInfosFromListResponse(n))}),void 0)},t}(),x.Datastore.List=function(){function t(t,e,r){this._datastore=t,this._record=e,this._field=r}return t.prototype.toString=function(){return"Datastore.List(("+this._record._tid+", "+this._record._rid+", "+this._field+"): "+JSON.stringify(this._array)+")"},t.prototype._array=function(){return this._record._rawFieldValues()[this._field]},t.prototype._checkValid=function(){if(this._record._checkNotDeleted(),!te.is_array(this._array()))throw new Error("Attempt to operate on deleted list ("+this._record._tid+", "+this._record._rid+", "+this._field+")")},t.prototype._storeUpdate=function(t){var e;return e={},e[this._field]=t,this._record._storeUpdate(e),void 0},t.prototype._fixInsertionIndex=function(t){var e,r;if(!te.is_json_number(t))throw new RangeError("Index not a number: "+t);if(e=this._array().length,r=t>=0?t:e+t,r>=0&&e>=r)return r;throw new RangeError("Bad index for list of length "+e+": "+t)},t.prototype._fixIndex=function(t){var e,r;if(r=this._fixInsertionIndex(t),e=this._array().length,e>r)return r;throw new RangeError("Bad index for list of length "+e+": "+t)},t.prototype.get=function(t){var e;return this._checkValid(),e=ie.clone(this._array()[this._fixIndex(t)]),ie.fromDsValue(void 0,void 0,void 0,e)},t.prototype.set=function(t,e){return this._checkValid(),t=this._fixIndex(t),this._storeUpdate(["LP",t,ie.toDsValue(e,!1)]),void 0},t.prototype.length=function(){return this._checkValid(),this._array().length},t.prototype.pop=function(){if(this._checkValid(),0===this._array().length)throw new Error("List is empty");return this.remove(this._array.length-1)},t.prototype.push=function(t){return this._checkValid(),this.insert(this._array().length,t),void 0},t.prototype.shift=function(){if(this._checkValid(),0===this._array().length)throw new Error("List is empty");return this.remove(0)},t.prototype.unshift=function(t){return this.insert(0,t),void 0},t.prototype.splice=function(){var t,e,r,n,i,o,s,a,u;if(n=arguments[0],e=arguments[1],t=3<=arguments.length?le.call(arguments,2):[],this._checkValid(),!te.is_json_number(e)||0>e)throw new RangeError("Bad second arg to splice: "+n+", "+e);for(n=this._fixInsertionIndex(n),i=this.slice(n,n+e),r=s=0;e>=0?e>s:s>e;r=e>=0?++s:--s)this.remove(n);for(a=0,u=t.length;u>a;a++)o=t[a],this.insert(n,o),n++;return i},t.prototype.move=function(t,e){return this._checkValid(),t=this._fixIndex(t),e=this._fixIndex(e),t===e?void 0:(this._storeUpdate(["LM",t,e]),void 0)},t.prototype.remove=function(t){var e;return this._checkValid(),t=this._fixIndex(t),e=this.get(t),this._storeUpdate(["LD",t]),e},t.prototype.insert=function(t,e){return this._checkValid(),t=this._fixInsertionIndex(t),this._storeUpdate(["LI",t,ie.toDsValue(e,!1)]),void 0},t.prototype.slice=function(t,e){var r;return this._checkValid(),function(){var n,i,o,s;for(o=this._array().slice(t,e),s=[],n=0,i=o.length;i>n;n++)r=o[n],s.push(ie.fromDsValue(void 0,void 0,void 0,r));return s}.call(this)},t.prototype.toArray=function(){var t;return this._checkValid(),function(){var e,r,n,i;for(n=this._array().slice(),i=[],e=0,r=n.length;r>e;e++)t=n[e],i.push(ie.fromDsValue(void 0,void 0,void 0,t));return i}.call(this)},t}(),x.Datastore.Record=function(){function t(t,e,r){this._datastore=t,this._tid=e,this._rid=r,this._deleted=!1,this._record_cache=this._datastore._record_cache,this._managed_datastore=this._datastore._managed_datastore}return t.prototype.get=function(t){var e;return this._checkNotDeleted(),e=this._rawFieldValues(),t in e?ie.fromDsValue(this._datastore,this,t,e[t]):null},t.prototype.set=function(t,e){var r;return r={},r[t]=e,this.update(r)},t.prototype.getOrCreateList=function(t){var e,r;if(this._checkNotDeleted(),r=this._rawFieldValues(),null==r[t])e={},e[t]=["LC"],this._storeUpdate(e),r=this._rawFieldValues();else if(!te.is_array(r[t]))throw new Error("Can't call getOrCreateList on field "+t+" for record ("+this.tid+", "+this.rid+"): existing value "+r[t]+" is not a list");return ie.fromDsValue(this._datastore,this,t,r[t])},t.prototype.getFields=function(){var t,e,r,n;this._checkNotDeleted(),t={},n=this._rawFieldValues();for(e in n)r=n[e],t[e]=ie.fromDsValue(this._datastore,this,e,r);return t},t.prototype.update=function(t){var e,r,n;this._checkNotDeleted(),e={};for(r in t)n=t[r],null!=n?e[r]=["P",ie.toDsValue(n)]:null!=this.get(r)&&(e[r]=["D"]);return te.is_empty(e)||this._storeUpdate(e),this},t.prototype.deleteRecord=function(){var t;return this._checkNotDeleted(),this._deleted=!0,this._record_cache.remove(this._tid,this._rid),t=h.changeFromArray(["D",this._tid,this._rid]),this._managed_datastore.perform_local_change(t),this._datastore._recordsChangedLocally([this]),this},t.prototype.has=function(t){var e;return this._checkNotDeleted(),e=this._rawFieldValues(),t in e},t.prototype.getId=function(){return this._rid},t.prototype.getTable=function(){return this._datastore.getTable(this._tid)},t.prototype.isDeleted=function(){return this._deleted},t.prototype.toString=function(){var t;return t=this.isDeleted()?"deleted":JSON.stringify(this.getFields()),"Datastore.Record(("+this._tid+", "+this._rid+"): "+t+")"},t.prototype._rawFieldValues=function(){return this._managed_datastore.query(this._tid,this._rid)},t.prototype._storeUpdate=function(t){var e;e=h.changeFromArray(["U",this._tid,this._rid,t]),this._managed_datastore.perform_local_change(e),this._datastore._recordsChangedLocally([this])},t.isValidId=function(t){var e;return e=new RegExp(te.SS_ID_REGEX),te.is_string(t)&&e.test(t)},t.prototype._checkNotDeleted=function(){if(this._deleted)throw new Error("Attempt to operate on deleted record ("+this._tid+", "+this._rid+")")},t}(),x.Datastore.RecordsChanged=function(){function t(t,e){this._recordsByTable=t,this._local=e}return t.prototype.toString=function(){var t,e,r,n,i,o,s;i=0,r=0,s=this._recordsByTable;for(o in s)t=s[o],i+=1,r+=t.length;return n=""+i+" "+(1===i?"table":"tables"),e=""+r+" "+(1===r?"record":"records"),"Datastore.RecordsChanged("+e+" in "+n+" changed "+(this._local?"locally":"remotely")+")"},t._fromRecordList=function(e,r){var n,i,o,s,a;for(i={},s=0,a=e.length;a>s;s++)n=e[s],o=n._tid,null==i[o]&&(i[o]=[]),i[o].push(n);return new t(i,r)},t.prototype.affectedRecordsByTable=function(){return this._recordsByTable},t.prototype.affectedRecordsForTable=function(t){var e;return null!=(e=this._recordsByTable[t])?e:[]},t.prototype.isLocal=function(){return this._local},t}(),K=x.Datastore.RecordsChanged,x.Datastore.Table=function(){function t(t,e){this._datastore=t,this._tid=e,this._record_cache=this._datastore._record_cache,this._managed_datastore=this._datastore._managed_datastore}return t.prototype.getId=function(){return this._tid},t.prototype.get=function(t){var e,r;if(!x.Datastore.Record.isValidId(t))throw new Error("Invalid record ID: "+t);return r=this._record_cache.get(this._tid,t),null!=r?(ne(!r._deleted),r):(e=this._managed_datastore.query(this._tid,t),null==e?null:this._record_cache.getOrCreate(this._tid,t))},t.prototype.getOrInsert=function(t,e){var r;return r=this.get(t),r?r:this._insertWithId(t,e)},t.prototype.insert=function(t){var e;return e=this._datastore._generateRid(),ne(null==this.get(e)),this._insertWithId(e,t)},t.prototype.query=function(t){var e,r,n,i,o,s,a;for(o=this._managed_datastore.list_rows_for_table(this._tid),n=[],s=0,a=o.length;a>s;s++)i=o[s],e=this._managed_datastore.query(this._tid,i),(null==t||ie.matchDsValues(t,e))&&(r=this.get(i),ne(null!=r),n.push(r));return n},t.prototype.setResolutionRule=function(t,e){if("remote"!==e&&"local"!==e&&"min"!==e&&"max"!==e&&"sum"!==e)throw new Error(""+e+" is not a valid resolution rule. Valid rules are 'remote', 'local', 'min', 'max', and 'sum'.");return this._managed_datastore.resolver.add_resolution_rule(this._tid,t,e),this},t.isValidId=function(t){var e;return e=new RegExp(te.SS_ID_REGEX),te.is_string(t)&&e.test(t)},t.prototype.toString=function(){return"Datastore.Table("+this._tid+")"},t.prototype._insertWithId=function(t,e){var r,n,i,o,s;n={};for(i in e)s=e[i],n[i]=ie.toDsValue(s);return r=h.changeFromArray(["I",this._tid,t,n]),this._managed_datastore.perform_local_change(r),o=this._record_cache.getOrCreate(this._tid,t),this._datastore._recordsChangedLocally([o]),o},t}(),x.File.ShareUrl=function(){function t(t,e){this.url=t.url,this.expiresAt=x.Util.parseDate(t.expires),this.isDirect=e===!0?!0:e===!1?!1:"direct"in t?t.direct:Date.now()-this.expiresAt<=864e5,this.isPreview=!this.isDirect,this._json=null}return t.parse=function(t,e){return t&&"object"==typeof t?new x.File.ShareUrl(t,e):t},t.prototype.url=null,t.prototype.expiresAt=null,t.prototype.isDirect=null,t.prototype.isPreview=null,t.prototype.json=function(){return this._json||(this._json={url:this.url,expires:this.expiresAt.toUTCString(),direct:this.isDirect})},t}(),x.File.CopyReference=function(){function t(t){"object"==typeof t?(this.tag=t.copy_ref,this.expiresAt=x.Util.parseDate(t.expires),this._json=t):(this.tag=t,this.expiresAt=new Date(1e3*Math.ceil(Date.now()/1e3)),this._json=null)}return t.parse=function(t){return!t||"object"!=typeof t&&"string"!=typeof t?t:new x.File.CopyReference(t)},t.prototype.tag=null,t.prototype.expiresAt=null,t.prototype.json=function(){return this._json||(this._json={copy_ref:this.tag,expires:this.expiresAt.toUTCString()})},t}(),x.File.Stat=function(){function t(t){var e,r,n,i;switch(this._json=t,this.path=t.path,"/"!==this.path.substring(0,1)&&(this.path="/"+this.path),e=this.path.length-1,e>=0&&"/"===this.path.substring(e)&&(this.path=this.path.substring(0,e)),r=this.path.lastIndexOf("/"),this.name=this.path.substring(r+1),this.isFolder=t.is_dir||!1,this.isFile=!this.isFolder,this.isRemoved=t.is_deleted||!1,this.typeIcon=t.icon,this.modifiedAt=(null!=(n=t.modified)?n.length:void 0)?x.Util.parseDate(t.modified):null,this.clientModifiedAt=(null!=(i=t.client_mtime)?i.length:void 0)?x.Util.parseDate(t.client_mtime):null,t.root){case"dropbox":this.inAppFolder=!1;break;case"app_folder":this.inAppFolder=!0;break;default:this.inAppFolder=null}this.size=t.bytes||0,this.humanSize=t.size||"",this.hasThumbnail=t.thumb_exists||!1,this.versionTag=t.rev,this.contentHash=t.hash||null,this.mimeType=this.isFolder?t.mime_type||"inode/directory":t.mime_type||"application/octet-stream"}return t.parse=function(t){return t&&"object"==typeof t?new x.File.Stat(t):t},t.prototype.path=null,t.prototype.name=null,t.prototype.inAppFolder=null,t.prototype.isFolder=null,t.prototype.isFile=null,t.prototype.isRemoved=null,t.prototype.typeIcon=null,t.prototype.versionTag=null,t.prototype.contentHash=null,t.prototype.mimeType=null,t.prototype.size=null,t.prototype.humanSize=null,t.prototype.hasThumbnail=null,t.prototype.modifiedAt=null,t.prototype.clientModifiedAt=null,t.prototype.json=function(){return this._json},t}(),x.Http.AppInfo=function(){function t(t,e){var r;this.name=t.name,this._icons=t.icons,r=t.permissions||{},this.canUseDatastores=!!r.datastores,this.canUseFiles=!!r.files,this.canUseFullDropbox="full_dropbox"===r.files,this.hasAppFolder="app_folder"===r.files,this.key=e?e:t.key||null}return t.parse=function(t,e){return t?new x.Http.AppInfo(t,e):t},t.prototype.name=void 0,t.prototype.key=void 0,t.prototype.canUseDatastores=void 0,t.prototype.canUseFiles=void 0,t.prototype.hasAppFolder=void 0,t.prototype.canUseFullDropbox=void 0,t.prototype.icon=function(t,e){return e||(e=t),this._icons[""+t+"x"+e]||null},t.ICON_SMALL=64,t.ICON_LARGE=256,t}(),x.Http.PulledChanges=function(){function t(t){var e;this.blankSlate=t.reset||!1,this.cursorTag=t.cursor,this.shouldPullAgain=t.has_more,this.shouldBackOff=!this.shouldPullAgain,this.changes=t.cursor&&t.cursor.length?function(){var r,n,i,o;for(i=t.entries,o=[],r=0,n=i.length;n>r;r++)e=i[r],o.push(x.Http.PulledChange.parse(e));return o}():[]}return t.parse=function(t){return t&&"object"==typeof t?new x.Http.PulledChanges(t):t},t.prototype.blankSlate=void 0,t.prototype.cursorTag=void 0,t.prototype.changes=void 0,t.prototype.shouldPullAgain=void 0,t.prototype.shouldBackOff=void 0,t.prototype.cursor=function(){return this.cursorTag},t}(),x.Http.PulledChange=function(){function t(t){this.path=t[0],this.stat=x.File.Stat.parse(t[1]),this.stat?this.wasRemoved=!1:(this.stat=null,this.wasRemoved=!0)}return t.parse=function(t){return t&&"object"==typeof t?new x.Http.PulledChange(t):t},t.prototype.path=void 0,t.prototype.wasRemoved=void 0,t.prototype.stat=void 0,t}(),x.Http.RangeInfo=function(){function t(t){var e;(e=/^bytes (\d*)-(\d*)\/(.*)$/.exec(t))?(this.start=parseInt(e[1]),this.end=parseInt(e[2]),this.size="*"===e[3]?null:parseInt(e[3])):(this.start=0,this.end=0,this.size=null)}return t.parse=function(t){return"string"==typeof t?new x.Http.RangeInfo(t):t},t.prototype.start=null,t.prototype.size=null,t.prototype.end=null,t}(),x.Http.UploadCursor=function(){function t(t){this.replace(t)}return t.parse=function(t){return!t||"object"!=typeof t&&"string"!=typeof t?t:new x.Http.UploadCursor(t)},t.prototype.tag=null,t.prototype.offset=null,t.prototype.expiresAt=null,t.prototype.json=function(){return this._json||(this._json={upload_id:this.tag,offset:this.offset,expires:this.expiresAt.toUTCString()})},t.prototype.replace=function(t){return"object"==typeof t?(this.tag=t.upload_id||null,this.offset=t.offset||0,this.expiresAt=x.Util.parseDate(t.expires)||Date.now(),this._json=t):(this.tag=t||null,this.offset=0,this.expiresAt=new Date(1e3*Math.floor(Date.now()/1e3)),this._json=null),this},t}(),"function"==typeof x.Env.global.atob&&"function"==typeof x.Env.global.btoa?(x.Util.atob=function(t){return x.Env.global.atob(t)},x.Util.btoa=function(t){return x.Env.global.btoa(t)}):x.Env.global.require&&x.Env.global.Buffer?(x.Util.atob=function(t){var e,r;return e=new Buffer(t,"base64"),function(){var t,n,i;for(i=[],r=t=0,n=e.length;n>=0?n>t:t>n;r=n>=0?++t:--t)i.push(String.fromCharCode(e[r]));return i}().join("")},x.Util.btoa=function(t){var e,r;return e=new Buffer(function(){var e,n,i;for(i=[],r=e=0,n=t.length;n>=0?n>e:e>n;r=n>=0?++e:--e)i.push(t.charCodeAt(r));return i}()),e.toString("base64")}):function(){var t,e,r;return e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r=function(t,r,n){var i,o;for(o=3-r,t<<=8*o,i=3;i>=o;)n.push(e.charAt(63&t>>6*i)),i-=1;for(i=r;3>i;)n.push("="),i+=1;return null},t=function(t,e,r){var n,i;for(i=4-e,t<<=6*i,n=2;n>=i;)r.push(String.fromCharCode(255&t>>8*n)),n-=1;return null},x.Util.btoa=function(t){var e,n,i,o,s,a;for(o=[],e=0,n=0,i=s=0,a=t.length;a>=0?a>s:s>a;i=a>=0?++s:--s)e=e<<8|t.charCodeAt(i),n+=1,3===n&&(r(e,n,o),e=n=0);return n>0&&r(e,n,o),o.join("")},x.Util.atob=function(r){var n,i,o,s,a,u,l;for(a=[],n=0,o=0,s=u=0,l=r.length;(l>=0?l>u:u>l)&&(i=r.charAt(s),"="!==i);s=l>=0?++u:--u)n=n<<6|e.indexOf(i),o+=1,4===o&&(t(n,o,a),n=o=0);return o>0&&t(n,o,a),a.join("")}}(),function(){var t,e,r,n,i,o,s,a,u,l,h;if(x.Util.hmac=function(e,n){return t(r(u(e),u(n),e.length,n.length))},x.Util.sha1=function(e){return t(i(u(e),e.length))},x.Util.sha256=function(e){return t(o(u(e),e.length))},x.Env.require)try{e=x.Env.require("crypto"),e.createHmac&&e.createHash&&(x.Util.hmac=function(t,r){var n;return n=e.createHmac("sha1",r),n.update(t),n.digest("base64")},x.Util.sha1=function(t){var r;return r=e.createHash("sha1"),r.update(t),r.digest("base64")},x.Util.sha256=function(t){var r;return r=e.createHash("sha256"),r.update(t),r.digest("base64")})}catch(c){n=c}return r=function(t,e,r,n){var o,s,a,u;return e.length>16&&(e=i(e,n)),a=function(){var t,r;for(r=[],s=t=0;16>t;s=++t)r.push(909522486^e[s]);return r}(),u=function(){var t,r;for(r=[],s=t=0;16>t;s=++t)r.push(1549556828^e[s]);return r}(),o=i(a.concat(t),64+r),i(u.concat(o),84)},i=function(t,e){var r,n,i,o,s,a,u,l,h,c,p,d,f,_,y,g,m;for(t[e>>2]|=1<<31-((3&e)<<3),t[(e+8>>6<<4)+15]=e<<3,y=Array(80),r=1732584193,i=4023233417,s=2562383102,u=271733878,h=3285377520,p=0,f=t.length;f>p;){for(n=r,o=i,a=s,l=u,c=h,d=m=0;80>m;d=++m)16>d?y[d]=0|t[p+d<<2>>2]:(_=(0|y[d-3<<2>>2])^(0|y[d-8<<2>>2])^(0|y[d-14<<2>>2])^(0|y[d-16<<2>>2]),y[d]=_<<1|_>>>31),g=0|(0|(r<<5|r>>>27)+h)+y[d<<2>>2],g=20>d?0|g+(0|(i&s|~i&u)+1518500249):40>d?0|g+(0|(i^s^u)+1859775393):60>d?0|(0|g+((i&s|i&u|s&u)-1894007588)):0|g+(0|(i^s^u)-899497514),h=u,u=s,s=i<<30|i>>>2,i=r,r=g;r=0|n+r,i=0|o+i,s=0|a+s,u=0|l+u,h=0|c+h,p=0|p+16}return[r,i,s,u,h]},o=function(t,e){var r,n,i,o,u,l,h,c,p,d,f,_,y,g,m,v,w,b,S,D,E,A,x,O,U,T,C,k,I,R,P,L;for(t[e>>2]|=1<<31-((3&e)<<3),t[(e+8>>6<<4)+15]=e<<3,I=Array(80),r=s[0],i=s[1],u=s[2],c=s[3],d=s[4],_=s[5],g=s[6],D=s[7],A=0,O=t.length;O>A;){for(n=r,o=i,l=u,p=c,f=d,y=_,m=g,E=D,x=L=0;64>L;x=++L)16>x?k=I[x]=0|t[A+x<<2>>2]:(w=0|I[x-15<<2>>2],v=(w<<25|w>>>7)^(w<<14|w>>>18)^w>>>3,S=0|I[x-2<<2>>2],b=(S<<15|S>>>17)^(S<<13|S>>>19)^S>>>10,k=I[x]=0|(0|v+(0|I[x-7<<2>>2]))+(0|b+(0|I[x-16<<2>>2]))),h=d&_^~d&g,U=r&i^r&u^i&u,T=(r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22),C=(d<<26|d>>>6)^(d<<21|d>>>11)^(d<<7|d>>>25),R=0|(0|(0|D+C)+(0|h+k))+(0|a[x<<2>>2]),P=0|T+U,D=g,g=_,_=d,d=0|c+R,c=u,u=i,i=r,r=0|R+P;r=0|n+r,i=0|o+i,u=0|l+u,c=0|p+c,d=0|f+d,_=0|y+_,g=0|m+g,D=0|E+D,A+=16}return[r,i,u,c,d,_,g,D]},l=function(t){return 0>t&&(t=4*(1<<30)+t),t.toString(16)},s=[],a=[],function(){var t,e,r,n,i,o,u;for(e=function(t){return 0|4294967296*(t-Math.floor(t))},i=2,u=[],r=o=0;64>o;r=++o){for(;;){for(n=!0,t=2;i>=t*t;){if(0===i%t){n=!1;break}t+=1}if(n)break;i+=1}8>r&&(s[r]=e(Math.pow(i,.5))),a[r]=e(Math.pow(i,1/3)),u.push(i+=1)}return u}(),t=function(t){var e,r,n,i,o;for(i="",e=0,n=4*t.length;n>e;)r=e,o=(255&t[r>>2]>>(3-(3&r)<<3))<<16,r+=1,o|=(255&t[r>>2]>>(3-(3&r)<<3))<<8,r+=1,o|=255&t[r>>2]>>(3-(3&r)<<3),i+=h[63&o>>18],i+=h[63&o>>12],e+=1,i+=e>=n?"=":h[63&o>>6],e+=1,i+=e>=n?"=":h[63&o],e+=1;return i},h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",u=function(t){var e,r,n,i,o;for(e=[],n=255,r=i=0,o=t.length;o>=0?o>i:i>o;r=o>=0?++i:--i)e[r>>2]|=(t.charCodeAt(r)&n)<<(3-(3&r)<<3);return e}}(),x.Util.Oauth=function(){function t(t){this._id=null,this._secret=null,this._stateParam=null,this._authCode=null,this._token=null,this._tokenKey=null,this._tokenKid=null,this._error=null,this._appHash=null,this._loaded=null,this.setCredentials(t)}return t.prototype.setCredentials=function(t){if(t.key)this._id=t.key;else{if(!t.token)throw new Error("No API key supplied");this._id=null}return this._secret=t.secret||null,this._appHash=null,this._error=null,this._loaded=!0,this.reset(),t.token?(this._token=t.token,t.tokenKey&&(this._tokenKey=t.tokenKey,this._tokenKid=t.tokenKid)):t.oauthCode?this._authCode=t.oauthCode:t.oauthStateParam&&(this._stateParam=t.oauthStateParam),this},t.prototype.credentials=function(){var t;return t={},this._id&&(t.key=this._id),this._secret&&(t.secret=this._secret),null!==this._token?(t.token=this._token,this._tokenKey&&(t.tokenKey=this._tokenKey,t.tokenKid=this._tokenKid)):null!==this._authCode?t.oauthCode=this._authCode:null!==this._stateParam&&(t.oauthStateParam=this._stateParam),t},t.prototype.step=function(){return null!==this._token?x.Client.DONE:null!==this._authCode?x.Client.AUTHORIZED:null!==this._stateParam?this._loaded?x.Client.PARAM_LOADED:x.Client.PARAM_SET:null!==this._error?x.Client.ERROR:x.Client.RESET},t.prototype.setAuthStateParam=function(t){if(null===this._id)throw new Error("No API key supplied, cannot do authorization");return this.reset(),this._loaded=!1,this._stateParam=t,this},t.prototype.checkAuthStateParam=function(t){return this._stateParam===t&&null!==this._stateParam},t.prototype.authStateParam=function(){return this._stateParam},t.prototype.error=function(){return this._error},t.prototype.processRedirectParams=function(t){var e;if(t.error){if(null===this._id)throw new Error("No API key supplied, cannot process errors");return this.reset(),this._error=new x.AuthError(t),!0}if(t.code){if(null===this._id)throw new Error("No API key supplied, cannot do Authorization Codes");return this.reset(),this._loaded=!1,this._authCode=t.code,!0}if(e=t.token_type){if(e=e.toLowerCase(),"bearer"!==e&&"mac"!==e)throw new Error("Unimplemented token type "+e);if(this.reset(),this._loaded=!1,"mac"===e){if("hmac-sha-1"!==t.mac_algorithm)throw new Error("Unimplemented MAC algorithms "+t.mac_algorithm);this._tokenKey=t.mac_key,this._tokenKid=t.kid}return this._token=t.access_token,!0}return!1},t.prototype.authHeader=function(t,e,r){var n,i;return null===this._token?(i=null===this._secret?x.Util.btoa(""+this._id+":"):x.Util.btoa(""+this._id+":"+this._secret),"Basic "+i):null===this._tokenKey?"Bearer "+this._token:(n=this.macParams(t,e,r),"MAC kid="+n.kid+" ts="+n.ts+" "+("access_token="+this._token+" mac="+n.mac))},t.prototype.addAuthParams=function(t,e,r){var n;return null===this._token?(r.client_id=this._id,null!==this._secret&&(r.client_secret=this._secret)):(null!==this._tokenKey&&(n=this.macParams(t,e,r),r.kid=n.kid,r.ts=n.ts,r.mac=n.mac),r.access_token=this._token),r},t.prototype.authorizeUrlParams=function(t,e){var r;if("token"!==t&&"code"!==t)throw new Error("Unimplemented /authorize response type "+t);return r={client_id:this._id,state:this._stateParam,response_type:t},e&&(r.redirect_uri=e),r},t.prototype.accessTokenParams=function(t){var e;return e={grant_type:"authorization_code",code:this._authCode},t&&(e.redirect_uri=t),e},t.queryParamsFromUrl=function(t){var e,r,n,i,o,s,a,u,l,h;if(i=/^[^?#]+(\?([^\#]*))?(\#(.*))?$/.exec(t),!i)return{};for(a=i[2]||"","/"===a.substring(0,1)&&(a=a.substring(1)),e=i[4]||"",r=e.indexOf("?"),-1!==r&&(e=e.substring(r+1)),"/"===e.substring(0,1)&&(e=e.substring(1)),s={},h=a.split("&").concat(e.split("&")),u=0,l=h.length;l>u;u++)n=h[u],o=n.indexOf("="),-1!==o&&(s[decodeURIComponent(n.substring(0,o))]=decodeURIComponent(n.substring(o+1)));return s},t.prototype.macParams=function(t,e,r){var n,i;return n={kid:this._tokenKid,ts:x.Util.Oauth.timestamp()},i=t.toUpperCase()+"&"+x.Util.Xhr.urlEncodeValue(e)+"&"+x.Util.Xhr.urlEncodeValue(x.Util.Xhr.urlEncode(r)),n.mac=x.Util.hmac(i,this._tokenKey),n},t.prototype.appHash=function(){return this._appHash?this._appHash:this._appHash=x.Util.sha1("oauth2-"+this._id).replace(/[\/+=]/g,"")},t.prototype.reset=function(){return this._stateParam=null,this._authCode=null,this._token=null,this._tokenKey=null,this._tokenKid=null,this._error=null,this},t.timestamp=function(){return Math.floor(Date.now()/1e3)},t.randomAuthStateParam=function(){return["oas",Date.now().toString(36),Math.random().toString(36)].join("_")},t}(),null==Date.now&&(x.Util.Oauth.timestamp=function(){return Math.floor((new Date).getTime()/1e3)}),2274814865e3===new Date("Fri, 31 Jan 2042 21:01:05 +0000").valueOf()?x.Util.parseDate=function(t){return new Date(t)}:2274814865e3===Date.parse("Fri, 31 Jan 2042 21:01:05 +0000")?x.Util.parseDate=function(t){return new Date(Date.parse(t))}:function(){var t,e;return e=/^\w+\, (\d+) (\w+) (\d+) (\d+)\:(\d+)\:(\d+) (\+\d+|UTC|GMT)$/,t={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11},x.Util.parseDate=function(r){var n;return(n=e.exec(r))?new Date(Date.UTC(parseInt(n[3]),t[n[2]],parseInt(n[1]),parseInt(n[4]),parseInt(n[5]),parseInt(n[6]),0)):0/0}}(),x.Util.countUtf8Bytes=function(t){var e,r,n,i,o;for(e=0,n=i=0,o=t.length;o>=0?o>i:i>o;n=o>=0?++i:--i)r=t.charCodeAt(n),127>=r?e+=1:2047>=r?e+=2:r>=55296&&57343>=r?e+=2:65535>=r?e+=3:ne(!1);return e},x.Env.global.XMLHttpRequest?(!x.Env.global.XDomainRequest||"withCredentials"in new XMLHttpRequest?(w=XMLHttpRequest,v=!1,g="undefined"!=typeof FormData&&-1===navigator.userAgent.indexOf("Firefox")):(w=XDomainRequest,v=!0,g=!1),m=!0):(w=x.Env.require("xhr2"),v=!1,g=!1,m=!1),x.Env.global.Uint8Array)if(Object.getPrototypeOf?y=Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array(0))).constructor:Object.__proto__&&(y=new Uint8Array(0).__proto__.__proto__.constructor),x.Env.global.Blob){try{!function(){return 2===new Blob([new Uint8Array(2)]).size?(S=!0,b=!0):(b=!1,S=2===new Blob([new ArrayBuffer(2)]).size)}()}catch(he){b=!1,S=!1,x.Env.global.WebKitBlobBuilder&&-1!==navigator.userAgent.indexOf("Android")&&(g=!1)}y===Object&&(b=!1)}else S=!1,b=!0;else y=null,S=!1,b=!1;x.Util.Xhr=function(){function t(t,e){this.method=t,this.isGet="GET"===this.method,this.url=e,this.wantHeaders=!1,this.headers={},this.params=null,this.body=null,this.preflight=!(this.isGet||"POST"===this.method),this.signed=!1,this.completed=!1,this.responseType=null,this.callback=null,this.xhr=null,this.onError=null}return t.Request=w,t.ieXdr=v,t.canSendForms=g,t.doesPreflight=m,t.ArrayBufferView=y,t.sendArrayBufferView=b,t.wrapBlob=S,t.prototype.xhr=null,t.prototype.onError=null,t.prototype.setParams=function(t){if(this.signed)throw new Error("setParams called after addOauthParams or addOauthHeader");if(this.params)throw new Error("setParams cannot be called twice");return this.params=t,this},t.prototype.setCallback=function(t){return this.callback=t,this},t.prototype.signWithOauth=function(t,e){return x.Util.Xhr.ieXdr?this.addOauthParams(t):this.preflight||!x.Util.Xhr.doesPreflight?this.addOauthHeader(t):this.isGet&&e?this.addOauthHeader(t):this.addOauthParams(t)},t.prototype.addOauthParams=function(t){if(this.signed)throw new Error("Request already has an OAuth signature");return this.params||(this.params={}),t.addAuthParams(this.method,this.url,this.params),this.signed=!0,this},t.prototype.addOauthHeader=function(t){if(this.signed)throw new Error("Request already has an OAuth signature");return this.params||(this.params={}),this.signed=!0,this.setHeader("Authorization",t.authHeader(this.method,this.url,this.params))},t.prototype.setBody=function(t){if(this.isGet)throw new Error("setBody cannot be called on GET requests");if(null!==this.body)throw new Error("Request already has a body");return"string"==typeof t||"undefined"!=typeof FormData&&t instanceof FormData||(this.headers["Content-Type"]="application/octet-stream",this.preflight=!0),this.body=t,this},t.prototype.setResponseType=function(t){return this.responseType=t,this},t.prototype.setHeader=function(t,e){var r;if(this.headers[t])throw r=this.headers[t],new Error("HTTP header "+t+" already set to "+r);if("Content-Type"===t)throw new Error("Content-Type is automatically computed based on setBody");return this.preflight=!0,this.headers[t]=e,this},t.prototype.reportResponseHeaders=function(){return this.wantHeaders=!0},t.prototype.setFileField=function(t,e,r,n){var i,o,s,a,u;if(null!==this.body)throw new Error("Request already has a body");if(this.isGet)throw new Error("setFileField cannot be called on GET requests");if("object"==typeof r){"undefined"!=typeof ArrayBuffer&&(r instanceof ArrayBuffer?x.Util.Xhr.sendArrayBufferView&&(r=new Uint8Array(r)):!x.Util.Xhr.sendArrayBufferView&&0===r.byteOffset&&r.buffer instanceof ArrayBuffer&&(r=r.buffer)),n||(n="application/octet-stream");try{r=new Blob([r],{type:n})}catch(l){o=l,window.WebKitBlobBuilder&&(a=new WebKitBlobBuilder,a.append(r),(i=a.getBlob(n))&&(r=i))}"undefined"!=typeof File&&r instanceof File&&(r=new Blob([r],{type:r.type})),u=r instanceof Blob}else u=!1;return u?(this.body=new FormData,this.body.append(t,r,e)):(n||(n="application/octet-stream"),s=this.multipartBoundary(),this.headers["Content-Type"]="multipart/form-data; boundary="+s,this.body=["--",s,"\r\n",'Content-Disposition: form-data; name="',t,'"; filename="',e,'"\r\n',"Content-Type: ",n,"\r\n","Content-Transfer-Encoding: binary\r\n\r\n",r,"\r\n","--",s,"--","\r\n"].join(""))},t.prototype.multipartBoundary=function(){return[Date.now().toString(36),Math.random().toString(36)].join("----")},t.prototype.paramsToUrl=function(){var t;return this.params&&(t=x.Util.Xhr.urlEncode(this.params),0!==t.length&&(this.url=[this.url,"?",t].join("")),this.params=null),this},t.prototype.paramsToBody=function(){if(this.params){if(null!==this.body)throw new Error("Request already has a body");if(this.isGet)throw new Error("paramsToBody cannot be called on GET requests");this.headers["Content-Type"]="application/x-www-form-urlencoded",this.body=x.Util.Xhr.urlEncode(this.params),this.params=null}return this},t.prototype.prepare=function(){var t,e,r,n,i=this;if(e=x.Util.Xhr.ieXdr,this.isGet||null!==this.body||e?(this.paramsToUrl(),null!==this.body&&"string"==typeof this.body&&(this.headers["Content-Type"]="text/plain; charset=utf8")):this.paramsToBody(),this.xhr=new x.Util.Xhr.Request,e?(this.xhr.onload=function(){return i.onXdrLoad()},this.xhr.onerror=function(){return i.onXdrError()},this.xhr.ontimeout=function(){return i.onXdrError()},this.xhr.onprogress=function(){}):this.xhr.onreadystatechange=function(){return i.onReadyStateChange()},this.xhr.open(this.method,this.url,!0),!e){n=this.headers;for(t in n)se.call(n,t)&&(r=n[t],this.xhr.setRequestHeader(t,r))}return this.responseType&&("b"===this.responseType?this.xhr.overrideMimeType&&this.xhr.overrideMimeType("text/plain; charset=x-user-defined"):this.xhr.responseType=this.responseType),this},t.prototype.send=function(t){var e,r;if(this.callback=t||this.callback,null!==this.body){e=this.body,x.Util.Xhr.sendArrayBufferView?e instanceof ArrayBuffer&&(e=new Uint8Array(e)):0===e.byteOffset&&e.buffer instanceof ArrayBuffer&&(e=e.buffer);try{this.xhr.send(e)}catch(n){if(r=n,x.Util.Xhr.sendArrayBufferView||!x.Util.Xhr.wrapBlob)throw r;e=new Blob([e],{type:"application/octet-stream"}),this.xhr.send(e)}}else this.xhr.send();return this},t.urlEncode=function(t){var e,r,n;e=[];for(r in t)n=t[r],e.push(this.urlEncodeValue(r)+"="+this.urlEncodeValue(n));return e.sort().join("&")},t.urlEncodeValue=function(t){return encodeURIComponent(t.toString()).replace(/\!/g,"%21").replace(/'/g,"%27").replace(/\(/g,"%28").replace(/\)/g,"%29").replace(/\*/g,"%2A")},t.urlDecode=function(t){var e,r,n,i,o,s;for(r={},s=t.split("&"),i=0,o=s.length;o>i;i++)n=s[i],e=n.split("="),r[decodeURIComponent(e[0])]=decodeURIComponent(e[1]);return r},t.prototype.onReadyStateChange=function(){var t,e,r,n,i,o,s,a,u,l,h,c,p,d,f;if(4!==this.xhr.readyState)return!0;if(this.completed)return!0;if(this.completed=!0,this.xhr.status<200||this.xhr.status>=300)return e=new x.ApiError(this.xhr,this.method,this.url),this.onError?this.onError(e,this.callback):this.callback(e),!0;if(this.wantHeaders?(t=this.xhr.getAllResponseHeaders(),s=t?x.Util.Xhr.parseResponseHeaders(t):this.guessResponseHeaders(),h=s["x-dropbox-metadata"]):(s=void 0,h=this.xhr.getResponseHeader("x-dropbox-metadata")),null!=h?h.length:void 0)try{l=JSON.parse(h)}catch(_){if(u=_,o=h.search(/\}\,\s*\{/),-1!==o)try{h=h.substring(0,o+1),l=JSON.parse(h)}catch(_){u=_,l=void 0}else l=void 0}else l=void 0;if(this.responseType){if("b"===this.responseType){for(i=null!=this.xhr.responseText?this.xhr.responseText:this.xhr.response,r=[],a=d=0,f=i.length;f>=0?f>d:d>f;a=f>=0?++d:--d)r.push(String.fromCharCode(255&i.charCodeAt(a)));p=r.join(""),this.callback(null,p,l,s)}else this.callback(null,this.xhr.response,l,s);return!0}switch(p=null!=this.xhr.responseText?this.xhr.responseText:this.xhr.response,n=this.xhr.getResponseHeader("Content-Type"),n&&(c=n.indexOf(";"),-1!==c&&(n=n.substring(0,c))),n){case"application/x-www-form-urlencoded":this.callback(null,x.Util.Xhr.urlDecode(p),l,s);break;case"application/json":case"text/javascript":this.callback(null,JSON.parse(p),l,s);
break;default:this.callback(null,p,l,s)}return!0},t.parseResponseHeaders=function(t){var e,r,n,i,o,s,a,u;for(n={},r=t.split("\n"),a=0,u=r.length;u>a;a++)i=r[a],e=i.indexOf(":"),o=i.substring(0,e).trim().toLowerCase(),s=i.substring(e+1).trim(),n[o]=s;return n},t.prototype.guessResponseHeaders=function(){var t,e,r,n,i,o;for(t={},o=["cache-control","content-language","content-range","content-type","expires","last-modified","pragma","x-dropbox-metadata"],n=0,i=o.length;i>n;n++)e=o[n],r=this.xhr.getResponseHeader(e),r&&(t[e]=r);return t},t.prototype.onXdrLoad=function(){var t,e,r;if(this.completed)return!0;if(this.completed=!0,r=this.xhr.responseText,t=this.wantHeaders?{"content-type":this.xhr.contentType}:void 0,e=void 0,this.responseType)return this.callback(null,r,e,t),!0;switch(this.xhr.contentType){case"application/x-www-form-urlencoded":this.callback(null,x.Util.Xhr.urlDecode(r),e,t);break;case"application/json":case"text/javascript":this.callback(null,JSON.parse(r),e,t);break;default:this.callback(null,r,e,t)}return!0},t.prototype.onXdrError=function(){var t;return this.completed?!0:(this.completed=!0,t=new x.ApiError(this.xhr,this.method,this.url),this.onError?this.onError(t,this.callback):this.callback(t),!0)},t}(),re="X-Dropbox-User-Agent",J="X-Dropbox-Request-Id",x.DatastoresClient={_dispatchDatastoreXhr:function(t,e,r,n,i,o){var s,a,l;return l=new x.Util.Xhr(t,e),i.setRequestId&&(a="xxxxxxxxxxxxxxxx".replace(/x/g,function(){return Math.floor(16*Math.random()).toString(16)}),l.setHeader(J,a)),ne(null==r[re]),r=ie.clone(r),r[re]="dropbox-js-datastore-sdk/"+u,l.setParams(r),l.signWithOauth(this.oauth,!1),s=function(t,e){var r;if(null!=t)return o(t);if(te.is_string(e)){console.log("Treating server response string as JSON:",e);try{e=JSON.parse(e)}catch(i){r=i,console.log("Error parsing response as JSON",r.stack)}}return o(null,n.fromJSON(e))},i.isLongPoll?this.dispatchLongPollXhr(l,s):this.dispatchXhr(l,s),l},_listDatastores:function(t){return this._dispatchDatastoreXhr("GET",this.urls.listDbs,{},N,{},t)},_getOrCreateDatastore:function(t,e){return this._dispatchDatastoreXhr("POST",this.urls.getOrCreateDb,{dsid:t},s,{},e)},_createDatastore:function(t,e,r){return this._dispatchDatastoreXhr("POST",this.urls.createDb,{dsid:t,key:e},s,{},r)},_getDatastore:function(t,e){return this._dispatchDatastoreXhr("GET",this.urls.getDb,{dsid:t},I,{},e)},_deleteDatastore:function(t,e){return this._dispatchDatastoreXhr("POST",this.urls.deleteDb,{handle:t},E,{setRequestId:!0},e)},_putDelta:function(t,e,r){return this._dispatchDatastoreXhr("POST",this.urls.putDelta,{handle:t,rev:e.rev,nonce:e.nonce,changes:JSON.stringify(e.changes)},q,{setRequestId:!0},r)},_getSnapshot:function(t,e){return this._dispatchDatastoreXhr("GET",this.urls.getSnapshot,{handle:t},P,{},e)},_datastoreAwait:function(e,r,n){return this._dispatchDatastoreXhr("GET",this.urls.datastoreAwait,{get_deltas:JSON.stringify({cursors:e}),list_datastores:JSON.stringify({token:r})},t,{isLongPoll:!0},n)},getDatastoreManager:function(){var t,e=this;return null==this._datastoreManager&&(this._datastoreManager=new x.Datastore.DatastoreManager(this),t=function(){return e.authStep===x.Client.SIGNED_OUT?(e._datastoreManager.close(),e._datastoreManager=null,e.onAuthStepChange.removeListener(t)):void 0},this.onAuthStepChange.addListener(t)),this._datastoreManager}},function(){var t,e,r,n;r=x.DatastoresClient,n=[];for(e in r)t=r[e],n.push(x.Client.prototype[e]=t);return n}(),x.File.PublicUrl=x.File.ShareUrl,x.UserInfo=x.AccountInfo}.call(this);

; browserify_shim__define__module__export__(typeof Dropbox != "undefined" ? Dropbox : window.Dropbox);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,require("/home/andreas/Dropbox/www/np/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"/home/andreas/Dropbox/www/np/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":15,"buffer":11}],10:[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/*!
 * routie - a tiny hash router
 * v0.3.2
 * http://projects.jga.me/routie
 * copyright Greg Allen 2013
 * MIT License
*/
(function(w) {

  var routes = [];
  var map = {};
  var reference = "routie";
  var oldReference = w[reference];

  var Route = function(path, name) {
    this.name = name;
    this.path = path;
    this.keys = [];
    this.fns = [];
    this.params = {};
    this.regex = pathToRegexp(this.path, this.keys, false, false);

  };

  Route.prototype.addHandler = function(fn) {
    this.fns.push(fn);
  };

  Route.prototype.removeHandler = function(fn) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      var f = this.fns[i];
      if (fn == f) {
        this.fns.splice(i, 1);
        return;
      }
    }
  };

  Route.prototype.run = function(params) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      this.fns[i].apply(this, params);
    }
  };

  Route.prototype.match = function(path, params){
    var m = this.regex.exec(path);

    if (!m) return false;


    for (var i = 1, len = m.length; i < len; ++i) {
      var key = this.keys[i - 1];

      var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

      if (key) {
        this.params[key.name] = val;
      }
      params.push(val);
    }

    return true;
  };

  Route.prototype.toURL = function(params) {
    var path = this.path;
    for (var param in params) {
      path = path.replace('/:'+param, '/'+params[param]);
    }
    path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
    if (path.indexOf(':') != -1) {
      throw new Error('missing parameters for url: '+path);
    }
    return path;
  };

  var pathToRegexp = function(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/\+/g, '__plus__')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var addHandler = function(path, fn) {
    var s = path.split(' ');
    var name = (s.length == 2) ? s[0] : null;
    path = (s.length == 2) ? s[1] : s[0];

    if (!map[path]) {
      map[path] = new Route(path, name);
      routes.push(map[path]);
    }
    map[path].addHandler(fn);
  };

  var routie = function(path, fn) {
    if (typeof fn == 'function') {
      addHandler(path, fn);
      routie.reload();
    } else if (typeof path == 'object') {
      for (var p in path) {
        addHandler(p, path[p]);
      }
      routie.reload();
    } else if (typeof fn === 'undefined') {
      routie.navigate(path);
    }
  };

  routie.lookup = function(name, obj) {
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (route.name == name) {
        return route.toURL(obj);
      }
    }
  };

  routie.remove = function(path, fn) {
    var route = map[path];
    if (!route)
      return;
    route.removeHandler(fn);
  };

  routie.removeAll = function() {
    map = {};
    routes = [];
  };

  routie.navigate = function(path, options) {
    options = options || {};
    var silent = options.silent || false;

    if (silent) {
      removeListener();
    }
    setTimeout(function() {
      window.location.hash = path;

      if (silent) {
        setTimeout(function() { 
          addListener();
        }, 1);
      }

    }, 1);
  };

  routie.noConflict = function() {
    w[reference] = oldReference;
    return routie;
  };

  var getHash = function() {
    return window.location.hash.substring(1);
  };

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
      route.run(params);
      return true;
    }
    return false;
  };

  var hashChanged = routie.reload = function() {
    var hash = getHash();
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (checkRoute(hash, route)) {
        return;
      }
    }
  };

  var addListener = function() {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false);
    } else {
      w.attachEvent('onhashchange', hashChanged);
    }
  };

  var removeListener = function() {
    if (w.removeEventListener) {
      w.removeEventListener('hashchange', hashChanged);
    } else {
      w.detachEvent('onhashchange', hashChanged);
    }
  };
  addListener();

  w[reference] = routie;
   
})(window);

; browserify_shim__define__module__export__(typeof routie != "undefined" ? routie : window.routie);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
/**
 * The buffer module from node.js, for the browser.
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install buffer`
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
   // Detect if browser supports Typed Arrays. Supported browsers are IE 10+,
   // Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+.
  if (typeof Uint8Array !== 'function' || typeof ArrayBuffer !== 'function')
    return false

  // Does the browser support adding properties to `Uint8Array` instances? If
  // not, then that's the same as no `Uint8Array` support. We need to be able to
  // add all the node Buffer API methods.
  // Bug in Firefox 4-29, now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var arr = new Uint8Array(0)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof Uint8Array === 'function' &&
      subject instanceof Uint8Array) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array === 'function') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment the Uint8Array *instance* (not the class!) with Buffer methods
 */
function augment (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":12,"ieee754":13}],12:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],13:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require("/home/andreas/Dropbox/www/np/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/home/andreas/Dropbox/www/np/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":15}],17:[function(require,module,exports){
/*

	Ractive - v0.3.9-317-d23e408 - 2014-03-21
	==============================================================

	Next-generation DOM manipulation - http://ractivejs.org
	Follow @RactiveJS for updates

	--------------------------------------------------------------

	Copyright 2014 Rich Harris and contributors

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.

*/

( function( global ) {



	var noConflict = global.Ractive;

	var legacy = undefined;

	var config_initOptions = function( legacy ) {

		var defaults, initOptions;
		defaults = {
			el: null,
			template: '',
			complete: null,
			preserveWhitespace: false,
			append: false,
			twoway: true,
			modifyArrays: true,
			lazy: false,
			debug: false,
			noIntro: false,
			transitionsEnabled: true,
			magic: false,
			noCssTransform: false,
			adapt: [],
			sanitize: false,
			stripComments: true,
			isolated: false,
			delimiters: [
				'{{',
				'}}'
			],
			tripleDelimiters: [
				'{{{',
				'}}}'
			]
		};
		initOptions = {
			keys: Object.keys( defaults ),
			defaults: defaults
		};
		return initOptions;
	}( legacy );

	var config_svg = function() {

		if ( typeof document === 'undefined' ) {
			return;
		}
		return document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
	}();

	var config_namespaces = {
		html: 'http://www.w3.org/1999/xhtml',
		mathml: 'http://www.w3.org/1998/Math/MathML',
		svg: 'http://www.w3.org/2000/svg',
		xlink: 'http://www.w3.org/1999/xlink',
		xml: 'http://www.w3.org/XML/1998/namespace',
		xmlns: 'http://www.w3.org/2000/xmlns/'
	};

	var utils_createElement = function( svg, namespaces ) {

		if ( !svg ) {
			return function( type, ns ) {
				if ( ns && ns !== namespaces.html ) {
					throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information';
				}
				return document.createElement( type );
			};
		} else {
			return function( type, ns ) {
				if ( !ns ) {
					return document.createElement( type );
				}
				return document.createElementNS( ns, type );
			};
		}
	}( config_svg, config_namespaces );

	var config_isClient = typeof document === 'object';

	var utils_defineProperty = function( isClient ) {

		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
			if ( isClient ) {
				Object.defineProperty( document.createElement( 'div' ), 'test', {
					value: 0
				} );
			}
			return Object.defineProperty;
		} catch ( err ) {
			return function( obj, prop, desc ) {
				obj[ prop ] = desc.value;
			};
		}
	}( config_isClient );

	var utils_defineProperties = function( createElement, defineProperty, isClient ) {

		try {
			try {
				Object.defineProperties( {}, {
					test: {
						value: 0
					}
				} );
			} catch ( err ) {
				throw err;
			}
			if ( isClient ) {
				Object.defineProperties( createElement( 'div' ), {
					test: {
						value: 0
					}
				} );
			}
			return Object.defineProperties;
		} catch ( err ) {
			return function( obj, props ) {
				var prop;
				for ( prop in props ) {
					if ( props.hasOwnProperty( prop ) ) {
						defineProperty( obj, prop, props[ prop ] );
					}
				}
			};
		}
	}( utils_createElement, utils_defineProperty, config_isClient );

	var utils_isNumeric = function( thing ) {
		return !isNaN( parseFloat( thing ) ) && isFinite( thing );
	};

	var Ractive_prototype_shared_add = function( isNumeric ) {

		return function( root, keypath, d ) {
			var value;
			if ( typeof keypath !== 'string' || !isNumeric( d ) ) {
				throw new Error( 'Bad arguments' );
			}
			value = +root.get( keypath ) || 0;
			if ( !isNumeric( value ) ) {
				throw new Error( 'Cannot add to a non-numeric value' );
			}
			return root.set( keypath, value + d );
		};
	}( utils_isNumeric );

	var Ractive_prototype_add = function( add ) {

		return function( keypath, d ) {
			return add( this, keypath, d === undefined ? 1 : +d );
		};
	}( Ractive_prototype_shared_add );

	var utils_isEqual = function( a, b ) {
		if ( a === null && b === null ) {
			return true;
		}
		if ( typeof a === 'object' || typeof b === 'object' ) {
			return false;
		}
		return a === b;
	};

	var utils_Promise = function() {

		var Promise, PENDING = {}, FULFILLED = {}, REJECTED = {};
		Promise = function( callback ) {
			var fulfilledHandlers = [],
				rejectedHandlers = [],
				state = PENDING,
				result, dispatchHandlers, makeResolver, fulfil, reject, promise;
			makeResolver = function( newState ) {
				return function( value ) {
					if ( state !== PENDING ) {
						return;
					}
					result = value;
					state = newState;
					dispatchHandlers = makeDispatcher( state === FULFILLED ? fulfilledHandlers : rejectedHandlers, result );
					wait( dispatchHandlers );
				};
			};
			fulfil = makeResolver( FULFILLED );
			reject = makeResolver( REJECTED );
			callback( fulfil, reject );
			promise = {
				then: function( onFulfilled, onRejected ) {
					var promise2 = new Promise( function( fulfil, reject ) {
						var processResolutionHandler = function( handler, handlers, forward ) {
							if ( typeof handler === 'function' ) {
								handlers.push( function( p1result ) {
									var x;
									try {
										x = handler( p1result );
										resolve( promise2, x, fulfil, reject );
									} catch ( err ) {
										reject( err );
									}
								} );
							} else {
								handlers.push( forward );
							}
						};
						processResolutionHandler( onFulfilled, fulfilledHandlers, fulfil );
						processResolutionHandler( onRejected, rejectedHandlers, reject );
						if ( state !== PENDING ) {
							wait( dispatchHandlers );
						}
					} );
					return promise2;
				}
			};
			promise[ 'catch' ] = function( onRejected ) {
				return this.then( null, onRejected );
			};
			return promise;
		};
		Promise.all = function( promises ) {
			return new Promise( function( fulfil, reject ) {
				var result = [],
					pending, i, processPromise;
				if ( !promises.length ) {
					fulfil( result );
					return;
				}
				processPromise = function( i ) {
					promises[ i ].then( function( value ) {
						result[ i ] = value;
						if ( !--pending ) {
							fulfil( result );
						}
					}, reject );
				};
				pending = i = promises.length;
				while ( i-- ) {
					processPromise( i );
				}
			} );
		};
		Promise.resolve = function( value ) {
			return new Promise( function( fulfil ) {
				fulfil( value );
			} );
		};
		Promise.reject = function( reason ) {
			return new Promise( function( fulfil, reject ) {
				reject( reason );
			} );
		};
		return Promise;

		function wait( callback ) {
			setTimeout( callback, 0 );
		}

		function makeDispatcher( handlers, result ) {
			return function() {
				var handler;
				while ( handler = handlers.shift() ) {
					handler( result );
				}
			};
		}

		function resolve( promise, x, fulfil, reject ) {
			var then;
			if ( x === promise ) {
				throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
			}
			if ( x instanceof Promise ) {
				x.then( fulfil, reject );
			} else if ( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
				try {
					then = x.then;
				} catch ( e ) {
					reject( e );
					return;
				}
				if ( typeof then === 'function' ) {
					var called, resolvePromise, rejectPromise;
					resolvePromise = function( y ) {
						if ( called ) {
							return;
						}
						called = true;
						resolve( promise, y, fulfil, reject );
					};
					rejectPromise = function( r ) {
						if ( called ) {
							return;
						}
						called = true;
						reject( r );
					};
					try {
						then.call( x, resolvePromise, rejectPromise );
					} catch ( e ) {
						if ( !called ) {
							reject( e );
							called = true;
							return;
						}
					}
				} else {
					fulfil( x );
				}
			} else {
				fulfil( x );
			}
		}
	}();

	var utils_normaliseKeypath = function() {

		var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
		return function normaliseKeypath( keypath ) {
			return ( keypath || '' ).replace( regex, '.$1' );
		};
	}();

	var config_vendors = [
		'o',
		'ms',
		'moz',
		'webkit'
	];

	var utils_requestAnimationFrame = function( vendors ) {

		if ( typeof window === 'undefined' ) {
			return;
		}
		( function( vendors, lastTime, window ) {
			var x, setTimeout;
			if ( window.requestAnimationFrame ) {
				return;
			}
			for ( x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
				window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
			}
			if ( !window.requestAnimationFrame ) {
				setTimeout = window.setTimeout;
				window.requestAnimationFrame = function( callback ) {
					var currTime, timeToCall, id;
					currTime = Date.now();
					timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
					id = setTimeout( function() {
						callback( currTime + timeToCall );
					}, timeToCall );
					lastTime = currTime + timeToCall;
					return id;
				};
			}
		}( vendors, 0, window ) );
		return window.requestAnimationFrame;
	}( config_vendors );

	var utils_getTime = function() {

		if ( typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function' ) {
			return function() {
				return window.performance.now();
			};
		} else {
			return function() {
				return Date.now();
			};
		}
	}();

	// This module provides a place to store a) circular dependencies and
	// b) the callback functions that require those circular dependencies
	var circular = [];

	var utils_removeFromArray = function( array, member ) {
		var index = array.indexOf( member );
		if ( index !== -1 ) {
			array.splice( index, 1 );
		}
	};

	var global_css = function( circular, isClient, removeFromArray ) {

		var runloop, styleElement, head, styleSheet, inDom, prefix = '/* Ractive.js component styles */\n',
			componentsInPage = {}, styles = [];
		if ( !isClient ) {
			return;
		}
		circular.push( function() {
			runloop = circular.runloop;
		} );
		styleElement = document.createElement( 'style' );
		styleElement.type = 'text/css';
		head = document.getElementsByTagName( 'head' )[ 0 ];
		inDom = false;
		styleSheet = styleElement.styleSheet;
		return {
			add: function( Component ) {
				if ( !Component.css ) {
					return;
				}
				if ( !componentsInPage[ Component._guid ] ) {
					componentsInPage[ Component._guid ] = 0;
					styles.push( Component.css );
					runloop.scheduleCssUpdate();
				}
				componentsInPage[ Component._guid ] += 1;
			},
			remove: function( Component ) {
				if ( !Component.css ) {
					return;
				}
				componentsInPage[ Component._guid ] -= 1;
				if ( !componentsInPage[ Component._guid ] ) {
					removeFromArray( styles, Component.css );
					runloop.scheduleCssUpdate();
				}
			},
			update: function() {
				var css;
				if ( styles.length ) {
					css = prefix + styles.join( ' ' );
					if ( styleSheet ) {
						styleSheet.cssText = css;
					} else {
						styleElement.innerHTML = css;
					}
					if ( !inDom ) {
						head.appendChild( styleElement );
					}
				} else if ( inDom ) {
					head.removeChild( styleElement );
				}
			}
		};
	}( circular, config_isClient, utils_removeFromArray );

	var shared_getValueFromCheckboxes = function( ractive, keypath ) {
		var value, checkboxes, checkbox, len, i, rootEl;
		value = [];
		rootEl = ractive._rendering ? ractive.fragment.docFrag : ractive.el;
		checkboxes = rootEl.querySelectorAll( 'input[type="checkbox"][name="{{' + keypath + '}}"]' );
		len = checkboxes.length;
		for ( i = 0; i < len; i += 1 ) {
			checkbox = checkboxes[ i ];
			if ( checkbox.hasAttribute( 'checked' ) || checkbox.checked ) {
				value.push( checkbox._ractive.value );
			}
		}
		return value;
	};

	var utils_hasOwnProperty = Object.prototype.hasOwnProperty;

	var shared_getInnerContext = function( fragment ) {
		do {
			if ( fragment.context ) {
				return fragment.context;
			}
		} while ( fragment = fragment.parent );
		return '';
	};

	var shared_resolveRef = function( circular, normaliseKeypath, hasOwnProperty, getInnerContext ) {

		var get, ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';
		circular.push( function() {
			get = circular.get;
		} );
		return function resolveRef( ractive, ref, fragment ) {
			var context, contextKeys, keys, lastKey, postfix, parentKeypath, parentValue, wrapped;
			ref = normaliseKeypath( ref );
			if ( ref === '.' ) {
				return getInnerContext( fragment );
			}
			if ( ref.charAt( 0 ) === '.' ) {
				context = getInnerContext( fragment );
				contextKeys = context ? context.split( '.' ) : [];
				if ( ref.substr( 0, 3 ) === '../' ) {
					while ( ref.substr( 0, 3 ) === '../' ) {
						if ( !contextKeys.length ) {
							throw new Error( ancestorErrorMessage );
						}
						contextKeys.pop();
						ref = ref.substring( 3 );
					}
					contextKeys.push( ref );
					return contextKeys.join( '.' );
				}
				if ( !context ) {
					return ref.substring( 1 );
				}
				return context + ref;
			}
			keys = ref.split( '.' );
			lastKey = keys.pop();
			postfix = keys.length ? '.' + keys.join( '.' ) : '';
			do {
				context = fragment.context;
				if ( !context ) {
					continue;
				}
				parentKeypath = context + postfix;
				parentValue = get( ractive, parentKeypath );
				if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
					parentValue = wrapped.get();
				}
				if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && lastKey in parentValue ) {
					return context + '.' + ref;
				}
			} while ( fragment = fragment.parent );
			if ( hasOwnProperty.call( ractive.data, ref ) ) {
				return ref;
			} else if ( get( ractive, ref ) !== undefined ) {
				return ref;
			}
		};
	}( circular, utils_normaliseKeypath, utils_hasOwnProperty, shared_getInnerContext );

	var shared_getUpstreamChanges = function getUpstreamChanges( changes ) {
		var upstreamChanges = [ '' ],
			i, keypath, keys, upstreamKeypath;
		i = changes.length;
		while ( i-- ) {
			keypath = changes[ i ];
			keys = keypath.split( '.' );
			while ( keys.length > 1 ) {
				keys.pop();
				upstreamKeypath = keys.join( '.' );
				if ( upstreamChanges[ upstreamKeypath ] !== true ) {
					upstreamChanges.push( upstreamKeypath );
					upstreamChanges[ upstreamKeypath ] = true;
				}
			}
		}
		return upstreamChanges;
	};

	var shared_notifyDependants = function() {

		var lastKey, starMaps = {};
		lastKey = /[^\.]+$/;

		function notifyDependants( ractive, keypath, onlyDirect ) {
			var i;
			if ( ractive._patternObservers.length ) {
				notifyPatternObservers( ractive, keypath, keypath, onlyDirect, true );
			}
			for ( i = 0; i < ractive._deps.length; i += 1 ) {
				notifyDependantsAtPriority( ractive, keypath, i, onlyDirect );
			}
		}
		notifyDependants.multiple = function notifyMultipleDependants( ractive, keypaths, onlyDirect ) {
			var i, j, len;
			len = keypaths.length;
			if ( ractive._patternObservers.length ) {
				i = len;
				while ( i-- ) {
					notifyPatternObservers( ractive, keypaths[ i ], keypaths[ i ], onlyDirect, true );
				}
			}
			for ( i = 0; i < ractive._deps.length; i += 1 ) {
				if ( ractive._deps[ i ] ) {
					j = len;
					while ( j-- ) {
						notifyDependantsAtPriority( ractive, keypaths[ j ], i, onlyDirect );
					}
				}
			}
		};
		return notifyDependants;

		function notifyDependantsAtPriority( ractive, keypath, priority, onlyDirect ) {
			var depsByKeypath = ractive._deps[ priority ];
			if ( !depsByKeypath ) {
				return;
			}
			updateAll( depsByKeypath[ keypath ] );
			if ( onlyDirect ) {
				return;
			}
			cascade( ractive._depsMap[ keypath ], ractive, priority );
		}

		function updateAll( deps ) {
			var i, len;
			if ( deps ) {
				len = deps.length;
				for ( i = 0; i < len; i += 1 ) {
					deps[ i ].update();
				}
			}
		}

		function cascade( childDeps, ractive, priority, onlyDirect ) {
			var i;
			if ( childDeps ) {
				i = childDeps.length;
				while ( i-- ) {
					notifyDependantsAtPriority( ractive, childDeps[ i ], priority, onlyDirect );
				}
			}
		}

		function notifyPatternObservers( ractive, registeredKeypath, actualKeypath, isParentOfChangedKeypath, isTopLevelCall ) {
			var i, patternObserver, children, child, key, childActualKeypath, potentialWildcardMatches, cascade;
			i = ractive._patternObservers.length;
			while ( i-- ) {
				patternObserver = ractive._patternObservers[ i ];
				if ( patternObserver.regex.test( actualKeypath ) ) {
					patternObserver.update( actualKeypath );
				}
			}
			if ( isParentOfChangedKeypath ) {
				return;
			}
			cascade = function( keypath ) {
				if ( children = ractive._depsMap[ keypath ] ) {
					i = children.length;
					while ( i-- ) {
						child = children[ i ];
						key = lastKey.exec( child )[ 0 ];
						childActualKeypath = actualKeypath + '.' + key;
						notifyPatternObservers( ractive, child, childActualKeypath );
					}
				}
			};
			if ( isTopLevelCall ) {
				potentialWildcardMatches = getPotentialWildcardMatches( actualKeypath );
				potentialWildcardMatches.forEach( cascade );
			} else {
				cascade( registeredKeypath );
			}
		}

		function getPotentialWildcardMatches( keypath ) {
			var keys, starMap, mapper, i, result, wildcardKeypath;
			keys = keypath.split( '.' );
			starMap = getStarMap( keys.length );
			result = [];
			mapper = function( star, i ) {
				return star ? '*' : keys[ i ];
			};
			i = starMap.length;
			while ( i-- ) {
				wildcardKeypath = starMap[ i ].map( mapper ).join( '.' );
				if ( !result[ wildcardKeypath ] ) {
					result.push( wildcardKeypath );
					result[ wildcardKeypath ] = true;
				}
			}
			return result;
		}

		function getStarMap( num ) {
			var ones = '',
				max, binary, starMap, mapper, i;
			if ( !starMaps[ num ] ) {
				starMap = [];
				while ( ones.length < num ) {
					ones += 1;
				}
				max = parseInt( ones, 2 );
				mapper = function( digit ) {
					return digit === '1';
				};
				for ( i = 0; i <= max; i += 1 ) {
					binary = i.toString( 2 );
					while ( binary.length < num ) {
						binary = '0' + binary;
					}
					starMap[ i ] = Array.prototype.map.call( binary, mapper );
				}
				starMaps[ num ] = starMap;
			}
			return starMaps[ num ];
		}
	}();

	var shared_makeTransitionManager = function( removeFromArray ) {

		var makeTransitionManager, checkComplete, remove, init;
		makeTransitionManager = function( callback, previous ) {
			var transitionManager = [];
			transitionManager.detachQueue = [];
			transitionManager.remove = remove;
			transitionManager.init = init;
			transitionManager._check = checkComplete;
			transitionManager._callback = callback;
			transitionManager._previous = previous;
			if ( previous ) {
				previous.push( transitionManager );
			}
			return transitionManager;
		};
		checkComplete = function() {
			var element;
			if ( this._ready && !this.length ) {
				while ( element = this.detachQueue.pop() ) {
					element.detach();
				}
				if ( typeof this._callback === 'function' ) {
					this._callback();
				}
				if ( this._previous ) {
					this._previous.remove( this );
				}
			}
		};
		remove = function( transition ) {
			removeFromArray( this, transition );
			this._check();
		};
		init = function() {
			this._ready = true;
			this._check();
		};
		return makeTransitionManager;
	}( utils_removeFromArray );

	var global_runloop = function( circular, css, removeFromArray, getValueFromCheckboxes, resolveRef, getUpstreamChanges, notifyDependants, makeTransitionManager ) {

		circular.push( function() {
			get = circular.get;
			set = circular.set;
		} );
		var runloop, get, set, dirty = false,
			flushing = false,
			pendingCssChanges, inFlight = 0,
			toFocus = null,
			liveQueries = [],
			decorators = [],
			transitions = [],
			observers = [],
			attributes = [],
			evaluators = [],
			selectValues = [],
			checkboxKeypaths = {}, checkboxes = [],
			radios = [],
			unresolved = [],
			instances = [],
			transitionManager;
		runloop = {
			start: function( instance, callback ) {
				if ( instance && !instances[ instance._guid ] ) {
					instances.push( instance );
					instances[ instances._guid ] = true;
				}
				if ( !flushing ) {
					inFlight += 1;
					transitionManager = makeTransitionManager( callback, transitionManager );
				}
			},
			end: function() {
				if ( flushing ) {
					attemptKeypathResolution();
					return;
				}
				if ( !--inFlight ) {
					flushing = true;
					flushChanges();
					flushing = false;
					land();
				}
				transitionManager.init();
				transitionManager = transitionManager._previous;
			},
			trigger: function() {
				if ( inFlight || flushing ) {
					attemptKeypathResolution();
					return;
				}
				flushing = true;
				flushChanges();
				flushing = false;
				land();
			},
			focus: function( node ) {
				toFocus = node;
			},
			addLiveQuery: function( query ) {
				liveQueries.push( query );
			},
			addDecorator: function( decorator ) {
				decorators.push( decorator );
			},
			addTransition: function( transition ) {
				transition._manager = transitionManager;
				transitionManager.push( transition );
				transitions.push( transition );
			},
			addObserver: function( observer ) {
				observers.push( observer );
			},
			addAttribute: function( attribute ) {
				attributes.push( attribute );
			},
			scheduleCssUpdate: function() {
				if ( !inFlight && !flushing ) {
					css.update();
				} else {
					pendingCssChanges = true;
				}
			},
			addEvaluator: function( evaluator ) {
				dirty = true;
				evaluators.push( evaluator );
			},
			addSelectValue: function( selectValue ) {
				dirty = true;
				selectValues.push( selectValue );
			},
			addCheckbox: function( checkbox ) {
				if ( !checkboxKeypaths[ checkbox.keypath ] ) {
					dirty = true;
					checkboxes.push( checkbox );
				}
			},
			addRadio: function( radio ) {
				dirty = true;
				radios.push( radio );
			},
			addUnresolved: function( thing ) {
				dirty = true;
				unresolved.push( thing );
			},
			removeUnresolved: function( thing ) {
				removeFromArray( unresolved, thing );
			},
			detachWhenReady: function( thing ) {
				transitionManager.detachQueue.push( thing );
			}
		};
		circular.runloop = runloop;
		return runloop;

		function land() {
			var thing, changedKeypath, changeHash;
			if ( toFocus ) {
				toFocus.focus();
				toFocus = null;
			}
			while ( thing = attributes.pop() ) {
				thing.update().deferred = false;
			}
			while ( thing = liveQueries.pop() ) {
				thing._sort();
			}
			while ( thing = decorators.pop() ) {
				thing.init();
			}
			while ( thing = transitions.pop() ) {
				thing.init();
			}
			while ( thing = observers.pop() ) {
				thing.update();
			}
			while ( thing = instances.pop() ) {
				instances[ thing._guid ] = false;
				if ( thing._changes.length ) {
					changeHash = {};
					while ( changedKeypath = thing._changes.pop() ) {
						changeHash[ changedKeypath ] = get( thing, changedKeypath );
					}
					thing.fire( 'change', changeHash );
				}
			}
			if ( pendingCssChanges ) {
				css.update();
				pendingCssChanges = false;
			}
		}

		function flushChanges() {
			var thing, upstreamChanges, i;
			i = instances.length;
			while ( i-- ) {
				thing = instances[ i ];
				if ( thing._changes.length ) {
					upstreamChanges = getUpstreamChanges( thing._changes );
					notifyDependants.multiple( thing, upstreamChanges, true );
				}
			}
			attemptKeypathResolution();
			while ( dirty ) {
				dirty = false;
				while ( thing = evaluators.pop() ) {
					thing.update().deferred = false;
				}
				while ( thing = selectValues.pop() ) {
					thing.deferredUpdate();
				}
				while ( thing = checkboxes.pop() ) {
					set( thing.root, thing.keypath, getValueFromCheckboxes( thing.root, thing.keypath ) );
				}
				while ( thing = radios.pop() ) {
					thing.update();
				}
			}
		}

		function attemptKeypathResolution() {
			var array, thing, keypath;
			if ( !unresolved.length ) {
				return;
			}
			array = unresolved.splice( 0, unresolved.length );
			while ( thing = array.pop() ) {
				if ( thing.keypath ) {
					continue;
				}
				keypath = resolveRef( thing.root, thing.ref, thing.parentFragment );
				if ( keypath !== undefined ) {
					thing.resolve( keypath );
				} else {
					unresolved.push( thing );
				}
			}
		}
	}( circular, global_css, utils_removeFromArray, shared_getValueFromCheckboxes, shared_resolveRef, shared_getUpstreamChanges, shared_notifyDependants, shared_makeTransitionManager );

	var shared_animations = function( rAF, getTime, runloop ) {

		var queue = [];
		var animations = {
			tick: function() {
				var i, animation, now;
				now = getTime();
				runloop.start();
				for ( i = 0; i < queue.length; i += 1 ) {
					animation = queue[ i ];
					if ( !animation.tick( now ) ) {
						queue.splice( i--, 1 );
					}
				}
				runloop.end();
				if ( queue.length ) {
					rAF( animations.tick );
				} else {
					animations.running = false;
				}
			},
			add: function( animation ) {
				queue.push( animation );
				if ( !animations.running ) {
					animations.running = true;
					rAF( animations.tick );
				}
			},
			abort: function( keypath, root ) {
				var i = queue.length,
					animation;
				while ( i-- ) {
					animation = queue[ i ];
					if ( animation.root === root && animation.keypath === keypath ) {
						animation.stop();
					}
				}
			}
		};
		return animations;
	}( utils_requestAnimationFrame, utils_getTime, global_runloop );

	var utils_isArray = function() {

		var toString = Object.prototype.toString;
		return function( thing ) {
			return toString.call( thing ) === '[object Array]';
		};
	}();

	var utils_clone = function( isArray ) {

		return function( source ) {
			var target, key;
			if ( !source || typeof source !== 'object' ) {
				return source;
			}
			if ( isArray( source ) ) {
				return source.slice();
			}
			target = {};
			for ( key in source ) {
				if ( source.hasOwnProperty( key ) ) {
					target[ key ] = source[ key ];
				}
			}
			return target;
		};
	}( utils_isArray );

	var registries_adaptors = {};

	var shared_get_arrayAdaptor_getSpliceEquivalent = function( array, methodName, args ) {
		switch ( methodName ) {
			case 'splice':
				return args;
			case 'sort':
			case 'reverse':
				return null;
			case 'pop':
				if ( array.length ) {
					return [ -1 ];
				}
				return null;
			case 'push':
				return [
					array.length,
					0
				].concat( args );
			case 'shift':
				return [
					0,
					1
				];
			case 'unshift':
				return [
					0,
					0
				].concat( args );
		}
	};

	var shared_get_arrayAdaptor_summariseSpliceOperation = function( array, args ) {
		var start, addedItems, removedItems, balance;
		if ( !args ) {
			return null;
		}
		start = +( args[ 0 ] < 0 ? array.length + args[ 0 ] : args[ 0 ] );
		addedItems = Math.max( 0, args.length - 2 );
		removedItems = args[ 1 ] !== undefined ? args[ 1 ] : array.length - start;
		removedItems = Math.min( removedItems, array.length - start );
		balance = addedItems - removedItems;
		return {
			start: start,
			balance: balance,
			added: addedItems,
			removed: removedItems
		};
	};

	var config_types = {
		TEXT: 1,
		INTERPOLATOR: 2,
		TRIPLE: 3,
		SECTION: 4,
		INVERTED: 5,
		CLOSING: 6,
		ELEMENT: 7,
		PARTIAL: 8,
		COMMENT: 9,
		DELIMCHANGE: 10,
		MUSTACHE: 11,
		TAG: 12,
		ATTRIBUTE: 13,
		COMPONENT: 15,
		NUMBER_LITERAL: 20,
		STRING_LITERAL: 21,
		ARRAY_LITERAL: 22,
		OBJECT_LITERAL: 23,
		BOOLEAN_LITERAL: 24,
		GLOBAL: 26,
		KEY_VALUE_PAIR: 27,
		REFERENCE: 30,
		REFINEMENT: 31,
		MEMBER: 32,
		PREFIX_OPERATOR: 33,
		BRACKETED: 34,
		CONDITIONAL: 35,
		INFIX_OPERATOR: 36,
		INVOCATION: 40
	};

	var shared_clearCache = function clearCache( ractive, keypath, dontTeardownWrapper ) {
		var cacheMap, wrappedProperty;
		if ( !dontTeardownWrapper ) {
			if ( wrappedProperty = ractive._wrapped[ keypath ] ) {
				if ( wrappedProperty.teardown() !== false ) {
					ractive._wrapped[ keypath ] = null;
				}
			}
		}
		ractive._cache[ keypath ] = undefined;
		if ( cacheMap = ractive._cacheMap[ keypath ] ) {
			while ( cacheMap.length ) {
				clearCache( ractive, cacheMap.pop() );
			}
		}
	};

	var utils_createBranch = function() {

		var numeric = /^\s*[0-9]+\s*$/;
		return function( key ) {
			return numeric.test( key ) ? [] : {};
		};
	}();

	var shared_set = function( circular, isEqual, createBranch, clearCache, notifyDependants ) {

		var get;
		circular.push( function() {
			get = circular.get;
		} );

		function set( ractive, keypath, value, silent ) {
			var keys, lastKey, parentKeypath, parentValue, wrapper, evaluator, dontTeardownWrapper;
			if ( isEqual( ractive._cache[ keypath ], value ) ) {
				return;
			}
			wrapper = ractive._wrapped[ keypath ];
			evaluator = ractive._evaluators[ keypath ];
			if ( wrapper && wrapper.reset ) {
				wrapper.reset( value );
				value = wrapper.get();
				dontTeardownWrapper = true;
			}
			if ( evaluator ) {
				evaluator.value = value;
			}
			if ( !evaluator && ( !wrapper || !wrapper.reset ) ) {
				keys = keypath.split( '.' );
				lastKey = keys.pop();
				parentKeypath = keys.join( '.' );
				wrapper = ractive._wrapped[ parentKeypath ];
				if ( wrapper && wrapper.set ) {
					wrapper.set( lastKey, value );
				} else {
					parentValue = wrapper ? wrapper.get() : get( ractive, parentKeypath );
					if ( !parentValue ) {
						parentValue = createBranch( lastKey );
						set( ractive, parentKeypath, parentValue );
					}
					parentValue[ lastKey ] = value;
				}
			}
			clearCache( ractive, keypath, dontTeardownWrapper );
			if ( !silent ) {
				ractive._changes.push( keypath );
				notifyDependants( ractive, keypath );
			}
		}
		circular.set = set;
		return set;
	}( circular, utils_isEqual, utils_createBranch, shared_clearCache, shared_notifyDependants );

	var shared_get_arrayAdaptor_processWrapper = function( types, clearCache, notifyDependants, set ) {

		return function( wrapper, array, methodName, spliceSummary ) {
			var root, keypath, clearEnd, updateDependant, i, changed, start, end, childKeypath, lengthUnchanged;
			root = wrapper.root;
			keypath = wrapper.keypath;
			root._changes.push( keypath );
			if ( methodName === 'sort' || methodName === 'reverse' ) {
				set( root, keypath, array );
				return;
			}
			if ( !spliceSummary ) {
				return;
			}
			clearEnd = !spliceSummary.balance ? spliceSummary.added : array.length - Math.min( spliceSummary.balance, 0 );
			for ( i = spliceSummary.start; i < clearEnd; i += 1 ) {
				clearCache( root, keypath + '.' + i );
			}
			updateDependant = function( dependant ) {
				if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
					dependant.splice( spliceSummary );
				} else {
					dependant.update();
				}
			};
			root._deps.forEach( function( depsByKeypath ) {
				var dependants = depsByKeypath[ keypath ];
				if ( dependants ) {
					dependants.forEach( updateDependant );
				}
			} );
			if ( spliceSummary.added && spliceSummary.removed ) {
				changed = Math.max( spliceSummary.added, spliceSummary.removed );
				start = spliceSummary.start;
				end = start + changed;
				lengthUnchanged = spliceSummary.added === spliceSummary.removed;
				for ( i = start; i < end; i += 1 ) {
					childKeypath = keypath + '.' + i;
					notifyDependants( root, childKeypath );
				}
			}
			if ( !lengthUnchanged ) {
				clearCache( root, keypath + '.length' );
				notifyDependants( root, keypath + '.length', true );
			}
		};
	}( config_types, shared_clearCache, shared_notifyDependants, shared_set );

	var shared_get_arrayAdaptor_patch = function( runloop, defineProperty, getSpliceEquivalent, summariseSpliceOperation, processWrapper ) {

		var patchedArrayProto = [],
			mutatorMethods = [
				'pop',
				'push',
				'reverse',
				'shift',
				'sort',
				'splice',
				'unshift'
			],
			testObj, patchArrayMethods, unpatchArrayMethods;
		mutatorMethods.forEach( function( methodName ) {
			var method = function() {
				var spliceEquivalent, spliceSummary, result, wrapper, i;
				spliceEquivalent = getSpliceEquivalent( this, methodName, Array.prototype.slice.call( arguments ) );
				spliceSummary = summariseSpliceOperation( this, spliceEquivalent );
				result = Array.prototype[ methodName ].apply( this, arguments );
				this._ractive.setting = true;
				i = this._ractive.wrappers.length;
				while ( i-- ) {
					wrapper = this._ractive.wrappers[ i ];
					runloop.start( wrapper.root );
					processWrapper( wrapper, this, methodName, spliceSummary );
					runloop.end();
				}
				this._ractive.setting = false;
				return result;
			};
			defineProperty( patchedArrayProto, methodName, {
				value: method
			} );
		} );
		testObj = {};
		if ( testObj.__proto__ ) {
			patchArrayMethods = function( array ) {
				array.__proto__ = patchedArrayProto;
			};
			unpatchArrayMethods = function( array ) {
				array.__proto__ = Array.prototype;
			};
		} else {
			patchArrayMethods = function( array ) {
				var i, methodName;
				i = mutatorMethods.length;
				while ( i-- ) {
					methodName = mutatorMethods[ i ];
					defineProperty( array, methodName, {
						value: patchedArrayProto[ methodName ],
						configurable: true
					} );
				}
			};
			unpatchArrayMethods = function( array ) {
				var i;
				i = mutatorMethods.length;
				while ( i-- ) {
					delete array[ mutatorMethods[ i ] ];
				}
			};
		}
		patchArrayMethods.unpatch = unpatchArrayMethods;
		return patchArrayMethods;
	}( global_runloop, utils_defineProperty, shared_get_arrayAdaptor_getSpliceEquivalent, shared_get_arrayAdaptor_summariseSpliceOperation, shared_get_arrayAdaptor_processWrapper );

	var shared_get_arrayAdaptor__arrayAdaptor = function( defineProperty, isArray, patch ) {

		var arrayAdaptor, ArrayWrapper, errorMessage;
		arrayAdaptor = {
			filter: function( object ) {
				return isArray( object ) && ( !object._ractive || !object._ractive.setting );
			},
			wrap: function( ractive, array, keypath ) {
				return new ArrayWrapper( ractive, array, keypath );
			}
		};
		ArrayWrapper = function( ractive, array, keypath ) {
			this.root = ractive;
			this.value = array;
			this.keypath = keypath;
			if ( !array._ractive ) {
				defineProperty( array, '_ractive', {
					value: {
						wrappers: [],
						instances: [],
						setting: false
					},
					configurable: true
				} );
				patch( array );
			}
			if ( !array._ractive.instances[ ractive._guid ] ) {
				array._ractive.instances[ ractive._guid ] = 0;
				array._ractive.instances.push( ractive );
			}
			array._ractive.instances[ ractive._guid ] += 1;
			array._ractive.wrappers.push( this );
		};
		ArrayWrapper.prototype = {
			get: function() {
				return this.value;
			},
			teardown: function() {
				var array, storage, wrappers, instances, index;
				array = this.value;
				storage = array._ractive;
				wrappers = storage.wrappers;
				instances = storage.instances;
				if ( storage.setting ) {
					return false;
				}
				index = wrappers.indexOf( this );
				if ( index === -1 ) {
					throw new Error( errorMessage );
				}
				wrappers.splice( index, 1 );
				if ( !wrappers.length ) {
					delete array._ractive;
					patch.unpatch( this.value );
				} else {
					instances[ this.root._guid ] -= 1;
					if ( !instances[ this.root._guid ] ) {
						index = instances.indexOf( this.root );
						if ( index === -1 ) {
							throw new Error( errorMessage );
						}
						instances.splice( index, 1 );
					}
				}
			}
		};
		errorMessage = 'Something went wrong in a rather interesting way';
		return arrayAdaptor;
	}( utils_defineProperty, utils_isArray, shared_get_arrayAdaptor_patch );

	var shared_get_magicAdaptor = function( runloop, createBranch, isArray, clearCache, notifyDependants ) {

		var magicAdaptor, MagicWrapper;
		try {
			Object.defineProperty( {}, 'test', {
				value: 0
			} );
		} catch ( err ) {
			return false;
		}
		magicAdaptor = {
			filter: function( object, keypath, ractive ) {
				var keys, key, parentKeypath, parentWrapper, parentValue;
				if ( !keypath ) {
					return false;
				}
				keys = keypath.split( '.' );
				key = keys.pop();
				parentKeypath = keys.join( '.' );
				if ( ( parentWrapper = ractive._wrapped[ parentKeypath ] ) && !parentWrapper.magic ) {
					return false;
				}
				parentValue = ractive.get( parentKeypath );
				if ( isArray( parentValue ) && /^[0-9]+$/.test( key ) ) {
					return false;
				}
				return parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' );
			},
			wrap: function( ractive, property, keypath ) {
				return new MagicWrapper( ractive, property, keypath );
			}
		};
		MagicWrapper = function( ractive, value, keypath ) {
			var keys, objKeypath, descriptor, siblings;
			this.magic = true;
			this.ractive = ractive;
			this.keypath = keypath;
			this.value = value;
			keys = keypath.split( '.' );
			this.prop = keys.pop();
			objKeypath = keys.join( '.' );
			this.obj = objKeypath ? ractive.get( objKeypath ) : ractive.data;
			descriptor = this.originalDescriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
			if ( descriptor && descriptor.set && ( siblings = descriptor.set._ractiveWrappers ) ) {
				if ( siblings.indexOf( this ) === -1 ) {
					siblings.push( this );
				}
				return;
			}
			createAccessors( this, value, descriptor );
		};
		MagicWrapper.prototype = {
			get: function() {
				return this.value;
			},
			reset: function( value ) {
				if ( this.updating ) {
					return;
				}
				this.updating = true;
				this.obj[ this.prop ] = value;
				clearCache( this.ractive, this.keypath );
				this.updating = false;
			},
			set: function( key, value ) {
				if ( this.updating ) {
					return;
				}
				if ( !this.obj[ this.prop ] ) {
					this.updating = true;
					this.obj[ this.prop ] = createBranch( key );
					this.updating = false;
				}
				this.obj[ this.prop ][ key ] = value;
			},
			teardown: function() {
				var descriptor, set, value, wrappers, index;
				if ( this.updating ) {
					return false;
				}
				descriptor = Object.getOwnPropertyDescriptor( this.obj, this.prop );
				set = descriptor && descriptor.set;
				if ( !set ) {
					return;
				}
				wrappers = set._ractiveWrappers;
				index = wrappers.indexOf( this );
				if ( index !== -1 ) {
					wrappers.splice( index, 1 );
				}
				if ( !wrappers.length ) {
					value = this.obj[ this.prop ];
					Object.defineProperty( this.obj, this.prop, this.originalDescriptor || {
						writable: true,
						enumerable: true,
						configurable: true
					} );
					this.obj[ this.prop ] = value;
				}
			}
		};

		function createAccessors( originalWrapper, value, descriptor ) {
			var object, property, oldGet, oldSet, get, set;
			object = originalWrapper.obj;
			property = originalWrapper.prop;
			if ( descriptor && !descriptor.configurable ) {
				if ( property === 'length' ) {
					return;
				}
				throw new Error( 'Cannot use magic mode with property "' + property + '" - object is not configurable' );
			}
			if ( descriptor ) {
				oldGet = descriptor.get;
				oldSet = descriptor.set;
			}
			get = oldGet || function() {
				return value;
			};
			set = function( v ) {
				if ( oldSet ) {
					oldSet( v );
				}
				value = oldGet ? oldGet() : v;
				set._ractiveWrappers.forEach( updateWrapper );
			};

			function updateWrapper( wrapper ) {
				var keypath, ractive;
				wrapper.value = value;
				if ( wrapper.updating ) {
					return;
				}
				ractive = wrapper.ractive;
				keypath = wrapper.keypath;
				wrapper.updating = true;
				runloop.start( ractive );
				ractive._changes.push( keypath );
				clearCache( ractive, keypath );
				notifyDependants( ractive, keypath );
				runloop.end();
				wrapper.updating = false;
			}
			set._ractiveWrappers = [ originalWrapper ];
			Object.defineProperty( object, property, {
				get: get,
				set: set,
				enumerable: true,
				configurable: true
			} );
		}
		return magicAdaptor;
	}( global_runloop, utils_createBranch, utils_isArray, shared_clearCache, shared_notifyDependants );

	var shared_get_magicArrayAdaptor = function( magicAdaptor, arrayAdaptor ) {

		if ( !magicAdaptor ) {
			return false;
		}
		var magicArrayAdaptor, MagicArrayWrapper;
		magicArrayAdaptor = {
			filter: function( object, keypath, ractive ) {
				return magicAdaptor.filter( object, keypath, ractive ) && arrayAdaptor.filter( object );
			},
			wrap: function( ractive, array, keypath ) {
				return new MagicArrayWrapper( ractive, array, keypath );
			}
		};
		MagicArrayWrapper = function( ractive, array, keypath ) {
			this.value = array;
			this.magic = true;
			this.magicWrapper = magicAdaptor.wrap( ractive, array, keypath );
			this.arrayWrapper = arrayAdaptor.wrap( ractive, array, keypath );
		};
		MagicArrayWrapper.prototype = {
			get: function() {
				return this.value;
			},
			teardown: function() {
				this.arrayWrapper.teardown();
				this.magicWrapper.teardown();
			},
			reset: function( value ) {
				return this.magicWrapper.reset( value );
			}
		};
		return magicArrayAdaptor;
	}( shared_get_magicAdaptor, shared_get_arrayAdaptor__arrayAdaptor );

	var shared_adaptIfNecessary = function( adaptorRegistry, arrayAdaptor, magicAdaptor, magicArrayAdaptor ) {

		var prefixers = {};
		return function adaptIfNecessary( ractive, keypath, value, isExpressionResult ) {
			var len, i, adaptor, wrapped;
			len = ractive.adapt.length;
			for ( i = 0; i < len; i += 1 ) {
				adaptor = ractive.adapt[ i ];
				if ( typeof adaptor === 'string' ) {
					if ( !adaptorRegistry[ adaptor ] ) {
						throw new Error( 'Missing adaptor "' + adaptor + '"' );
					}
					adaptor = ractive.adapt[ i ] = adaptorRegistry[ adaptor ];
				}
				if ( adaptor.filter( value, keypath, ractive ) ) {
					wrapped = ractive._wrapped[ keypath ] = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
					wrapped.value = value;
					return value;
				}
			}
			if ( !isExpressionResult ) {
				if ( ractive.magic ) {
					if ( magicArrayAdaptor.filter( value, keypath, ractive ) ) {
						ractive._wrapped[ keypath ] = magicArrayAdaptor.wrap( ractive, value, keypath );
					} else if ( magicAdaptor.filter( value, keypath, ractive ) ) {
						ractive._wrapped[ keypath ] = magicAdaptor.wrap( ractive, value, keypath );
					}
				} else if ( ractive.modifyArrays && arrayAdaptor.filter( value, keypath, ractive ) ) {
					ractive._wrapped[ keypath ] = arrayAdaptor.wrap( ractive, value, keypath );
				}
			}
			return value;
		};

		function prefixKeypath( obj, prefix ) {
			var prefixed = {}, key;
			if ( !prefix ) {
				return obj;
			}
			prefix += '.';
			for ( key in obj ) {
				if ( obj.hasOwnProperty( key ) ) {
					prefixed[ prefix + key ] = obj[ key ];
				}
			}
			return prefixed;
		}

		function getPrefixer( rootKeypath ) {
			var rootDot;
			if ( !prefixers[ rootKeypath ] ) {
				rootDot = rootKeypath ? rootKeypath + '.' : '';
				prefixers[ rootKeypath ] = function( relativeKeypath, value ) {
					var obj;
					if ( typeof relativeKeypath === 'string' ) {
						obj = {};
						obj[ rootDot + relativeKeypath ] = value;
						return obj;
					}
					if ( typeof relativeKeypath === 'object' ) {
						return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
					}
				};
			}
			return prefixers[ rootKeypath ];
		}
	}( registries_adaptors, shared_get_arrayAdaptor__arrayAdaptor, shared_get_magicAdaptor, shared_get_magicArrayAdaptor );

	var shared_registerDependant = function() {

		return function registerDependant( dependant ) {
			var depsByKeypath, deps, ractive, keypath, priority;
			ractive = dependant.root;
			keypath = dependant.keypath;
			priority = dependant.priority;
			depsByKeypath = ractive._deps[ priority ] || ( ractive._deps[ priority ] = {} );
			deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );
			deps.push( dependant );
			dependant.registered = true;
			if ( !keypath ) {
				return;
			}
			updateDependantsMap( ractive, keypath );
		};

		function updateDependantsMap( ractive, keypath ) {
			var keys, parentKeypath, map;
			keys = keypath.split( '.' );
			while ( keys.length ) {
				keys.pop();
				parentKeypath = keys.join( '.' );
				map = ractive._depsMap[ parentKeypath ] || ( ractive._depsMap[ parentKeypath ] = [] );
				if ( map[ keypath ] === undefined ) {
					map[ keypath ] = 0;
					map[ map.length ] = keypath;
				}
				map[ keypath ] += 1;
				keypath = parentKeypath;
			}
		}
	}();

	var shared_unregisterDependant = function() {

		return function unregisterDependant( dependant ) {
			var deps, index, ractive, keypath, priority;
			ractive = dependant.root;
			keypath = dependant.keypath;
			priority = dependant.priority;
			deps = ractive._deps[ priority ][ keypath ];
			index = deps.indexOf( dependant );
			if ( index === -1 || !dependant.registered ) {
				throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
			}
			deps.splice( index, 1 );
			dependant.registered = false;
			if ( !keypath ) {
				return;
			}
			updateDependantsMap( ractive, keypath );
		};

		function updateDependantsMap( ractive, keypath ) {
			var keys, parentKeypath, map;
			keys = keypath.split( '.' );
			while ( keys.length ) {
				keys.pop();
				parentKeypath = keys.join( '.' );
				map = ractive._depsMap[ parentKeypath ];
				map[ keypath ] -= 1;
				if ( !map[ keypath ] ) {
					map.splice( map.indexOf( keypath ), 1 );
					map[ keypath ] = undefined;
				}
				keypath = parentKeypath;
			}
		}
	}();

	var shared_createComponentBinding = function( circular, isArray, isEqual, registerDependant, unregisterDependant ) {

		var get, set;
		circular.push( function() {
			get = circular.get;
			set = circular.set;
		} );
		var Binding = function( ractive, keypath, otherInstance, otherKeypath, priority ) {
			this.root = ractive;
			this.keypath = keypath;
			this.priority = priority;
			this.otherInstance = otherInstance;
			this.otherKeypath = otherKeypath;
			registerDependant( this );
			this.value = get( this.root, this.keypath );
		};
		Binding.prototype = {
			update: function() {
				var value;
				if ( this.updating || this.counterpart && this.counterpart.updating ) {
					return;
				}
				value = get( this.root, this.keypath );
				if ( isArray( value ) && value._ractive && value._ractive.setting ) {
					return;
				}
				if ( !isEqual( value, this.value ) ) {
					this.updating = true;
					set( this.otherInstance, this.otherKeypath, value );
					this.value = value;
					this.updating = false;
				}
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return function createComponentBinding( component, parentInstance, parentKeypath, childKeypath ) {
			var hash, childInstance, bindings, priority, parentToChildBinding, childToParentBinding;
			hash = parentKeypath + '=' + childKeypath;
			bindings = component.bindings;
			if ( bindings[ hash ] ) {
				return;
			}
			bindings[ hash ] = true;
			childInstance = component.instance;
			priority = component.parentFragment.priority;
			parentToChildBinding = new Binding( parentInstance, parentKeypath, childInstance, childKeypath, priority );
			bindings.push( parentToChildBinding );
			if ( childInstance.twoway ) {
				childToParentBinding = new Binding( childInstance, childKeypath, parentInstance, parentKeypath, 1 );
				bindings.push( childToParentBinding );
				parentToChildBinding.counterpart = childToParentBinding;
				childToParentBinding.counterpart = parentToChildBinding;
			}
		};
	}( circular, utils_isArray, utils_isEqual, shared_registerDependant, shared_unregisterDependant );

	var shared_get_getFromParent = function( circular, createComponentBinding, set ) {

		var get;
		circular.push( function() {
			get = circular.get;
		} );
		return function getFromParent( child, keypath ) {
			var parent, fragment, keypathToTest, value;
			parent = child._parent;
			fragment = child.component.parentFragment;
			do {
				if ( !fragment.context ) {
					continue;
				}
				keypathToTest = fragment.context + '.' + keypath;
				value = get( parent, keypathToTest );
				if ( value !== undefined ) {
					createLateComponentBinding( parent, child, keypathToTest, keypath, value );
					return value;
				}
			} while ( fragment = fragment.parent );
			value = get( parent, keypath );
			if ( value !== undefined ) {
				createLateComponentBinding( parent, child, keypath, keypath, value );
				return value;
			}
		};

		function createLateComponentBinding( parent, child, parentKeypath, childKeypath, value ) {
			set( child, childKeypath, value, true );
			createComponentBinding( child.component, parent, parentKeypath, childKeypath );
		}
	}( circular, shared_createComponentBinding, shared_set );

	var shared_get_FAILED_LOOKUP = {
		FAILED_LOOKUP: true
	};

	var shared_get__get = function( circular, hasOwnProperty, clone, adaptIfNecessary, getFromParent, FAILED_LOOKUP ) {

		function get( ractive, keypath, options ) {
			var cache = ractive._cache,
				value, wrapped, evaluator;
			if ( cache[ keypath ] === undefined ) {
				if ( wrapped = ractive._wrapped[ keypath ] ) {
					value = wrapped.value;
				} else if ( !keypath ) {
					adaptIfNecessary( ractive, '', ractive.data );
					value = ractive.data;
				} else if ( evaluator = ractive._evaluators[ keypath ] ) {
					value = evaluator.value;
				} else {
					value = retrieve( ractive, keypath );
				}
				cache[ keypath ] = value;
			} else {
				value = cache[ keypath ];
			}
			if ( value === FAILED_LOOKUP ) {
				if ( ractive._parent && !ractive.isolated ) {
					value = getFromParent( ractive, keypath, options );
				} else {
					value = undefined;
				}
			}
			if ( options && options.evaluateWrapped && ( wrapped = ractive._wrapped[ keypath ] ) ) {
				value = wrapped.get();
			}
			return value;
		}
		circular.get = get;
		return get;

		function retrieve( ractive, keypath ) {
			var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped, shouldClone;
			keys = keypath.split( '.' );
			key = keys.pop();
			parentKeypath = keys.join( '.' );
			parentValue = get( ractive, parentKeypath );
			if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
				parentValue = wrapped.get();
			}
			if ( parentValue === null || parentValue === undefined ) {
				return;
			}
			if ( !( cacheMap = ractive._cacheMap[ parentKeypath ] ) ) {
				ractive._cacheMap[ parentKeypath ] = [ keypath ];
			} else {
				if ( cacheMap.indexOf( keypath ) === -1 ) {
					cacheMap.push( keypath );
				}
			}
			if ( typeof parentValue === 'object' && !( key in parentValue ) ) {
				return ractive._cache[ keypath ] = FAILED_LOOKUP;
			}
			shouldClone = !hasOwnProperty.call( parentValue, key );
			value = shouldClone ? clone( parentValue[ key ] ) : parentValue[ key ];
			value = adaptIfNecessary( ractive, keypath, value, false );
			ractive._cache[ keypath ] = value;
			return value;
		}
	}( circular, utils_hasOwnProperty, utils_clone, shared_adaptIfNecessary, shared_get_getFromParent, shared_get_FAILED_LOOKUP );

	/* global console */
	var utils_warn = function() {

		if ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' ) {
			return function() {
				console.warn.apply( console, arguments );
			};
		}
		return function() {};
	}();

	var utils_isObject = function() {

		var toString = Object.prototype.toString;
		return function( thing ) {
			return typeof thing === 'object' && toString.call( thing ) === '[object Object]';
		};
	}();

	var registries_interpolators = function( circular, hasOwnProperty, isArray, isObject, isNumeric ) {

		var interpolators, interpolate, cssLengthPattern;
		circular.push( function() {
			interpolate = circular.interpolate;
		} );
		cssLengthPattern = /^([+-]?[0-9]+\.?(?:[0-9]+)?)(px|em|ex|%|in|cm|mm|pt|pc)$/;
		interpolators = {
			number: function( from, to ) {
				var delta;
				if ( !isNumeric( from ) || !isNumeric( to ) ) {
					return null;
				}
				from = +from;
				to = +to;
				delta = to - from;
				if ( !delta ) {
					return function() {
						return from;
					};
				}
				return function( t ) {
					return from + t * delta;
				};
			},
			array: function( from, to ) {
				var intermediate, interpolators, len, i;
				if ( !isArray( from ) || !isArray( to ) ) {
					return null;
				}
				intermediate = [];
				interpolators = [];
				i = len = Math.min( from.length, to.length );
				while ( i-- ) {
					interpolators[ i ] = interpolate( from[ i ], to[ i ] );
				}
				for ( i = len; i < from.length; i += 1 ) {
					intermediate[ i ] = from[ i ];
				}
				for ( i = len; i < to.length; i += 1 ) {
					intermediate[ i ] = to[ i ];
				}
				return function( t ) {
					var i = len;
					while ( i-- ) {
						intermediate[ i ] = interpolators[ i ]( t );
					}
					return intermediate;
				};
			},
			object: function( from, to ) {
				var properties, len, interpolators, intermediate, prop;
				if ( !isObject( from ) || !isObject( to ) ) {
					return null;
				}
				properties = [];
				intermediate = {};
				interpolators = {};
				for ( prop in from ) {
					if ( hasOwnProperty.call( from, prop ) ) {
						if ( hasOwnProperty.call( to, prop ) ) {
							properties.push( prop );
							interpolators[ prop ] = interpolate( from[ prop ], to[ prop ] );
						} else {
							intermediate[ prop ] = from[ prop ];
						}
					}
				}
				for ( prop in to ) {
					if ( hasOwnProperty.call( to, prop ) && !hasOwnProperty.call( from, prop ) ) {
						intermediate[ prop ] = to[ prop ];
					}
				}
				len = properties.length;
				return function( t ) {
					var i = len,
						prop;
					while ( i-- ) {
						prop = properties[ i ];
						intermediate[ prop ] = interpolators[ prop ]( t );
					}
					return intermediate;
				};
			},
			cssLength: function( from, to ) {
				var fromMatch, toMatch, fromUnit, toUnit, fromValue, toValue, unit, delta;
				if ( from !== 0 && typeof from !== 'string' || to !== 0 && typeof to !== 'string' ) {
					return null;
				}
				fromMatch = cssLengthPattern.exec( from );
				toMatch = cssLengthPattern.exec( to );
				fromUnit = fromMatch ? fromMatch[ 2 ] : '';
				toUnit = toMatch ? toMatch[ 2 ] : '';
				if ( fromUnit && toUnit && fromUnit !== toUnit ) {
					return null;
				}
				unit = fromUnit || toUnit;
				fromValue = fromMatch ? +fromMatch[ 1 ] : 0;
				toValue = toMatch ? +toMatch[ 1 ] : 0;
				delta = toValue - fromValue;
				if ( !delta ) {
					return function() {
						return fromValue + unit;
					};
				}
				return function( t ) {
					return fromValue + t * delta + unit;
				};
			}
		};
		return interpolators;
	}( circular, utils_hasOwnProperty, utils_isArray, utils_isObject, utils_isNumeric );

	var shared_interpolate = function( circular, warn, interpolators ) {

		var interpolate = function( from, to, ractive, type ) {
			if ( from === to ) {
				return snap( to );
			}
			if ( type ) {
				if ( ractive.interpolators[ type ] ) {
					return ractive.interpolators[ type ]( from, to ) || snap( to );
				}
				warn( 'Missing "' + type + '" interpolator. You may need to download a plugin from [TODO]' );
			}
			return interpolators.number( from, to ) || interpolators.array( from, to ) || interpolators.object( from, to ) || interpolators.cssLength( from, to ) || snap( to );
		};
		circular.interpolate = interpolate;
		return interpolate;

		function snap( to ) {
			return function() {
				return to;
			};
		}
	}( circular, utils_warn, registries_interpolators );

	var Ractive_prototype_animate_Animation = function( warn, runloop, interpolate, set ) {

		var Animation = function( options ) {
			var key;
			this.startTime = Date.now();
			for ( key in options ) {
				if ( options.hasOwnProperty( key ) ) {
					this[ key ] = options[ key ];
				}
			}
			this.interpolator = interpolate( this.from, this.to, this.root, this.interpolator );
			this.running = true;
		};
		Animation.prototype = {
			tick: function() {
				var elapsed, t, value, timeNow, index, keypath;
				keypath = this.keypath;
				if ( this.running ) {
					timeNow = Date.now();
					elapsed = timeNow - this.startTime;
					if ( elapsed >= this.duration ) {
						if ( keypath !== null ) {
							runloop.start( this.root );
							set( this.root, keypath, this.to );
							runloop.end();
						}
						if ( this.step ) {
							this.step( 1, this.to );
						}
						this.complete( this.to );
						index = this.root._animations.indexOf( this );
						if ( index === -1 ) {
							warn( 'Animation was not found' );
						}
						this.root._animations.splice( index, 1 );
						this.running = false;
						return false;
					}
					t = this.easing ? this.easing( elapsed / this.duration ) : elapsed / this.duration;
					if ( keypath !== null ) {
						value = this.interpolator( t );
						runloop.start( this.root );
						set( this.root, keypath, value );
						runloop.end();
					}
					if ( this.step ) {
						this.step( t, value );
					}
					return true;
				}
				return false;
			},
			stop: function() {
				var index;
				this.running = false;
				index = this.root._animations.indexOf( this );
				if ( index === -1 ) {
					warn( 'Animation was not found' );
				}
				this.root._animations.splice( index, 1 );
			}
		};
		return Animation;
	}( utils_warn, global_runloop, shared_interpolate, shared_set );

	var Ractive_prototype_animate__animate = function( isEqual, Promise, normaliseKeypath, animations, get, Animation ) {

		var noop = function() {}, noAnimation = {
				stop: noop
			};
		return function( keypath, to, options ) {
			var promise, fulfilPromise, k, animation, animations, easing, duration, step, complete, makeValueCollector, currentValues, collectValue, dummy, dummyOptions;
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			if ( typeof keypath === 'object' ) {
				options = to || {};
				easing = options.easing;
				duration = options.duration;
				animations = [];
				step = options.step;
				complete = options.complete;
				if ( step || complete ) {
					currentValues = {};
					options.step = null;
					options.complete = null;
					makeValueCollector = function( keypath ) {
						return function( t, value ) {
							currentValues[ keypath ] = value;
						};
					};
				}
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						if ( step || complete ) {
							collectValue = makeValueCollector( k );
							options = {
								easing: easing,
								duration: duration
							};
							if ( step ) {
								options.step = collectValue;
							}
						}
						options.complete = complete ? collectValue : noop;
						animations.push( animate( this, k, keypath[ k ], options ) );
					}
				}
				if ( step || complete ) {
					dummyOptions = {
						easing: easing,
						duration: duration
					};
					if ( step ) {
						dummyOptions.step = function( t ) {
							step( t, currentValues );
						};
					}
					if ( complete ) {
						promise.then( function( t ) {
							complete( t, currentValues );
						} );
					}
					dummyOptions.complete = fulfilPromise;
					dummy = animate( this, null, null, dummyOptions );
					animations.push( dummy );
				}
				return {
					stop: function() {
						var animation;
						while ( animation = animations.pop() ) {
							animation.stop();
						}
						if ( dummy ) {
							dummy.stop();
						}
					}
				};
			}
			options = options || {};
			if ( options.complete ) {
				promise.then( options.complete );
			}
			options.complete = fulfilPromise;
			animation = animate( this, keypath, to, options );
			promise.stop = function() {
				animation.stop();
			};
			return promise;
		};

		function animate( root, keypath, to, options ) {
			var easing, duration, animation, from;
			if ( keypath ) {
				keypath = normaliseKeypath( keypath );
			}
			if ( keypath !== null ) {
				from = get( root, keypath );
			}
			animations.abort( keypath, root );
			if ( isEqual( from, to ) ) {
				if ( options.complete ) {
					options.complete( options.to );
				}
				return noAnimation;
			}
			if ( options.easing ) {
				if ( typeof options.easing === 'function' ) {
					easing = options.easing;
				} else {
					easing = root.easing[ options.easing ];
				}
				if ( typeof easing !== 'function' ) {
					easing = null;
				}
			}
			duration = options.duration === undefined ? 400 : options.duration;
			animation = new Animation( {
				keypath: keypath,
				from: from,
				to: to,
				root: root,
				duration: duration,
				easing: easing,
				interpolator: options.interpolator,
				step: options.step,
				complete: options.complete
			} );
			animations.add( animation );
			root._animations.push( animation );
			return animation;
		}
	}( utils_isEqual, utils_Promise, utils_normaliseKeypath, shared_animations, shared_get__get, Ractive_prototype_animate_Animation );

	var Ractive_prototype_detach = function() {
		return this.fragment.detach();
	};

	var Ractive_prototype_find = function( selector ) {
		if ( !this.el ) {
			return null;
		}
		return this.fragment.find( selector );
	};

	var utils_matches = function( isClient, vendors, createElement ) {

		var div, methodNames, unprefixed, prefixed, i, j, makeFunction;
		if ( !isClient ) {
			return;
		}
		div = createElement( 'div' );
		methodNames = [
			'matches',
			'matchesSelector'
		];
		makeFunction = function( methodName ) {
			return function( node, selector ) {
				return node[ methodName ]( selector );
			};
		};
		i = methodNames.length;
		while ( i-- ) {
			unprefixed = methodNames[ i ];
			if ( div[ unprefixed ] ) {
				return makeFunction( unprefixed );
			}
			j = vendors.length;
			while ( j-- ) {
				prefixed = vendors[ i ] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );
				if ( div[ prefixed ] ) {
					return makeFunction( prefixed );
				}
			}
		}
		return function( node, selector ) {
			var nodes, i;
			nodes = ( node.parentNode || node.document ).querySelectorAll( selector );
			i = nodes.length;
			while ( i-- ) {
				if ( nodes[ i ] === node ) {
					return true;
				}
			}
			return false;
		};
	}( config_isClient, config_vendors, utils_createElement );

	var Ractive_prototype_shared_makeQuery_test = function( matches ) {

		return function( item, noDirty ) {
			var itemMatches = this._isComponentQuery ? !this.selector || item.name === this.selector : matches( item.node, this.selector );
			if ( itemMatches ) {
				this.push( item.node || item.instance );
				if ( !noDirty ) {
					this._makeDirty();
				}
				return true;
			}
		};
	}( utils_matches );

	var Ractive_prototype_shared_makeQuery_cancel = function() {
		var liveQueries, selector, index;
		liveQueries = this._root[ this._isComponentQuery ? 'liveComponentQueries' : 'liveQueries' ];
		selector = this.selector;
		index = liveQueries.indexOf( selector );
		if ( index !== -1 ) {
			liveQueries.splice( index, 1 );
			liveQueries[ selector ] = null;
		}
	};

	var Ractive_prototype_shared_makeQuery_sortByItemPosition = function() {

		return function( a, b ) {
			var ancestryA, ancestryB, oldestA, oldestB, mutualAncestor, indexA, indexB, fragments, fragmentA, fragmentB;
			ancestryA = getAncestry( a.component || a._ractive.proxy );
			ancestryB = getAncestry( b.component || b._ractive.proxy );
			oldestA = ancestryA[ ancestryA.length - 1 ];
			oldestB = ancestryB[ ancestryB.length - 1 ];
			while ( oldestA && oldestA === oldestB ) {
				ancestryA.pop();
				ancestryB.pop();
				mutualAncestor = oldestA;
				oldestA = ancestryA[ ancestryA.length - 1 ];
				oldestB = ancestryB[ ancestryB.length - 1 ];
			}
			oldestA = oldestA.component || oldestA;
			oldestB = oldestB.component || oldestB;
			fragmentA = oldestA.parentFragment;
			fragmentB = oldestB.parentFragment;
			if ( fragmentA === fragmentB ) {
				indexA = fragmentA.items.indexOf( oldestA );
				indexB = fragmentB.items.indexOf( oldestB );
				return indexA - indexB || ancestryA.length - ancestryB.length;
			}
			if ( fragments = mutualAncestor.fragments ) {
				indexA = fragments.indexOf( fragmentA );
				indexB = fragments.indexOf( fragmentB );
				return indexA - indexB || ancestryA.length - ancestryB.length;
			}
			throw new Error( 'An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/RactiveJS/Ractive/issues - thanks!' );
		};

		function getParent( item ) {
			var parentFragment;
			if ( parentFragment = item.parentFragment ) {
				return parentFragment.owner;
			}
			if ( item.component && ( parentFragment = item.component.parentFragment ) ) {
				return parentFragment.owner;
			}
		}

		function getAncestry( item ) {
			var ancestry, ancestor;
			ancestry = [ item ];
			ancestor = getParent( item );
			while ( ancestor ) {
				ancestry.push( ancestor );
				ancestor = getParent( ancestor );
			}
			return ancestry;
		}
	}();

	var Ractive_prototype_shared_makeQuery_sortByDocumentPosition = function( sortByItemPosition ) {

		return function( node, otherNode ) {
			var bitmask;
			if ( node.compareDocumentPosition ) {
				bitmask = node.compareDocumentPosition( otherNode );
				return bitmask & 2 ? 1 : -1;
			}
			return sortByItemPosition( node, otherNode );
		};
	}( Ractive_prototype_shared_makeQuery_sortByItemPosition );

	var Ractive_prototype_shared_makeQuery_sort = function( sortByDocumentPosition, sortByItemPosition ) {

		return function() {
			this.sort( this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
			this._dirty = false;
		};
	}( Ractive_prototype_shared_makeQuery_sortByDocumentPosition, Ractive_prototype_shared_makeQuery_sortByItemPosition );

	var Ractive_prototype_shared_makeQuery_dirty = function( runloop ) {

		return function() {
			if ( !this._dirty ) {
				runloop.addLiveQuery( this );
				this._dirty = true;
			}
		};
	}( global_runloop );

	var Ractive_prototype_shared_makeQuery_remove = function( nodeOrComponent ) {
		var index = this.indexOf( this._isComponentQuery ? nodeOrComponent.instance : nodeOrComponent );
		if ( index !== -1 ) {
			this.splice( index, 1 );
		}
	};

	var Ractive_prototype_shared_makeQuery__makeQuery = function( defineProperties, test, cancel, sort, dirty, remove ) {

		return function( ractive, selector, live, isComponentQuery ) {
			var query = [];
			defineProperties( query, {
				selector: {
					value: selector
				},
				live: {
					value: live
				},
				_isComponentQuery: {
					value: isComponentQuery
				},
				_test: {
					value: test
				}
			} );
			if ( !live ) {
				return query;
			}
			defineProperties( query, {
				cancel: {
					value: cancel
				},
				_root: {
					value: ractive
				},
				_sort: {
					value: sort
				},
				_makeDirty: {
					value: dirty
				},
				_remove: {
					value: remove
				},
				_dirty: {
					value: false,
					writable: true
				}
			} );
			return query;
		};
	}( utils_defineProperties, Ractive_prototype_shared_makeQuery_test, Ractive_prototype_shared_makeQuery_cancel, Ractive_prototype_shared_makeQuery_sort, Ractive_prototype_shared_makeQuery_dirty, Ractive_prototype_shared_makeQuery_remove );

	var Ractive_prototype_findAll = function( makeQuery ) {

		return function( selector, options ) {
			var liveQueries, query;
			if ( !this.el ) {
				return [];
			}
			options = options || {};
			liveQueries = this._liveQueries;
			if ( query = liveQueries[ selector ] ) {
				return options && options.live ? query : query.slice();
			}
			query = makeQuery( this, selector, !! options.live, false );
			if ( query.live ) {
				liveQueries.push( selector );
				liveQueries[ selector ] = query;
			}
			this.fragment.findAll( selector, query );
			return query;
		};
	}( Ractive_prototype_shared_makeQuery__makeQuery );

	var Ractive_prototype_findAllComponents = function( makeQuery ) {

		return function( selector, options ) {
			var liveQueries, query;
			options = options || {};
			liveQueries = this._liveComponentQueries;
			if ( query = liveQueries[ selector ] ) {
				return options && options.live ? query : query.slice();
			}
			query = makeQuery( this, selector, !! options.live, true );
			if ( query.live ) {
				liveQueries.push( selector );
				liveQueries[ selector ] = query;
			}
			this.fragment.findAllComponents( selector, query );
			return query;
		};
	}( Ractive_prototype_shared_makeQuery__makeQuery );

	var Ractive_prototype_findComponent = function( selector ) {
		return this.fragment.findComponent( selector );
	};

	var Ractive_prototype_fire = function( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];
		if ( !subscribers ) {
			return;
		}
		args = Array.prototype.slice.call( arguments, 1 );
		for ( i = 0, len = subscribers.length; i < len; i += 1 ) {
			subscribers[ i ].apply( this, args );
		}
	};

	var shared_get_UnresolvedImplicitDependency = function( circular, removeFromArray, runloop, notifyDependants ) {

		var get, empty = {};
		circular.push( function() {
			get = circular.get;
		} );
		var UnresolvedImplicitDependency = function( ractive, keypath ) {
			this.root = ractive;
			this.ref = keypath;
			this.parentFragment = empty;
			ractive._unresolvedImplicitDependencies[ keypath ] = true;
			ractive._unresolvedImplicitDependencies.push( this );
			runloop.addUnresolved( this );
		};
		UnresolvedImplicitDependency.prototype = {
			resolve: function() {
				var ractive = this.root;
				notifyDependants( ractive, this.ref );
				ractive._unresolvedImplicitDependencies[ this.ref ] = false;
				removeFromArray( ractive._unresolvedImplicitDependencies, this );
			},
			teardown: function() {
				runloop.removeUnresolved( this );
			}
		};
		return UnresolvedImplicitDependency;
	}( circular, utils_removeFromArray, global_runloop, shared_notifyDependants );

	var Ractive_prototype_get = function( normaliseKeypath, get, UnresolvedImplicitDependency ) {

		var options = {
			isTopLevel: true
		};
		return function Ractive_prototype_get( keypath ) {
			var value;
			keypath = normaliseKeypath( keypath );
			value = get( this, keypath, options );
			if ( this._captured && this._captured[ keypath ] !== true ) {
				this._captured.push( keypath );
				this._captured[ keypath ] = true;
				if ( value === undefined && this._unresolvedImplicitDependencies[ keypath ] !== true ) {
					new UnresolvedImplicitDependency( this, keypath );
				}
			}
			return value;
		};
	}( utils_normaliseKeypath, shared_get__get, shared_get_UnresolvedImplicitDependency );

	var utils_getElement = function( input ) {
		var output;
		if ( typeof window === 'undefined' || !document || !input ) {
			return null;
		}
		if ( input.nodeType ) {
			return input;
		}
		if ( typeof input === 'string' ) {
			output = document.getElementById( input );
			if ( !output && document.querySelector ) {
				output = document.querySelector( input );
			}
			if ( output && output.nodeType ) {
				return output;
			}
		}
		if ( input[ 0 ] && input[ 0 ].nodeType ) {
			return input[ 0 ];
		}
		return null;
	};

	var Ractive_prototype_insert = function( getElement ) {

		return function( target, anchor ) {
			target = getElement( target );
			anchor = getElement( anchor ) || null;
			if ( !target ) {
				throw new Error( 'You must specify a valid target to insert into' );
			}
			target.insertBefore( this.detach(), anchor );
			this.fragment.pNode = this.el = target;
		};
	}( utils_getElement );

	var Ractive_prototype_merge_mapOldToNewIndex = function( oldArray, newArray ) {
		var usedIndices, firstUnusedIndex, newIndices, changed;
		usedIndices = {};
		firstUnusedIndex = 0;
		newIndices = oldArray.map( function( item, i ) {
			var index, start, len;
			start = firstUnusedIndex;
			len = newArray.length;
			do {
				index = newArray.indexOf( item, start );
				if ( index === -1 ) {
					changed = true;
					return -1;
				}
				start = index + 1;
			} while ( usedIndices[ index ] && start < len );
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			if ( index !== i ) {
				changed = true;
			}
			usedIndices[ index ] = true;
			return index;
		} );
		newIndices.unchanged = !changed;
		return newIndices;
	};

	var Ractive_prototype_merge_propagateChanges = function( types, notifyDependants ) {

		return function( ractive, keypath, newIndices, lengthUnchanged ) {
			var updateDependant;
			ractive._changes.push( keypath );
			updateDependant = function( dependant ) {
				if ( dependant.type === types.REFERENCE ) {
					dependant.update();
				} else if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
					dependant.merge( newIndices );
				} else {
					dependant.update();
				}
			};
			ractive._deps.forEach( function( depsByKeypath ) {
				var dependants = depsByKeypath[ keypath ];
				if ( dependants ) {
					dependants.forEach( updateDependant );
				}
			} );
			if ( !lengthUnchanged ) {
				notifyDependants( ractive, keypath + '.length', true );
			}
		};
	}( config_types, shared_notifyDependants );

	var Ractive_prototype_merge__merge = function( runloop, warn, isArray, Promise, set, mapOldToNewIndex, propagateChanges ) {

		var comparators = {};
		return function merge( keypath, array, options ) {
			var currentArray, oldArray, newArray, comparator, lengthUnchanged, newIndices, promise, fulfilPromise;
			currentArray = this.get( keypath );
			if ( !isArray( currentArray ) || !isArray( array ) ) {
				return this.set( keypath, array, options && options.complete );
			}
			lengthUnchanged = currentArray.length === array.length;
			if ( options && options.compare ) {
				comparator = getComparatorFunction( options.compare );
				try {
					oldArray = currentArray.map( comparator );
					newArray = array.map( comparator );
				} catch ( err ) {
					if ( this.debug ) {
						throw err;
					} else {
						warn( 'Merge operation: comparison failed. Falling back to identity checking' );
					}
					oldArray = currentArray;
					newArray = array;
				}
			} else {
				oldArray = currentArray;
				newArray = array;
			}
			newIndices = mapOldToNewIndex( oldArray, newArray );
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			set( this, keypath, array, true );
			propagateChanges( this, keypath, newIndices, lengthUnchanged );
			runloop.end();
			if ( options && options.complete ) {
				promise.then( options.complete );
			}
			return promise;
		};

		function stringify( item ) {
			return JSON.stringify( item );
		}

		function getComparatorFunction( comparator ) {
			if ( comparator === true ) {
				return stringify;
			}
			if ( typeof comparator === 'string' ) {
				if ( !comparators[ comparator ] ) {
					comparators[ comparator ] = function( item ) {
						return item[ comparator ];
					};
				}
				return comparators[ comparator ];
			}
			if ( typeof comparator === 'function' ) {
				return comparator;
			}
			throw new Error( 'The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)' );
		}
	}( global_runloop, utils_warn, utils_isArray, utils_Promise, shared_set, Ractive_prototype_merge_mapOldToNewIndex, Ractive_prototype_merge_propagateChanges );

	var Ractive_prototype_observe_Observer = function( runloop, isEqual, get ) {

		var Observer = function( ractive, keypath, callback, options ) {
			var self = this;
			this.root = ractive;
			this.keypath = keypath;
			this.callback = callback;
			this.defer = options.defer;
			this.debug = options.debug;
			this.proxy = {
				update: function() {
					self.reallyUpdate();
				}
			};
			this.priority = 0;
			this.context = options && options.context ? options.context : ractive;
		};
		Observer.prototype = {
			init: function( immediate ) {
				if ( immediate !== false ) {
					this.update();
				} else {
					this.value = get( this.root, this.keypath );
				}
			},
			update: function() {
				if ( this.defer && this.ready ) {
					runloop.addObserver( this.proxy );
					return;
				}
				this.reallyUpdate();
			},
			reallyUpdate: function() {
				var oldValue, newValue;
				oldValue = this.value;
				newValue = get( this.root, this.keypath );
				this.value = newValue;
				if ( this.updating ) {
					return;
				}
				this.updating = true;
				if ( !isEqual( newValue, oldValue ) || !this.ready ) {
					try {
						this.callback.call( this.context, newValue, oldValue, this.keypath );
					} catch ( err ) {
						if ( this.debug || this.root.debug ) {
							throw err;
						}
					}
				}
				this.updating = false;
			}
		};
		return Observer;
	}( global_runloop, utils_isEqual, shared_get__get );

	var Ractive_prototype_observe_getPattern = function( isArray ) {

		return function( ractive, pattern ) {
			var keys, key, values, toGet, newToGet, expand, concatenate;
			keys = pattern.split( '.' );
			toGet = [];
			expand = function( keypath ) {
				var value, key;
				value = ractive._wrapped[ keypath ] ? ractive._wrapped[ keypath ].get() : ractive.get( keypath );
				for ( key in value ) {
					if ( value.hasOwnProperty( key ) && ( key !== '_ractive' || !isArray( value ) ) ) {
						newToGet.push( keypath + '.' + key );
					}
				}
			};
			concatenate = function( keypath ) {
				return keypath + '.' + key;
			};
			while ( key = keys.shift() ) {
				if ( key === '*' ) {
					newToGet = [];
					toGet.forEach( expand );
					toGet = newToGet;
				} else {
					if ( !toGet[ 0 ] ) {
						toGet[ 0 ] = key;
					} else {
						toGet = toGet.map( concatenate );
					}
				}
			}
			values = {};
			toGet.forEach( function( keypath ) {
				values[ keypath ] = ractive.get( keypath );
			} );
			return values;
		};
	}( utils_isArray );

	var Ractive_prototype_observe_PatternObserver = function( runloop, isEqual, get, getPattern ) {

		var PatternObserver, wildcard = /\*/;
		PatternObserver = function( ractive, keypath, callback, options ) {
			this.root = ractive;
			this.callback = callback;
			this.defer = options.defer;
			this.debug = options.debug;
			this.keypath = keypath;
			this.regex = new RegExp( '^' + keypath.replace( /\./g, '\\.' ).replace( /\*/g, '[^\\.]+' ) + '$' );
			this.values = {};
			if ( this.defer ) {
				this.proxies = [];
			}
			this.priority = 'pattern';
			this.context = options && options.context ? options.context : ractive;
		};
		PatternObserver.prototype = {
			init: function( immediate ) {
				var values, keypath;
				values = getPattern( this.root, this.keypath );
				if ( immediate !== false ) {
					for ( keypath in values ) {
						if ( values.hasOwnProperty( keypath ) ) {
							this.update( keypath );
						}
					}
				} else {
					this.values = values;
				}
			},
			update: function( keypath ) {
				var values;
				if ( wildcard.test( keypath ) ) {
					values = getPattern( this.root, keypath );
					for ( keypath in values ) {
						if ( values.hasOwnProperty( keypath ) ) {
							this.update( keypath );
						}
					}
					return;
				}
				if ( this.defer && this.ready ) {
					runloop.addObserver( this.getProxy( keypath ) );
					return;
				}
				this.reallyUpdate( keypath );
			},
			reallyUpdate: function( keypath ) {
				var value = get( this.root, keypath );
				if ( this.updating ) {
					this.values[ keypath ] = value;
					return;
				}
				this.updating = true;
				if ( !isEqual( value, this.values[ keypath ] ) || !this.ready ) {
					try {
						this.callback.call( this.context, value, this.values[ keypath ], keypath );
					} catch ( err ) {
						if ( this.debug || this.root.debug ) {
							throw err;
						}
					}
					this.values[ keypath ] = value;
				}
				this.updating = false;
			},
			getProxy: function( keypath ) {
				var self = this;
				if ( !this.proxies[ keypath ] ) {
					this.proxies[ keypath ] = {
						update: function() {
							self.reallyUpdate( keypath );
						}
					};
				}
				return this.proxies[ keypath ];
			}
		};
		return PatternObserver;
	}( global_runloop, utils_isEqual, shared_get__get, Ractive_prototype_observe_getPattern );

	var Ractive_prototype_observe_getObserverFacade = function( normaliseKeypath, registerDependant, unregisterDependant, Observer, PatternObserver ) {

		var wildcard = /\*/,
			emptyObject = {};
		return function getObserverFacade( ractive, keypath, callback, options ) {
			var observer, isPatternObserver;
			keypath = normaliseKeypath( keypath );
			options = options || emptyObject;
			if ( wildcard.test( keypath ) ) {
				observer = new PatternObserver( ractive, keypath, callback, options );
				ractive._patternObservers.push( observer );
				isPatternObserver = true;
			} else {
				observer = new Observer( ractive, keypath, callback, options );
			}
			registerDependant( observer );
			observer.init( options.init );
			observer.ready = true;
			return {
				cancel: function() {
					var index;
					if ( isPatternObserver ) {
						index = ractive._patternObservers.indexOf( observer );
						if ( index !== -1 ) {
							ractive._patternObservers.splice( index, 1 );
						}
					}
					unregisterDependant( observer );
				}
			};
		};
	}( utils_normaliseKeypath, shared_registerDependant, shared_unregisterDependant, Ractive_prototype_observe_Observer, Ractive_prototype_observe_PatternObserver );

	var Ractive_prototype_observe__observe = function( isObject, getObserverFacade ) {

		return function observe( keypath, callback, options ) {
			var observers, map, keypaths, i;
			if ( isObject( keypath ) ) {
				options = callback;
				map = keypath;
				observers = [];
				for ( keypath in map ) {
					if ( map.hasOwnProperty( keypath ) ) {
						callback = map[ keypath ];
						observers.push( this.observe( keypath, callback, options ) );
					}
				}
				return {
					cancel: function() {
						while ( observers.length ) {
							observers.pop().cancel();
						}
					}
				};
			}
			if ( typeof keypath === 'function' ) {
				options = callback;
				callback = keypath;
				keypath = '';
				return getObserverFacade( this, keypath, callback, options );
			}
			keypaths = keypath.split( ' ' );
			if ( keypaths.length === 1 ) {
				return getObserverFacade( this, keypath, callback, options );
			}
			observers = [];
			i = keypaths.length;
			while ( i-- ) {
				keypath = keypaths[ i ];
				if ( keypath ) {
					observers.push( getObserverFacade( this, keypath, callback, options ) );
				}
			}
			return {
				cancel: function() {
					while ( observers.length ) {
						observers.pop().cancel();
					}
				}
			};
		};
	}( utils_isObject, Ractive_prototype_observe_getObserverFacade );

	var Ractive_prototype_off = function( eventName, callback ) {
		var subscribers, index;
		if ( !callback ) {
			if ( !eventName ) {
				for ( eventName in this._subs ) {
					delete this._subs[ eventName ];
				}
			} else {
				this._subs[ eventName ] = [];
			}
		}
		subscribers = this._subs[ eventName ];
		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

	var Ractive_prototype_on = function( eventName, callback ) {
		var self = this,
			listeners, n;
		if ( typeof eventName === 'object' ) {
			listeners = [];
			for ( n in eventName ) {
				if ( eventName.hasOwnProperty( n ) ) {
					listeners.push( this.on( n, eventName[ n ] ) );
				}
			}
			return {
				cancel: function() {
					var listener;
					while ( listener = listeners.pop() ) {
						listener.cancel();
					}
				}
			};
		}
		if ( !this._subs[ eventName ] ) {
			this._subs[ eventName ] = [ callback ];
		} else {
			this._subs[ eventName ].push( callback );
		}
		return {
			cancel: function() {
				self.off( eventName, callback );
			}
		};
	};

	var utils_create = function() {

		var create;
		try {
			Object.create( null );
			create = Object.create;
		} catch ( err ) {
			create = function() {
				var F = function() {};
				return function( proto, props ) {
					var obj;
					if ( proto === null ) {
						return {};
					}
					F.prototype = proto;
					obj = new F();
					if ( props ) {
						Object.defineProperties( obj, props );
					}
					return obj;
				};
			}();
		}
		return create;
	}();

	var render_shared_initFragment = function( types, create ) {

		return function initFragment( fragment, options ) {
			var numItems, i, parentFragment, parentRefs, ref;
			fragment.owner = options.owner;
			parentFragment = fragment.parent = fragment.owner.parentFragment;
			fragment.root = options.root;
			fragment.pNode = options.pNode;
			fragment.pElement = options.pElement;
			fragment.context = options.context;
			if ( fragment.owner.type === types.SECTION ) {
				fragment.index = options.index;
			}
			if ( parentFragment ) {
				parentRefs = parentFragment.indexRefs;
				if ( parentRefs ) {
					fragment.indexRefs = create( null );
					for ( ref in parentRefs ) {
						fragment.indexRefs[ ref ] = parentRefs[ ref ];
					}
				}
			}
			fragment.priority = parentFragment ? parentFragment.priority + 1 : 1;
			if ( options.indexRef ) {
				if ( !fragment.indexRefs ) {
					fragment.indexRefs = {};
				}
				fragment.indexRefs[ options.indexRef ] = options.index;
			}
			fragment.items = [];
			numItems = options.descriptor ? options.descriptor.length : 0;
			for ( i = 0; i < numItems; i += 1 ) {
				fragment.items[ fragment.items.length ] = fragment.createItem( {
					parentFragment: fragment,
					pElement: options.pElement,
					descriptor: options.descriptor[ i ],
					index: i
				} );
			}
		};
	}( config_types, utils_create );

	var render_DomFragment_shared_insertHtml = function( createElement ) {

		var elementCache = {}, ieBug, ieBlacklist;
		try {
			createElement( 'table' ).innerHTML = 'foo';
		} catch ( err ) {
			ieBug = true;
			ieBlacklist = {
				TABLE: [
					'<table class="x">',
					'</table>'
				],
				THEAD: [
					'<table><thead class="x">',
					'</thead></table>'
				],
				TBODY: [
					'<table><tbody class="x">',
					'</tbody></table>'
				],
				TR: [
					'<table><tr class="x">',
					'</tr></table>'
				],
				SELECT: [
					'<select class="x">',
					'</select>'
				]
			};
		}
		return function( html, tagName, docFrag ) {
			var container, nodes = [],
				wrapper;
			if ( html ) {
				if ( ieBug && ( wrapper = ieBlacklist[ tagName ] ) ) {
					container = element( 'DIV' );
					container.innerHTML = wrapper[ 0 ] + html + wrapper[ 1 ];
					container = container.querySelector( '.x' );
				} else {
					container = element( tagName );
					container.innerHTML = html;
				}
				while ( container.firstChild ) {
					nodes.push( container.firstChild );
					docFrag.appendChild( container.firstChild );
				}
			}
			return nodes;
		};

		function element( tagName ) {
			return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
		}
	}( utils_createElement );

	var render_DomFragment_shared_detach = function() {
		var node = this.node,
			parentNode;
		if ( node && ( parentNode = node.parentNode ) ) {
			parentNode.removeChild( node );
			return node;
		}
	};

	var render_DomFragment_Text = function( types, detach ) {

		var DomText, lessThan, greaterThan;
		lessThan = /</g;
		greaterThan = />/g;
		DomText = function( options, docFrag ) {
			this.type = types.TEXT;
			this.descriptor = options.descriptor;
			if ( docFrag ) {
				this.node = document.createTextNode( options.descriptor );
				docFrag.appendChild( this.node );
			}
		};
		DomText.prototype = {
			detach: detach,
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function() {
				return ( '' + this.descriptor ).replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
			}
		};
		return DomText;
	}( config_types, render_DomFragment_shared_detach );

	var shared_teardown = function( runloop, unregisterDependant ) {

		return function( thing ) {
			if ( !thing.keypath ) {
				runloop.removeUnresolved( thing );
			} else {
				unregisterDependant( thing );
			}
		};
	}( global_runloop, shared_unregisterDependant );

	var render_shared_Evaluator_Reference = function( types, isEqual, defineProperty, registerDependant, unregisterDependant ) {

		var Reference, thisPattern;
		thisPattern = /this/;
		Reference = function( root, keypath, evaluator, argNum, priority ) {
			var value;
			this.evaluator = evaluator;
			this.keypath = keypath;
			this.root = root;
			this.argNum = argNum;
			this.type = types.REFERENCE;
			this.priority = priority;
			value = root.get( keypath );
			if ( typeof value === 'function' ) {
				value = wrapFunction( value, root, evaluator );
			}
			this.value = evaluator.values[ argNum ] = value;
			registerDependant( this );
		};
		Reference.prototype = {
			update: function() {
				var value = this.root.get( this.keypath );
				if ( typeof value === 'function' && !value._nowrap ) {
					value = wrapFunction( value, this.root, this.evaluator );
				}
				if ( !isEqual( value, this.value ) ) {
					this.evaluator.values[ this.argNum ] = value;
					this.evaluator.bubble();
					this.value = value;
				}
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return Reference;

		function wrapFunction( fn, ractive, evaluator ) {
			var prop, evaluators, index;
			if ( !thisPattern.test( fn.toString() ) ) {
				defineProperty( fn, '_nowrap', {
					value: true
				} );
				return fn;
			}
			if ( !fn[ '_' + ractive._guid ] ) {
				defineProperty( fn, '_' + ractive._guid, {
					value: function() {
						var originalCaptured, result, i, evaluator;
						originalCaptured = ractive._captured;
						if ( !originalCaptured ) {
							ractive._captured = [];
						}
						result = fn.apply( ractive, arguments );
						if ( ractive._captured.length ) {
							i = evaluators.length;
							while ( i-- ) {
								evaluator = evaluators[ i ];
								evaluator.updateSoftDependencies( ractive._captured );
							}
						}
						ractive._captured = originalCaptured;
						return result;
					},
					writable: true
				} );
				for ( prop in fn ) {
					if ( fn.hasOwnProperty( prop ) ) {
						fn[ '_' + ractive._guid ][ prop ] = fn[ prop ];
					}
				}
				fn[ '_' + ractive._guid + '_evaluators' ] = [];
			}
			evaluators = fn[ '_' + ractive._guid + '_evaluators' ];
			index = evaluators.indexOf( evaluator );
			if ( index === -1 ) {
				evaluators.push( evaluator );
			}
			return fn[ '_' + ractive._guid ];
		}
	}( config_types, utils_isEqual, utils_defineProperty, shared_registerDependant, shared_unregisterDependant );

	var render_shared_Evaluator_SoftReference = function( isEqual, registerDependant, unregisterDependant ) {

		var SoftReference = function( root, keypath, evaluator ) {
			this.root = root;
			this.keypath = keypath;
			this.priority = evaluator.priority;
			this.evaluator = evaluator;
			registerDependant( this );
		};
		SoftReference.prototype = {
			update: function() {
				var value = this.root.get( this.keypath );
				if ( !isEqual( value, this.value ) ) {
					this.evaluator.bubble();
					this.value = value;
				}
			},
			teardown: function() {
				unregisterDependant( this );
			}
		};
		return SoftReference;
	}( utils_isEqual, shared_registerDependant, shared_unregisterDependant );

	var render_shared_Evaluator__Evaluator = function( runloop, warn, isEqual, clearCache, notifyDependants, adaptIfNecessary, Reference, SoftReference ) {

		var Evaluator, cache = {};
		Evaluator = function( root, keypath, uniqueString, functionStr, args, priority ) {
			var i, arg;
			this.root = root;
			this.uniqueString = uniqueString;
			this.keypath = keypath;
			this.priority = priority;
			this.fn = getFunctionFromString( functionStr, args.length );
			this.values = [];
			this.refs = [];
			i = args.length;
			while ( i-- ) {
				if ( arg = args[ i ] ) {
					if ( arg[ 0 ] ) {
						this.values[ i ] = arg[ 1 ];
					} else {
						this.refs.push( new Reference( root, arg[ 1 ], this, i, priority ) );
					}
				} else {
					this.values[ i ] = undefined;
				}
			}
			this.selfUpdating = this.refs.length <= 1;
		};
		Evaluator.prototype = {
			bubble: function() {
				if ( this.selfUpdating ) {
					this.update();
				} else if ( !this.deferred ) {
					runloop.addEvaluator( this );
					this.deferred = true;
				}
			},
			update: function() {
				var value;
				if ( this.evaluating ) {
					return this;
				}
				this.evaluating = true;
				try {
					value = this.fn.apply( null, this.values );
				} catch ( err ) {
					if ( this.root.debug ) {
						warn( 'Error evaluating "' + this.uniqueString + '": ' + err.message || err );
					}
					value = undefined;
				}
				if ( !isEqual( value, this.value ) ) {
					this.value = value;
					clearCache( this.root, this.keypath );
					adaptIfNecessary( this.root, this.keypath, value, true );
					notifyDependants( this.root, this.keypath );
				}
				this.evaluating = false;
				return this;
			},
			teardown: function() {
				while ( this.refs.length ) {
					this.refs.pop().teardown();
				}
				clearCache( this.root, this.keypath );
				this.root._evaluators[ this.keypath ] = null;
			},
			refresh: function() {
				if ( !this.selfUpdating ) {
					this.deferred = true;
				}
				var i = this.refs.length;
				while ( i-- ) {
					this.refs[ i ].update();
				}
				if ( this.deferred ) {
					this.update();
					this.deferred = false;
				}
			},
			updateSoftDependencies: function( softDeps ) {
				var i, keypath, ref;
				if ( !this.softRefs ) {
					this.softRefs = [];
				}
				i = this.softRefs.length;
				while ( i-- ) {
					ref = this.softRefs[ i ];
					if ( !softDeps[ ref.keypath ] ) {
						this.softRefs.splice( i, 1 );
						this.softRefs[ ref.keypath ] = false;
						ref.teardown();
					}
				}
				i = softDeps.length;
				while ( i-- ) {
					keypath = softDeps[ i ];
					if ( !this.softRefs[ keypath ] ) {
						ref = new SoftReference( this.root, keypath, this );
						this.softRefs.push( ref );
						this.softRefs[ keypath ] = true;
					}
				}
				this.selfUpdating = this.refs.length + this.softRefs.length <= 1;
			}
		};
		return Evaluator;

		function getFunctionFromString( str, i ) {
			var fn, args;
			str = str.replace( /\$\{([0-9]+)\}/g, '_$1' );
			if ( cache[ str ] ) {
				return cache[ str ];
			}
			args = [];
			while ( i-- ) {
				args[ i ] = '_' + i;
			}
			fn = new Function( args.join( ',' ), 'return(' + str + ')' );
			cache[ str ] = fn;
			return fn;
		}
	}( global_runloop, utils_warn, utils_isEqual, shared_clearCache, shared_notifyDependants, shared_adaptIfNecessary, render_shared_Evaluator_Reference, render_shared_Evaluator_SoftReference );

	var render_shared_ExpressionResolver_ReferenceScout = function( runloop, resolveRef, teardown ) {

		var ReferenceScout = function( resolver, ref, parentFragment, argNum ) {
			var keypath, ractive;
			ractive = this.root = resolver.root;
			this.ref = ref;
			this.parentFragment = parentFragment;
			keypath = resolveRef( ractive, ref, parentFragment );
			if ( keypath !== undefined ) {
				resolver.resolve( argNum, false, keypath );
			} else {
				this.argNum = argNum;
				this.resolver = resolver;
				runloop.addUnresolved( this );
			}
		};
		ReferenceScout.prototype = {
			resolve: function( keypath ) {
				this.keypath = keypath;
				this.resolver.resolve( this.argNum, false, keypath );
			},
			teardown: function() {
				if ( !this.keypath ) {
					teardown( this );
				}
			}
		};
		return ReferenceScout;
	}( global_runloop, shared_resolveRef, shared_teardown );

	var render_shared_ExpressionResolver_getUniqueString = function( str, args ) {
		return str.replace( /\$\{([0-9]+)\}/g, function( match, $1 ) {
			return args[ $1 ] ? args[ $1 ][ 1 ] : 'undefined';
		} );
	};

	var render_shared_ExpressionResolver_isRegularKeypath = function() {

		var keyPattern = /^(?:(?:[a-zA-Z$_][a-zA-Z$_0-9]*)|(?:[0-9]|[1-9][0-9]+))$/;
		return function( keypath ) {
			var keys, key, i;
			keys = keypath.split( '.' );
			i = keys.length;
			while ( i-- ) {
				key = keys[ i ];
				if ( key === 'undefined' || !keyPattern.test( key ) ) {
					return false;
				}
			}
			return true;
		};
	}();

	var render_shared_ExpressionResolver_getKeypath = function( normaliseKeypath, isRegularKeypath ) {

		return function( uniqueString ) {
			var normalised;
			normalised = normaliseKeypath( uniqueString );
			if ( isRegularKeypath( normalised ) ) {
				return normalised;
			}
			return '${' + normalised.replace( /[\.\[\]]/g, '-' ) + '}';
		};
	}( utils_normaliseKeypath, render_shared_ExpressionResolver_isRegularKeypath );

	var render_shared_ExpressionResolver__ExpressionResolver = function( Evaluator, ReferenceScout, getUniqueString, getKeypath ) {

		var ExpressionResolver = function( mustache ) {
			var expression, i, len, ref, indexRefs;
			this.root = mustache.root;
			this.mustache = mustache;
			this.args = [];
			this.scouts = [];
			expression = mustache.descriptor.x;
			indexRefs = mustache.parentFragment.indexRefs;
			this.str = expression.s;
			len = this.unresolved = this.args.length = expression.r ? expression.r.length : 0;
			if ( !len ) {
				this.resolved = this.ready = true;
				this.bubble();
				return;
			}
			for ( i = 0; i < len; i += 1 ) {
				ref = expression.r[ i ];
				if ( indexRefs && indexRefs[ ref ] !== undefined ) {
					this.resolve( i, true, indexRefs[ ref ] );
				} else {
					this.scouts.push( new ReferenceScout( this, ref, mustache.parentFragment, i ) );
				}
			}
			this.ready = true;
			this.bubble();
		};
		ExpressionResolver.prototype = {
			bubble: function() {
				var oldKeypath;
				if ( !this.ready ) {
					return;
				}
				oldKeypath = this.keypath;
				this.uniqueString = getUniqueString( this.str, this.args );
				this.keypath = getKeypath( this.uniqueString );
				if ( this.keypath.substr( 0, 2 ) === '${' ) {
					this.createEvaluator();
				}
				this.mustache.resolve( this.keypath );
			},
			teardown: function() {
				while ( this.scouts.length ) {
					this.scouts.pop().teardown();
				}
			},
			resolve: function( argNum, isIndexRef, value ) {
				this.args[ argNum ] = [
					isIndexRef,
					value
				];
				this.bubble();
				this.resolved = !--this.unresolved;
			},
			createEvaluator: function() {
				var evaluator;
				if ( !this.root._evaluators[ this.keypath ] ) {
					evaluator = new Evaluator( this.root, this.keypath, this.uniqueString, this.str, this.args, this.mustache.priority );
					this.root._evaluators[ this.keypath ] = evaluator;
					evaluator.update();
				} else {
					this.root._evaluators[ this.keypath ].refresh();
				}
			}
		};
		return ExpressionResolver;
	}( render_shared_Evaluator__Evaluator, render_shared_ExpressionResolver_ReferenceScout, render_shared_ExpressionResolver_getUniqueString, render_shared_ExpressionResolver_getKeypath );

	var render_shared_initMustache = function( runloop, resolveRef, ExpressionResolver ) {

		return function initMustache( mustache, options ) {
			var keypath, indexRef, parentFragment;
			parentFragment = mustache.parentFragment = options.parentFragment;
			mustache.root = parentFragment.root;
			mustache.descriptor = options.descriptor;
			mustache.index = options.index || 0;
			mustache.priority = parentFragment.priority;
			mustache.type = options.descriptor.t;
			if ( options.descriptor.r ) {
				if ( parentFragment.indexRefs && parentFragment.indexRefs[ options.descriptor.r ] !== undefined ) {
					indexRef = parentFragment.indexRefs[ options.descriptor.r ];
					mustache.indexRef = options.descriptor.r;
					mustache.value = indexRef;
					mustache.render( mustache.value );
				} else {
					keypath = resolveRef( mustache.root, options.descriptor.r, mustache.parentFragment );
					if ( keypath !== undefined ) {
						mustache.resolve( keypath );
					} else {
						mustache.ref = options.descriptor.r;
						runloop.addUnresolved( mustache );
					}
				}
			}
			if ( options.descriptor.x ) {
				mustache.expressionResolver = new ExpressionResolver( mustache );
			}
			if ( mustache.descriptor.n && !mustache.hasOwnProperty( 'value' ) ) {
				mustache.render( undefined );
			}
		};
	}( global_runloop, shared_resolveRef, render_shared_ExpressionResolver__ExpressionResolver );

	var render_DomFragment_Section_reassignFragment = function( types, ExpressionResolver ) {

		return reassignFragment;

		function reassignFragment( fragment, indexRef, newIndex, oldKeypath, newKeypath ) {
			var i, item, query;
			if ( fragment.html !== undefined ) {
				return;
			}
			assignNewKeypath( fragment, 'context', oldKeypath, newKeypath );
			if ( fragment.indexRefs && fragment.indexRefs[ indexRef ] !== undefined && fragment.indexRefs[ indexRef ] !== newIndex ) {
				fragment.indexRefs[ indexRef ] = newIndex;
			}
			i = fragment.items.length;
			while ( i-- ) {
				item = fragment.items[ i ];
				switch ( item.type ) {
					case types.ELEMENT:
						reassignElement( item, indexRef, newIndex, oldKeypath, newKeypath );
						break;
					case types.PARTIAL:
						reassignFragment( item.fragment, indexRef, newIndex, oldKeypath, newKeypath );
						break;
					case types.COMPONENT:
						reassignFragment( item.instance.fragment, indexRef, newIndex, oldKeypath, newKeypath );
						if ( query = fragment.root._liveComponentQueries[ item.name ] ) {
							query._makeDirty();
						}
						break;
					case types.SECTION:
					case types.INTERPOLATOR:
					case types.TRIPLE:
						reassignMustache( item, indexRef, newIndex, oldKeypath, newKeypath );
						break;
				}
			}
		}

		function assignNewKeypath( target, property, oldKeypath, newKeypath ) {
			if ( !target[ property ] || startsWith( target[ property ], newKeypath ) ) {
				return;
			}
			target[ property ] = getNewKeypath( target[ property ], oldKeypath, newKeypath );
		}

		function startsWith( target, keypath ) {
			return target === keypath || startsWithKeypath( target, keypath );
		}

		function startsWithKeypath( target, keypath ) {
			return target.substr( 0, keypath.length + 1 ) === keypath + '.';
		}

		function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {
			if ( targetKeypath === oldKeypath ) {
				return newKeypath;
			}
			if ( startsWithKeypath( targetKeypath, oldKeypath ) ) {
				return targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
			}
		}

		function reassignElement( element, indexRef, newIndex, oldKeypath, newKeypath ) {
			var i, attribute, storage, masterEventName, proxies, proxy, binding, bindings, liveQueries, ractive;
			i = element.attributes.length;
			while ( i-- ) {
				attribute = element.attributes[ i ];
				if ( attribute.fragment ) {
					reassignFragment( attribute.fragment, indexRef, newIndex, oldKeypath, newKeypath );
					if ( attribute.twoway ) {
						attribute.updateBindings();
					}
				}
			}
			if ( storage = element.node._ractive ) {
				assignNewKeypath( storage, 'keypath', oldKeypath, newKeypath );
				if ( indexRef != undefined ) {
					storage.index[ indexRef ] = newIndex;
				}
				for ( masterEventName in storage.events ) {
					proxies = storage.events[ masterEventName ].proxies;
					i = proxies.length;
					while ( i-- ) {
						proxy = proxies[ i ];
						if ( typeof proxy.n === 'object' ) {
							reassignFragment( proxy.a, indexRef, newIndex, oldKeypath, newKeypath );
						}
						if ( proxy.d ) {
							reassignFragment( proxy.d, indexRef, newIndex, oldKeypath, newKeypath );
						}
					}
				}
				if ( binding = storage.binding ) {
					if ( binding.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
						bindings = storage.root._twowayBindings[ binding.keypath ];
						bindings.splice( bindings.indexOf( binding ), 1 );
						binding.keypath = binding.keypath.replace( oldKeypath, newKeypath );
						bindings = storage.root._twowayBindings[ binding.keypath ] || ( storage.root._twowayBindings[ binding.keypath ] = [] );
						bindings.push( binding );
					}
				}
			}
			if ( element.fragment ) {
				reassignFragment( element.fragment, indexRef, newIndex, oldKeypath, newKeypath );
			}
			if ( liveQueries = element.liveQueries ) {
				ractive = element.root;
				i = liveQueries.length;
				while ( i-- ) {
					liveQueries[ i ]._makeDirty();
				}
			}
		}

		function reassignMustache( mustache, indexRef, newIndex, oldKeypath, newKeypath ) {
			var updated, i;
			if ( mustache.descriptor.x ) {
				if ( mustache.expressionResolver ) {
					mustache.expressionResolver.teardown();
				}
				mustache.expressionResolver = new ExpressionResolver( mustache );
			}
			if ( mustache.keypath ) {
				updated = getNewKeypath( mustache.keypath, oldKeypath, newKeypath );
				if ( updated ) {
					mustache.resolve( updated );
				}
			} else if ( indexRef !== undefined && mustache.indexRef === indexRef ) {
				mustache.value = newIndex;
				mustache.render( newIndex );
			}
			if ( mustache.fragments ) {
				i = mustache.fragments.length;
				while ( i-- ) {
					reassignFragment( mustache.fragments[ i ], indexRef, newIndex, oldKeypath, newKeypath );
				}
			}
		}
	}( config_types, render_shared_ExpressionResolver__ExpressionResolver );

	var render_shared_resolveMustache = function( types, registerDependant, unregisterDependant, reassignFragment ) {

		return function resolveMustache( keypath ) {
			var i;
			if ( keypath === this.keypath ) {
				return;
			}
			if ( this.registered ) {
				unregisterDependant( this );
				if ( this.type === types.SECTION ) {
					i = this.fragments.length;
					while ( i-- ) {
						reassignFragment( this.fragments[ i ], null, null, this.keypath, keypath );
					}
				}
			}
			this.keypath = keypath;
			registerDependant( this );
			this.update();
			if ( this.root.twoway && this.parentFragment.owner.type === types.ATTRIBUTE ) {
				this.parentFragment.owner.element.bind();
			}
			if ( this.expressionResolver && this.expressionResolver.resolved ) {
				this.expressionResolver = null;
			}
		};
	}( config_types, shared_registerDependant, shared_unregisterDependant, render_DomFragment_Section_reassignFragment );

	var render_shared_updateMustache = function( isEqual, get ) {

		var options = {
			evaluateWrapped: true
		};
		return function updateMustache() {
			var value = get( this.root, this.keypath, options );
			if ( !isEqual( value, this.value ) ) {
				this.render( value );
				this.value = value;
			}
		};
	}( utils_isEqual, shared_get__get );

	var render_DomFragment_Interpolator = function( types, teardown, initMustache, resolveMustache, updateMustache, detach ) {

		var DomInterpolator, lessThan, greaterThan;
		lessThan = /</g;
		greaterThan = />/g;
		DomInterpolator = function( options, docFrag ) {
			this.type = types.INTERPOLATOR;
			if ( docFrag ) {
				this.node = document.createTextNode( '' );
				docFrag.appendChild( this.node );
			}
			initMustache( this, options );
		};
		DomInterpolator.prototype = {
			update: updateMustache,
			resolve: resolveMustache,
			detach: detach,
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
				}
				teardown( this );
			},
			render: function( value ) {
				if ( this.node ) {
					this.node.data = value == undefined ? '' : value;
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function() {
				var value = this.value != undefined ? '' + this.value : '';
				return value.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
			}
		};
		return DomInterpolator;
	}( config_types, shared_teardown, render_shared_initMustache, render_shared_resolveMustache, render_shared_updateMustache, render_DomFragment_shared_detach );

	var render_DomFragment_Section_prototype_merge = function( reassignFragment ) {

		var toTeardown = [];
		return function sectionMerge( newIndices ) {
			var section = this,
				parentFragment, firstChange, i, newLength, reassignedFragments, fragmentOptions, fragment, nextNode;
			parentFragment = this.parentFragment;
			reassignedFragments = [];
			newIndices.forEach( function reassignIfNecessary( newIndex, oldIndex ) {
				var fragment, by, oldKeypath, newKeypath;
				if ( newIndex === oldIndex ) {
					reassignedFragments[ newIndex ] = section.fragments[ oldIndex ];
					return;
				}
				if ( firstChange === undefined ) {
					firstChange = oldIndex;
				}
				if ( newIndex === -1 ) {
					toTeardown.push( section.fragments[ oldIndex ] );
					return;
				}
				fragment = section.fragments[ oldIndex ];
				by = newIndex - oldIndex;
				oldKeypath = section.keypath + '.' + oldIndex;
				newKeypath = section.keypath + '.' + newIndex;
				reassignFragment( fragment, section.descriptor.i, oldIndex, newIndex, by, oldKeypath, newKeypath );
				reassignedFragments[ newIndex ] = fragment;
			} );
			while ( fragment = toTeardown.pop() ) {
				fragment.teardown( true );
			}
			if ( firstChange === undefined ) {
				firstChange = this.length;
			}
			this.length = newLength = this.root.get( this.keypath ).length;
			if ( newLength === firstChange ) {
				return;
			}
			fragmentOptions = {
				descriptor: this.descriptor.f,
				root: this.root,
				pNode: parentFragment.pNode,
				owner: this
			};
			if ( this.descriptor.i ) {
				fragmentOptions.indexRef = this.descriptor.i;
			}
			for ( i = firstChange; i < newLength; i += 1 ) {
				if ( fragment = reassignedFragments[ i ] ) {
					this.docFrag.appendChild( fragment.detach( false ) );
				} else {
					fragmentOptions.context = this.keypath + '.' + i;
					fragmentOptions.index = i;
					fragment = this.createFragment( fragmentOptions );
				}
				this.fragments[ i ] = fragment;
			}
			nextNode = parentFragment.findNextNode( this );
			parentFragment.pNode.insertBefore( this.docFrag, nextNode );
		};
	}( render_DomFragment_Section_reassignFragment );

	var render_shared_updateSection = function( isArray, isObject ) {

		return function updateSection( section, value ) {
			var fragmentOptions = {
				descriptor: section.descriptor.f,
				root: section.root,
				pNode: section.parentFragment.pNode,
				pElement: section.parentFragment.pElement,
				owner: section
			};
			if ( section.descriptor.n ) {
				updateConditionalSection( section, value, true, fragmentOptions );
				return;
			}
			if ( isArray( value ) ) {
				updateListSection( section, value, fragmentOptions );
			} else if ( isObject( value ) || typeof value === 'function' ) {
				if ( section.descriptor.i ) {
					updateListObjectSection( section, value, fragmentOptions );
				} else {
					updateContextSection( section, fragmentOptions );
				}
			} else {
				updateConditionalSection( section, value, false, fragmentOptions );
			}
		};

		function updateListSection( section, value, fragmentOptions ) {
			var i, length, fragmentsToRemove;
			length = value.length;
			if ( length < section.length ) {
				fragmentsToRemove = section.fragments.splice( length, section.length - length );
				while ( fragmentsToRemove.length ) {
					fragmentsToRemove.pop().teardown( true );
				}
			} else {
				if ( length > section.length ) {
					for ( i = section.length; i < length; i += 1 ) {
						fragmentOptions.context = section.keypath + '.' + i;
						fragmentOptions.index = i;
						if ( section.descriptor.i ) {
							fragmentOptions.indexRef = section.descriptor.i;
						}
						section.fragments[ i ] = section.createFragment( fragmentOptions );
					}
				}
			}
			section.length = length;
		}

		function updateListObjectSection( section, value, fragmentOptions ) {
			var id, i, hasKey, fragment;
			hasKey = section.hasKey || ( section.hasKey = {} );
			i = section.fragments.length;
			while ( i-- ) {
				fragment = section.fragments[ i ];
				if ( !( fragment.index in value ) ) {
					section.fragments[ i ].teardown( true );
					section.fragments.splice( i, 1 );
					hasKey[ fragment.index ] = false;
				}
			}
			for ( id in value ) {
				if ( !hasKey[ id ] ) {
					fragmentOptions.context = section.keypath + '.' + id;
					fragmentOptions.index = id;
					if ( section.descriptor.i ) {
						fragmentOptions.indexRef = section.descriptor.i;
					}
					section.fragments.push( section.createFragment( fragmentOptions ) );
					hasKey[ id ] = true;
				}
			}
			section.length = section.fragments.length;
		}

		function updateContextSection( section, fragmentOptions ) {
			if ( !section.length ) {
				fragmentOptions.context = section.keypath;
				fragmentOptions.index = 0;
				section.fragments[ 0 ] = section.createFragment( fragmentOptions );
				section.length = 1;
			}
		}

		function updateConditionalSection( section, value, inverted, fragmentOptions ) {
			var doRender, emptyArray, fragmentsToRemove, fragment;
			emptyArray = isArray( value ) && value.length === 0;
			if ( inverted ) {
				doRender = emptyArray || !value;
			} else {
				doRender = value && !emptyArray;
			}
			if ( doRender ) {
				if ( !section.length ) {
					fragmentOptions.index = 0;
					section.fragments[ 0 ] = section.createFragment( fragmentOptions );
					section.length = 1;
				}
				if ( section.length > 1 ) {
					fragmentsToRemove = section.fragments.splice( 1 );
					while ( fragment = fragmentsToRemove.pop() ) {
						fragment.teardown( true );
					}
				}
			} else if ( section.length ) {
				section.teardownFragments( true );
				section.length = 0;
			}
		}
	}( utils_isArray, utils_isObject );

	var render_DomFragment_Section_prototype_render = function( isClient, updateSection ) {

		return function DomSection_prototype_render( value ) {
			var nextNode, wrapped;
			if ( wrapped = this.root._wrapped[ this.keypath ] ) {
				value = wrapped.get();
			}
			if ( this.rendering ) {
				return;
			}
			this.rendering = true;
			updateSection( this, value );
			this.rendering = false;
			if ( this.docFrag && !this.docFrag.childNodes.length ) {
				return;
			}
			if ( !this.initialising && isClient ) {
				nextNode = this.parentFragment.findNextNode( this );
				if ( nextNode && nextNode.parentNode === this.parentFragment.pNode ) {
					this.parentFragment.pNode.insertBefore( this.docFrag, nextNode );
				} else {
					this.parentFragment.pNode.appendChild( this.docFrag );
				}
			}
		};
	}( config_isClient, render_shared_updateSection );

	var render_DomFragment_Section_reassignFragments = function( reassignFragment ) {

		return function( section, start, end, by ) {
			if ( start + by === end ) {
				return;
			}
			if ( start === end ) {
				return;
			}
			var i, fragment, indexRef, oldIndex, newIndex, oldKeypath, newKeypath;
			indexRef = section.descriptor.i;
			for ( i = start; i < end; i += 1 ) {
				fragment = section.fragments[ i ];
				oldIndex = i - by;
				newIndex = i;
				oldKeypath = section.keypath + '.' + ( i - by );
				newKeypath = section.keypath + '.' + i;
				fragment.index += by;
				reassignFragment( fragment, indexRef, newIndex, oldKeypath, newKeypath );
			}
		};
	}( render_DomFragment_Section_reassignFragment );

	var render_DomFragment_Section_prototype_splice = function( reassignFragments ) {

		return function( spliceSummary ) {
			var section = this,
				insertionPoint, balance, i, start, end, insertStart, insertEnd, spliceArgs, fragmentOptions;
			balance = spliceSummary.balance;
			if ( !balance ) {
				return;
			}
			section.rendering = true;
			start = spliceSummary.start;
			if ( balance < 0 ) {
				end = start - balance;
				for ( i = start; i < end; i += 1 ) {
					section.fragments[ i ].teardown( true );
				}
				section.fragments.splice( start, -balance );
			} else {
				fragmentOptions = {
					descriptor: section.descriptor.f,
					root: section.root,
					pNode: section.parentFragment.pNode,
					owner: section
				};
				if ( section.descriptor.i ) {
					fragmentOptions.indexRef = section.descriptor.i;
				}
				insertStart = start + spliceSummary.removed;
				insertEnd = start + spliceSummary.added;
				insertionPoint = section.fragments[ insertStart ] ? section.fragments[ insertStart ].firstNode() : section.parentFragment.findNextNode( section );
				spliceArgs = [
					insertStart,
					0
				].concat( new Array( balance ) );
				section.fragments.splice.apply( section.fragments, spliceArgs );
				for ( i = insertStart; i < insertEnd; i += 1 ) {
					fragmentOptions.context = section.keypath + '.' + i;
					fragmentOptions.index = i;
					section.fragments[ i ] = section.createFragment( fragmentOptions );
				}
				section.parentFragment.pNode.insertBefore( section.docFrag, insertionPoint );
			}
			section.length += balance;
			reassignFragments( section, start, section.length, balance );
			section.rendering = false;
		};
	}( render_DomFragment_Section_reassignFragments );

	var render_DomFragment_Section__Section = function( types, initMustache, updateMustache, resolveMustache, merge, render, splice, teardown, circular ) {

		var DomSection, DomFragment;
		circular.push( function() {
			DomFragment = circular.DomFragment;
		} );
		DomSection = function( options, docFrag ) {
			this.type = types.SECTION;
			this.inverted = !! options.descriptor.n;
			this.fragments = [];
			this.length = 0;
			if ( docFrag ) {
				this.docFrag = document.createDocumentFragment();
			}
			this.initialising = true;
			initMustache( this, options );
			if ( docFrag ) {
				docFrag.appendChild( this.docFrag );
			}
			this.initialising = false;
		};
		DomSection.prototype = {
			update: updateMustache,
			resolve: resolveMustache,
			splice: splice,
			merge: merge,
			detach: function() {
				var i, len;
				if ( this.docFrag ) {
					len = this.fragments.length;
					for ( i = 0; i < len; i += 1 ) {
						this.docFrag.appendChild( this.fragments[ i ].detach() );
					}
					return this.docFrag;
				}
			},
			teardown: function( destroy ) {
				this.teardownFragments( destroy );
				teardown( this );
			},
			firstNode: function() {
				if ( this.fragments[ 0 ] ) {
					return this.fragments[ 0 ].firstNode();
				}
				return this.parentFragment.findNextNode( this );
			},
			findNextNode: function( fragment ) {
				if ( this.fragments[ fragment.index + 1 ] ) {
					return this.fragments[ fragment.index + 1 ].firstNode();
				}
				return this.parentFragment.findNextNode( this );
			},
			teardownFragments: function( destroy ) {
				var fragment;
				while ( fragment = this.fragments.shift() ) {
					fragment.teardown( destroy );
				}
			},
			render: render,
			createFragment: function( options ) {
				var fragment = new DomFragment( options );
				if ( this.docFrag ) {
					this.docFrag.appendChild( fragment.docFrag );
				}
				return fragment;
			},
			toString: function() {
				var str, i, len;
				str = '';
				i = 0;
				len = this.length;
				for ( i = 0; i < len; i += 1 ) {
					str += this.fragments[ i ].toString();
				}
				return str;
			},
			find: function( selector ) {
				var i, len, queryResult;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					if ( queryResult = this.fragments[ i ].find( selector ) ) {
						return queryResult;
					}
				}
				return null;
			},
			findAll: function( selector, query ) {
				var i, len;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					this.fragments[ i ].findAll( selector, query );
				}
			},
			findComponent: function( selector ) {
				var i, len, queryResult;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					if ( queryResult = this.fragments[ i ].findComponent( selector ) ) {
						return queryResult;
					}
				}
				return null;
			},
			findAllComponents: function( selector, query ) {
				var i, len;
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					this.fragments[ i ].findAllComponents( selector, query );
				}
			}
		};
		return DomSection;
	}( config_types, render_shared_initMustache, render_shared_updateMustache, render_shared_resolveMustache, render_DomFragment_Section_prototype_merge, render_DomFragment_Section_prototype_render, render_DomFragment_Section_prototype_splice, shared_teardown, circular );

	var render_DomFragment_Triple = function( types, matches, initMustache, updateMustache, resolveMustache, insertHtml, teardown ) {

		var DomTriple = function( options, docFrag ) {
			this.type = types.TRIPLE;
			if ( docFrag ) {
				this.nodes = [];
				this.docFrag = document.createDocumentFragment();
			}
			this.initialising = true;
			initMustache( this, options );
			if ( docFrag ) {
				docFrag.appendChild( this.docFrag );
			}
			this.initialising = false;
		};
		DomTriple.prototype = {
			update: updateMustache,
			resolve: resolveMustache,
			detach: function() {
				var len, i;
				if ( this.docFrag ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						this.docFrag.appendChild( this.nodes[ i ] );
					}
					return this.docFrag;
				}
			},
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
					this.docFrag = this.nodes = null;
				}
				teardown( this );
			},
			firstNode: function() {
				if ( this.nodes[ 0 ] ) {
					return this.nodes[ 0 ];
				}
				return this.parentFragment.findNextNode( this );
			},
			render: function( html ) {
				var node, pNode;
				if ( !this.nodes ) {
					return;
				}
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				if ( !html ) {
					this.nodes = [];
					return;
				}
				pNode = this.parentFragment.pNode;
				this.nodes = insertHtml( html, pNode.tagName, this.docFrag );
				if ( !this.initialising ) {
					pNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
				}
				if ( pNode.tagName === 'SELECT' && pNode._ractive && pNode._ractive.binding ) {
					pNode._ractive.binding.update();
				}
			},
			toString: function() {
				return this.value != undefined ? this.value : '';
			},
			find: function( selector ) {
				var i, len, node, queryResult;
				len = this.nodes.length;
				for ( i = 0; i < len; i += 1 ) {
					node = this.nodes[ i ];
					if ( node.nodeType !== 1 ) {
						continue;
					}
					if ( matches( node, selector ) ) {
						return node;
					}
					if ( queryResult = node.querySelector( selector ) ) {
						return queryResult;
					}
				}
				return null;
			},
			findAll: function( selector, queryResult ) {
				var i, len, node, queryAllResult, numNodes, j;
				len = this.nodes.length;
				for ( i = 0; i < len; i += 1 ) {
					node = this.nodes[ i ];
					if ( node.nodeType !== 1 ) {
						continue;
					}
					if ( matches( node, selector ) ) {
						queryResult.push( node );
					}
					if ( queryAllResult = node.querySelectorAll( selector ) ) {
						numNodes = queryAllResult.length;
						for ( j = 0; j < numNodes; j += 1 ) {
							queryResult.push( queryAllResult[ j ] );
						}
					}
				}
			}
		};
		return DomTriple;
	}( config_types, utils_matches, render_shared_initMustache, render_shared_updateMustache, render_shared_resolveMustache, render_DomFragment_shared_insertHtml, shared_teardown );

	var render_DomFragment_Element_initialise_getElementNamespace = function( namespaces ) {

		return function( descriptor, parentNode ) {
			if ( descriptor.a && descriptor.a.xmlns ) {
				return descriptor.a.xmlns;
			}
			return descriptor.e === 'svg' ? namespaces.svg : parentNode.namespaceURI || namespaces.html;
		};
	}( config_namespaces );

	var render_DomFragment_shared_enforceCase = function() {

		var svgCamelCaseElements, svgCamelCaseAttributes, createMap, map;
		svgCamelCaseElements = 'altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern'.split( ' ' );
		svgCamelCaseAttributes = 'attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan'.split( ' ' );
		createMap = function( items ) {
			var map = {}, i = items.length;
			while ( i-- ) {
				map[ items[ i ].toLowerCase() ] = items[ i ];
			}
			return map;
		};
		map = createMap( svgCamelCaseElements.concat( svgCamelCaseAttributes ) );
		return function( elementName ) {
			var lowerCaseElementName = elementName.toLowerCase();
			return map[ lowerCaseElementName ] || lowerCaseElementName;
		};
	}();

	var render_DomFragment_Attribute_helpers_determineNameAndNamespace = function( namespaces, enforceCase ) {

		return function( attribute, name ) {
			var colonIndex, namespacePrefix;
			colonIndex = name.indexOf( ':' );
			if ( colonIndex !== -1 ) {
				namespacePrefix = name.substr( 0, colonIndex );
				if ( namespacePrefix !== 'xmlns' ) {
					name = name.substring( colonIndex + 1 );
					attribute.name = enforceCase( name );
					attribute.lcName = attribute.name.toLowerCase();
					attribute.namespace = namespaces[ namespacePrefix.toLowerCase() ];
					if ( !attribute.namespace ) {
						throw 'Unknown namespace ("' + namespacePrefix + '")';
					}
					return;
				}
			}
			attribute.name = attribute.element.namespace !== namespaces.html ? enforceCase( name ) : name;
			attribute.lcName = attribute.name.toLowerCase();
		};
	}( config_namespaces, render_DomFragment_shared_enforceCase );

	var render_DomFragment_Attribute_helpers_setStaticAttribute = function( namespaces ) {

		return function setStaticAttribute( attribute, options ) {
			var node, value = options.value === null ? '' : options.value;
			if ( node = options.pNode ) {
				if ( attribute.namespace ) {
					node.setAttributeNS( attribute.namespace, options.name, value );
				} else {
					if ( options.name === 'style' && node.style.setAttribute ) {
						node.style.setAttribute( 'cssText', value );
					} else if ( options.name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
						node.className = value;
					} else {
						node.setAttribute( options.name, value );
					}
				}
				if ( attribute.name === 'id' ) {
					options.root.nodes[ options.value ] = node;
				}
				if ( attribute.name === 'value' ) {
					node._ractive.value = options.value;
				}
			}
			attribute.value = options.value;
		};
	}( config_namespaces );

	var render_DomFragment_Attribute_helpers_determinePropertyName = function( namespaces ) {

		var propertyNames = {
			'accept-charset': 'acceptCharset',
			accesskey: 'accessKey',
			bgcolor: 'bgColor',
			'class': 'className',
			codebase: 'codeBase',
			colspan: 'colSpan',
			contenteditable: 'contentEditable',
			datetime: 'dateTime',
			dirname: 'dirName',
			'for': 'htmlFor',
			'http-equiv': 'httpEquiv',
			ismap: 'isMap',
			maxlength: 'maxLength',
			novalidate: 'noValidate',
			pubdate: 'pubDate',
			readonly: 'readOnly',
			rowspan: 'rowSpan',
			tabindex: 'tabIndex',
			usemap: 'useMap'
		};
		return function( attribute, options ) {
			var propertyName;
			if ( attribute.pNode && !attribute.namespace && ( !options.pNode.namespaceURI || options.pNode.namespaceURI === namespaces.html ) ) {
				propertyName = propertyNames[ attribute.name ] || attribute.name;
				if ( options.pNode[ propertyName ] !== undefined ) {
					attribute.propertyName = propertyName;
				}
				if ( typeof options.pNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
					attribute.useProperty = true;
				}
			}
		};
	}( config_namespaces );

	var render_DomFragment_Attribute_helpers_getInterpolator = function( types ) {

		return function getInterpolator( attribute ) {
			var items, item;
			items = attribute.fragment.items;
			if ( items.length !== 1 ) {
				return;
			}
			item = items[ 0 ];
			if ( item.type !== types.INTERPOLATOR || !item.keypath && !item.ref ) {
				return;
			}
			return item;
		};
	}( config_types );

	var utils_arrayContentsMatch = function( isArray ) {

		return function( a, b ) {
			var i;
			if ( !isArray( a ) || !isArray( b ) ) {
				return false;
			}
			if ( a.length !== b.length ) {
				return false;
			}
			i = a.length;
			while ( i-- ) {
				if ( a[ i ] !== b[ i ] ) {
					return false;
				}
			}
			return true;
		};
	}( utils_isArray );

	var render_DomFragment_Attribute_prototype_bind = function( runloop, warn, arrayContentsMatch, getValueFromCheckboxes, get, set ) {

		var singleMustacheError = 'For two-way binding to work, attribute value must be a single interpolator (e.g. value="{{foo}}")',
			expressionError = 'You cannot set up two-way binding against an expression ',
			bindAttribute, updateModel, getOptions, update, getBinding, inheritProperties, MultipleSelectBinding, SelectBinding, RadioNameBinding, CheckboxNameBinding, CheckedBinding, FileListBinding, ContentEditableBinding, GenericBinding;
		bindAttribute = function() {
			var node = this.pNode,
				interpolator, binding, bindings;
			interpolator = this.interpolator;
			if ( !interpolator ) {
				warn( singleMustacheError );
				return false;
			}
			if ( interpolator.keypath && interpolator.keypath.substr === '${' ) {
				warn( expressionError + interpolator.keypath );
				return false;
			}
			if ( !interpolator.keypath ) {
				interpolator.resolve( interpolator.descriptor.r );
			}
			this.keypath = interpolator.keypath;
			binding = getBinding( this );
			if ( !binding ) {
				return false;
			}
			node._ractive.binding = this.element.binding = binding;
			this.twoway = true;
			bindings = this.root._twowayBindings[ this.keypath ] || ( this.root._twowayBindings[ this.keypath ] = [] );
			bindings.push( binding );
			return true;
		};
		updateModel = function() {
			runloop.start( this._ractive.root );
			this._ractive.binding.update();
			runloop.end();
		};
		getOptions = {
			evaluateWrapped: true
		};
		update = function() {
			var value = get( this._ractive.root, this._ractive.binding.keypath, getOptions );
			this.value = value == undefined ? '' : value;
		};
		getBinding = function( attribute ) {
			var node = attribute.pNode;
			if ( node.tagName === 'SELECT' ) {
				return node.multiple ? new MultipleSelectBinding( attribute, node ) : new SelectBinding( attribute, node );
			}
			if ( node.type === 'checkbox' || node.type === 'radio' ) {
				if ( attribute.propertyName === 'name' ) {
					if ( node.type === 'checkbox' ) {
						return new CheckboxNameBinding( attribute, node );
					}
					if ( node.type === 'radio' ) {
						return new RadioNameBinding( attribute, node );
					}
				}
				if ( attribute.propertyName === 'checked' ) {
					return new CheckedBinding( attribute, node );
				}
				return null;
			}
			if ( attribute.lcName !== 'value' ) {
				throw new Error( 'Attempted to set up an illegal two-way binding. This error is unexpected - if you can, please file an issue at https://github.com/RactiveJS/Ractive, or contact @RactiveJS on Twitter. Thanks!' );
			}
			if ( node.type === 'file' ) {
				return new FileListBinding( attribute, node );
			}
			if ( node.getAttribute( 'contenteditable' ) ) {
				return new ContentEditableBinding( attribute, node );
			}
			return new GenericBinding( attribute, node );
		};
		MultipleSelectBinding = function( attribute, node ) {
			var valueFromModel;
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel === undefined ) {
				this.update();
			}
		};
		MultipleSelectBinding.prototype = {
			value: function() {
				var selectedValues, options, i, len, option, optionValue;
				selectedValues = [];
				options = this.node.options;
				len = options.length;
				for ( i = 0; i < len; i += 1 ) {
					option = options[ i ];
					if ( option.selected ) {
						optionValue = option._ractive ? option._ractive.value : option.value;
						selectedValues.push( optionValue );
					}
				}
				return selectedValues;
			},
			update: function() {
				var attribute, previousValue, value;
				attribute = this.attr;
				previousValue = attribute.value;
				value = this.value();
				if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
					attribute.receiving = true;
					attribute.value = value;
					set( this.root, this.keypath, value );
					runloop.trigger();
					attribute.receiving = false;
				}
				return this;
			},
			deferUpdate: function() {
				if ( this.deferred === true ) {
					return;
				}
				runloop.addAttribute( this );
				this.deferred = true;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
			}
		};
		SelectBinding = function( attribute, node ) {
			var valueFromModel;
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel === undefined ) {
				this.update();
			}
		};
		SelectBinding.prototype = {
			value: function() {
				var options, i, len, option, optionValue;
				options = this.node.options;
				len = options.length;
				for ( i = 0; i < len; i += 1 ) {
					option = options[ i ];
					if ( options[ i ].selected ) {
						optionValue = option._ractive ? option._ractive.value : option.value;
						return optionValue;
					}
				}
			},
			update: function() {
				var value = this.value();
				this.attr.receiving = true;
				this.attr.value = value;
				set( this.root, this.keypath, value );
				runloop.trigger();
				this.attr.receiving = false;
				return this;
			},
			deferUpdate: function() {
				if ( this.deferred === true ) {
					return;
				}
				runloop.addAttribute( this );
				this.deferred = true;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
			}
		};
		RadioNameBinding = function( attribute, node ) {
			var valueFromModel;
			this.radioName = true;
			inheritProperties( this, attribute, node );
			node.name = '{{' + attribute.keypath + '}}';
			node.addEventListener( 'change', updateModel, false );
			if ( node.attachEvent ) {
				node.addEventListener( 'click', updateModel, false );
			}
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel !== undefined ) {
				node.checked = valueFromModel == node._ractive.value;
			} else {
				runloop.addRadio( this );
			}
		};
		RadioNameBinding.prototype = {
			value: function() {
				return this.node._ractive ? this.node._ractive.value : this.node.value;
			},
			update: function() {
				var node = this.node;
				if ( node.checked ) {
					this.attr.receiving = true;
					set( this.root, this.keypath, this.value() );
					runloop.trigger();
					this.attr.receiving = false;
				}
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'click', updateModel, false );
			}
		};
		CheckboxNameBinding = function( attribute, node ) {
			var valueFromModel, checked;
			this.checkboxName = true;
			inheritProperties( this, attribute, node );
			node.name = '{{' + this.keypath + '}}';
			node.addEventListener( 'change', updateModel, false );
			if ( node.attachEvent ) {
				node.addEventListener( 'click', updateModel, false );
			}
			valueFromModel = get( this.root, this.keypath );
			if ( valueFromModel !== undefined ) {
				checked = valueFromModel.indexOf( node._ractive.value ) !== -1;
				node.checked = checked;
			} else {
				runloop.addCheckbox( this );
			}
		};
		CheckboxNameBinding.prototype = {
			changed: function() {
				return this.node.checked !== !! this.checked;
			},
			update: function() {
				this.checked = this.node.checked;
				this.attr.receiving = true;
				set( this.root, this.keypath, getValueFromCheckboxes( this.root, this.keypath ) );
				runloop.trigger();
				this.attr.receiving = false;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'click', updateModel, false );
			}
		};
		CheckedBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			if ( node.attachEvent ) {
				node.addEventListener( 'click', updateModel, false );
			}
		};
		CheckedBinding.prototype = {
			value: function() {
				return this.node.checked;
			},
			update: function() {
				this.attr.receiving = true;
				set( this.root, this.keypath, this.value() );
				runloop.trigger();
				this.attr.receiving = false;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'click', updateModel, false );
			}
		};
		FileListBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
		};
		FileListBinding.prototype = {
			value: function() {
				return this.attr.pNode.files;
			},
			update: function() {
				set( this.attr.root, this.attr.keypath, this.value() );
				runloop.trigger();
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
			}
		};
		ContentEditableBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			if ( !this.root.lazy ) {
				node.addEventListener( 'input', updateModel, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'keyup', updateModel, false );
				}
			}
		};
		ContentEditableBinding.prototype = {
			update: function() {
				this.attr.receiving = true;
				set( this.root, this.keypath, this.node.innerHTML );
				runloop.trigger();
				this.attr.receiving = false;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'input', updateModel, false );
				this.node.removeEventListener( 'keyup', updateModel, false );
			}
		};
		GenericBinding = function( attribute, node ) {
			inheritProperties( this, attribute, node );
			node.addEventListener( 'change', updateModel, false );
			if ( !this.root.lazy ) {
				node.addEventListener( 'input', updateModel, false );
				if ( node.attachEvent ) {
					node.addEventListener( 'keyup', updateModel, false );
				}
			}
			this.node.addEventListener( 'blur', update, false );
		};
		GenericBinding.prototype = {
			value: function() {
				var value = this.attr.pNode.value;
				if ( +value + '' === value && value.indexOf( 'e' ) === -1 ) {
					value = +value;
				}
				return value;
			},
			update: function() {
				var attribute = this.attr,
					value = this.value();
				attribute.receiving = true;
				set( attribute.root, attribute.keypath, value );
				runloop.trigger();
				attribute.receiving = false;
			},
			teardown: function() {
				this.node.removeEventListener( 'change', updateModel, false );
				this.node.removeEventListener( 'input', updateModel, false );
				this.node.removeEventListener( 'keyup', updateModel, false );
				this.node.removeEventListener( 'blur', update, false );
			}
		};
		inheritProperties = function( binding, attribute, node ) {
			binding.attr = attribute;
			binding.node = node;
			binding.root = attribute.root;
			binding.keypath = attribute.keypath;
		};
		return bindAttribute;
	}( global_runloop, utils_warn, utils_arrayContentsMatch, shared_getValueFromCheckboxes, shared_get__get, shared_set );

	var render_DomFragment_Attribute_prototype_update = function( runloop, namespaces, isArray ) {

		var updateAttribute, updateFileInputValue, deferSelect, initSelect, updateSelect, updateMultipleSelect, updateRadioName, updateCheckboxName, updateIEStyleAttribute, updateClassName, updateContentEditableValue, updateEverythingElse;
		updateAttribute = function() {
			var node;
			if ( !this.ready ) {
				return this;
			}
			node = this.pNode;
			if ( node.tagName === 'SELECT' && this.lcName === 'value' ) {
				this.update = deferSelect;
				this.deferredUpdate = initSelect;
				return this.update();
			}
			if ( this.isFileInputValue ) {
				this.update = updateFileInputValue;
				return this;
			}
			if ( this.twoway && this.lcName === 'name' ) {
				if ( node.type === 'radio' ) {
					this.update = updateRadioName;
					return this.update();
				}
				if ( node.type === 'checkbox' ) {
					this.update = updateCheckboxName;
					return this.update();
				}
			}
			if ( this.lcName === 'style' && node.style.setAttribute ) {
				this.update = updateIEStyleAttribute;
				return this.update();
			}
			if ( this.lcName === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
				this.update = updateClassName;
				return this.update();
			}
			if ( node.getAttribute( 'contenteditable' ) && this.lcName === 'value' ) {
				this.update = updateContentEditableValue;
				return this.update();
			}
			this.update = updateEverythingElse;
			return this.update();
		};
		updateFileInputValue = function() {
			return this;
		};
		initSelect = function() {
			this.deferredUpdate = this.pNode.multiple ? updateMultipleSelect : updateSelect;
			this.deferredUpdate();
		};
		deferSelect = function() {
			runloop.addSelectValue( this );
			return this;
		};
		updateSelect = function() {
			var value = this.fragment.getValue(),
				options, option, optionValue, i;
			this.value = this.pNode._ractive.value = value;
			options = this.pNode.options;
			i = options.length;
			while ( i-- ) {
				option = options[ i ];
				optionValue = option._ractive ? option._ractive.value : option.value;
				if ( optionValue == value ) {
					option.selected = true;
					return this;
				}
			}
			return this;
		};
		updateMultipleSelect = function() {
			var value = this.fragment.getValue(),
				options, i, option, optionValue;
			if ( !isArray( value ) ) {
				value = [ value ];
			}
			options = this.pNode.options;
			i = options.length;
			while ( i-- ) {
				option = options[ i ];
				optionValue = option._ractive ? option._ractive.value : option.value;
				option.selected = value.indexOf( optionValue ) !== -1;
			}
			this.value = value;
			return this;
		};
		updateRadioName = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			node.checked = value == node._ractive.value;
			return this;
		};
		updateCheckboxName = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( !isArray( value ) ) {
				node.checked = value == node._ractive.value;
				return this;
			}
			node.checked = value.indexOf( node._ractive.value ) !== -1;
			return this;
		};
		updateIEStyleAttribute = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( value === undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				node.style.setAttribute( 'cssText', value );
				this.value = value;
			}
			return this;
		};
		updateClassName = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( value === undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				node.className = value;
				this.value = value;
			}
			return this;
		};
		updateContentEditableValue = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( value === undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				if ( !this.receiving ) {
					node.innerHTML = value;
				}
				this.value = value;
			}
			return this;
		};
		updateEverythingElse = function() {
			var node, value;
			node = this.pNode;
			value = this.fragment.getValue();
			if ( this.isValueAttribute ) {
				node._ractive.value = value;
			}
			if ( value == undefined ) {
				value = '';
			}
			if ( value !== this.value ) {
				if ( this.useProperty ) {
					if ( !this.receiving ) {
						node[ this.propertyName ] = value;
					}
					this.value = value;
					return this;
				}
				if ( this.namespace ) {
					node.setAttributeNS( this.namespace, this.name, value );
					this.value = value;
					return this;
				}
				if ( this.lcName === 'id' ) {
					if ( this.value !== undefined ) {
						this.root.nodes[ this.value ] = undefined;
					}
					this.root.nodes[ value ] = node;
				}
				node.setAttribute( this.name, value );
				this.value = value;
			}
			return this;
		};
		return updateAttribute;
	}( global_runloop, config_namespaces, utils_isArray );

	var parse_Tokenizer_utils_getStringMatch = function( string ) {
		var substr;
		substr = this.str.substr( this.pos, string.length );
		if ( substr === string ) {
			this.pos += string.length;
			return string;
		}
		return null;
	};

	var parse_Tokenizer_utils_allowWhitespace = function() {

		var leadingWhitespace = /^\s+/;
		return function() {
			var match = leadingWhitespace.exec( this.remaining() );
			if ( !match ) {
				return null;
			}
			this.pos += match[ 0 ].length;
			return match[ 0 ];
		};
	}();

	var parse_Tokenizer_utils_makeRegexMatcher = function( regex ) {
		return function( tokenizer ) {
			var match = regex.exec( tokenizer.str.substring( tokenizer.pos ) );
			if ( !match ) {
				return null;
			}
			tokenizer.pos += match[ 0 ].length;
			return match[ 1 ] || match[ 0 ];
		};
	};

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_makeQuotedStringMatcher = function( makeRegexMatcher ) {

		var getStringMiddle, getEscapeSequence, getLineContinuation;
		getStringMiddle = makeRegexMatcher( /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/ );
		getEscapeSequence = makeRegexMatcher( /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/ );
		getLineContinuation = makeRegexMatcher( /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/ );
		return function( quote, okQuote ) {
			return function( tokenizer ) {
				var start, literal, done, next;
				start = tokenizer.pos;
				literal = '"';
				done = false;
				while ( !done ) {
					next = getStringMiddle( tokenizer ) || getEscapeSequence( tokenizer ) || tokenizer.getStringMatch( okQuote );
					if ( next ) {
						if ( next === '"' ) {
							literal += '\\"';
						} else if ( next === '\\\'' ) {
							literal += '\'';
						} else {
							literal += next;
						}
					} else {
						next = getLineContinuation( tokenizer );
						if ( next ) {
							literal += '\\u' + ( '000' + next.charCodeAt( 1 ).toString( 16 ) ).slice( -4 );
						} else {
							done = true;
						}
					}
				}
				literal += '"';
				return JSON.parse( literal );
			};
		};
	}( parse_Tokenizer_utils_makeRegexMatcher );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_getSingleQuotedString = function( makeQuotedStringMatcher ) {

		return makeQuotedStringMatcher( '\'', '"' );
	}( parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_makeQuotedStringMatcher );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_getDoubleQuotedString = function( makeQuotedStringMatcher ) {

		return makeQuotedStringMatcher( '"', '\'' );
	}( parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_makeQuotedStringMatcher );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral__getStringLiteral = function( types, getSingleQuotedString, getDoubleQuotedString ) {

		return function( tokenizer ) {
			var start, string;
			start = tokenizer.pos;
			if ( tokenizer.getStringMatch( '"' ) ) {
				string = getDoubleQuotedString( tokenizer );
				if ( !tokenizer.getStringMatch( '"' ) ) {
					tokenizer.pos = start;
					return null;
				}
				return {
					t: types.STRING_LITERAL,
					v: string
				};
			}
			if ( tokenizer.getStringMatch( '\'' ) ) {
				string = getSingleQuotedString( tokenizer );
				if ( !tokenizer.getStringMatch( '\'' ) ) {
					tokenizer.pos = start;
					return null;
				}
				return {
					t: types.STRING_LITERAL,
					v: string
				};
			}
			return null;
		};
	}( config_types, parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_getSingleQuotedString, parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral_getDoubleQuotedString );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getNumberLiteral = function( types, makeRegexMatcher ) {

		var getNumber = makeRegexMatcher( /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/ );
		return function( tokenizer ) {
			var result;
			if ( result = getNumber( tokenizer ) ) {
				return {
					t: types.NUMBER_LITERAL,
					v: result
				};
			}
			return null;
		};
	}( config_types, parse_Tokenizer_utils_makeRegexMatcher );

	var parse_Tokenizer_getExpression_shared_getName = function( makeRegexMatcher ) {

		return makeRegexMatcher( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );
	}( parse_Tokenizer_utils_makeRegexMatcher );

	var parse_Tokenizer_getExpression_shared_getKey = function( getStringLiteral, getNumberLiteral, getName ) {

		var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
		return function( tokenizer ) {
			var token;
			if ( token = getStringLiteral( tokenizer ) ) {
				return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
			}
			if ( token = getNumberLiteral( tokenizer ) ) {
				return token.v;
			}
			if ( token = getName( tokenizer ) ) {
				return token;
			}
		};
	}( parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral__getStringLiteral, parse_Tokenizer_getExpression_getPrimary_getLiteral_getNumberLiteral, parse_Tokenizer_getExpression_shared_getName );

	var utils_parseJSON = function( getStringMatch, allowWhitespace, getStringLiteral, getKey ) {

		var Tokenizer, specials, specialsPattern, numberPattern, placeholderPattern, placeholderAtStartPattern;
		specials = {
			'true': true,
			'false': false,
			'undefined': undefined,
			'null': null
		};
		specialsPattern = new RegExp( '^(?:' + Object.keys( specials ).join( '|' ) + ')' );
		numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
		placeholderPattern = /\$\{([^\}]+)\}/g;
		placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
		Tokenizer = function( str, values ) {
			this.str = str;
			this.values = values;
			this.pos = 0;
			this.result = this.getToken();
		};
		Tokenizer.prototype = {
			remaining: function() {
				return this.str.substring( this.pos );
			},
			getStringMatch: getStringMatch,
			getToken: function() {
				this.allowWhitespace();
				return this.getPlaceholder() || this.getSpecial() || this.getNumber() || this.getString() || this.getObject() || this.getArray();
			},
			getPlaceholder: function() {
				var match;
				if ( !this.values ) {
					return null;
				}
				if ( ( match = placeholderAtStartPattern.exec( this.remaining() ) ) && this.values.hasOwnProperty( match[ 1 ] ) ) {
					this.pos += match[ 0 ].length;
					return {
						v: this.values[ match[ 1 ] ]
					};
				}
			},
			getSpecial: function() {
				var match;
				if ( match = specialsPattern.exec( this.remaining() ) ) {
					this.pos += match[ 0 ].length;
					return {
						v: specials[ match[ 0 ] ]
					};
				}
			},
			getNumber: function() {
				var match;
				if ( match = numberPattern.exec( this.remaining() ) ) {
					this.pos += match[ 0 ].length;
					return {
						v: +match[ 0 ]
					};
				}
			},
			getString: function() {
				var stringLiteral = getStringLiteral( this ),
					values;
				if ( stringLiteral && ( values = this.values ) ) {
					return {
						v: stringLiteral.v.replace( placeholderPattern, function( match, $1 ) {
							return values[ $1 ] || $1;
						} )
					};
				}
				return stringLiteral;
			},
			getObject: function() {
				var result, pair;
				if ( !this.getStringMatch( '{' ) ) {
					return null;
				}
				result = {};
				while ( pair = getKeyValuePair( this ) ) {
					result[ pair.key ] = pair.value;
					this.allowWhitespace();
					if ( this.getStringMatch( '}' ) ) {
						return {
							v: result
						};
					}
					if ( !this.getStringMatch( ',' ) ) {
						return null;
					}
				}
				return null;
			},
			getArray: function() {
				var result, valueToken;
				if ( !this.getStringMatch( '[' ) ) {
					return null;
				}
				result = [];
				while ( valueToken = this.getToken() ) {
					result.push( valueToken.v );
					if ( this.getStringMatch( ']' ) ) {
						return {
							v: result
						};
					}
					if ( !this.getStringMatch( ',' ) ) {
						return null;
					}
				}
				return null;
			},
			allowWhitespace: allowWhitespace
		};

		function getKeyValuePair( tokenizer ) {
			var key, valueToken, pair;
			tokenizer.allowWhitespace();
			key = getKey( tokenizer );
			if ( !key ) {
				return null;
			}
			pair = {
				key: key
			};
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( ':' ) ) {
				return null;
			}
			tokenizer.allowWhitespace();
			valueToken = tokenizer.getToken();
			if ( !valueToken ) {
				return null;
			}
			pair.value = valueToken.v;
			return pair;
		}
		return function( str, values ) {
			var tokenizer = new Tokenizer( str, values );
			if ( tokenizer.result ) {
				return {
					value: tokenizer.result.v,
					remaining: tokenizer.remaining()
				};
			}
			return null;
		};
	}( parse_Tokenizer_utils_getStringMatch, parse_Tokenizer_utils_allowWhitespace, parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral__getStringLiteral, parse_Tokenizer_getExpression_shared_getKey );

	var render_StringFragment_Interpolator = function( types, teardown, initMustache, updateMustache, resolveMustache ) {

		var StringInterpolator = function( options ) {
			this.type = types.INTERPOLATOR;
			initMustache( this, options );
		};
		StringInterpolator.prototype = {
			update: updateMustache,
			resolve: resolveMustache,
			render: function( value ) {
				this.value = value;
				this.parentFragment.bubble();
			},
			teardown: function() {
				teardown( this );
			},
			toString: function() {
				if ( this.value == undefined ) {
					return '';
				}
				return stringify( this.value );
			}
		};
		return StringInterpolator;

		function stringify( value ) {
			if ( typeof value === 'string' ) {
				return value;
			}
			return JSON.stringify( value );
		}
	}( config_types, shared_teardown, render_shared_initMustache, render_shared_updateMustache, render_shared_resolveMustache );

	var render_StringFragment_Section = function( types, initMustache, updateMustache, resolveMustache, updateSection, teardown, circular ) {

		var StringSection, StringFragment;
		circular.push( function() {
			StringFragment = circular.StringFragment;
		} );
		StringSection = function( options ) {
			this.type = types.SECTION;
			this.fragments = [];
			this.length = 0;
			initMustache( this, options );
		};
		StringSection.prototype = {
			update: updateMustache,
			resolve: resolveMustache,
			teardown: function() {
				this.teardownFragments();
				teardown( this );
			},
			teardownFragments: function() {
				while ( this.fragments.length ) {
					this.fragments.shift().teardown();
				}
				this.length = 0;
			},
			bubble: function() {
				this.value = this.fragments.join( '' );
				this.parentFragment.bubble();
			},
			render: function( value ) {
				var wrapped;
				if ( wrapped = this.root._wrapped[ this.keypath ] ) {
					value = wrapped.get();
				}
				updateSection( this, value );
				this.parentFragment.bubble();
			},
			createFragment: function( options ) {
				return new StringFragment( options );
			},
			toString: function() {
				return this.fragments.join( '' );
			}
		};
		return StringSection;
	}( config_types, render_shared_initMustache, render_shared_updateMustache, render_shared_resolveMustache, render_shared_updateSection, shared_teardown, circular );

	var render_StringFragment_Text = function( types ) {

		var StringText = function( text ) {
			this.type = types.TEXT;
			this.text = text;
		};
		StringText.prototype = {
			toString: function() {
				return this.text;
			},
			teardown: function() {}
		};
		return StringText;
	}( config_types );

	var render_StringFragment_prototype_toArgsList = function( warn, parseJSON ) {

		return function() {
			var values, counter, jsonesque, guid, errorMessage, parsed, processItems;
			if ( !this.argsList || this.dirty ) {
				values = {};
				counter = 0;
				guid = this.root._guid;
				processItems = function( items ) {
					return items.map( function( item ) {
						var placeholderId, wrapped, value;
						if ( item.text ) {
							return item.text;
						}
						if ( item.fragments ) {
							return item.fragments.map( function( fragment ) {
								return processItems( fragment.items );
							} ).join( '' );
						}
						placeholderId = guid + '-' + counter++;
						if ( wrapped = item.root._wrapped[ item.keypath ] ) {
							value = wrapped.value;
						} else {
							value = item.value;
						}
						values[ placeholderId ] = value;
						return '${' + placeholderId + '}';
					} ).join( '' );
				};
				jsonesque = processItems( this.items );
				parsed = parseJSON( '[' + jsonesque + ']', values );
				if ( !parsed ) {
					errorMessage = 'Could not parse directive arguments (' + this.toString() + '). If you think this is a bug, please file an issue at http://github.com/RactiveJS/Ractive/issues';
					if ( this.root.debug ) {
						throw new Error( errorMessage );
					} else {
						warn( errorMessage );
						this.argsList = [ jsonesque ];
					}
				} else {
					this.argsList = parsed.value;
				}
				this.dirty = false;
			}
			return this.argsList;
		};
	}( utils_warn, utils_parseJSON );

	var render_StringFragment__StringFragment = function( types, parseJSON, initFragment, Interpolator, Section, Text, toArgsList, circular ) {

		var StringFragment = function( options ) {
			initFragment( this, options );
		};
		StringFragment.prototype = {
			createItem: function( options ) {
				if ( typeof options.descriptor === 'string' ) {
					return new Text( options.descriptor );
				}
				switch ( options.descriptor.t ) {
					case types.INTERPOLATOR:
						return new Interpolator( options );
					case types.TRIPLE:
						return new Interpolator( options );
					case types.SECTION:
						return new Section( options );
					default:
						throw 'Something went wrong in a rather interesting way';
				}
			},
			bubble: function() {
				this.dirty = true;
				this.owner.bubble();
			},
			teardown: function() {
				var numItems, i;
				numItems = this.items.length;
				for ( i = 0; i < numItems; i += 1 ) {
					this.items[ i ].teardown();
				}
			},
			getValue: function() {
				var value;
				if ( this.items.length === 1 && this.items[ 0 ].type === types.INTERPOLATOR ) {
					value = this.items[ 0 ].value;
					if ( value !== undefined ) {
						return value;
					}
				}
				return this.toString();
			},
			isSimple: function() {
				var i, item, containsInterpolator;
				if ( this.simple !== undefined ) {
					return this.simple;
				}
				i = this.items.length;
				while ( i-- ) {
					item = this.items[ i ];
					if ( item.type === types.TEXT ) {
						continue;
					}
					if ( item.type === types.INTERPOLATOR ) {
						if ( containsInterpolator ) {
							return false;
						} else {
							containsInterpolator = true;
							continue;
						}
					}
					return this.simple = false;
				}
				return this.simple = true;
			},
			toString: function() {
				return this.items.join( '' );
			},
			toJSON: function() {
				var value = this.getValue(),
					parsed;
				if ( typeof value === 'string' ) {
					parsed = parseJSON( value );
					value = parsed ? parsed.value : value;
				}
				return value;
			},
			toArgsList: toArgsList
		};
		circular.StringFragment = StringFragment;
		return StringFragment;
	}( config_types, utils_parseJSON, render_shared_initFragment, render_StringFragment_Interpolator, render_StringFragment_Section, render_StringFragment_Text, render_StringFragment_prototype_toArgsList, circular );

	var render_DomFragment_Attribute__Attribute = function( runloop, types, determineNameAndNamespace, setStaticAttribute, determinePropertyName, getInterpolator, bind, update, StringFragment ) {

		var DomAttribute = function( options ) {
			this.type = types.ATTRIBUTE;
			this.element = options.element;
			determineNameAndNamespace( this, options.name );
			if ( options.value === null || typeof options.value === 'string' ) {
				setStaticAttribute( this, options );
				return;
			}
			this.root = options.root;
			this.pNode = options.pNode;
			this.parentFragment = this.element.parentFragment;
			this.fragment = new StringFragment( {
				descriptor: options.value,
				root: this.root,
				owner: this
			} );
			this.interpolator = getInterpolator( this );
			if ( !this.pNode ) {
				return;
			}
			if ( this.name === 'value' ) {
				this.isValueAttribute = true;
				if ( this.pNode.tagName === 'INPUT' && this.pNode.type === 'file' ) {
					this.isFileInputValue = true;
				}
			}
			determinePropertyName( this, options );
			this.selfUpdating = this.fragment.isSimple();
			this.ready = true;
		};
		DomAttribute.prototype = {
			bind: bind,
			update: update,
			updateBindings: function() {
				this.keypath = this.interpolator.keypath || this.interpolator.ref;
				if ( this.propertyName === 'name' ) {
					this.pNode.name = '{{' + this.keypath + '}}';
				}
			},
			teardown: function() {
				var i;
				if ( this.boundEvents ) {
					i = this.boundEvents.length;
					while ( i-- ) {
						this.pNode.removeEventListener( this.boundEvents[ i ], this.updateModel, false );
					}
				}
				if ( this.fragment ) {
					this.fragment.teardown();
				}
			},
			bubble: function() {
				if ( this.selfUpdating ) {
					this.update();
				} else if ( !this.deferred && this.ready ) {
					runloop.addAttribute( this );
					this.deferred = true;
				}
			},
			toString: function() {
				var str, interpolator;
				if ( this.value === null ) {
					return this.name;
				}
				if ( this.name === 'value' && this.element.lcName === 'select' ) {
					return;
				}
				if ( this.name === 'name' && this.element.lcName === 'input' && ( interpolator = this.interpolator ) ) {
					return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
				}
				if ( !this.fragment ) {
					return this.name + '=' + JSON.stringify( this.value );
				}
				str = this.fragment.toString();
				return this.name + '=' + JSON.stringify( str );
			}
		};
		return DomAttribute;
	}( global_runloop, config_types, render_DomFragment_Attribute_helpers_determineNameAndNamespace, render_DomFragment_Attribute_helpers_setStaticAttribute, render_DomFragment_Attribute_helpers_determinePropertyName, render_DomFragment_Attribute_helpers_getInterpolator, render_DomFragment_Attribute_prototype_bind, render_DomFragment_Attribute_prototype_update, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_createElementAttributes = function( DomAttribute ) {

		return function( element, attributes ) {
			var attrName, attrValue, attr;
			element.attributes = [];
			for ( attrName in attributes ) {
				if ( attributes.hasOwnProperty( attrName ) ) {
					attrValue = attributes[ attrName ];
					attr = new DomAttribute( {
						element: element,
						name: attrName,
						value: attrValue,
						root: element.root,
						pNode: element.node
					} );
					element.attributes.push( element.attributes[ attrName ] = attr );
					if ( attrName !== 'name' ) {
						attr.update();
					}
				}
			}
			return element.attributes;
		};
	}( render_DomFragment_Attribute__Attribute );

	var utils_toArray = function toArray( arrayLike ) {
		var array = [],
			i = arrayLike.length;
		while ( i-- ) {
			array[ i ] = arrayLike[ i ];
		}
		return array;
	};

	var render_DomFragment_Element_shared_getMatchingStaticNodes = function( toArray ) {

		return function getMatchingStaticNodes( element, selector ) {
			if ( !element.matchingStaticNodes[ selector ] ) {
				element.matchingStaticNodes[ selector ] = toArray( element.node.querySelectorAll( selector ) );
			}
			return element.matchingStaticNodes[ selector ];
		};
	}( utils_toArray );

	var render_DomFragment_Element_initialise_appendElementChildren = function( warn, namespaces, StringFragment, getMatchingStaticNodes, circular ) {

		var DomFragment, updateCss, updateScript;
		circular.push( function() {
			DomFragment = circular.DomFragment;
		} );
		updateCss = function() {
			var node = this.node,
				content = this.fragment.toString();
			if ( node.styleSheet ) {
				node.styleSheet.cssText = content;
			} else {
				node.innerHTML = content;
			}
		};
		updateScript = function() {
			if ( !this.node.type || this.node.type === 'text/javascript' ) {
				warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
			}
			this.node.text = this.fragment.toString();
		};
		return function appendElementChildren( element, node, descriptor, docFrag ) {
			if ( element.lcName === 'script' || element.lcName === 'style' ) {
				element.fragment = new StringFragment( {
					descriptor: descriptor.f,
					root: element.root,
					owner: element
				} );
				if ( docFrag ) {
					if ( element.lcName === 'script' ) {
						element.bubble = updateScript;
						element.node.text = element.fragment.toString();
					} else {
						element.bubble = updateCss;
						element.bubble();
					}
				}
				return;
			}
			if ( typeof descriptor.f === 'string' && ( !node || ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) ) {
				element.html = descriptor.f;
				if ( docFrag ) {
					node.innerHTML = element.html;
					element.matchingStaticNodes = {};
					updateLiveQueries( element );
				}
			} else {
				element.fragment = new DomFragment( {
					descriptor: descriptor.f,
					root: element.root,
					pNode: node,
					owner: element,
					pElement: element
				} );
				if ( docFrag ) {
					node.appendChild( element.fragment.docFrag );
				}
			}
		};

		function updateLiveQueries( element ) {
			var instance, liveQueries, node, selector, query, matchingStaticNodes, i;
			node = element.node;
			instance = element.root;
			do {
				liveQueries = instance._liveQueries;
				i = liveQueries.length;
				while ( i-- ) {
					selector = liveQueries[ i ];
					query = liveQueries[ selector ];
					matchingStaticNodes = getMatchingStaticNodes( element, selector );
					query.push.apply( query, matchingStaticNodes );
				}
			} while ( instance = instance._parent );
		}
	}( utils_warn, config_namespaces, render_StringFragment__StringFragment, render_DomFragment_Element_shared_getMatchingStaticNodes, circular );

	var render_DomFragment_Element_initialise_decorate_Decorator = function( warn, StringFragment ) {

		var Decorator = function( descriptor, ractive, owner ) {
			var decorator = this,
				name, fragment, errorMessage;
			decorator.root = ractive;
			decorator.node = owner.node;
			name = descriptor.n || descriptor;
			if ( typeof name !== 'string' ) {
				fragment = new StringFragment( {
					descriptor: name,
					root: ractive,
					owner: owner
				} );
				name = fragment.toString();
				fragment.teardown();
			}
			if ( descriptor.a ) {
				decorator.params = descriptor.a;
			} else if ( descriptor.d ) {
				decorator.fragment = new StringFragment( {
					descriptor: descriptor.d,
					root: ractive,
					owner: owner
				} );
				decorator.params = decorator.fragment.toArgsList();
				decorator.fragment.bubble = function() {
					this.dirty = true;
					decorator.params = this.toArgsList();
					if ( decorator.ready ) {
						decorator.update();
					}
				};
			}
			decorator.fn = ractive.decorators[ name ];
			if ( !decorator.fn ) {
				errorMessage = 'Missing "' + name + '" decorator. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#decorators';
				if ( ractive.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
			}
		};
		Decorator.prototype = {
			init: function() {
				var result, args;
				if ( this.params ) {
					args = [ this.node ].concat( this.params );
					result = this.fn.apply( this.root, args );
				} else {
					result = this.fn.call( this.root, this.node );
				}
				if ( !result || !result.teardown ) {
					throw new Error( 'Decorator definition must return an object with a teardown method' );
				}
				this.actual = result;
				this.ready = true;
			},
			update: function() {
				if ( this.actual.update ) {
					this.actual.update.apply( this.root, this.params );
				} else {
					this.actual.teardown( true );
					this.init();
				}
			},
			teardown: function( updating ) {
				this.actual.teardown();
				if ( !updating ) {
					this.fragment.teardown();
				}
			}
		};
		return Decorator;
	}( utils_warn, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_decorate__decorate = function( runloop, Decorator ) {

		return function( descriptor, root, owner ) {
			var decorator = new Decorator( descriptor, root, owner );
			if ( decorator.fn ) {
				owner.decorator = decorator;
				runloop.addDecorator( owner.decorator );
			}
		};
	}( global_runloop, render_DomFragment_Element_initialise_decorate_Decorator );

	var render_DomFragment_Element_initialise_addEventProxies_addEventProxy = function( warn, StringFragment ) {

		var addEventProxy, MasterEventHandler, ProxyEvent, firePlainEvent, fireEventWithArgs, fireEventWithDynamicArgs, customHandlers, genericHandler, getCustomHandler;
		addEventProxy = function( element, triggerEventName, proxyDescriptor, indexRefs ) {
			var events, master;
			events = element.node._ractive.events;
			master = events[ triggerEventName ] || ( events[ triggerEventName ] = new MasterEventHandler( element, triggerEventName, indexRefs ) );
			master.add( proxyDescriptor );
		};
		MasterEventHandler = function( element, eventName ) {
			var definition;
			this.element = element;
			this.root = element.root;
			this.node = element.node;
			this.name = eventName;
			this.proxies = [];
			if ( definition = this.root.events[ eventName ] ) {
				this.custom = definition( this.node, getCustomHandler( eventName ) );
			} else {
				if ( !( 'on' + eventName in this.node ) ) {
					warn( 'Missing "' + this.name + '" event. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#events' );
				}
				this.node.addEventListener( eventName, genericHandler, false );
			}
		};
		MasterEventHandler.prototype = {
			add: function( proxy ) {
				this.proxies.push( new ProxyEvent( this.element, this.root, proxy ) );
			},
			teardown: function() {
				var i;
				if ( this.custom ) {
					this.custom.teardown();
				} else {
					this.node.removeEventListener( this.name, genericHandler, false );
				}
				i = this.proxies.length;
				while ( i-- ) {
					this.proxies[ i ].teardown();
				}
			},
			fire: function( event ) {
				var i = this.proxies.length;
				while ( i-- ) {
					this.proxies[ i ].fire( event );
				}
			}
		};
		ProxyEvent = function( element, ractive, descriptor ) {
			var name;
			this.root = ractive;
			name = descriptor.n || descriptor;
			if ( typeof name === 'string' ) {
				this.n = name;
			} else {
				this.n = new StringFragment( {
					descriptor: descriptor.n,
					root: this.root,
					owner: element
				} );
			}
			if ( descriptor.a ) {
				this.a = descriptor.a;
				this.fire = fireEventWithArgs;
				return;
			}
			if ( descriptor.d ) {
				this.d = new StringFragment( {
					descriptor: descriptor.d,
					root: this.root,
					owner: element
				} );
				this.fire = fireEventWithDynamicArgs;
				return;
			}
			this.fire = firePlainEvent;
		};
		ProxyEvent.prototype = {
			teardown: function() {
				if ( this.n.teardown ) {
					this.n.teardown();
				}
				if ( this.d ) {
					this.d.teardown();
				}
			},
			bubble: function() {}
		};
		firePlainEvent = function( event ) {
			this.root.fire( this.n.toString(), event );
		};
		fireEventWithArgs = function( event ) {
			this.root.fire.apply( this.root, [
				this.n.toString(),
				event
			].concat( this.a ) );
		};
		fireEventWithDynamicArgs = function( event ) {
			var args = this.d.toArgsList();
			if ( typeof args === 'string' ) {
				args = args.substr( 1, args.length - 2 );
			}
			this.root.fire.apply( this.root, [
				this.n.toString(),
				event
			].concat( args ) );
		};
		genericHandler = function( event ) {
			var storage = this._ractive;
			storage.events[ event.type ].fire( {
				node: this,
				original: event,
				index: storage.index,
				keypath: storage.keypath,
				context: storage.root.get( storage.keypath )
			} );
		};
		customHandlers = {};
		getCustomHandler = function( eventName ) {
			if ( customHandlers[ eventName ] ) {
				return customHandlers[ eventName ];
			}
			return customHandlers[ eventName ] = function( event ) {
				var storage = event.node._ractive;
				event.index = storage.index;
				event.keypath = storage.keypath;
				event.context = storage.root.get( storage.keypath );
				storage.events[ eventName ].fire( event );
			};
		};
		return addEventProxy;
	}( utils_warn, render_StringFragment__StringFragment );

	var render_DomFragment_Element_initialise_addEventProxies__addEventProxies = function( addEventProxy ) {

		return function( element, proxies ) {
			var i, eventName, eventNames;
			for ( eventName in proxies ) {
				if ( proxies.hasOwnProperty( eventName ) ) {
					eventNames = eventName.split( '-' );
					i = eventNames.length;
					while ( i-- ) {
						addEventProxy( element, eventNames[ i ], proxies[ eventName ] );
					}
				}
			}
		};
	}( render_DomFragment_Element_initialise_addEventProxies_addEventProxy );

	var render_DomFragment_Element_initialise_updateLiveQueries = function( element ) {
		var instance, liveQueries, i, selector, query;
		instance = element.root;
		do {
			liveQueries = instance._liveQueries;
			i = liveQueries.length;
			while ( i-- ) {
				selector = liveQueries[ i ];
				query = liveQueries[ selector ];
				if ( query._test( element ) ) {
					( element.liveQueries || ( element.liveQueries = [] ) ).push( query );
				}
			}
		} while ( instance = instance._parent );
	};

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_init = function() {
		if ( this._inited ) {
			throw new Error( 'Cannot initialize a transition more than once' );
		}
		this._inited = true;
		this._fn.apply( this.root, [ this ].concat( this.params ) );
	};

	var render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix = function( isClient, vendors, createElement ) {

		var prefixCache, testStyle;
		if ( !isClient ) {
			return;
		}
		prefixCache = {};
		testStyle = createElement( 'div' ).style;
		return function( prop ) {
			var i, vendor, capped;
			if ( !prefixCache[ prop ] ) {
				if ( testStyle[ prop ] !== undefined ) {
					prefixCache[ prop ] = prop;
				} else {
					capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );
					i = vendors.length;
					while ( i-- ) {
						vendor = vendors[ i ];
						if ( testStyle[ vendor + capped ] !== undefined ) {
							prefixCache[ prop ] = vendor + capped;
							break;
						}
					}
				}
			}
			return prefixCache[ prop ];
		};
	}( config_isClient, config_vendors, utils_createElement );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_getStyle = function( legacy, isClient, isArray, prefix ) {

		var getComputedStyle;
		if ( !isClient ) {
			return;
		}
		getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
		return function( props ) {
			var computedStyle, styles, i, prop, value;
			computedStyle = window.getComputedStyle( this.node );
			if ( typeof props === 'string' ) {
				value = computedStyle[ prefix( props ) ];
				if ( value === '0px' ) {
					value = 0;
				}
				return value;
			}
			if ( !isArray( props ) ) {
				throw new Error( 'Transition#getStyle must be passed a string, or an array of strings representing CSS properties' );
			}
			styles = {};
			i = props.length;
			while ( i-- ) {
				prop = props[ i ];
				value = computedStyle[ prefix( prop ) ];
				if ( value === '0px' ) {
					value = 0;
				}
				styles[ prop ] = value;
			}
			return styles;
		};
	}( legacy, config_isClient, utils_isArray, render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_setStyle = function( prefix ) {

		return function( style, value ) {
			var prop;
			if ( typeof style === 'string' ) {
				this.node.style[ prefix( style ) ] = value;
			} else {
				for ( prop in style ) {
					if ( style.hasOwnProperty( prop ) ) {
						this.node.style[ prefix( prop ) ] = style[ prop ];
					}
				}
			}
			return this;
		};
	}( render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix );

	var utils_camelCase = function( hyphenatedStr ) {
		return hyphenatedStr.replace( /-([a-zA-Z])/g, function( match, $1 ) {
			return $1.toUpperCase();
		} );
	};

	var shared_Ticker = function( warn, getTime, animations ) {

		var Ticker = function( options ) {
			var easing;
			this.duration = options.duration;
			this.step = options.step;
			this.complete = options.complete;
			if ( typeof options.easing === 'string' ) {
				easing = options.root.easing[ options.easing ];
				if ( !easing ) {
					warn( 'Missing easing function ("' + options.easing + '"). You may need to download a plugin from [TODO]' );
					easing = linear;
				}
			} else if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			} else {
				easing = linear;
			}
			this.easing = easing;
			this.start = getTime();
			this.end = this.start + this.duration;
			this.running = true;
			animations.add( this );
		};
		Ticker.prototype = {
			tick: function( now ) {
				var elapsed, eased;
				if ( !this.running ) {
					return false;
				}
				if ( now > this.end ) {
					if ( this.step ) {
						this.step( 1 );
					}
					if ( this.complete ) {
						this.complete( 1 );
					}
					return false;
				}
				elapsed = now - this.start;
				eased = this.easing( elapsed / this.duration );
				if ( this.step ) {
					this.step( eased );
				}
				return true;
			},
			stop: function() {
				if ( this.abort ) {
					this.abort();
				}
				this.running = false;
			}
		};
		return Ticker;

		function linear( t ) {
			return t;
		}
	}( utils_warn, utils_getTime, shared_animations );

	var render_DomFragment_Element_shared_executeTransition_Transition_helpers_unprefix = function( vendors ) {

		var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );
		return function( prop ) {
			return prop.replace( unprefixPattern, '' );
		};
	}( config_vendors );

	var render_DomFragment_Element_shared_executeTransition_Transition_helpers_hyphenate = function( vendors ) {

		var vendorPattern = new RegExp( '^(?:' + vendors.join( '|' ) + ')([A-Z])' );
		return function( str ) {
			var hyphenated;
			if ( !str ) {
				return '';
			}
			if ( vendorPattern.test( str ) ) {
				str = '-' + str;
			}
			hyphenated = str.replace( /[A-Z]/g, function( match ) {
				return '-' + match.toLowerCase();
			} );
			return hyphenated;
		};
	}( config_vendors );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle_createTransitions = function( isClient, warn, createElement, camelCase, interpolate, Ticker, prefix, unprefix, hyphenate ) {

		var testStyle, TRANSITION, TRANSITIONEND, CSS_TRANSITIONS_ENABLED, TRANSITION_DURATION, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNCTION, canUseCssTransitions = {}, cannotUseCssTransitions = {};
		if ( !isClient ) {
			return;
		}
		testStyle = createElement( 'div' ).style;
		( function() {
			if ( testStyle.transition !== undefined ) {
				TRANSITION = 'transition';
				TRANSITIONEND = 'transitionend';
				CSS_TRANSITIONS_ENABLED = true;
			} else if ( testStyle.webkitTransition !== undefined ) {
				TRANSITION = 'webkitTransition';
				TRANSITIONEND = 'webkitTransitionEnd';
				CSS_TRANSITIONS_ENABLED = true;
			} else {
				CSS_TRANSITIONS_ENABLED = false;
			}
		}() );
		if ( TRANSITION ) {
			TRANSITION_DURATION = TRANSITION + 'Duration';
			TRANSITION_PROPERTY = TRANSITION + 'Property';
			TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
		}
		return function( t, to, options, changedProperties, transitionEndHandler, resolve ) {
			setTimeout( function() {
				var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete;
				checkComplete = function() {
					if ( jsTransitionsComplete && cssTransitionsComplete ) {
						resolve();
					}
				};
				hashPrefix = t.node.namespaceURI + t.node.tagName;
				t.node.style[ TRANSITION_PROPERTY ] = changedProperties.map( prefix ).map( hyphenate ).join( ',' );
				t.node.style[ TRANSITION_TIMING_FUNCTION ] = hyphenate( options.easing || 'linear' );
				t.node.style[ TRANSITION_DURATION ] = options.duration / 1000 + 's';
				transitionEndHandler = function( event ) {
					var index;
					index = changedProperties.indexOf( camelCase( unprefix( event.propertyName ) ) );
					if ( index !== -1 ) {
						changedProperties.splice( index, 1 );
					}
					if ( changedProperties.length ) {
						return;
					}
					t.root.fire( t.name + ':end' );
					t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
					cssTransitionsComplete = true;
					checkComplete();
				};
				t.node.addEventListener( TRANSITIONEND, transitionEndHandler, false );
				setTimeout( function() {
					var i = changedProperties.length,
						hash, originalValue, index, propertiesToTransitionInJs = [],
						prop;
					while ( i-- ) {
						prop = changedProperties[ i ];
						hash = hashPrefix + prop;
						if ( canUseCssTransitions[ hash ] ) {
							t.node.style[ prefix( prop ) ] = to[ prop ];
						} else {
							originalValue = t.getStyle( prop );
						}
						if ( canUseCssTransitions[ hash ] === undefined ) {
							t.node.style[ prefix( prop ) ] = to[ prop ];
							canUseCssTransitions[ hash ] = t.getStyle( prop ) != to[ prop ];
							cannotUseCssTransitions[ hash ] = !canUseCssTransitions[ hash ];
						}
						if ( cannotUseCssTransitions[ hash ] ) {
							index = changedProperties.indexOf( prop );
							if ( index === -1 ) {
								warn( 'Something very strange happened with transitions. If you see this message, please let @RactiveJS know. Thanks!' );
							} else {
								changedProperties.splice( index, 1 );
							}
							t.node.style[ prefix( prop ) ] = originalValue;
							propertiesToTransitionInJs.push( {
								name: prefix( prop ),
								interpolator: interpolate( originalValue, to[ prop ] )
							} );
						}
					}
					if ( propertiesToTransitionInJs.length ) {
						new Ticker( {
							root: t.root,
							duration: options.duration,
							easing: camelCase( options.easing ),
							step: function( pos ) {
								var prop, i;
								i = propertiesToTransitionInJs.length;
								while ( i-- ) {
									prop = propertiesToTransitionInJs[ i ];
									t.node.style[ prop.name ] = prop.interpolator( pos );
								}
							},
							complete: function() {
								jsTransitionsComplete = true;
								checkComplete();
							}
						} );
					} else {
						jsTransitionsComplete = true;
					}
					if ( !changedProperties.length ) {
						t.node.removeEventListener( TRANSITIONEND, transitionEndHandler, false );
						cssTransitionsComplete = true;
						checkComplete();
					}
				}, 0 );
			}, options.delay || 0 );
		};
	}( config_isClient, utils_warn, utils_createElement, utils_camelCase, shared_interpolate, shared_Ticker, render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix, render_DomFragment_Element_shared_executeTransition_Transition_helpers_unprefix, render_DomFragment_Element_shared_executeTransition_Transition_helpers_hyphenate );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle__animateStyle = function( legacy, isClient, warn, Promise, prefix, createTransitions ) {

		var getComputedStyle;
		if ( !isClient ) {
			return;
		}
		getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
		return function( style, value, options, complete ) {
			var t = this,
				to;
			if ( typeof style === 'string' ) {
				to = {};
				to[ style ] = value;
			} else {
				to = style;
				complete = options;
				options = value;
			}
			if ( !options ) {
				warn( 'The "' + t.name + '" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340' );
				options = t;
				complete = t.complete;
			}
			var promise = new Promise( function( resolve ) {
				var propertyNames, changedProperties, computedStyle, current, from, transitionEndHandler, i, prop;
				if ( !options.duration ) {
					t.setStyle( to );
					resolve();
					return;
				}
				propertyNames = Object.keys( to );
				changedProperties = [];
				computedStyle = window.getComputedStyle( t.node );
				from = {};
				i = propertyNames.length;
				while ( i-- ) {
					prop = propertyNames[ i ];
					current = computedStyle[ prefix( prop ) ];
					if ( current === '0px' ) {
						current = 0;
					}
					if ( current != to[ prop ] ) {
						changedProperties.push( prop );
						t.node.style[ prefix( prop ) ] = current;
					}
				}
				if ( !changedProperties.length ) {
					resolve();
					return;
				}
				createTransitions( t, to, options, changedProperties, transitionEndHandler, resolve );
			} );
			if ( complete ) {
				warn( 't.animateStyle returns a Promise as of 0.4.0. Transition authors should do t.animateStyle(...).then(callback)' );
				promise.then( complete );
			}
			return promise;
		};
	}( legacy, config_isClient, utils_warn, utils_Promise, render_DomFragment_Element_shared_executeTransition_Transition_helpers_prefix, render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle_createTransitions );

	var utils_fillGaps = function( target, source ) {
		var key;
		for ( key in source ) {
			if ( source.hasOwnProperty( key ) && !( key in target ) ) {
				target[ key ] = source[ key ];
			}
		}
		return target;
	};

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_processParams = function( fillGaps ) {

		return function( params, defaults ) {
			if ( typeof params === 'number' ) {
				params = {
					duration: params
				};
			} else if ( typeof params === 'string' ) {
				if ( params === 'slow' ) {
					params = {
						duration: 600
					};
				} else if ( params === 'fast' ) {
					params = {
						duration: 200
					};
				} else {
					params = {
						duration: 400
					};
				}
			} else if ( !params ) {
				params = {};
			}
			return fillGaps( params, defaults );
		};
	}( utils_fillGaps );

	var render_DomFragment_Element_shared_executeTransition_Transition_prototype_resetStyle = function() {
		if ( this.originalStyle ) {
			this.node.setAttribute( 'style', this.originalStyle );
		} else {
			this.node.getAttribute( 'style' );
			this.node.removeAttribute( 'style' );
		}
	};

	var render_DomFragment_Element_shared_executeTransition_Transition__Transition = function( warn, StringFragment, init, getStyle, setStyle, animateStyle, processParams, resetStyle ) {

		var Transition;
		Transition = function( descriptor, root, owner, isIntro ) {
			var t = this,
				name, fragment, errorMessage;
			this.root = root;
			this.node = owner.node;
			this.isIntro = isIntro;
			this.originalStyle = this.node.getAttribute( 'style' );
			t.complete = function( noReset ) {
				if ( !noReset && t.isIntro ) {
					t.resetStyle();
				}
				t.node._ractive.transition = null;
				t._manager.remove( t );
			};
			name = descriptor.n || descriptor;
			if ( typeof name !== 'string' ) {
				fragment = new StringFragment( {
					descriptor: name,
					root: this.root,
					owner: owner
				} );
				name = fragment.toString();
				fragment.teardown();
			}
			this.name = name;
			if ( descriptor.a ) {
				this.params = descriptor.a;
			} else if ( descriptor.d ) {
				fragment = new StringFragment( {
					descriptor: descriptor.d,
					root: this.root,
					owner: owner
				} );
				this.params = fragment.toArgsList();
				fragment.teardown();
			}
			this._fn = root.transitions[ name ];
			if ( !this._fn ) {
				errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#transitions';
				if ( root.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
				return;
			}
		};
		Transition.prototype = {
			init: init,
			getStyle: getStyle,
			setStyle: setStyle,
			animateStyle: animateStyle,
			processParams: processParams,
			resetStyle: resetStyle
		};
		return Transition;
	}( utils_warn, render_StringFragment__StringFragment, render_DomFragment_Element_shared_executeTransition_Transition_prototype_init, render_DomFragment_Element_shared_executeTransition_Transition_prototype_getStyle, render_DomFragment_Element_shared_executeTransition_Transition_prototype_setStyle, render_DomFragment_Element_shared_executeTransition_Transition_prototype_animateStyle__animateStyle, render_DomFragment_Element_shared_executeTransition_Transition_prototype_processParams, render_DomFragment_Element_shared_executeTransition_Transition_prototype_resetStyle );

	var render_DomFragment_Element_shared_executeTransition__executeTransition = function( runloop, Transition ) {

		return function( descriptor, ractive, owner, isIntro ) {
			var transition, node, oldTransition;
			if ( !ractive.transitionsEnabled || ractive._parent && !ractive._parent.transitionsEnabled ) {
				return;
			}
			transition = new Transition( descriptor, ractive, owner, isIntro );
			if ( transition._fn ) {
				node = transition.node;
				if ( oldTransition = node._ractive.transition ) {
					oldTransition.complete();
				}
				node._ractive.transition = transition;
				runloop.addTransition( transition );
			}
		};
	}( global_runloop, render_DomFragment_Element_shared_executeTransition_Transition__Transition );

	var render_DomFragment_Element_initialise__initialise = function( runloop, types, namespaces, create, defineProperty, warn, createElement, getInnerContext, getElementNamespace, createElementAttributes, appendElementChildren, decorate, addEventProxies, updateLiveQueries, executeTransition, enforceCase ) {

		return function initialiseElement( element, options, docFrag ) {
			var parentFragment, pNode, descriptor, namespace, name, attributes, width, height, loadHandler, root, selectBinding, errorMessage;
			element.type = types.ELEMENT;
			parentFragment = element.parentFragment = options.parentFragment;
			pNode = parentFragment.pNode;
			descriptor = element.descriptor = options.descriptor;
			element.parent = options.pElement;
			element.root = root = parentFragment.root;
			element.index = options.index;
			element.lcName = descriptor.e.toLowerCase();
			element.eventListeners = [];
			element.customEventListeners = [];
			element.cssDetachQueue = [];
			if ( pNode ) {
				namespace = element.namespace = getElementNamespace( descriptor, pNode );
				name = namespace !== namespaces.html ? enforceCase( descriptor.e ) : descriptor.e;
				element.node = createElement( name, namespace );
				if ( root.css && pNode === root.el ) {
					element.node.setAttribute( 'data-rvcguid', root.constructor._guid || root._guid );
				}
				defineProperty( element.node, '_ractive', {
					value: {
						proxy: element,
						keypath: getInnerContext( parentFragment ),
						index: parentFragment.indexRefs,
						events: create( null ),
						root: root
					}
				} );
			}
			attributes = createElementAttributes( element, descriptor.a );
			if ( descriptor.f ) {
				if ( element.node && element.node.getAttribute( 'contenteditable' ) ) {
					if ( element.node.innerHTML ) {
						errorMessage = 'A pre-populated contenteditable element should not have children';
						if ( root.debug ) {
							throw new Error( errorMessage );
						} else {
							warn( errorMessage );
						}
					}
				}
				appendElementChildren( element, element.node, descriptor, docFrag );
			}
			if ( docFrag && descriptor.v ) {
				addEventProxies( element, descriptor.v );
			}
			if ( docFrag ) {
				if ( root.twoway ) {
					element.bind();
					if ( element.node.getAttribute( 'contenteditable' ) && element.node._ractive.binding ) {
						element.node._ractive.binding.update();
					}
				}
				if ( attributes.name && !attributes.name.twoway ) {
					attributes.name.update();
				}
				if ( element.node.tagName === 'IMG' && ( ( width = element.attributes.width ) || ( height = element.attributes.height ) ) ) {
					element.node.addEventListener( 'load', loadHandler = function() {
						if ( width ) {
							element.node.width = width.value;
						}
						if ( height ) {
							element.node.height = height.value;
						}
						element.node.removeEventListener( 'load', loadHandler, false );
					}, false );
				}
				docFrag.appendChild( element.node );
				if ( descriptor.o ) {
					decorate( descriptor.o, root, element );
				}
				if ( descriptor.t1 ) {
					executeTransition( descriptor.t1, root, element, true );
				}
				if ( element.node.tagName === 'OPTION' ) {
					if ( pNode.tagName === 'SELECT' && ( selectBinding = pNode._ractive.binding ) ) {
						selectBinding.deferUpdate();
					}
					if ( element.node._ractive.value == pNode._ractive.value ) {
						element.node.selected = true;
					}
				}
				if ( element.node.autofocus ) {
					runloop.focus( element.node );
				}
			}
			if ( element.lcName === 'option' ) {
				element.select = findParentSelect( element.parent );
			}
			updateLiveQueries( element );
		};

		function findParentSelect( element ) {
			do {
				if ( element.lcName === 'select' ) {
					return element;
				}
			} while ( element = element.parent );
		}
	}( global_runloop, config_types, config_namespaces, utils_create, utils_defineProperty, utils_warn, utils_createElement, shared_getInnerContext, render_DomFragment_Element_initialise_getElementNamespace, render_DomFragment_Element_initialise_createElementAttributes, render_DomFragment_Element_initialise_appendElementChildren, render_DomFragment_Element_initialise_decorate__decorate, render_DomFragment_Element_initialise_addEventProxies__addEventProxies, render_DomFragment_Element_initialise_updateLiveQueries, render_DomFragment_Element_shared_executeTransition__executeTransition, render_DomFragment_shared_enforceCase );

	var render_DomFragment_Element_prototype_teardown = function( runloop, executeTransition ) {

		return function Element_prototype_teardown( destroy ) {
			var eventName, binding, bindings;
			if ( destroy ) {
				this.willDetach = true;
				runloop.detachWhenReady( this );
			}
			if ( this.fragment ) {
				this.fragment.teardown( false );
			}
			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
			if ( this.node ) {
				for ( eventName in this.node._ractive.events ) {
					this.node._ractive.events[ eventName ].teardown();
				}
				if ( binding = this.node._ractive.binding ) {
					binding.teardown();
					bindings = this.root._twowayBindings[ binding.attr.keypath ];
					bindings.splice( bindings.indexOf( binding ), 1 );
				}
			}
			if ( this.decorator ) {
				this.decorator.teardown();
			}
			if ( this.descriptor.t2 ) {
				executeTransition( this.descriptor.t2, this.root, this, false );
			}
			if ( this.liveQueries ) {
				removeFromLiveQueries( this );
			}
		};

		function removeFromLiveQueries( element ) {
			var query, selector, matchingStaticNodes, i, j;
			i = element.liveQueries.length;
			while ( i-- ) {
				query = element.liveQueries[ i ];
				selector = query.selector;
				query._remove( element.node );
				if ( element.matchingStaticNodes && ( matchingStaticNodes = element.matchingStaticNodes[ selector ] ) ) {
					j = matchingStaticNodes.length;
					while ( j-- ) {
						query.remove( matchingStaticNodes[ j ] );
					}
				}
			}
		}
	}( global_runloop, render_DomFragment_Element_shared_executeTransition__executeTransition );

	var config_voidElementNames = 'area base br col command doctype embed hr img input keygen link meta param source track wbr'.split( ' ' );

	var render_DomFragment_Element_prototype_toString = function( voidElementNames, isArray ) {

		return function() {
			var str, i, len, attrStr;
			str = '<' + ( this.descriptor.y ? '!doctype' : this.descriptor.e );
			len = this.attributes.length;
			for ( i = 0; i < len; i += 1 ) {
				if ( attrStr = this.attributes[ i ].toString() ) {
					str += ' ' + attrStr;
				}
			}
			if ( this.lcName === 'option' && optionIsSelected( this ) ) {
				str += ' selected';
			}
			if ( this.lcName === 'input' && inputIsCheckedRadio( this ) ) {
				str += ' checked';
			}
			str += '>';
			if ( this.html ) {
				str += this.html;
			} else if ( this.fragment ) {
				str += this.fragment.toString();
			}
			if ( voidElementNames.indexOf( this.descriptor.e ) === -1 ) {
				str += '</' + this.descriptor.e + '>';
			}
			this.stringifying = false;
			return str;
		};

		function optionIsSelected( element ) {
			var optionValue, selectValueAttribute, selectValueInterpolator, selectValue, i;
			optionValue = element.attributes.value.value;
			selectValueAttribute = element.select.attributes.value;
			selectValueInterpolator = selectValueAttribute.interpolator;
			if ( !selectValueInterpolator ) {
				return;
			}
			selectValue = element.root.get( selectValueInterpolator.keypath || selectValueInterpolator.ref );
			if ( selectValue == optionValue ) {
				return true;
			}
			if ( element.select.attributes.multiple && isArray( selectValue ) ) {
				i = selectValue.length;
				while ( i-- ) {
					if ( selectValue[ i ] == optionValue ) {
						return true;
					}
				}
			}
		}

		function inputIsCheckedRadio( element ) {
			var attributes, typeAttribute, valueAttribute, nameAttribute;
			attributes = element.attributes;
			typeAttribute = attributes.type;
			valueAttribute = attributes.value;
			nameAttribute = attributes.name;
			if ( !typeAttribute || typeAttribute.value !== 'radio' || !valueAttribute || !nameAttribute.interpolator ) {
				return;
			}
			if ( valueAttribute.value === nameAttribute.interpolator.value ) {
				return true;
			}
		}
	}( config_voidElementNames, utils_isArray );

	var render_DomFragment_Element_prototype_find = function( matches ) {

		return function( selector ) {
			var queryResult;
			if ( matches( this.node, selector ) ) {
				return this.node;
			}
			if ( this.html && ( queryResult = this.node.querySelector( selector ) ) ) {
				return queryResult;
			}
			if ( this.fragment && this.fragment.find ) {
				return this.fragment.find( selector );
			}
		};
	}( utils_matches );

	var render_DomFragment_Element_prototype_findAll = function( getMatchingStaticNodes ) {

		return function( selector, query ) {
			var matchingStaticNodes, matchedSelf;
			if ( query._test( this, true ) && query.live ) {
				( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
			}
			if ( this.html ) {
				matchingStaticNodes = getMatchingStaticNodes( this, selector );
				query.push.apply( query, matchingStaticNodes );
				if ( query.live && !matchedSelf ) {
					( this.liveQueries || ( this.liveQueries = [] ) ).push( query );
				}
			}
			if ( this.fragment ) {
				this.fragment.findAll( selector, query );
			}
		};
	}( render_DomFragment_Element_shared_getMatchingStaticNodes );

	var render_DomFragment_Element_prototype_findComponent = function( selector ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( selector );
		}
	};

	var render_DomFragment_Element_prototype_findAllComponents = function( selector, query ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( selector, query );
		}
	};

	var render_DomFragment_Element_prototype_bind = function() {
		var attributes = this.attributes;
		if ( !this.node ) {
			return;
		}
		if ( this.binding ) {
			this.binding.teardown();
			this.binding = null;
		}
		if ( this.node.getAttribute( 'contenteditable' ) && attributes.value && attributes.value.bind() ) {
			return;
		}
		switch ( this.descriptor.e ) {
			case 'select':
			case 'textarea':
				if ( attributes.value ) {
					attributes.value.bind();
				}
				return;
			case 'input':
				if ( this.node.type === 'radio' || this.node.type === 'checkbox' ) {
					if ( attributes.name && attributes.name.bind() ) {
						return;
					}
					if ( attributes.checked && attributes.checked.bind() ) {
						return;
					}
				}
				if ( attributes.value && attributes.value.bind() ) {
					return;
				}
		}
	};

	var render_DomFragment_Element__Element = function( runloop, css, initialise, teardown, toString, find, findAll, findComponent, findAllComponents, bind ) {

		var DomElement = function( options, docFrag ) {
			initialise( this, options, docFrag );
		};
		DomElement.prototype = {
			detach: function() {
				var Component;
				if ( this.node ) {
					if ( this.node.parentNode ) {
						this.node.parentNode.removeChild( this.node );
					}
					return this.node;
				}
				if ( this.cssDetachQueue.length ) {
					runloop.start();
					while ( Component === this.cssDetachQueue.pop() ) {
						css.remove( Component );
					}
					runloop.end();
				}
			},
			teardown: teardown,
			firstNode: function() {
				return this.node;
			},
			findNextNode: function() {
				return null;
			},
			bubble: function() {},
			toString: toString,
			find: find,
			findAll: findAll,
			findComponent: findComponent,
			findAllComponents: findAllComponents,
			bind: bind
		};
		return DomElement;
	}( global_runloop, global_css, render_DomFragment_Element_initialise__initialise, render_DomFragment_Element_prototype_teardown, render_DomFragment_Element_prototype_toString, render_DomFragment_Element_prototype_find, render_DomFragment_Element_prototype_findAll, render_DomFragment_Element_prototype_findComponent, render_DomFragment_Element_prototype_findAllComponents, render_DomFragment_Element_prototype_bind );

	var config_errors = {
		missingParser: 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser'
	};

	var registries_partials = {};

	var parse_utils_stripHtmlComments = function( html ) {
		var commentStart, commentEnd, processed;
		processed = '';
		while ( html.length ) {
			commentStart = html.indexOf( '<!--' );
			commentEnd = html.indexOf( '-->' );
			if ( commentStart === -1 && commentEnd === -1 ) {
				processed += html;
				break;
			}
			if ( commentStart !== -1 && commentEnd === -1 ) {
				throw 'Illegal HTML - expected closing comment sequence (\'-->\')';
			}
			if ( commentEnd !== -1 && commentStart === -1 || commentEnd < commentStart ) {
				throw 'Illegal HTML - unexpected closing comment sequence (\'-->\')';
			}
			processed += html.substr( 0, commentStart );
			html = html.substring( commentEnd + 3 );
		}
		return processed;
	};

	var parse_utils_stripStandalones = function( types ) {

		return function( tokens ) {
			var i, current, backOne, backTwo, leadingLinebreak, trailingLinebreak;
			leadingLinebreak = /^\s*\r?\n/;
			trailingLinebreak = /\r?\n\s*$/;
			for ( i = 2; i < tokens.length; i += 1 ) {
				current = tokens[ i ];
				backOne = tokens[ i - 1 ];
				backTwo = tokens[ i - 2 ];
				if ( current.type === types.TEXT && ( backOne.type === types.MUSTACHE && backOne.mustacheType !== types.PARTIAL ) && backTwo.type === types.TEXT ) {
					if ( trailingLinebreak.test( backTwo.value ) && leadingLinebreak.test( current.value ) ) {
						if ( backOne.mustacheType !== types.INTERPOLATOR && backOne.mustacheType !== types.TRIPLE ) {
							backTwo.value = backTwo.value.replace( trailingLinebreak, '\n' );
						}
						current.value = current.value.replace( leadingLinebreak, '' );
						if ( current.value === '' ) {
							tokens.splice( i--, 1 );
						}
					}
				}
			}
			return tokens;
		};
	}( config_types );

	var parse_utils_stripCommentTokens = function( types ) {

		return function( tokens ) {
			var i, current, previous, next;
			for ( i = 0; i < tokens.length; i += 1 ) {
				current = tokens[ i ];
				previous = tokens[ i - 1 ];
				next = tokens[ i + 1 ];
				if ( current.mustacheType === types.COMMENT || current.mustacheType === types.DELIMCHANGE ) {
					tokens.splice( i, 1 );
					if ( previous && next ) {
						if ( previous.type === types.TEXT && next.type === types.TEXT ) {
							previous.value += next.value;
							tokens.splice( i, 1 );
						}
					}
					i -= 1;
				}
			}
			return tokens;
		};
	}( config_types );

	var parse_Tokenizer_getMustache_getDelimiterChange = function( makeRegexMatcher ) {

		var getDelimiter = makeRegexMatcher( /^[^\s=]+/ );
		return function( tokenizer ) {
			var start, opening, closing;
			if ( !tokenizer.getStringMatch( '=' ) ) {
				return null;
			}
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			opening = getDelimiter( tokenizer );
			if ( !opening ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			closing = getDelimiter( tokenizer );
			if ( !closing ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( '=' ) ) {
				tokenizer.pos = start;
				return null;
			}
			return [
				opening,
				closing
			];
		};
	}( parse_Tokenizer_utils_makeRegexMatcher );

	var parse_Tokenizer_getMustache_getMustacheType = function( types ) {

		var mustacheTypes = {
			'#': types.SECTION,
			'^': types.INVERTED,
			'/': types.CLOSING,
			'>': types.PARTIAL,
			'!': types.COMMENT,
			'&': types.TRIPLE
		};
		return function( tokenizer ) {
			var type = mustacheTypes[ tokenizer.str.charAt( tokenizer.pos ) ];
			if ( !type ) {
				return null;
			}
			tokenizer.pos += 1;
			return type;
		};
	}( config_types );

	var parse_Tokenizer_getMustache_getMustacheContent = function( types, makeRegexMatcher, getMustacheType ) {

		var getIndexRef = makeRegexMatcher( /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/ ),
			arrayMember = /^[0-9][1-9]*$/;
		return function( tokenizer, isTriple ) {
			var start, mustache, type, expr, i, remaining, index, delimiter;
			start = tokenizer.pos;
			mustache = {
				type: isTriple ? types.TRIPLE : types.MUSTACHE
			};
			if ( !isTriple ) {
				if ( expr = tokenizer.getExpression() ) {
					mustache.mustacheType = types.INTERPOLATOR;
					tokenizer.allowWhitespace();
					if ( tokenizer.getStringMatch( tokenizer.delimiters[ 1 ] ) ) {
						tokenizer.pos -= tokenizer.delimiters[ 1 ].length;
					} else {
						tokenizer.pos = start;
						expr = null;
					}
				}
				if ( !expr ) {
					type = getMustacheType( tokenizer );
					if ( type === types.TRIPLE ) {
						mustache = {
							type: types.TRIPLE
						};
					} else {
						mustache.mustacheType = type || types.INTERPOLATOR;
					}
					if ( type === types.COMMENT || type === types.CLOSING ) {
						remaining = tokenizer.remaining();
						index = remaining.indexOf( tokenizer.delimiters[ 1 ] );
						if ( index !== -1 ) {
							mustache.ref = remaining.substr( 0, index );
							tokenizer.pos += index;
							return mustache;
						}
					}
				}
			}
			if ( !expr ) {
				tokenizer.allowWhitespace();
				expr = tokenizer.getExpression();
				remaining = tokenizer.remaining();
				delimiter = isTriple ? tokenizer.tripleDelimiters[ 1 ] : tokenizer.delimiters[ 1 ];
				if ( remaining.substr( 0, delimiter.length ) !== delimiter && remaining.charAt( 0 ) !== ':' ) {
					tokenizer.pos = start;
					remaining = tokenizer.remaining();
					index = remaining.indexOf( tokenizer.delimiters[ 1 ] );
					if ( index !== -1 ) {
						mustache.ref = remaining.substr( 0, index ).trim();
						tokenizer.pos += index;
						return mustache;
					}
				}
			}
			while ( expr.t === types.BRACKETED && expr.x ) {
				expr = expr.x;
			}
			if ( expr.t === types.REFERENCE ) {
				mustache.ref = expr.n;
			} else if ( expr.t === types.NUMBER_LITERAL && arrayMember.test( expr.v ) ) {
				mustache.ref = expr.v;
			} else {
				mustache.expression = expr;
			}
			i = getIndexRef( tokenizer );
			if ( i !== null ) {
				mustache.indexRef = i;
			}
			return mustache;
		};
	}( config_types, parse_Tokenizer_utils_makeRegexMatcher, parse_Tokenizer_getMustache_getMustacheType );

	var parse_Tokenizer_getMustache__getMustache = function( types, getDelimiterChange, getMustacheContent ) {

		return function() {
			var seekTripleFirst = this.tripleDelimiters[ 0 ].length > this.delimiters[ 0 ].length;
			return getMustache( this, seekTripleFirst ) || getMustache( this, !seekTripleFirst );
		};

		function getMustache( tokenizer, seekTriple ) {
			var start = tokenizer.pos,
				content, delimiters;
			delimiters = seekTriple ? tokenizer.tripleDelimiters : tokenizer.delimiters;
			if ( !tokenizer.getStringMatch( delimiters[ 0 ] ) ) {
				return null;
			}
			content = getDelimiterChange( tokenizer );
			if ( content ) {
				if ( !tokenizer.getStringMatch( delimiters[ 1 ] ) ) {
					tokenizer.pos = start;
					return null;
				}
				tokenizer[ seekTriple ? 'tripleDelimiters' : 'delimiters' ] = content;
				return {
					type: types.MUSTACHE,
					mustacheType: types.DELIMCHANGE
				};
			}
			tokenizer.allowWhitespace();
			content = getMustacheContent( tokenizer, seekTriple );
			if ( content === null ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( delimiters[ 1 ] ) ) {
				tokenizer.pos = start;
				return null;
			}
			return content;
		}
	}( config_types, parse_Tokenizer_getMustache_getDelimiterChange, parse_Tokenizer_getMustache_getMustacheContent );

	var parse_Tokenizer_getComment_getComment = function( types ) {

		return function() {
			var content, remaining, endIndex;
			if ( !this.getStringMatch( '<!--' ) ) {
				return null;
			}
			remaining = this.remaining();
			endIndex = remaining.indexOf( '-->' );
			if ( endIndex === -1 ) {
				throw new Error( 'Unexpected end of input (expected "-->" to close comment)' );
			}
			content = remaining.substr( 0, endIndex );
			this.pos += endIndex + 3;
			return {
				type: types.COMMENT,
				content: content
			};
		};
	}( config_types );

	var parse_Tokenizer_utils_getLowestIndex = function( haystack, needles ) {
		var i, index, lowest;
		i = needles.length;
		while ( i-- ) {
			index = haystack.indexOf( needles[ i ] );
			if ( !index ) {
				return 0;
			}
			if ( index === -1 ) {
				continue;
			}
			if ( !lowest || index < lowest ) {
				lowest = index;
			}
		}
		return lowest || -1;
	};

	var parse_Tokenizer_getTag__getTag = function( types, makeRegexMatcher, getLowestIndex ) {

		var getTag, getOpeningTag, getClosingTag, getTagName, getAttributes, getAttribute, getAttributeName, getAttributeValue, getUnquotedAttributeValue, getUnquotedAttributeValueToken, getUnquotedAttributeValueText, getQuotedStringToken, getQuotedAttributeValue;
		getTag = function() {
			return getOpeningTag( this ) || getClosingTag( this );
		};
		getOpeningTag = function( tokenizer ) {
			var start, tag, attrs, lowerCaseName;
			start = tokenizer.pos;
			if ( tokenizer.inside ) {
				return null;
			}
			if ( !tokenizer.getStringMatch( '<' ) ) {
				return null;
			}
			tag = {
				type: types.TAG
			};
			if ( tokenizer.getStringMatch( '!' ) ) {
				tag.doctype = true;
			}
			tag.name = getTagName( tokenizer );
			if ( !tag.name ) {
				tokenizer.pos = start;
				return null;
			}
			attrs = getAttributes( tokenizer );
			if ( attrs ) {
				tag.attrs = attrs;
			}
			tokenizer.allowWhitespace();
			if ( tokenizer.getStringMatch( '/' ) ) {
				tag.selfClosing = true;
			}
			if ( !tokenizer.getStringMatch( '>' ) ) {
				tokenizer.pos = start;
				return null;
			}
			lowerCaseName = tag.name.toLowerCase();
			if ( lowerCaseName === 'script' || lowerCaseName === 'style' ) {
				tokenizer.inside = lowerCaseName;
			}
			return tag;
		};
		getClosingTag = function( tokenizer ) {
			var start, tag, expected;
			start = tokenizer.pos;
			expected = function( str ) {
				throw new Error( 'Unexpected character ' + tokenizer.remaining().charAt( 0 ) + ' (expected ' + str + ')' );
			};
			if ( !tokenizer.getStringMatch( '<' ) ) {
				return null;
			}
			tag = {
				type: types.TAG,
				closing: true
			};
			if ( !tokenizer.getStringMatch( '/' ) ) {
				expected( '"/"' );
			}
			tag.name = getTagName( tokenizer );
			if ( !tag.name ) {
				expected( 'tag name' );
			}
			if ( !tokenizer.getStringMatch( '>' ) ) {
				expected( '">"' );
			}
			if ( tokenizer.inside ) {
				if ( tag.name.toLowerCase() !== tokenizer.inside ) {
					tokenizer.pos = start;
					return null;
				}
				tokenizer.inside = null;
			}
			return tag;
		};
		getTagName = makeRegexMatcher( /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/ );
		getAttributes = function( tokenizer ) {
			var start, attrs, attr;
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			attr = getAttribute( tokenizer );
			if ( !attr ) {
				tokenizer.pos = start;
				return null;
			}
			attrs = [];
			while ( attr !== null ) {
				attrs.push( attr );
				tokenizer.allowWhitespace();
				attr = getAttribute( tokenizer );
			}
			return attrs;
		};
		getAttribute = function( tokenizer ) {
			var attr, name, value;
			name = getAttributeName( tokenizer );
			if ( !name ) {
				return null;
			}
			attr = {
				name: name
			};
			value = getAttributeValue( tokenizer );
			if ( value ) {
				attr.value = value;
			}
			return attr;
		};
		getAttributeName = makeRegexMatcher( /^[^\s"'>\/=]+/ );
		getAttributeValue = function( tokenizer ) {
			var start, value;
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( '=' ) ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			value = getQuotedAttributeValue( tokenizer, '\'' ) || getQuotedAttributeValue( tokenizer, '"' ) || getUnquotedAttributeValue( tokenizer );
			if ( value === null ) {
				tokenizer.pos = start;
				return null;
			}
			return value;
		};
		getUnquotedAttributeValueText = makeRegexMatcher( /^[^\s"'=<>`]+/ );
		getUnquotedAttributeValueToken = function( tokenizer ) {
			var start, text, index;
			start = tokenizer.pos;
			text = getUnquotedAttributeValueText( tokenizer );
			if ( !text ) {
				return null;
			}
			if ( ( index = text.indexOf( tokenizer.delimiters[ 0 ] ) ) !== -1 ) {
				text = text.substr( 0, index );
				tokenizer.pos = start + text.length;
			}
			return {
				type: types.TEXT,
				value: text
			};
		};
		getUnquotedAttributeValue = function( tokenizer ) {
			var tokens, token;
			tokens = [];
			token = tokenizer.getMustache() || getUnquotedAttributeValueToken( tokenizer );
			while ( token !== null ) {
				tokens.push( token );
				token = tokenizer.getMustache() || getUnquotedAttributeValueToken( tokenizer );
			}
			if ( !tokens.length ) {
				return null;
			}
			return tokens;
		};
		getQuotedAttributeValue = function( tokenizer, quoteMark ) {
			var start, tokens, token;
			start = tokenizer.pos;
			if ( !tokenizer.getStringMatch( quoteMark ) ) {
				return null;
			}
			tokens = [];
			token = tokenizer.getMustache() || getQuotedStringToken( tokenizer, quoteMark );
			while ( token !== null ) {
				tokens.push( token );
				token = tokenizer.getMustache() || getQuotedStringToken( tokenizer, quoteMark );
			}
			if ( !tokenizer.getStringMatch( quoteMark ) ) {
				tokenizer.pos = start;
				return null;
			}
			return tokens;
		};
		getQuotedStringToken = function( tokenizer, quoteMark ) {
			var start, index, remaining;
			start = tokenizer.pos;
			remaining = tokenizer.remaining();
			index = getLowestIndex( remaining, [
				quoteMark,
				tokenizer.delimiters[ 0 ],
				tokenizer.delimiters[ 1 ]
			] );
			if ( index === -1 ) {
				throw new Error( 'Quoted attribute value must have a closing quote' );
			}
			if ( !index ) {
				return null;
			}
			tokenizer.pos += index;
			return {
				type: types.TEXT,
				value: remaining.substr( 0, index )
			};
		};
		return getTag;
	}( config_types, parse_Tokenizer_utils_makeRegexMatcher, parse_Tokenizer_utils_getLowestIndex );

	var parse_Tokenizer_getText__getText = function( types, getLowestIndex ) {

		return function() {
			var index, remaining, barrier;
			remaining = this.remaining();
			barrier = this.inside ? '</' + this.inside : '<';
			if ( this.inside && !this.interpolate[ this.inside ] ) {
				index = remaining.indexOf( barrier );
			} else {
				index = getLowestIndex( remaining, [
					barrier,
					this.delimiters[ 0 ],
					this.tripleDelimiters[ 0 ]
				] );
			}
			if ( !index ) {
				return null;
			}
			if ( index === -1 ) {
				index = remaining.length;
			}
			this.pos += index;
			return {
				type: types.TEXT,
				value: remaining.substr( 0, index )
			};
		};
	}( config_types, parse_Tokenizer_utils_getLowestIndex );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getBooleanLiteral = function( types ) {

		return function( tokenizer ) {
			var remaining = tokenizer.remaining();
			if ( remaining.substr( 0, 4 ) === 'true' ) {
				tokenizer.pos += 4;
				return {
					t: types.BOOLEAN_LITERAL,
					v: 'true'
				};
			}
			if ( remaining.substr( 0, 5 ) === 'false' ) {
				tokenizer.pos += 5;
				return {
					t: types.BOOLEAN_LITERAL,
					v: 'false'
				};
			}
			return null;
		};
	}( config_types );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getObjectLiteral_getKeyValuePair = function( types, getKey ) {

		return function( tokenizer ) {
			var start, key, value;
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			key = getKey( tokenizer );
			if ( key === null ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( ':' ) ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			value = tokenizer.getExpression();
			if ( value === null ) {
				tokenizer.pos = start;
				return null;
			}
			return {
				t: types.KEY_VALUE_PAIR,
				k: key,
				v: value
			};
		};
	}( config_types, parse_Tokenizer_getExpression_shared_getKey );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getObjectLiteral_getKeyValuePairs = function( getKeyValuePair ) {

		return function getKeyValuePairs( tokenizer ) {
			var start, pairs, pair, keyValuePairs;
			start = tokenizer.pos;
			pair = getKeyValuePair( tokenizer );
			if ( pair === null ) {
				return null;
			}
			pairs = [ pair ];
			if ( tokenizer.getStringMatch( ',' ) ) {
				keyValuePairs = getKeyValuePairs( tokenizer );
				if ( !keyValuePairs ) {
					tokenizer.pos = start;
					return null;
				}
				return pairs.concat( keyValuePairs );
			}
			return pairs;
		};
	}( parse_Tokenizer_getExpression_getPrimary_getLiteral_getObjectLiteral_getKeyValuePair );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getObjectLiteral__getObjectLiteral = function( types, getKeyValuePairs ) {

		return function( tokenizer ) {
			var start, keyValuePairs;
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( '{' ) ) {
				tokenizer.pos = start;
				return null;
			}
			keyValuePairs = getKeyValuePairs( tokenizer );
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( '}' ) ) {
				tokenizer.pos = start;
				return null;
			}
			return {
				t: types.OBJECT_LITERAL,
				m: keyValuePairs
			};
		};
	}( config_types, parse_Tokenizer_getExpression_getPrimary_getLiteral_getObjectLiteral_getKeyValuePairs );

	var parse_Tokenizer_getExpression_shared_getExpressionList = function getExpressionList( tokenizer ) {
		var start, expressions, expr, next;
		start = tokenizer.pos;
		tokenizer.allowWhitespace();
		expr = tokenizer.getExpression();
		if ( expr === null ) {
			return null;
		}
		expressions = [ expr ];
		tokenizer.allowWhitespace();
		if ( tokenizer.getStringMatch( ',' ) ) {
			next = getExpressionList( tokenizer );
			if ( next === null ) {
				tokenizer.pos = start;
				return null;
			}
			expressions = expressions.concat( next );
		}
		return expressions;
	};

	var parse_Tokenizer_getExpression_getPrimary_getLiteral_getArrayLiteral = function( types, getExpressionList ) {

		return function( tokenizer ) {
			var start, expressionList;
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( '[' ) ) {
				tokenizer.pos = start;
				return null;
			}
			expressionList = getExpressionList( tokenizer );
			if ( !tokenizer.getStringMatch( ']' ) ) {
				tokenizer.pos = start;
				return null;
			}
			return {
				t: types.ARRAY_LITERAL,
				m: expressionList
			};
		};
	}( config_types, parse_Tokenizer_getExpression_shared_getExpressionList );

	var parse_Tokenizer_getExpression_getPrimary_getLiteral__getLiteral = function( getNumberLiteral, getBooleanLiteral, getStringLiteral, getObjectLiteral, getArrayLiteral ) {

		return function( tokenizer ) {
			var literal = getNumberLiteral( tokenizer ) || getBooleanLiteral( tokenizer ) || getStringLiteral( tokenizer ) || getObjectLiteral( tokenizer ) || getArrayLiteral( tokenizer );
			return literal;
		};
	}( parse_Tokenizer_getExpression_getPrimary_getLiteral_getNumberLiteral, parse_Tokenizer_getExpression_getPrimary_getLiteral_getBooleanLiteral, parse_Tokenizer_getExpression_getPrimary_getLiteral_getStringLiteral__getStringLiteral, parse_Tokenizer_getExpression_getPrimary_getLiteral_getObjectLiteral__getObjectLiteral, parse_Tokenizer_getExpression_getPrimary_getLiteral_getArrayLiteral );

	var parse_Tokenizer_getExpression_getPrimary_getReference = function( types, makeRegexMatcher, getName ) {

		var getDotRefinement, getArrayRefinement, getArrayMember, globals;
		getDotRefinement = makeRegexMatcher( /^\.[a-zA-Z_$0-9]+/ );
		getArrayRefinement = function( tokenizer ) {
			var num = getArrayMember( tokenizer );
			if ( num ) {
				return '.' + num;
			}
			return null;
		};
		getArrayMember = makeRegexMatcher( /^\[(0|[1-9][0-9]*)\]/ );
		globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;
		return function( tokenizer ) {
			var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;
			startPos = tokenizer.pos;
			ancestor = '';
			while ( tokenizer.getStringMatch( '../' ) ) {
				ancestor += '../';
			}
			if ( !ancestor ) {
				dot = tokenizer.getStringMatch( '.' ) || '';
			}
			name = getName( tokenizer ) || '';
			if ( !ancestor && !dot && globals.test( name ) ) {
				return {
					t: types.GLOBAL,
					v: name
				};
			}
			if ( name === 'this' && !ancestor && !dot ) {
				name = '.';
				startPos += 3;
			}
			combo = ( ancestor || dot ) + name;
			if ( !combo ) {
				return null;
			}
			while ( refinement = getDotRefinement( tokenizer ) || getArrayRefinement( tokenizer ) ) {
				combo += refinement;
			}
			if ( tokenizer.getStringMatch( '(' ) ) {
				lastDotIndex = combo.lastIndexOf( '.' );
				if ( lastDotIndex !== -1 ) {
					combo = combo.substr( 0, lastDotIndex );
					tokenizer.pos = startPos + combo.length;
				} else {
					tokenizer.pos -= 1;
				}
			}
			return {
				t: types.REFERENCE,
				n: combo
			};
		};
	}( config_types, parse_Tokenizer_utils_makeRegexMatcher, parse_Tokenizer_getExpression_shared_getName );

	var parse_Tokenizer_getExpression_getPrimary_getBracketedExpression = function( types ) {

		return function( tokenizer ) {
			var start, expr;
			start = tokenizer.pos;
			if ( !tokenizer.getStringMatch( '(' ) ) {
				return null;
			}
			tokenizer.allowWhitespace();
			expr = tokenizer.getExpression();
			if ( !expr ) {
				tokenizer.pos = start;
				return null;
			}
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( ')' ) ) {
				tokenizer.pos = start;
				return null;
			}
			return {
				t: types.BRACKETED,
				x: expr
			};
		};
	}( config_types );

	var parse_Tokenizer_getExpression_getPrimary__getPrimary = function( getLiteral, getReference, getBracketedExpression ) {

		return function( tokenizer ) {
			return getLiteral( tokenizer ) || getReference( tokenizer ) || getBracketedExpression( tokenizer );
		};
	}( parse_Tokenizer_getExpression_getPrimary_getLiteral__getLiteral, parse_Tokenizer_getExpression_getPrimary_getReference, parse_Tokenizer_getExpression_getPrimary_getBracketedExpression );

	var parse_Tokenizer_getExpression_shared_getRefinement = function( types, getName ) {

		return function getRefinement( tokenizer ) {
			var start, name, expr;
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			if ( tokenizer.getStringMatch( '.' ) ) {
				tokenizer.allowWhitespace();
				if ( name = getName( tokenizer ) ) {
					return {
						t: types.REFINEMENT,
						n: name
					};
				}
				tokenizer.expected( 'a property name' );
			}
			if ( tokenizer.getStringMatch( '[' ) ) {
				tokenizer.allowWhitespace();
				expr = tokenizer.getExpression();
				if ( !expr ) {
					tokenizer.expected( 'an expression' );
				}
				tokenizer.allowWhitespace();
				if ( !tokenizer.getStringMatch( ']' ) ) {
					tokenizer.expected( '"]"' );
				}
				return {
					t: types.REFINEMENT,
					x: expr
				};
			}
			return null;
		};
	}( config_types, parse_Tokenizer_getExpression_shared_getName );

	var parse_Tokenizer_getExpression_getMemberOrInvocation = function( types, getPrimary, getExpressionList, getRefinement ) {

		return function( tokenizer ) {
			var current, expression, refinement, expressionList;
			expression = getPrimary( tokenizer );
			if ( !expression ) {
				return null;
			}
			while ( expression ) {
				current = tokenizer.pos;
				if ( refinement = getRefinement( tokenizer ) ) {
					expression = {
						t: types.MEMBER,
						x: expression,
						r: refinement
					};
				} else if ( tokenizer.getStringMatch( '(' ) ) {
					tokenizer.allowWhitespace();
					expressionList = getExpressionList( tokenizer );
					tokenizer.allowWhitespace();
					if ( !tokenizer.getStringMatch( ')' ) ) {
						tokenizer.pos = current;
						break;
					}
					expression = {
						t: types.INVOCATION,
						x: expression
					};
					if ( expressionList ) {
						expression.o = expressionList;
					}
				} else {
					break;
				}
			}
			return expression;
		};
	}( config_types, parse_Tokenizer_getExpression_getPrimary__getPrimary, parse_Tokenizer_getExpression_shared_getExpressionList, parse_Tokenizer_getExpression_shared_getRefinement );

	var parse_Tokenizer_getExpression_getTypeOf = function( types, getMemberOrInvocation ) {

		var getTypeOf, makePrefixSequenceMatcher;
		makePrefixSequenceMatcher = function( symbol, fallthrough ) {
			return function( tokenizer ) {
				var start, expression;
				if ( !tokenizer.getStringMatch( symbol ) ) {
					return fallthrough( tokenizer );
				}
				start = tokenizer.pos;
				tokenizer.allowWhitespace();
				expression = tokenizer.getExpression();
				if ( !expression ) {
					tokenizer.expected( 'an expression' );
				}
				return {
					s: symbol,
					o: expression,
					t: types.PREFIX_OPERATOR
				};
			};
		};
		( function() {
			var i, len, matcher, prefixOperators, fallthrough;
			prefixOperators = '! ~ + - typeof'.split( ' ' );
			fallthrough = getMemberOrInvocation;
			for ( i = 0, len = prefixOperators.length; i < len; i += 1 ) {
				matcher = makePrefixSequenceMatcher( prefixOperators[ i ], fallthrough );
				fallthrough = matcher;
			}
			getTypeOf = fallthrough;
		}() );
		return getTypeOf;
	}( config_types, parse_Tokenizer_getExpression_getMemberOrInvocation );

	var parse_Tokenizer_getExpression_getLogicalOr = function( types, getTypeOf ) {

		var getLogicalOr, makeInfixSequenceMatcher;
		makeInfixSequenceMatcher = function( symbol, fallthrough ) {
			return function( tokenizer ) {
				var start, left, right;
				left = fallthrough( tokenizer );
				if ( !left ) {
					return null;
				}
				while ( true ) {
					start = tokenizer.pos;
					tokenizer.allowWhitespace();
					if ( !tokenizer.getStringMatch( symbol ) ) {
						tokenizer.pos = start;
						return left;
					}
					if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( tokenizer.remaining().charAt( 0 ) ) ) {
						tokenizer.pos = start;
						return left;
					}
					tokenizer.allowWhitespace();
					right = fallthrough( tokenizer );
					if ( !right ) {
						tokenizer.pos = start;
						return left;
					}
					left = {
						t: types.INFIX_OPERATOR,
						s: symbol,
						o: [
							left,
							right
						]
					};
				}
			};
		};
		( function() {
			var i, len, matcher, infixOperators, fallthrough;
			infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );
			fallthrough = getTypeOf;
			for ( i = 0, len = infixOperators.length; i < len; i += 1 ) {
				matcher = makeInfixSequenceMatcher( infixOperators[ i ], fallthrough );
				fallthrough = matcher;
			}
			getLogicalOr = fallthrough;
		}() );
		return getLogicalOr;
	}( config_types, parse_Tokenizer_getExpression_getTypeOf );

	var parse_Tokenizer_getExpression_getConditional = function( types, getLogicalOr ) {

		return function( tokenizer ) {
			var start, expression, ifTrue, ifFalse;
			expression = getLogicalOr( tokenizer );
			if ( !expression ) {
				return null;
			}
			start = tokenizer.pos;
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( '?' ) ) {
				tokenizer.pos = start;
				return expression;
			}
			tokenizer.allowWhitespace();
			ifTrue = tokenizer.getExpression();
			if ( !ifTrue ) {
				tokenizer.pos = start;
				return expression;
			}
			tokenizer.allowWhitespace();
			if ( !tokenizer.getStringMatch( ':' ) ) {
				tokenizer.pos = start;
				return expression;
			}
			tokenizer.allowWhitespace();
			ifFalse = tokenizer.getExpression();
			if ( !ifFalse ) {
				tokenizer.pos = start;
				return expression;
			}
			return {
				t: types.CONDITIONAL,
				o: [
					expression,
					ifTrue,
					ifFalse
				]
			};
		};
	}( config_types, parse_Tokenizer_getExpression_getLogicalOr );

	var parse_Tokenizer_getExpression__getExpression = function( getConditional ) {

		return function() {
			return getConditional( this );
		};
	}( parse_Tokenizer_getExpression_getConditional );

	var parse_Tokenizer__Tokenizer = function( getMustache, getComment, getTag, getText, getExpression, allowWhitespace, getStringMatch ) {

		var Tokenizer;
		Tokenizer = function( str, options ) {
			var token;
			this.str = str;
			this.pos = 0;
			this.delimiters = options.delimiters;
			this.tripleDelimiters = options.tripleDelimiters;
			this.interpolate = options.interpolate;
			this.tokens = [];
			while ( this.pos < this.str.length ) {
				token = this.getToken();
				if ( token === null && this.remaining() ) {
					this.fail();
				}
				this.tokens.push( token );
			}
		};
		Tokenizer.prototype = {
			getToken: function() {
				var token = this.getMustache() || this.getComment() || this.getTag() || this.getText();
				return token;
			},
			getMustache: getMustache,
			getComment: getComment,
			getTag: getTag,
			getText: getText,
			getExpression: getExpression,
			allowWhitespace: allowWhitespace,
			getStringMatch: getStringMatch,
			remaining: function() {
				return this.str.substring( this.pos );
			},
			fail: function() {
				var last20, next20;
				last20 = this.str.substr( 0, this.pos ).substr( -20 );
				if ( last20.length === 20 ) {
					last20 = '...' + last20;
				}
				next20 = this.remaining().substr( 0, 20 );
				if ( next20.length === 20 ) {
					next20 = next20 + '...';
				}
				throw new Error( 'Could not parse template: ' + ( last20 ? last20 + '<- ' : '' ) + 'failed at character ' + this.pos + ' ->' + next20 );
			},
			expected: function( thing ) {
				var remaining = this.remaining().substr( 0, 40 );
				if ( remaining.length === 40 ) {
					remaining += '...';
				}
				throw new Error( 'Tokenizer failed: unexpected string "' + remaining + '" (expected ' + thing + ')' );
			}
		};
		return Tokenizer;
	}( parse_Tokenizer_getMustache__getMustache, parse_Tokenizer_getComment_getComment, parse_Tokenizer_getTag__getTag, parse_Tokenizer_getText__getText, parse_Tokenizer_getExpression__getExpression, parse_Tokenizer_utils_allowWhitespace, parse_Tokenizer_utils_getStringMatch );

	var parse_tokenize = function( initOptions, stripHtmlComments, stripStandalones, stripCommentTokens, Tokenizer ) {

		return function( template, options ) {
			var tokenizer, tokens;
			options = options || {};
			if ( options.stripComments !== false ) {
				template = stripHtmlComments( template );
			}
			tokenizer = new Tokenizer( template, {
				delimiters: options.delimiters || initOptions.defaults.delimiters,
				tripleDelimiters: options.tripleDelimiters || initOptions.defaults.tripleDelimiters,
				interpolate: {
					script: options.interpolateScripts !== false ? true : false,
					style: options.interpolateStyles !== false ? true : false
				}
			} );
			tokens = tokenizer.tokens;
			stripStandalones( tokens );
			stripCommentTokens( tokens );
			return tokens;
		};
	}( config_initOptions, parse_utils_stripHtmlComments, parse_utils_stripStandalones, parse_utils_stripCommentTokens, parse_Tokenizer__Tokenizer );

	var parse_Parser_getText_TextStub__TextStub = function( types ) {

		var TextStub, htmlEntities, controlCharacters, namedEntityPattern, hexEntityPattern, decimalEntityPattern, validateCode, decodeCharacterReferences, whitespace;
		TextStub = function( token, preserveWhitespace ) {
			this.text = preserveWhitespace ? token.value : token.value.replace( whitespace, ' ' );
		};
		TextStub.prototype = {
			type: types.TEXT,
			toJSON: function() {
				return this.decoded || ( this.decoded = decodeCharacterReferences( this.text ) );
			},
			toString: function() {
				return this.text;
			}
		};
		htmlEntities = {
			quot: 34,
			amp: 38,
			apos: 39,
			lt: 60,
			gt: 62,
			nbsp: 160,
			iexcl: 161,
			cent: 162,
			pound: 163,
			curren: 164,
			yen: 165,
			brvbar: 166,
			sect: 167,
			uml: 168,
			copy: 169,
			ordf: 170,
			laquo: 171,
			not: 172,
			shy: 173,
			reg: 174,
			macr: 175,
			deg: 176,
			plusmn: 177,
			sup2: 178,
			sup3: 179,
			acute: 180,
			micro: 181,
			para: 182,
			middot: 183,
			cedil: 184,
			sup1: 185,
			ordm: 186,
			raquo: 187,
			frac14: 188,
			frac12: 189,
			frac34: 190,
			iquest: 191,
			Agrave: 192,
			Aacute: 193,
			Acirc: 194,
			Atilde: 195,
			Auml: 196,
			Aring: 197,
			AElig: 198,
			Ccedil: 199,
			Egrave: 200,
			Eacute: 201,
			Ecirc: 202,
			Euml: 203,
			Igrave: 204,
			Iacute: 205,
			Icirc: 206,
			Iuml: 207,
			ETH: 208,
			Ntilde: 209,
			Ograve: 210,
			Oacute: 211,
			Ocirc: 212,
			Otilde: 213,
			Ouml: 214,
			times: 215,
			Oslash: 216,
			Ugrave: 217,
			Uacute: 218,
			Ucirc: 219,
			Uuml: 220,
			Yacute: 221,
			THORN: 222,
			szlig: 223,
			agrave: 224,
			aacute: 225,
			acirc: 226,
			atilde: 227,
			auml: 228,
			aring: 229,
			aelig: 230,
			ccedil: 231,
			egrave: 232,
			eacute: 233,
			ecirc: 234,
			euml: 235,
			igrave: 236,
			iacute: 237,
			icirc: 238,
			iuml: 239,
			eth: 240,
			ntilde: 241,
			ograve: 242,
			oacute: 243,
			ocirc: 244,
			otilde: 245,
			ouml: 246,
			divide: 247,
			oslash: 248,
			ugrave: 249,
			uacute: 250,
			ucirc: 251,
			uuml: 252,
			yacute: 253,
			thorn: 254,
			yuml: 255,
			OElig: 338,
			oelig: 339,
			Scaron: 352,
			scaron: 353,
			Yuml: 376,
			fnof: 402,
			circ: 710,
			tilde: 732,
			Alpha: 913,
			Beta: 914,
			Gamma: 915,
			Delta: 916,
			Epsilon: 917,
			Zeta: 918,
			Eta: 919,
			Theta: 920,
			Iota: 921,
			Kappa: 922,
			Lambda: 923,
			Mu: 924,
			Nu: 925,
			Xi: 926,
			Omicron: 927,
			Pi: 928,
			Rho: 929,
			Sigma: 931,
			Tau: 932,
			Upsilon: 933,
			Phi: 934,
			Chi: 935,
			Psi: 936,
			Omega: 937,
			alpha: 945,
			beta: 946,
			gamma: 947,
			delta: 948,
			epsilon: 949,
			zeta: 950,
			eta: 951,
			theta: 952,
			iota: 953,
			kappa: 954,
			lambda: 955,
			mu: 956,
			nu: 957,
			xi: 958,
			omicron: 959,
			pi: 960,
			rho: 961,
			sigmaf: 962,
			sigma: 963,
			tau: 964,
			upsilon: 965,
			phi: 966,
			chi: 967,
			psi: 968,
			omega: 969,
			thetasym: 977,
			upsih: 978,
			piv: 982,
			ensp: 8194,
			emsp: 8195,
			thinsp: 8201,
			zwnj: 8204,
			zwj: 8205,
			lrm: 8206,
			rlm: 8207,
			ndash: 8211,
			mdash: 8212,
			lsquo: 8216,
			rsquo: 8217,
			sbquo: 8218,
			ldquo: 8220,
			rdquo: 8221,
			bdquo: 8222,
			dagger: 8224,
			Dagger: 8225,
			bull: 8226,
			hellip: 8230,
			permil: 8240,
			prime: 8242,
			Prime: 8243,
			lsaquo: 8249,
			rsaquo: 8250,
			oline: 8254,
			frasl: 8260,
			euro: 8364,
			image: 8465,
			weierp: 8472,
			real: 8476,
			trade: 8482,
			alefsym: 8501,
			larr: 8592,
			uarr: 8593,
			rarr: 8594,
			darr: 8595,
			harr: 8596,
			crarr: 8629,
			lArr: 8656,
			uArr: 8657,
			rArr: 8658,
			dArr: 8659,
			hArr: 8660,
			forall: 8704,
			part: 8706,
			exist: 8707,
			empty: 8709,
			nabla: 8711,
			isin: 8712,
			notin: 8713,
			ni: 8715,
			prod: 8719,
			sum: 8721,
			minus: 8722,
			lowast: 8727,
			radic: 8730,
			prop: 8733,
			infin: 8734,
			ang: 8736,
			and: 8743,
			or: 8744,
			cap: 8745,
			cup: 8746,
			'int': 8747,
			there4: 8756,
			sim: 8764,
			cong: 8773,
			asymp: 8776,
			ne: 8800,
			equiv: 8801,
			le: 8804,
			ge: 8805,
			sub: 8834,
			sup: 8835,
			nsub: 8836,
			sube: 8838,
			supe: 8839,
			oplus: 8853,
			otimes: 8855,
			perp: 8869,
			sdot: 8901,
			lceil: 8968,
			rceil: 8969,
			lfloor: 8970,
			rfloor: 8971,
			lang: 9001,
			rang: 9002,
			loz: 9674,
			spades: 9824,
			clubs: 9827,
			hearts: 9829,
			diams: 9830
		};
		controlCharacters = [
			8364,
			129,
			8218,
			402,
			8222,
			8230,
			8224,
			8225,
			710,
			8240,
			352,
			8249,
			338,
			141,
			381,
			143,
			144,
			8216,
			8217,
			8220,
			8221,
			8226,
			8211,
			8212,
			732,
			8482,
			353,
			8250,
			339,
			157,
			382,
			376
		];
		namedEntityPattern = new RegExp( '&(' + Object.keys( htmlEntities ).join( '|' ) + ');?', 'g' );
		hexEntityPattern = /&#x([0-9]+);?/g;
		decimalEntityPattern = /&#([0-9]+);?/g;
		validateCode = function( code ) {
			if ( !code ) {
				return 65533;
			}
			if ( code === 10 ) {
				return 32;
			}
			if ( code < 128 ) {
				return code;
			}
			if ( code <= 159 ) {
				return controlCharacters[ code - 128 ];
			}
			if ( code < 55296 ) {
				return code;
			}
			if ( code <= 57343 ) {
				return 65533;
			}
			if ( code <= 65535 ) {
				return code;
			}
			return 65533;
		};
		decodeCharacterReferences = function( html ) {
			var result;
			result = html.replace( namedEntityPattern, function( match, name ) {
				if ( htmlEntities[ name ] ) {
					return String.fromCharCode( htmlEntities[ name ] );
				}
				return match;
			} );
			result = result.replace( hexEntityPattern, function( match, hex ) {
				return String.fromCharCode( validateCode( parseInt( hex, 16 ) ) );
			} );
			result = result.replace( decimalEntityPattern, function( match, charCode ) {
				return String.fromCharCode( validateCode( charCode ) );
			} );
			return result;
		};
		whitespace = /\s+/g;
		return TextStub;
	}( config_types );

	var parse_Parser_getText__getText = function( types, TextStub ) {

		return function( token, preserveWhitespace ) {
			if ( token.type === types.TEXT ) {
				this.pos += 1;
				return new TextStub( token, preserveWhitespace );
			}
			return null;
		};
	}( config_types, parse_Parser_getText_TextStub__TextStub );

	var parse_Parser_getComment_CommentStub__CommentStub = function( types ) {

		var CommentStub;
		CommentStub = function( token ) {
			this.content = token.content;
		};
		CommentStub.prototype = {
			toJSON: function() {
				return {
					t: types.COMMENT,
					f: this.content
				};
			},
			toString: function() {
				return '<!--' + this.content + '-->';
			}
		};
		return CommentStub;
	}( config_types );

	var parse_Parser_getComment__getComment = function( types, CommentStub ) {

		return function( token ) {
			if ( token.type === types.COMMENT ) {
				this.pos += 1;
				return new CommentStub( token, this.preserveWhitespace );
			}
			return null;
		};
	}( config_types, parse_Parser_getComment_CommentStub__CommentStub );

	var parse_Parser_getMustache_ExpressionStub__ExpressionStub = function( types, isObject ) {

		var ExpressionStub = function( token ) {
			this.refs = [];
			getRefs( token, this.refs );
			this.str = stringify( token, this.refs );
		};
		ExpressionStub.prototype = {
			toJSON: function() {
				if ( this.json ) {
					return this.json;
				}
				this.json = {
					r: this.refs,
					s: this.str
				};
				return this.json;
			}
		};
		return ExpressionStub;

		function quoteStringLiteral( str ) {
			return JSON.stringify( String( str ) );
		}

		function getRefs( token, refs ) {
			var i, list;
			if ( token.t === types.REFERENCE ) {
				if ( refs.indexOf( token.n ) === -1 ) {
					refs.unshift( token.n );
				}
			}
			list = token.o || token.m;
			if ( list ) {
				if ( isObject( list ) ) {
					getRefs( list, refs );
				} else {
					i = list.length;
					while ( i-- ) {
						getRefs( list[ i ], refs );
					}
				}
			}
			if ( token.x ) {
				getRefs( token.x, refs );
			}
			if ( token.r ) {
				getRefs( token.r, refs );
			}
			if ( token.v ) {
				getRefs( token.v, refs );
			}
		}

		function stringify( token, refs ) {
			var map = function( item ) {
				return stringify( item, refs );
			};
			switch ( token.t ) {
				case types.BOOLEAN_LITERAL:
				case types.GLOBAL:
				case types.NUMBER_LITERAL:
					return token.v;
				case types.STRING_LITERAL:
					return quoteStringLiteral( token.v );
				case types.ARRAY_LITERAL:
					return '[' + ( token.m ? token.m.map( map ).join( ',' ) : '' ) + ']';
				case types.OBJECT_LITERAL:
					return '{' + ( token.m ? token.m.map( map ).join( ',' ) : '' ) + '}';
				case types.KEY_VALUE_PAIR:
					return token.k + ':' + stringify( token.v, refs );
				case types.PREFIX_OPERATOR:
					return ( token.s === 'typeof' ? 'typeof ' : token.s ) + stringify( token.o, refs );
				case types.INFIX_OPERATOR:
					return stringify( token.o[ 0 ], refs ) + ( token.s.substr( 0, 2 ) === 'in' ? ' ' + token.s + ' ' : token.s ) + stringify( token.o[ 1 ], refs );
				case types.INVOCATION:
					return stringify( token.x, refs ) + '(' + ( token.o ? token.o.map( map ).join( ',' ) : '' ) + ')';
				case types.BRACKETED:
					return '(' + stringify( token.x, refs ) + ')';
				case types.MEMBER:
					return stringify( token.x, refs ) + stringify( token.r, refs );
				case types.REFINEMENT:
					return token.n ? '.' + token.n : '[' + stringify( token.x, refs ) + ']';
				case types.CONDITIONAL:
					return stringify( token.o[ 0 ], refs ) + '?' + stringify( token.o[ 1 ], refs ) + ':' + stringify( token.o[ 2 ], refs );
				case types.REFERENCE:
					return '${' + refs.indexOf( token.n ) + '}';
				default:
					throw new Error( 'Could not stringify expression token. This error is unexpected' );
			}
		}
	}( config_types, utils_isObject );

	var parse_Parser_getMustache_MustacheStub__MustacheStub = function( types, ExpressionStub ) {

		var MustacheStub = function( token, parser ) {
			this.type = token.type === types.TRIPLE ? types.TRIPLE : token.mustacheType;
			if ( token.ref ) {
				this.ref = token.ref;
			}
			if ( token.expression ) {
				this.expr = new ExpressionStub( token.expression );
			}
			parser.pos += 1;
		};
		MustacheStub.prototype = {
			toJSON: function() {
				var json;
				if ( this.json ) {
					return this.json;
				}
				json = {
					t: this.type
				};
				if ( this.ref ) {
					json.r = this.ref;
				}
				if ( this.expr ) {
					json.x = this.expr.toJSON();
				}
				this.json = json;
				return json;
			},
			toString: function() {
				return false;
			}
		};
		return MustacheStub;
	}( config_types, parse_Parser_getMustache_ExpressionStub__ExpressionStub );

	var parse_Parser_utils_stringifyStubs = function( items ) {
		var str = '',
			itemStr, i, len;
		if ( !items ) {
			return '';
		}
		for ( i = 0, len = items.length; i < len; i += 1 ) {
			itemStr = items[ i ].toString();
			if ( itemStr === false ) {
				return false;
			}
			str += itemStr;
		}
		return str;
	};

	var parse_Parser_utils_jsonifyStubs = function( stringifyStubs ) {

		return function( items, noStringify, topLevel ) {
			var str, json;
			if ( !topLevel && !noStringify ) {
				str = stringifyStubs( items );
				if ( str !== false ) {
					return str;
				}
			}
			json = items.map( function( item ) {
				return item.toJSON( noStringify );
			} );
			return json;
		};
	}( parse_Parser_utils_stringifyStubs );

	var parse_Parser_getMustache_SectionStub__SectionStub = function( types, normaliseKeypath, jsonifyStubs, ExpressionStub ) {

		var SectionStub = function( firstToken, parser ) {
			var next;
			this.ref = firstToken.ref;
			this.indexRef = firstToken.indexRef;
			this.inverted = firstToken.mustacheType === types.INVERTED;
			if ( firstToken.expression ) {
				this.expr = new ExpressionStub( firstToken.expression );
			}
			parser.pos += 1;
			this.items = [];
			next = parser.next();
			while ( next ) {
				if ( next.mustacheType === types.CLOSING ) {
					if ( normaliseKeypath( next.ref.trim() ) === this.ref || this.expr ) {
						parser.pos += 1;
						break;
					} else {
						throw new Error( 'Could not parse template: Illegal closing section' );
					}
				}
				this.items.push( parser.getStub() );
				next = parser.next();
			}
		};
		SectionStub.prototype = {
			toJSON: function( noStringify ) {
				var json;
				if ( this.json ) {
					return this.json;
				}
				json = {
					t: types.SECTION
				};
				if ( this.ref ) {
					json.r = this.ref;
				}
				if ( this.indexRef ) {
					json.i = this.indexRef;
				}
				if ( this.inverted ) {
					json.n = true;
				}
				if ( this.expr ) {
					json.x = this.expr.toJSON();
				}
				if ( this.items.length ) {
					json.f = jsonifyStubs( this.items, noStringify );
				}
				this.json = json;
				return json;
			},
			toString: function() {
				return false;
			}
		};
		return SectionStub;
	}( config_types, utils_normaliseKeypath, parse_Parser_utils_jsonifyStubs, parse_Parser_getMustache_ExpressionStub__ExpressionStub );

	var parse_Parser_getMustache__getMustache = function( types, MustacheStub, SectionStub ) {

		return function( token ) {
			if ( token.type === types.MUSTACHE || token.type === types.TRIPLE ) {
				if ( token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED ) {
					return new SectionStub( token, this );
				}
				return new MustacheStub( token, this );
			}
		};
	}( config_types, parse_Parser_getMustache_MustacheStub__MustacheStub, parse_Parser_getMustache_SectionStub__SectionStub );

	var parse_Parser_getElement_ElementStub_utils_siblingsByTagName = {
		li: [ 'li' ],
		dt: [
			'dt',
			'dd'
		],
		dd: [
			'dt',
			'dd'
		],
		p: 'address article aside blockquote dir div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr menu nav ol p pre section table ul'.split( ' ' ),
		rt: [
			'rt',
			'rp'
		],
		rp: [
			'rp',
			'rt'
		],
		optgroup: [ 'optgroup' ],
		option: [
			'option',
			'optgroup'
		],
		thead: [
			'tbody',
			'tfoot'
		],
		tbody: [
			'tbody',
			'tfoot'
		],
		tr: [ 'tr' ],
		td: [
			'td',
			'th'
		],
		th: [
			'td',
			'th'
		]
	};

	var parse_Parser_getElement_ElementStub_utils_filterAttributes = function( isArray ) {

		return function( items ) {
			var attrs, proxies, filtered, i, len, item;
			filtered = {};
			attrs = [];
			proxies = [];
			len = items.length;
			for ( i = 0; i < len; i += 1 ) {
				item = items[ i ];
				if ( item.name === 'intro' ) {
					if ( filtered.intro ) {
						throw new Error( 'An element can only have one intro transition' );
					}
					filtered.intro = item;
				} else if ( item.name === 'outro' ) {
					if ( filtered.outro ) {
						throw new Error( 'An element can only have one outro transition' );
					}
					filtered.outro = item;
				} else if ( item.name === 'intro-outro' ) {
					if ( filtered.intro || filtered.outro ) {
						throw new Error( 'An element can only have one intro and one outro transition' );
					}
					filtered.intro = item;
					filtered.outro = deepClone( item );
				} else if ( item.name.substr( 0, 6 ) === 'proxy-' ) {
					item.name = item.name.substring( 6 );
					proxies.push( item );
				} else if ( item.name.substr( 0, 3 ) === 'on-' ) {
					item.name = item.name.substring( 3 );
					proxies.push( item );
				} else if ( item.name === 'decorator' ) {
					filtered.decorator = item;
				} else {
					attrs.push( item );
				}
			}
			filtered.attrs = attrs;
			filtered.proxies = proxies;
			return filtered;
		};

		function deepClone( obj ) {
			var result, key;
			if ( typeof obj !== 'object' ) {
				return obj;
			}
			if ( isArray( obj ) ) {
				return obj.map( deepClone );
			}
			result = {};
			for ( key in obj ) {
				if ( obj.hasOwnProperty( key ) ) {
					result[ key ] = deepClone( obj[ key ] );
				}
			}
			return result;
		}
	}( utils_isArray );

	var parse_Parser_getElement_ElementStub_utils_processDirective = function( types, parseJSON ) {

		return function( directive ) {
			var processed, tokens, token, colonIndex, throwError, directiveName, directiveArgs, parsed;
			throwError = function() {
				throw new Error( 'Illegal directive' );
			};
			if ( !directive.name || !directive.value ) {
				throwError();
			}
			processed = {
				directiveType: directive.name
			};
			tokens = directive.value;
			directiveName = [];
			directiveArgs = [];
			while ( tokens.length ) {
				token = tokens.shift();
				if ( token.type === types.TEXT ) {
					colonIndex = token.value.indexOf( ':' );
					if ( colonIndex === -1 ) {
						directiveName.push( token );
					} else {
						if ( colonIndex ) {
							directiveName.push( {
								type: types.TEXT,
								value: token.value.substr( 0, colonIndex )
							} );
						}
						if ( token.value.length > colonIndex + 1 ) {
							directiveArgs[ 0 ] = {
								type: types.TEXT,
								value: token.value.substring( colonIndex + 1 )
							};
						}
						break;
					}
				} else {
					directiveName.push( token );
				}
			}
			directiveArgs = directiveArgs.concat( tokens );
			if ( directiveName.length === 1 && directiveName[ 0 ].type === types.TEXT ) {
				processed.name = directiveName[ 0 ].value;
			} else {
				processed.name = directiveName;
			}
			if ( directiveArgs.length ) {
				if ( directiveArgs.length === 1 && directiveArgs[ 0 ].type === types.TEXT ) {
					parsed = parseJSON( '[' + directiveArgs[ 0 ].value + ']' );
					processed.args = parsed ? parsed.value : directiveArgs[ 0 ].value;
				} else {
					processed.dynamicArgs = directiveArgs;
				}
			}
			return processed;
		};
	}( config_types, utils_parseJSON );

	var parse_Parser_StringStub_StringParser = function( getText, getMustache ) {

		var StringParser;
		StringParser = function( tokens, options ) {
			var stub;
			this.tokens = tokens || [];
			this.pos = 0;
			this.options = options;
			this.result = [];
			while ( stub = this.getStub() ) {
				this.result.push( stub );
			}
		};
		StringParser.prototype = {
			getStub: function() {
				var token = this.next();
				if ( !token ) {
					return null;
				}
				return this.getText( token ) || this.getMustache( token );
			},
			getText: getText,
			getMustache: getMustache,
			next: function() {
				return this.tokens[ this.pos ];
			}
		};
		return StringParser;
	}( parse_Parser_getText__getText, parse_Parser_getMustache__getMustache );

	var parse_Parser_StringStub__StringStub = function( StringParser, stringifyStubs, jsonifyStubs ) {

		var StringStub;
		StringStub = function( tokens ) {
			var parser = new StringParser( tokens );
			this.stubs = parser.result;
		};
		StringStub.prototype = {
			toJSON: function( noStringify ) {
				var json;
				if ( this[ 'json_' + noStringify ] ) {
					return this[ 'json_' + noStringify ];
				}
				json = this[ 'json_' + noStringify ] = jsonifyStubs( this.stubs, noStringify );
				return json;
			},
			toString: function() {
				if ( this.str !== undefined ) {
					return this.str;
				}
				this.str = stringifyStubs( this.stubs );
				return this.str;
			}
		};
		return StringStub;
	}( parse_Parser_StringStub_StringParser, parse_Parser_utils_stringifyStubs, parse_Parser_utils_jsonifyStubs );

	var parse_Parser_getElement_ElementStub_utils_jsonifyDirective = function( StringStub ) {

		return function( directive ) {
			var result, name;
			if ( typeof directive.name === 'string' ) {
				if ( !directive.args && !directive.dynamicArgs ) {
					return directive.name;
				}
				name = directive.name;
			} else {
				name = new StringStub( directive.name ).toJSON();
			}
			result = {
				n: name
			};
			if ( directive.args ) {
				result.a = directive.args;
				return result;
			}
			if ( directive.dynamicArgs ) {
				result.d = new StringStub( directive.dynamicArgs ).toJSON();
			}
			return result;
		};
	}( parse_Parser_StringStub__StringStub );

	var parse_Parser_getElement_ElementStub_toJSON = function( types, jsonifyStubs, jsonifyDirective ) {

		return function( noStringify ) {
			var json, name, value, proxy, i, len, attribute;
			if ( this[ 'json_' + noStringify ] ) {
				return this[ 'json_' + noStringify ];
			}
			json = {
				t: types.ELEMENT,
				e: this.tag
			};
			if ( this.doctype ) {
				json.y = 1;
			}
			if ( this.attributes && this.attributes.length ) {
				json.a = {};
				len = this.attributes.length;
				for ( i = 0; i < len; i += 1 ) {
					attribute = this.attributes[ i ];
					name = attribute.name;
					if ( json.a[ name ] ) {
						throw new Error( 'You cannot have multiple attributes with the same name' );
					}
					if ( attribute.value === null ) {
						value = null;
					} else {
						value = attribute.value.toJSON( noStringify );
					}
					json.a[ name ] = value;
				}
			}
			if ( this.items && this.items.length ) {
				json.f = jsonifyStubs( this.items, noStringify );
			}
			if ( this.proxies && this.proxies.length ) {
				json.v = {};
				len = this.proxies.length;
				for ( i = 0; i < len; i += 1 ) {
					proxy = this.proxies[ i ];
					json.v[ proxy.directiveType ] = jsonifyDirective( proxy );
				}
			}
			if ( this.intro ) {
				json.t1 = jsonifyDirective( this.intro );
			}
			if ( this.outro ) {
				json.t2 = jsonifyDirective( this.outro );
			}
			if ( this.decorator ) {
				json.o = jsonifyDirective( this.decorator );
			}
			this[ 'json_' + noStringify ] = json;
			return json;
		};
	}( config_types, parse_Parser_utils_jsonifyStubs, parse_Parser_getElement_ElementStub_utils_jsonifyDirective );

	var parse_Parser_getElement_ElementStub_toString = function( stringifyStubs, voidElementNames ) {

		var htmlElements;
		htmlElements = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split( ' ' );
		return function() {
			var str, i, len, attrStr, name, attrValueStr, fragStr, isVoid;
			if ( this.str !== undefined ) {
				return this.str;
			}
			if ( htmlElements.indexOf( this.tag.toLowerCase() ) === -1 ) {
				return this.str = false;
			}
			if ( this.proxies || this.intro || this.outro || this.decorator ) {
				return this.str = false;
			}
			fragStr = stringifyStubs( this.items );
			if ( fragStr === false ) {
				return this.str = false;
			}
			isVoid = voidElementNames.indexOf( this.tag.toLowerCase() ) !== -1;
			str = '<' + this.tag;
			if ( this.attributes ) {
				for ( i = 0, len = this.attributes.length; i < len; i += 1 ) {
					name = this.attributes[ i ].name;
					if ( name.indexOf( ':' ) !== -1 ) {
						return this.str = false;
					}
					if ( name === 'id' || name === 'intro' || name === 'outro' ) {
						return this.str = false;
					}
					attrStr = ' ' + name;
					if ( this.attributes[ i ].value !== null ) {
						attrValueStr = this.attributes[ i ].value.toString();
						if ( attrValueStr === false ) {
							return this.str = false;
						}
						if ( attrValueStr !== '' ) {
							attrStr += '=';
							if ( /[\s"'=<>`]/.test( attrValueStr ) ) {
								attrStr += '"' + attrValueStr.replace( /"/g, '&quot;' ) + '"';
							} else {
								attrStr += attrValueStr;
							}
						}
					}
					str += attrStr;
				}
			}
			if ( this.selfClosing && !isVoid ) {
				str += '/>';
				return this.str = str;
			}
			str += '>';
			if ( isVoid ) {
				return this.str = str;
			}
			str += fragStr;
			str += '</' + this.tag + '>';
			return this.str = str;
		};
	}( parse_Parser_utils_stringifyStubs, config_voidElementNames );

	var parse_Parser_getElement_ElementStub__ElementStub = function( types, voidElementNames, warn, siblingsByTagName, filterAttributes, processDirective, toJSON, toString, StringStub ) {

		var ElementStub, allElementNames, closedByParentClose, onPattern, sanitize, leadingWhitespace = /^\s+/,
			trailingWhitespace = /\s+$/;
		ElementStub = function( firstToken, parser, preserveWhitespace ) {
			var next, attrs, filtered, proxies, item, getFrag, lowerCaseTag;
			parser.pos += 1;
			getFrag = function( attr ) {
				return {
					name: attr.name,
					value: attr.value ? new StringStub( attr.value ) : null
				};
			};
			this.tag = firstToken.name;
			lowerCaseTag = firstToken.name.toLowerCase();
			if ( lowerCaseTag.substr( 0, 3 ) === 'rv-' ) {
				warn( 'The "rv-" prefix for components has been deprecated. Support will be removed in a future version' );
				this.tag = this.tag.substring( 3 );
			}
			preserveWhitespace = preserveWhitespace || lowerCaseTag === 'pre' || lowerCaseTag === 'style' || lowerCaseTag === 'script';
			if ( firstToken.attrs ) {
				filtered = filterAttributes( firstToken.attrs );
				attrs = filtered.attrs;
				proxies = filtered.proxies;
				if ( parser.options.sanitize && parser.options.sanitize.eventAttributes ) {
					attrs = attrs.filter( sanitize );
				}
				if ( attrs.length ) {
					this.attributes = attrs.map( getFrag );
				}
				if ( proxies.length ) {
					this.proxies = proxies.map( processDirective );
				}
				if ( filtered.intro ) {
					this.intro = processDirective( filtered.intro );
				}
				if ( filtered.outro ) {
					this.outro = processDirective( filtered.outro );
				}
				if ( filtered.decorator ) {
					this.decorator = processDirective( filtered.decorator );
				}
			}
			if ( firstToken.doctype ) {
				this.doctype = true;
			}
			if ( firstToken.selfClosing ) {
				this.selfClosing = true;
			}
			if ( voidElementNames.indexOf( lowerCaseTag ) !== -1 ) {
				this.isVoid = true;
			}
			if ( this.selfClosing || this.isVoid ) {
				return;
			}
			this.siblings = siblingsByTagName[ lowerCaseTag ];
			this.items = [];
			next = parser.next();
			while ( next ) {
				if ( next.mustacheType === types.CLOSING ) {
					break;
				}
				if ( next.type === types.TAG ) {
					if ( next.closing ) {
						if ( next.name.toLowerCase() === lowerCaseTag ) {
							parser.pos += 1;
						}
						break;
					} else if ( this.siblings && this.siblings.indexOf( next.name.toLowerCase() ) !== -1 ) {
						break;
					}
				}
				this.items.push( parser.getStub( preserveWhitespace ) );
				next = parser.next();
			}
			if ( !preserveWhitespace ) {
				item = this.items[ 0 ];
				if ( item && item.type === types.TEXT ) {
					item.text = item.text.replace( leadingWhitespace, '' );
					if ( !item.text ) {
						this.items.shift();
					}
				}
				item = this.items[ this.items.length - 1 ];
				if ( item && item.type === types.TEXT ) {
					item.text = item.text.replace( trailingWhitespace, '' );
					if ( !item.text ) {
						this.items.pop();
					}
				}
			}
		};
		ElementStub.prototype = {
			toJSON: toJSON,
			toString: toString
		};
		allElementNames = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split( ' ' );
		closedByParentClose = 'li dd rt rp optgroup option tbody tfoot tr td th'.split( ' ' );
		onPattern = /^on[a-zA-Z]/;
		sanitize = function( attr ) {
			var valid = !onPattern.test( attr.name );
			return valid;
		};
		return ElementStub;
	}( config_types, config_voidElementNames, utils_warn, parse_Parser_getElement_ElementStub_utils_siblingsByTagName, parse_Parser_getElement_ElementStub_utils_filterAttributes, parse_Parser_getElement_ElementStub_utils_processDirective, parse_Parser_getElement_ElementStub_toJSON, parse_Parser_getElement_ElementStub_toString, parse_Parser_StringStub__StringStub );

	var parse_Parser_getElement__getElement = function( types, ElementStub ) {

		return function( token ) {
			if ( this.options.sanitize && this.options.sanitize.elements ) {
				if ( this.options.sanitize.elements.indexOf( token.name.toLowerCase() ) !== -1 ) {
					return null;
				}
			}
			return new ElementStub( token, this, this.preserveWhitespace );
		};
	}( config_types, parse_Parser_getElement_ElementStub__ElementStub );

	var parse_Parser__Parser = function( getText, getComment, getMustache, getElement, jsonifyStubs ) {

		var Parser;
		Parser = function( tokens, options ) {
			var stub, stubs;
			this.tokens = tokens || [];
			this.pos = 0;
			this.options = options;
			this.preserveWhitespace = options.preserveWhitespace;
			stubs = [];
			while ( stub = this.getStub() ) {
				stubs.push( stub );
			}
			this.result = jsonifyStubs( stubs, options.noStringify, true );
		};
		Parser.prototype = {
			getStub: function( preserveWhitespace ) {
				var token = this.next();
				if ( !token ) {
					return null;
				}
				return this.getText( token, this.preserveWhitespace || preserveWhitespace ) || this.getComment( token ) || this.getMustache( token ) || this.getElement( token );
			},
			getText: getText,
			getComment: getComment,
			getMustache: getMustache,
			getElement: getElement,
			next: function() {
				return this.tokens[ this.pos ];
			}
		};
		return Parser;
	}( parse_Parser_getText__getText, parse_Parser_getComment__getComment, parse_Parser_getMustache__getMustache, parse_Parser_getElement__getElement, parse_Parser_utils_jsonifyStubs );

	// Ractive.parse
	// ===============
	//
	// Takes in a string, and returns an object representing the parsed template.
	// A parsed template is an array of 1 or more 'descriptors', which in some
	// cases have children.
	//
	// The format is optimised for size, not readability, however for reference the
	// keys for each descriptor are as follows:
	//
	// * r - Reference, e.g. 'mustache' in {{mustache}}
	// * t - Type code (e.g. 1 is text, 2 is interpolator...)
	// * f - Fragment. Contains a descriptor's children
	// * e - Element name
	// * a - map of element Attributes, or proxy event/transition Arguments
	// * d - Dynamic proxy event/transition arguments
	// * n - indicates an iNverted section
	// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
	// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
	// * x - eXpressions
	// * s - String representation of an expression function
	// * t1 - intro Transition
	// * t2 - outro Transition
	// * o - decOrator
	// * y - is doctYpe
	var parse__parse = function( tokenize, types, Parser ) {

		var parse, onlyWhitespace, inlinePartialStart, inlinePartialEnd, parseCompoundTemplate;
		onlyWhitespace = /^\s*$/;
		inlinePartialStart = /<!--\s*\{\{\s*>\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/;
		inlinePartialEnd = /<!--\s*\{\{\s*\/\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/;
		parse = function( template, options ) {
			var tokens, json, token;
			options = options || {};
			if ( inlinePartialStart.test( template ) ) {
				return parseCompoundTemplate( template, options );
			}
			if ( options.sanitize === true ) {
				options.sanitize = {
					elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
					eventAttributes: true
				};
			}
			tokens = tokenize( template, options );
			if ( !options.preserveWhitespace ) {
				token = tokens[ 0 ];
				if ( token && token.type === types.TEXT && onlyWhitespace.test( token.value ) ) {
					tokens.shift();
				}
				token = tokens[ tokens.length - 1 ];
				if ( token && token.type === types.TEXT && onlyWhitespace.test( token.value ) ) {
					tokens.pop();
				}
			}
			json = new Parser( tokens, options ).result;
			if ( typeof json === 'string' ) {
				return [ json ];
			}
			return json;
		};
		parseCompoundTemplate = function( template, options ) {
			var mainTemplate, remaining, partials, name, startMatch, endMatch;
			partials = {};
			mainTemplate = '';
			remaining = template;
			while ( startMatch = inlinePartialStart.exec( remaining ) ) {
				name = startMatch[ 1 ];
				mainTemplate += remaining.substr( 0, startMatch.index );
				remaining = remaining.substring( startMatch.index + startMatch[ 0 ].length );
				endMatch = inlinePartialEnd.exec( remaining );
				if ( !endMatch || endMatch[ 1 ] !== name ) {
					throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested' );
				}
				partials[ name ] = parse( remaining.substr( 0, endMatch.index ), options );
				remaining = remaining.substring( endMatch.index + endMatch[ 0 ].length );
			}
			return {
				main: parse( mainTemplate, options ),
				partials: partials
			};
		};
		return parse;
	}( parse_tokenize, config_types, parse_Parser__Parser );

	var render_DomFragment_Partial_deIndent = function() {

		var empty = /^\s*$/,
			leadingWhitespace = /^\s*/;
		return function( str ) {
			var lines, firstLine, lastLine, minIndent;
			lines = str.split( '\n' );
			firstLine = lines[ 0 ];
			if ( firstLine !== undefined && empty.test( firstLine ) ) {
				lines.shift();
			}
			lastLine = lines[ lines.length - 1 ];
			if ( lastLine !== undefined && empty.test( lastLine ) ) {
				lines.pop();
			}
			minIndent = lines.reduce( reducer, null );
			if ( minIndent ) {
				str = lines.map( function( line ) {
					return line.replace( minIndent, '' );
				} ).join( '\n' );
			}
			return str;
		};

		function reducer( previous, line ) {
			var lineIndent = leadingWhitespace.exec( line )[ 0 ];
			if ( previous === null || lineIndent.length < previous.length ) {
				return lineIndent;
			}
			return previous;
		}
	}();

	var render_DomFragment_Partial_getPartialDescriptor = function( errors, isClient, warn, isObject, partials, parse, deIndent ) {

		var getPartialDescriptor, registerPartial, getPartialFromRegistry, unpack;
		getPartialDescriptor = function( root, name ) {
			var el, partial, errorMessage;
			if ( partial = getPartialFromRegistry( root, name ) ) {
				return partial;
			}
			if ( isClient ) {
				el = document.getElementById( name );
				if ( el && el.tagName === 'SCRIPT' ) {
					if ( !parse ) {
						throw new Error( errors.missingParser );
					}
					registerPartial( parse( deIndent( el.text ), root.parseOptions ), name, partials );
				}
			}
			partial = partials[ name ];
			if ( !partial ) {
				errorMessage = 'Could not find descriptor for partial "' + name + '"';
				if ( root.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
				return [];
			}
			return unpack( partial );
		};
		getPartialFromRegistry = function( ractive, name ) {
			var partial;
			if ( ractive.partials[ name ] ) {
				if ( typeof ractive.partials[ name ] === 'string' ) {
					if ( !parse ) {
						throw new Error( errors.missingParser );
					}
					partial = parse( ractive.partials[ name ], ractive.parseOptions );
					registerPartial( partial, name, ractive.partials );
				}
				return unpack( ractive.partials[ name ] );
			}
		};
		registerPartial = function( partial, name, registry ) {
			var key;
			if ( isObject( partial ) ) {
				registry[ name ] = partial.main;
				for ( key in partial.partials ) {
					if ( partial.partials.hasOwnProperty( key ) ) {
						registry[ key ] = partial.partials[ key ];
					}
				}
			} else {
				registry[ name ] = partial;
			}
		};
		unpack = function( partial ) {
			if ( partial.length === 1 && typeof partial[ 0 ] === 'string' ) {
				return partial[ 0 ];
			}
			return partial;
		};
		return getPartialDescriptor;
	}( config_errors, config_isClient, utils_warn, utils_isObject, registries_partials, parse__parse, render_DomFragment_Partial_deIndent );

	var render_DomFragment_Partial_applyIndent = function( string, indent ) {
		var indented;
		if ( !indent ) {
			return string;
		}
		indented = string.split( '\n' ).map( function( line, notFirstLine ) {
			return notFirstLine ? indent + line : line;
		} ).join( '\n' );
		return indented;
	};

	var render_DomFragment_Partial__Partial = function( types, getPartialDescriptor, applyIndent, circular ) {

		var DomPartial, DomFragment;
		circular.push( function() {
			DomFragment = circular.DomFragment;
		} );
		DomPartial = function( options, docFrag ) {
			var parentFragment = this.parentFragment = options.parentFragment,
				descriptor;
			this.type = types.PARTIAL;
			this.name = options.descriptor.r;
			this.index = options.index;
			if ( !options.descriptor.r ) {
				throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
			}
			descriptor = getPartialDescriptor( parentFragment.root, options.descriptor.r );
			this.fragment = new DomFragment( {
				descriptor: descriptor,
				root: parentFragment.root,
				pNode: parentFragment.pNode,
				owner: this
			} );
			if ( docFrag ) {
				docFrag.appendChild( this.fragment.docFrag );
			}
		};
		DomPartial.prototype = {
			firstNode: function() {
				return this.fragment.firstNode();
			},
			findNextNode: function() {
				return this.parentFragment.findNextNode( this );
			},
			detach: function() {
				return this.fragment.detach();
			},
			teardown: function( destroy ) {
				this.fragment.teardown( destroy );
			},
			toString: function() {
				var string, previousItem, lastLine, match;
				string = this.fragment.toString();
				previousItem = this.parentFragment.items[ this.index - 1 ];
				if ( !previousItem || previousItem.type !== types.TEXT ) {
					return string;
				}
				lastLine = previousItem.descriptor.split( '\n' ).pop();
				if ( match = /^\s+$/.exec( lastLine ) ) {
					return applyIndent( string, match[ 0 ] );
				}
				return string;
			},
			find: function( selector ) {
				return this.fragment.find( selector );
			},
			findAll: function( selector, query ) {
				return this.fragment.findAll( selector, query );
			},
			findComponent: function( selector ) {
				return this.fragment.findComponent( selector );
			},
			findAllComponents: function( selector, query ) {
				return this.fragment.findAllComponents( selector, query );
			}
		};
		return DomPartial;
	}( config_types, render_DomFragment_Partial_getPartialDescriptor, render_DomFragment_Partial_applyIndent, circular );

	var render_DomFragment_Component_initialise_createModel_ComponentParameter = function( runloop, StringFragment ) {

		var ComponentParameter = function( component, key, value ) {
			this.parentFragment = component.parentFragment;
			this.component = component;
			this.key = key;
			this.fragment = new StringFragment( {
				descriptor: value,
				root: component.root,
				owner: this
			} );
			this.selfUpdating = this.fragment.isSimple();
			this.value = this.fragment.getValue();
		};
		ComponentParameter.prototype = {
			bubble: function() {
				if ( this.selfUpdating ) {
					this.update();
				} else if ( !this.deferred && this.ready ) {
					runloop.addAttribute( this );
					this.deferred = true;
				}
			},
			update: function() {
				var value = this.fragment.getValue();
				this.component.instance.set( this.key, value );
				this.value = value;
			},
			teardown: function() {
				this.fragment.teardown();
			}
		};
		return ComponentParameter;
	}( global_runloop, render_StringFragment__StringFragment );

	var render_DomFragment_Component_initialise_createModel__createModel = function( types, parseJSON, resolveRef, get, ComponentParameter ) {

		return function( component, defaultData, attributes, toBind ) {
			var data, key, value;
			data = {};
			component.complexParameters = [];
			for ( key in attributes ) {
				if ( attributes.hasOwnProperty( key ) ) {
					value = getValue( component, key, attributes[ key ], toBind );
					if ( value !== undefined || defaultData[ key ] === undefined ) {
						data[ key ] = value;
					}
				}
			}
			return data;
		};

		function getValue( component, key, descriptor, toBind ) {
			var parameter, parsed, parentInstance, parentFragment, keypath;
			parentInstance = component.root;
			parentFragment = component.parentFragment;
			if ( typeof descriptor === 'string' ) {
				parsed = parseJSON( descriptor );
				return parsed ? parsed.value : descriptor;
			}
			if ( descriptor === null ) {
				return true;
			}
			if ( descriptor.length === 1 && descriptor[ 0 ].t === types.INTERPOLATOR && descriptor[ 0 ].r ) {
				if ( parentFragment.indexRefs && parentFragment.indexRefs[ descriptor[ 0 ].r ] !== undefined ) {
					return parentFragment.indexRefs[ descriptor[ 0 ].r ];
				}
				keypath = resolveRef( parentInstance, descriptor[ 0 ].r, parentFragment ) || descriptor[ 0 ].r;
				toBind.push( {
					childKeypath: key,
					parentKeypath: keypath
				} );
				return get( parentInstance, keypath );
			}
			parameter = new ComponentParameter( component, key, descriptor );
			component.complexParameters.push( parameter );
			return parameter.value;
		}
	}( config_types, utils_parseJSON, shared_resolveRef, shared_get__get, render_DomFragment_Component_initialise_createModel_ComponentParameter );

	var render_DomFragment_Component_initialise_createInstance = function() {

		return function( component, Component, data, docFrag, contentDescriptor ) {
			var instance, parentFragment, partials, root, adapt;
			parentFragment = component.parentFragment;
			root = component.root;
			partials = {
				content: contentDescriptor || []
			};
			adapt = combineAdaptors( root, Component.defaults.adapt, Component.adaptors );
			instance = new Component( {
				el: parentFragment.pNode,
				append: true,
				data: data,
				partials: partials,
				magic: root.magic || Component.defaults.magic,
				modifyArrays: root.modifyArrays,
				_parent: root,
				_component: component,
				adapt: adapt
			} );
			if ( docFrag ) {
				instance.insert( docFrag );
				instance.fragment.pNode = instance.el = parentFragment.pNode;
			}
			return instance;
		};

		function combineAdaptors( root, defaultAdapt ) {
			var adapt, len, i;
			if ( root.adapt.length ) {
				adapt = root.adapt.map( function( stringOrObject ) {
					if ( typeof stringOrObject === 'object' ) {
						return stringOrObject;
					}
					return root.adaptors[ stringOrObject ] || stringOrObject;
				} );
			} else {
				adapt = [];
			}
			if ( len = defaultAdapt.length ) {
				for ( i = 0; i < len; i += 1 ) {
					if ( adapt.indexOf( defaultAdapt[ i ] ) === -1 ) {
						adapt.push( defaultAdapt[ i ] );
					}
				}
			}
			return adapt;
		}
	}();

	var render_DomFragment_Component_initialise_createBindings = function( createComponentBinding, get, set ) {

		return function createInitialComponentBindings( component, toBind ) {
			toBind.forEach( function createInitialComponentBinding( pair ) {
				var childValue;
				createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );
				childValue = get( component.instance, pair.childKeypath );
				if ( childValue !== undefined ) {
					set( component.root, pair.parentKeypath, childValue );
				}
			} );
		};
	}( shared_createComponentBinding, shared_get__get, shared_set );

	var render_DomFragment_Component_initialise_propagateEvents = function( warn ) {

		var errorMessage = 'Components currently only support simple events - you cannot include arguments. Sorry!';
		return function( component, eventsDescriptor ) {
			var eventName;
			for ( eventName in eventsDescriptor ) {
				if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
					propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
				}
			}
		};

		function propagateEvent( childInstance, parentInstance, eventName, proxyEventName ) {
			if ( typeof proxyEventName !== 'string' ) {
				if ( parentInstance.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
					return;
				}
			}
			childInstance.on( eventName, function() {
				var args = Array.prototype.slice.call( arguments );
				args.unshift( proxyEventName );
				parentInstance.fire.apply( parentInstance, args );
			} );
		}
	}( utils_warn );

	var render_DomFragment_Component_initialise_updateLiveQueries = function( component ) {
		var ancestor, query;
		ancestor = component.root;
		while ( ancestor ) {
			if ( query = ancestor._liveComponentQueries[ component.name ] ) {
				query.push( component.instance );
			}
			ancestor = ancestor._parent;
		}
	};

	var render_DomFragment_Component_initialise__initialise = function( types, warn, createModel, createInstance, createBindings, propagateEvents, updateLiveQueries ) {

		return function initialiseComponent( component, options, docFrag ) {
			var parentFragment, root, Component, data, toBind;
			parentFragment = component.parentFragment = options.parentFragment;
			root = parentFragment.root;
			component.root = root;
			component.type = types.COMPONENT;
			component.name = options.descriptor.e;
			component.index = options.index;
			component.bindings = [];
			Component = root.components[ options.descriptor.e ];
			if ( !Component ) {
				throw new Error( 'Component "' + options.descriptor.e + '" not found' );
			}
			toBind = [];
			data = createModel( component, Component.data || {}, options.descriptor.a, toBind );
			createInstance( component, Component, data, docFrag, options.descriptor.f );
			createBindings( component, toBind );
			propagateEvents( component, options.descriptor.v );
			if ( options.descriptor.t1 || options.descriptor.t2 || options.descriptor.o ) {
				warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
			}
			updateLiveQueries( component );
		};
	}( config_types, utils_warn, render_DomFragment_Component_initialise_createModel__createModel, render_DomFragment_Component_initialise_createInstance, render_DomFragment_Component_initialise_createBindings, render_DomFragment_Component_initialise_propagateEvents, render_DomFragment_Component_initialise_updateLiveQueries );

	var render_DomFragment_Component__Component = function( initialise ) {

		var DomComponent = function( options, docFrag ) {
			initialise( this, options, docFrag );
		};
		DomComponent.prototype = {
			firstNode: function() {
				return this.instance.fragment.firstNode();
			},
			findNextNode: function() {
				return this.parentFragment.findNextNode( this );
			},
			detach: function() {
				return this.instance.fragment.detach();
			},
			teardown: function( destroy ) {
				while ( this.complexParameters.length ) {
					this.complexParameters.pop().teardown();
				}
				while ( this.bindings.length ) {
					this.bindings.pop().teardown();
				}
				removeFromLiveComponentQueries( this );
				this.shouldDestroy = destroy;
				this.instance.teardown();
			},
			toString: function() {
				return this.instance.fragment.toString();
			},
			find: function( selector ) {
				return this.instance.fragment.find( selector );
			},
			findAll: function( selector, query ) {
				return this.instance.fragment.findAll( selector, query );
			},
			findComponent: function( selector ) {
				if ( !selector || selector === this.name ) {
					return this.instance;
				}
				if ( this.instance.fragment ) {
					return this.instance.fragment.findComponent( selector );
				}
				return null;
			},
			findAllComponents: function( selector, query ) {
				query._test( this, true );
				if ( this.instance.fragment ) {
					this.instance.fragment.findAllComponents( selector, query );
				}
			}
		};
		return DomComponent;

		function removeFromLiveComponentQueries( component ) {
			var instance, query;
			instance = component.root;
			do {
				if ( query = instance._liveComponentQueries[ component.name ] ) {
					query._remove( component );
				}
			} while ( instance = instance._parent );
		}
	}( render_DomFragment_Component_initialise__initialise );

	var render_DomFragment_Comment = function( types, detach ) {

		var DomComment = function( options, docFrag ) {
			this.type = types.COMMENT;
			this.descriptor = options.descriptor;
			if ( docFrag ) {
				this.node = document.createComment( options.descriptor.f );
				docFrag.appendChild( this.node );
			}
		};
		DomComment.prototype = {
			detach: detach,
			teardown: function( destroy ) {
				if ( destroy ) {
					this.detach();
				}
			},
			firstNode: function() {
				return this.node;
			},
			toString: function() {
				return '<!--' + this.descriptor.f + '-->';
			}
		};
		return DomComment;
	}( config_types, render_DomFragment_shared_detach );

	var render_DomFragment__DomFragment = function( types, matches, initFragment, insertHtml, Text, Interpolator, Section, Triple, Element, Partial, Component, Comment, circular ) {

		var DomFragment = function( options ) {
			if ( options.pNode ) {
				this.docFrag = document.createDocumentFragment();
			}
			if ( typeof options.descriptor === 'string' ) {
				this.html = options.descriptor;
				if ( this.docFrag ) {
					this.nodes = insertHtml( this.html, options.pNode.tagName, this.docFrag );
				}
			} else {
				initFragment( this, options );
			}
		};
		DomFragment.prototype = {
			detach: function() {
				var len, i;
				if ( this.docFrag ) {
					if ( this.nodes ) {
						len = this.nodes.length;
						for ( i = 0; i < len; i += 1 ) {
							this.docFrag.appendChild( this.nodes[ i ] );
						}
					} else if ( this.items ) {
						len = this.items.length;
						for ( i = 0; i < len; i += 1 ) {
							this.docFrag.appendChild( this.items[ i ].detach() );
						}
					}
					return this.docFrag;
				}
			},
			createItem: function( options ) {
				if ( typeof options.descriptor === 'string' ) {
					return new Text( options, this.docFrag );
				}
				switch ( options.descriptor.t ) {
					case types.INTERPOLATOR:
						return new Interpolator( options, this.docFrag );
					case types.SECTION:
						return new Section( options, this.docFrag );
					case types.TRIPLE:
						return new Triple( options, this.docFrag );
					case types.ELEMENT:
						if ( this.root.components[ options.descriptor.e ] ) {
							return new Component( options, this.docFrag );
						}
						return new Element( options, this.docFrag );
					case types.PARTIAL:
						return new Partial( options, this.docFrag );
					case types.COMMENT:
						return new Comment( options, this.docFrag );
					default:
						throw new Error( 'Something very strange happened. Please file an issue at https://github.com/RactiveJS/Ractive/issues. Thanks!' );
				}
			},
			teardown: function( destroy ) {
				var node;
				if ( this.nodes && destroy ) {
					while ( node = this.nodes.pop() ) {
						node.parentNode.removeChild( node );
					}
				} else if ( this.items ) {
					while ( this.items.length ) {
						this.items.pop().teardown( destroy );
					}
				}
				this.nodes = this.items = this.docFrag = null;
			},
			firstNode: function() {
				if ( this.items && this.items[ 0 ] ) {
					return this.items[ 0 ].firstNode();
				} else if ( this.nodes ) {
					return this.nodes[ 0 ] || null;
				}
				return null;
			},
			findNextNode: function( item ) {
				var index = item.index;
				if ( this.items[ index + 1 ] ) {
					return this.items[ index + 1 ].firstNode();
				}
				if ( this.owner === this.root ) {
					if ( !this.owner.component ) {
						return null;
					}
					return this.owner.component.findNextNode();
				}
				return this.owner.findNextNode( this );
			},
			toString: function() {
				var html, i, len, item;
				if ( this.html ) {
					return this.html;
				}
				html = '';
				if ( !this.items ) {
					return html;
				}
				len = this.items.length;
				for ( i = 0; i < len; i += 1 ) {
					item = this.items[ i ];
					html += item.toString();
				}
				return html;
			},
			find: function( selector ) {
				var i, len, item, node, queryResult;
				if ( this.nodes ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						node = this.nodes[ i ];
						if ( node.nodeType !== 1 ) {
							continue;
						}
						if ( matches( node, selector ) ) {
							return node;
						}
						if ( queryResult = node.querySelector( selector ) ) {
							return queryResult;
						}
					}
					return null;
				}
				if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.find && ( queryResult = item.find( selector ) ) ) {
							return queryResult;
						}
					}
					return null;
				}
			},
			findAll: function( selector, query ) {
				var i, len, item, node, queryAllResult, numNodes, j;
				if ( this.nodes ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						node = this.nodes[ i ];
						if ( node.nodeType !== 1 ) {
							continue;
						}
						if ( matches( node, selector ) ) {
							query.push( node );
						}
						if ( queryAllResult = node.querySelectorAll( selector ) ) {
							numNodes = queryAllResult.length;
							for ( j = 0; j < numNodes; j += 1 ) {
								query.push( queryAllResult[ j ] );
							}
						}
					}
				} else if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.findAll ) {
							item.findAll( selector, query );
						}
					}
				}
				return query;
			},
			findComponent: function( selector ) {
				var len, i, item, queryResult;
				if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.findComponent && ( queryResult = item.findComponent( selector ) ) ) {
							return queryResult;
						}
					}
					return null;
				}
			},
			findAllComponents: function( selector, query ) {
				var i, len, item;
				if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						item = this.items[ i ];
						if ( item.findAllComponents ) {
							item.findAllComponents( selector, query );
						}
					}
				}
				return query;
			}
		};
		circular.DomFragment = DomFragment;
		return DomFragment;
	}( config_types, utils_matches, render_shared_initFragment, render_DomFragment_shared_insertHtml, render_DomFragment_Text, render_DomFragment_Interpolator, render_DomFragment_Section__Section, render_DomFragment_Triple, render_DomFragment_Element__Element, render_DomFragment_Partial__Partial, render_DomFragment_Component__Component, render_DomFragment_Comment, circular );

	var Ractive_prototype_render = function( runloop, css, DomFragment ) {

		return function Ractive_prototype_render( target, callback ) {
			this._rendering = true;
			runloop.start( this, callback );
			if ( !this._initing ) {
				throw new Error( 'You cannot call ractive.render() directly!' );
			}
			if ( this.constructor.css ) {
				css.add( this.constructor );
			}
			this.fragment = new DomFragment( {
				descriptor: this.template,
				root: this,
				owner: this,
				pNode: target
			} );
			if ( target ) {
				target.appendChild( this.fragment.docFrag );
			}
			if ( !this._parent || !this._parent._rendering ) {
				initChildren( this );
			}
			delete this._rendering;
			runloop.end();
		};

		function initChildren( instance ) {
			var child;
			while ( child = instance._childInitQueue.pop() ) {
				if ( child.instance.init ) {
					child.instance.init( child.options );
				}
				initChildren( child.instance );
			}
		}
	}( global_runloop, global_css, render_DomFragment__DomFragment );

	var Ractive_prototype_renderHTML = function( warn ) {

		return function() {
			warn( 'renderHTML() has been deprecated and will be removed in a future version. Please use toHTML() instead' );
			return this.toHTML();
		};
	}( utils_warn );

	var Ractive_prototype_reset = function( Promise, runloop, clearCache, notifyDependants ) {

		return function( data, callback ) {
			var promise, fulfilPromise, wrapper;
			if ( typeof data === 'function' ) {
				callback = data;
				data = {};
			} else {
				data = data || {};
			}
			if ( typeof data !== 'object' ) {
				throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			if ( callback ) {
				promise.then( callback );
			}
			runloop.start( this, fulfilPromise );
			if ( ( wrapper = this._wrapped[ '' ] ) && wrapper.reset ) {
				if ( wrapper.reset( data ) === false ) {
					this.data = data;
				}
			} else {
				this.data = data;
			}
			clearCache( this, '' );
			notifyDependants( this, '' );
			runloop.end();
			this.fire( 'reset', data );
			return promise;
		};
	}( utils_Promise, global_runloop, shared_clearCache, shared_notifyDependants );

	var Ractive_prototype_set = function( runloop, isObject, normaliseKeypath, Promise, set ) {

		return function Ractive_prototype_set( keypath, value, callback ) {
			var map, promise, fulfilPromise;
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			if ( isObject( keypath ) ) {
				map = keypath;
				callback = value;
				for ( keypath in map ) {
					if ( map.hasOwnProperty( keypath ) ) {
						value = map[ keypath ];
						keypath = normaliseKeypath( keypath );
						set( this, keypath, value );
					}
				}
			} else {
				keypath = normaliseKeypath( keypath );
				set( this, keypath, value );
			}
			runloop.end();
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( global_runloop, utils_isObject, utils_normaliseKeypath, utils_Promise, shared_set );

	var Ractive_prototype_subtract = function( add ) {

		return function( keypath, d ) {
			return add( this, keypath, d === undefined ? -1 : -d );
		};
	}( Ractive_prototype_shared_add );

	// Teardown. This goes through the root fragment and all its children, removing observers
	// and generally cleaning up after itself
	var Ractive_prototype_teardown = function( types, css, runloop, Promise, clearCache ) {

		return function( callback ) {
			var keypath, promise, fulfilPromise, shouldDestroy, originalCallback, fragment, nearestDetachingElement, unresolvedImplicitDependency;
			this.fire( 'teardown' );
			shouldDestroy = !this.component || this.component.shouldDestroy;
			if ( this.constructor.css ) {
				if ( shouldDestroy ) {
					originalCallback = callback;
					callback = function() {
						if ( originalCallback ) {
							originalCallback.call( this );
						}
						css.remove( this.constructor );
					};
				} else {
					fragment = this.component.parentFragment;
					do {
						if ( fragment.owner.type !== types.ELEMENT ) {
							continue;
						}
						if ( fragment.owner.willDetach ) {
							nearestDetachingElement = fragment.owner;
						}
					} while ( !nearestDetachingElement && ( fragment = fragment.parent ) );
					if ( !nearestDetachingElement ) {
						throw new Error( 'A component is being torn down but doesn\'t have a nearest detaching element... this shouldn\'t happen!' );
					}
					nearestDetachingElement.cssDetachQueue.push( this.constructor );
				}
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			this.fragment.teardown( shouldDestroy );
			while ( this._animations[ 0 ] ) {
				this._animations[ 0 ].stop();
			}
			for ( keypath in this._cache ) {
				clearCache( this, keypath );
			}
			while ( unresolvedImplicitDependency = this._unresolvedImplicitDependencies.pop() ) {
				unresolvedImplicitDependency.teardown();
			}
			runloop.end();
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( config_types, global_css, global_runloop, utils_Promise, shared_clearCache );

	var Ractive_prototype_toHTML = function() {
		return this.fragment.toString();
	};

	var Ractive_prototype_toggle = function( keypath, callback ) {
		var value;
		if ( typeof keypath !== 'string' ) {
			if ( this.debug ) {
				throw new Error( 'Bad arguments' );
			}
			return;
		}
		value = this.get( keypath );
		return this.set( keypath, !value, callback );
	};

	var Ractive_prototype_update = function( runloop, Promise, clearCache, notifyDependants ) {

		return function( keypath, callback ) {
			var promise, fulfilPromise;
			if ( typeof keypath === 'function' ) {
				callback = keypath;
				keypath = '';
			} else {
				keypath = keypath || '';
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			runloop.start( this, fulfilPromise );
			clearCache( this, keypath );
			notifyDependants( this, keypath );
			runloop.end();
			this.fire( 'update', keypath );
			if ( callback ) {
				promise.then( callback.bind( this ) );
			}
			return promise;
		};
	}( global_runloop, utils_Promise, shared_clearCache, shared_notifyDependants );

	var Ractive_prototype_updateModel = function( getValueFromCheckboxes, arrayContentsMatch, isEqual ) {

		return function Ractive_prototype_updateModel( keypath, cascade ) {
			var values, deferredCheckboxes, i;
			if ( typeof keypath !== 'string' ) {
				keypath = '';
				cascade = true;
			}
			consolidateChangedValues( this, keypath, values = {}, deferredCheckboxes = [], cascade );
			if ( i = deferredCheckboxes.length ) {
				while ( i-- ) {
					keypath = deferredCheckboxes[ i ];
					values[ keypath ] = getValueFromCheckboxes( this, keypath );
				}
			}
			this.set( values );
		};

		function consolidateChangedValues( ractive, keypath, values, deferredCheckboxes, cascade ) {
			var bindings, childDeps, i, binding, oldValue, newValue;
			bindings = ractive._twowayBindings[ keypath ];
			if ( bindings ) {
				i = bindings.length;
				while ( i-- ) {
					binding = bindings[ i ];
					if ( binding.radioName && !binding.node.checked ) {
						continue;
					}
					if ( binding.checkboxName ) {
						if ( binding.changed() && deferredCheckboxes[ keypath ] !== true ) {
							deferredCheckboxes[ keypath ] = true;
							deferredCheckboxes.push( keypath );
						}
						continue;
					}
					oldValue = binding.attr.value;
					newValue = binding.value();
					if ( arrayContentsMatch( oldValue, newValue ) ) {
						continue;
					}
					if ( !isEqual( oldValue, newValue ) ) {
						values[ keypath ] = newValue;
					}
				}
			}
			if ( !cascade ) {
				return;
			}
			childDeps = ractive._depsMap[ keypath ];
			if ( childDeps ) {
				i = childDeps.length;
				while ( i-- ) {
					consolidateChangedValues( ractive, childDeps[ i ], values, deferredCheckboxes, cascade );
				}
			}
		}
	}( shared_getValueFromCheckboxes, utils_arrayContentsMatch, utils_isEqual );

	var Ractive_prototype__prototype = function( add, animate, detach, find, findAll, findAllComponents, findComponent, fire, get, insert, merge, observe, off, on, render, renderHTML, reset, set, subtract, teardown, toHTML, toggle, update, updateModel ) {

		return {
			add: add,
			animate: animate,
			detach: detach,
			find: find,
			findAll: findAll,
			findAllComponents: findAllComponents,
			findComponent: findComponent,
			fire: fire,
			get: get,
			insert: insert,
			merge: merge,
			observe: observe,
			off: off,
			on: on,
			render: render,
			renderHTML: renderHTML,
			reset: reset,
			set: set,
			subtract: subtract,
			teardown: teardown,
			toHTML: toHTML,
			toggle: toggle,
			update: update,
			updateModel: updateModel
		};
	}( Ractive_prototype_add, Ractive_prototype_animate__animate, Ractive_prototype_detach, Ractive_prototype_find, Ractive_prototype_findAll, Ractive_prototype_findAllComponents, Ractive_prototype_findComponent, Ractive_prototype_fire, Ractive_prototype_get, Ractive_prototype_insert, Ractive_prototype_merge__merge, Ractive_prototype_observe__observe, Ractive_prototype_off, Ractive_prototype_on, Ractive_prototype_render, Ractive_prototype_renderHTML, Ractive_prototype_reset, Ractive_prototype_set, Ractive_prototype_subtract, Ractive_prototype_teardown, Ractive_prototype_toHTML, Ractive_prototype_toggle, Ractive_prototype_update, Ractive_prototype_updateModel );

	var registries_components = {};

	// These are a subset of the easing equations found at
	// https://raw.github.com/danro/easing-js - license info
	// follows:
	// --------------------------------------------------
	// easing.js v0.5.4
	// Generic set of easing functions with AMD support
	// https://github.com/danro/easing-js
	// This code may be freely distributed under the MIT license
	// http://danro.mit-license.org/
	// --------------------------------------------------
	// All functions adapted from Thomas Fuchs & Jeremy Kahn
	// Easing Equations (c) 2003 Robert Penner, BSD license
	// https://raw.github.com/danro/easing-js/master/LICENSE
	// --------------------------------------------------
	// In that library, the functions named easeIn, easeOut, and
	// easeInOut below are named easeInCubic, easeOutCubic, and
	// (you guessed it) easeInOutCubic.
	//
	// You can add additional easing functions to this list, and they
	// will be globally available.
	var registries_easing = {
		linear: function( pos ) {
			return pos;
		},
		easeIn: function( pos ) {
			return Math.pow( pos, 3 );
		},
		easeOut: function( pos ) {
			return Math.pow( pos - 1, 3 ) + 1;
		},
		easeInOut: function( pos ) {
			if ( ( pos /= 0.5 ) < 1 ) {
				return 0.5 * Math.pow( pos, 3 );
			}
			return 0.5 * ( Math.pow( pos - 2, 3 ) + 2 );
		}
	};

	var utils_getGuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			var r, v;
			r = Math.random() * 16 | 0;
			v = c == 'x' ? r : r & 3 | 8;
			return v.toString( 16 );
		} );
	};

	var utils_extend = function( target ) {
		var prop, source, sources = Array.prototype.slice.call( arguments, 1 );
		while ( source = sources.shift() ) {
			for ( prop in source ) {
				if ( source.hasOwnProperty( prop ) ) {
					target[ prop ] = source[ prop ];
				}
			}
		}
		return target;
	};

	var config_registries = [
		'adaptors',
		'components',
		'decorators',
		'easing',
		'events',
		'interpolators',
		'partials',
		'transitions',
		'data'
	];

	var extend_utils_transformCss = function() {

		var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g,
			commentsPattern = /\/\*.*?\*\//g,
			selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>\~:]))+)((?::[^\s\+\>\~]+)?\s*[\s\+\>\~]?)\s*/g;
		return function transformCss( css, guid ) {
			var transformed, addGuid;
			addGuid = function( selector ) {
				var selectorUnits, match, unit, dataAttr, base, prepended, appended, i, transformed = [];
				selectorUnits = [];
				while ( match = selectorUnitPattern.exec( selector ) ) {
					selectorUnits.push( {
						str: match[ 0 ],
						base: match[ 1 ],
						modifiers: match[ 2 ]
					} );
				}
				dataAttr = '[data-rvcguid="' + guid + '"]';
				base = selectorUnits.map( extractString );
				i = selectorUnits.length;
				while ( i-- ) {
					appended = base.slice();
					unit = selectorUnits[ i ];
					appended[ i ] = unit.base + dataAttr + unit.modifiers || '';
					prepended = base.slice();
					prepended[ i ] = dataAttr + ' ' + prepended[ i ];
					transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
				}
				return transformed.join( ', ' );
			};
			transformed = css.replace( commentsPattern, '' ).replace( selectorsPattern, function( match, $1 ) {
				var selectors, transformed;
				selectors = $1.split( ',' ).map( trim );
				transformed = selectors.map( addGuid ).join( ', ' ) + ' ';
				return match.replace( $1, transformed );
			} );
			return transformed;
		};

		function trim( str ) {
			if ( str.trim ) {
				return str.trim();
			}
			return str.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		}

		function extractString( unit ) {
			return unit.str;
		}
	}();

	var extend_inheritFromParent = function( registries, create, defineProperty, transformCss ) {

		return function( Child, Parent ) {
			registries.forEach( function( property ) {
				if ( Parent[ property ] ) {
					Child[ property ] = create( Parent[ property ] );
				}
			} );
			defineProperty( Child, 'defaults', {
				value: create( Parent.defaults )
			} );
			if ( Parent.css ) {
				defineProperty( Child, 'css', {
					value: Parent.defaults.noCssTransform ? Parent.css : transformCss( Parent.css, Child._guid )
				} );
			}
		};
	}( config_registries, utils_create, utils_defineProperty, extend_utils_transformCss );

	var extend_wrapMethod = function( method, superMethod ) {
		if ( /_super/.test( method ) ) {
			return function() {
				var _super = this._super,
					result;
				this._super = superMethod;
				result = method.apply( this, arguments );
				this._super = _super;
				return result;
			};
		} else {
			return method;
		}
	};

	var extend_utils_augment = function( target, source ) {
		var key;
		for ( key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = source[ key ];
			}
		}
		return target;
	};

	var extend_inheritFromChildProps = function( initOptions, registries, defineProperty, wrapMethod, augment, transformCss ) {

		var blacklisted = {};
		registries.concat( initOptions.keys ).forEach( function( property ) {
			blacklisted[ property ] = true;
		} );
		return function( Child, childProps ) {
			var key, member;
			registries.forEach( function( property ) {
				var value = childProps[ property ];
				if ( value ) {
					if ( Child[ property ] ) {
						augment( Child[ property ], value );
					} else {
						Child[ property ] = value;
					}
				}
			} );
			initOptions.keys.forEach( function( key ) {
				var value = childProps[ key ];
				if ( value !== undefined ) {
					if ( typeof value === 'function' && typeof Child[ key ] === 'function' ) {
						Child.defaults[ key ] = wrapMethod( value, Child[ key ] );
					} else {
						Child.defaults[ key ] = childProps[ key ];
					}
				}
			} );
			for ( key in childProps ) {
				if ( !blacklisted[ key ] && childProps.hasOwnProperty( key ) ) {
					member = childProps[ key ];
					if ( typeof member === 'function' && typeof Child.prototype[ key ] === 'function' ) {
						Child.prototype[ key ] = wrapMethod( member, Child.prototype[ key ] );
					} else {
						Child.prototype[ key ] = member;
					}
				}
			}
			if ( childProps.css ) {
				defineProperty( Child, 'css', {
					value: Child.defaults.noCssTransform ? childProps.css : transformCss( childProps.css, Child._guid )
				} );
			}
		};
	}( config_initOptions, config_registries, utils_defineProperty, extend_wrapMethod, extend_utils_augment, extend_utils_transformCss );

	var extend_extractInlinePartials = function( isObject, augment ) {

		return function( Child, childProps ) {
			if ( isObject( Child.defaults.template ) ) {
				if ( !Child.partials ) {
					Child.partials = {};
				}
				augment( Child.partials, Child.defaults.template.partials );
				if ( childProps.partials ) {
					augment( Child.partials, childProps.partials );
				}
				Child.defaults.template = Child.defaults.template.main;
			}
		};
	}( utils_isObject, extend_utils_augment );

	var extend_conditionallyParseTemplate = function( errors, isClient, parse ) {

		return function( Child ) {
			var templateEl;
			if ( typeof Child.defaults.template === 'string' ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}
				if ( Child.defaults.template.charAt( 0 ) === '#' && isClient ) {
					templateEl = document.getElementById( Child.defaults.template.substring( 1 ) );
					if ( templateEl && templateEl.tagName === 'SCRIPT' ) {
						Child.defaults.template = parse( templateEl.innerHTML, Child );
					} else {
						throw new Error( 'Could not find template element (' + Child.defaults.template + ')' );
					}
				} else {
					Child.defaults.template = parse( Child.defaults.template, Child.defaults );
				}
			}
		};
	}( config_errors, config_isClient, parse__parse );

	var extend_conditionallyParsePartials = function( errors, parse ) {

		return function( Child ) {
			var key;
			if ( Child.partials ) {
				for ( key in Child.partials ) {
					if ( Child.partials.hasOwnProperty( key ) && typeof Child.partials[ key ] === 'string' ) {
						if ( !parse ) {
							throw new Error( errors.missingParser );
						}
						Child.partials[ key ] = parse( Child.partials[ key ], Child );
					}
				}
			}
		};
	}( config_errors, parse__parse );

	var Ractive_initialise = function( isClient, errors, initOptions, registries, warn, create, extend, fillGaps, defineProperties, getElement, isObject, isArray, getGuid, Promise, magicAdaptor, parse ) {

		var flags = [
			'adapt',
			'modifyArrays',
			'magic',
			'twoway',
			'lazy',
			'debug',
			'isolated'
		];
		return function initialiseRactiveInstance( ractive, options ) {
			var template, templateEl, parsedTemplate, promise, fulfilPromise;
			if ( isArray( options.adaptors ) ) {
				warn( 'The `adaptors` option, to indicate which adaptors should be used with a given Ractive instance, has been deprecated in favour of `adapt`. See [TODO] for more information' );
				options.adapt = options.adaptors;
				delete options.adaptors;
			}
			initOptions.keys.forEach( function( key ) {
				if ( options[ key ] === undefined ) {
					options[ key ] = ractive.constructor.defaults[ key ];
				}
			} );
			flags.forEach( function( flag ) {
				ractive[ flag ] = options[ flag ];
			} );
			if ( typeof ractive.adapt === 'string' ) {
				ractive.adapt = [ ractive.adapt ];
			}
			if ( ractive.magic && !magicAdaptor ) {
				throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
			}
			defineProperties( ractive, {
				_initing: {
					value: true,
					writable: true
				},
				_guid: {
					value: getGuid()
				},
				_subs: {
					value: create( null ),
					configurable: true
				},
				_cache: {
					value: {}
				},
				_cacheMap: {
					value: create( null )
				},
				_deps: {
					value: []
				},
				_depsMap: {
					value: create( null )
				},
				_patternObservers: {
					value: []
				},
				_evaluators: {
					value: create( null )
				},
				_twowayBindings: {
					value: {}
				},
				_animations: {
					value: []
				},
				nodes: {
					value: {}
				},
				_wrapped: {
					value: create( null )
				},
				_liveQueries: {
					value: []
				},
				_liveComponentQueries: {
					value: []
				},
				_childInitQueue: {
					value: []
				},
				_changes: {
					value: []
				},
				_unresolvedImplicitDependencies: {
					value: []
				}
			} );
			if ( options._parent && options._component ) {
				defineProperties( ractive, {
					_parent: {
						value: options._parent
					},
					component: {
						value: options._component
					}
				} );
				options._component.instance = ractive;
			}
			if ( options.el ) {
				ractive.el = getElement( options.el );
				if ( !ractive.el && ractive.debug ) {
					throw new Error( 'Could not find container element' );
				}
			}
			if ( options.eventDefinitions ) {
				warn( 'ractive.eventDefinitions has been deprecated in favour of ractive.events. Support will be removed in future versions' );
				options.events = options.eventDefinitions;
			}
			registries.forEach( function( registry ) {
				if ( ractive.constructor[ registry ] ) {
					ractive[ registry ] = extend( create( ractive.constructor[ registry ] ), options[ registry ] );
				} else if ( options[ registry ] ) {
					ractive[ registry ] = options[ registry ];
				}
			} );
			if ( !ractive.data ) {
				ractive.data = {};
			}
			template = options.template;
			if ( typeof template === 'string' ) {
				if ( !parse ) {
					throw new Error( errors.missingParser );
				}
				if ( template.charAt( 0 ) === '#' && isClient ) {
					templateEl = document.getElementById( template.substring( 1 ) );
					if ( templateEl ) {
						parsedTemplate = parse( templateEl.innerHTML, options );
					} else {
						throw new Error( 'Could not find template element (' + template + ')' );
					}
				} else {
					parsedTemplate = parse( template, options );
				}
			} else {
				parsedTemplate = template;
			}
			if ( isObject( parsedTemplate ) ) {
				fillGaps( ractive.partials, parsedTemplate.partials );
				parsedTemplate = parsedTemplate.main;
			}
			if ( parsedTemplate && parsedTemplate.length === 1 && typeof parsedTemplate[ 0 ] === 'string' ) {
				parsedTemplate = parsedTemplate[ 0 ];
			}
			ractive.template = parsedTemplate;
			extend( ractive.partials, options.partials );
			ractive.parseOptions = {
				preserveWhitespace: options.preserveWhitespace,
				sanitize: options.sanitize,
				stripComments: options.stripComments
			};
			ractive.transitionsEnabled = options.noIntro ? false : options.transitionsEnabled;
			if ( isClient && !ractive.el ) {
				ractive.el = document.createDocumentFragment();
			}
			if ( ractive.el && !options.append ) {
				ractive.el.innerHTML = '';
			}
			promise = new Promise( function( fulfil ) {
				fulfilPromise = fulfil;
			} );
			ractive.render( ractive.el, fulfilPromise );
			if ( options.complete ) {
				promise.then( options.complete.bind( ractive ) );
			}
			ractive.transitionsEnabled = options.transitionsEnabled;
			ractive._initing = false;
		};
	}( config_isClient, config_errors, config_initOptions, config_registries, utils_warn, utils_create, utils_extend, utils_fillGaps, utils_defineProperties, utils_getElement, utils_isObject, utils_isArray, utils_getGuid, utils_Promise, shared_get_magicAdaptor, parse__parse );

	var extend_initChildInstance = function( initOptions, wrapMethod, initialise ) {

		return function initChildInstance( child, Child, options ) {
			initOptions.keys.forEach( function( key ) {
				var value = options[ key ],
					defaultValue = Child.defaults[ key ];
				if ( typeof value === 'function' && typeof defaultValue === 'function' ) {
					options[ key ] = wrapMethod( value, defaultValue );
				}
			} );
			if ( child.beforeInit ) {
				child.beforeInit( options );
			}
			initialise( child, options );
			if ( options._parent && options._parent._rendering ) {
				options._parent._childInitQueue.push( {
					instance: child,
					options: options
				} );
			} else if ( child.init ) {
				child.init( options );
			}
		};
	}( config_initOptions, extend_wrapMethod, Ractive_initialise );

	var extend__extend = function( create, defineProperties, getGuid, extendObject, inheritFromParent, inheritFromChildProps, extractInlinePartials, conditionallyParseTemplate, conditionallyParsePartials, initChildInstance, circular ) {

		var Ractive;
		circular.push( function() {
			Ractive = circular.Ractive;
		} );
		return function extend( childProps ) {
			var Parent = this,
				Child, adaptor, i;
			if ( childProps.prototype instanceof Ractive ) {
				childProps = extendObject( {}, childProps, childProps.prototype, childProps.defaults );
			}
			Child = function( options ) {
				initChildInstance( this, Child, options || {} );
			};
			Child.prototype = create( Parent.prototype );
			Child.prototype.constructor = Child;
			defineProperties( Child, {
				extend: {
					value: Parent.extend
				},
				_guid: {
					value: getGuid()
				}
			} );
			inheritFromParent( Child, Parent );
			inheritFromChildProps( Child, childProps );
			if ( Child.adaptors && ( i = Child.defaults.adapt.length ) ) {
				while ( i-- ) {
					adaptor = Child.defaults.adapt[ i ];
					if ( typeof adaptor === 'string' ) {
						Child.defaults.adapt[ i ] = Child.adaptors[ adaptor ] || adaptor;
					}
				}
			}
			if ( childProps.template ) {
				conditionallyParseTemplate( Child );
				extractInlinePartials( Child, childProps );
				conditionallyParsePartials( Child );
			}
			return Child;
		};
	}( utils_create, utils_defineProperties, utils_getGuid, utils_extend, extend_inheritFromParent, extend_inheritFromChildProps, extend_extractInlinePartials, extend_conditionallyParseTemplate, extend_conditionallyParsePartials, extend_initChildInstance, circular );

	var Ractive__Ractive = function( initOptions, svg, defineProperties, prototype, partialRegistry, adaptorRegistry, componentsRegistry, easingRegistry, interpolatorsRegistry, Promise, extend, parse, initialise, circular ) {

		var Ractive = function( options ) {
			initialise( this, options );
		};
		defineProperties( Ractive, {
			prototype: {
				value: prototype
			},
			partials: {
				value: partialRegistry
			},
			adaptors: {
				value: adaptorRegistry
			},
			easing: {
				value: easingRegistry
			},
			transitions: {
				value: {}
			},
			events: {
				value: {}
			},
			components: {
				value: componentsRegistry
			},
			decorators: {
				value: {}
			},
			interpolators: {
				value: interpolatorsRegistry
			},
			defaults: {
				value: initOptions.defaults
			},
			svg: {
				value: svg
			},
			VERSION: {
				value: 'v0.3.9-317-d23e408'
			}
		} );
		Ractive.eventDefinitions = Ractive.events;
		Ractive.prototype.constructor = Ractive;
		Ractive.Promise = Promise;
		Ractive.extend = extend;
		Ractive.parse = parse;
		circular.Ractive = Ractive;
		return Ractive;
	}( config_initOptions, config_svg, utils_defineProperties, Ractive_prototype__prototype, registries_partials, registries_adaptors, registries_components, registries_easing, registries_interpolators, utils_Promise, extend__extend, parse__parse, Ractive_initialise, circular );

	var Ractive = function( Ractive, circular, legacy ) {

		var FUNCTION = 'function';
		while ( circular.length ) {
			circular.pop()();
		}
		if ( typeof Date.now !== FUNCTION || typeof String.prototype.trim !== FUNCTION || typeof Object.keys !== FUNCTION || typeof Array.prototype.indexOf !== FUNCTION || typeof Array.prototype.forEach !== FUNCTION || typeof Array.prototype.map !== FUNCTION || typeof Array.prototype.filter !== FUNCTION || typeof window !== 'undefined' && typeof window.addEventListener !== FUNCTION ) {
			throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
		}
		if ( typeof window !== 'undefined' && window.Node && !window.Node.prototype.contains && window.HTMLElement && window.HTMLElement.prototype.contains ) {
			window.Node.prototype.contains = window.HTMLElement.prototype.contains;
		}
		return Ractive;
	}( Ractive__Ractive, circular, legacy );


	// export as Common JS module...
	if ( typeof module !== "undefined" && module.exports ) {
		module.exports = Ractive;
	}

	// ... or as AMD module
	else if ( typeof define === "function" && define.amd ) {
		define( function() {
			return Ractive;
		} );
	}

	// ... or as browser global
	global.Ractive = Ractive;

	Ractive.noConflict = function() {
		global.Ractive = noConflict;
		return Ractive;
	};

}( typeof window !== 'undefined' ? window : this ) );

},{}],18:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":19,"reduce":20}],19:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],20:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}]},{},[4])