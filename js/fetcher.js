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
