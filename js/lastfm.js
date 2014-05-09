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
