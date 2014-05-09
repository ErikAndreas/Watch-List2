var should = require('chai').should();

/*global describe, it, before, beforeEach, after, afterEach */
describe('lastFMOnSpotify', function () {
  /* jshint -W030 */
  var lastFMOnSpotify = require('../js/lastFMOnSpotify');
  
  it('(callback) news', function (done) {
    lastFMOnSpotify.getSuggsOnSpot('saerdnakire', function (err, res) {
      should.not.exist(err);
      res.should.exist;
      res.should.be.instanceof(Array);
      done();
    });
  });

  it('(promise) news', function (done) {
    lastFMOnSpotify.getSuggsOnSpot('saerdnakire').then(function (res) {
      res.should.exist;
      res.should.be.instanceof(Array);
      done();
    }).fail(function (err) {
      done(err);
    });
  });

});
