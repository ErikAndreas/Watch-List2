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
