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

// just to make jshint happy
var nc;

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

nc = {
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

module.exports.nc = nc;
module.exports.aac = aac;
module.exports.lfmc = lfmc;
module.exports.sc = sc;
module.exports.notc = notc;
module.exports.mc = mc;
