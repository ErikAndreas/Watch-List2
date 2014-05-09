var should = require('chai').should();

/*global describe, it, before, beforeEach, after, afterEach */
describe('spotify', function () {
  /* jshint -W030 */
  var spotify = require('../js/spotify');
  it('(callback) news', function (done) {
    spotify.lookupNews('vampire', null, function (err, res) {
      should.not.exist(err);
      res.should.exist;
      res.should.be.instanceof(Array);
      done();
    });
  });

  it('(promise) news', function (done) {
    spotify.lookupNews('vampire').then(function (res) {
      res.should.exist;
      res.should.be.instanceof(Array);
      done();
    }).fail(function (err) {
      done(err);
    });
  });

});
