var should = require('chai').should();

/*global describe, it, before, beforeEach, after, afterEach */
describe('lastfm', function () {
  /* jshint -W030 */
  var lfm = require('../js/lastfm');
  it('(callback) fails on no username', function (done) {
    lfm.getNews('', '00198b31b392d0750f88819830e49680', function (err, res) {
      should.exist(err);
      err.should.be.instanceof(Error);
      err.error.should.equal(6);
      done();
    });
  });

  it('(callback) fails on invalid apiKey', function (done) {
    lfm.getNews('saerdnakire', '00198b31b392d0750f88819830e4968--', function (err, res) {
      should.exist(err);
      err.should.be.instanceof(Error);
      err.error.should.equal(10);
      done();
    });
  });

  it('(callback) fetches news provided valid username and apiKey', function (done) {
    lfm.getNews('saerdnakire', '00198b31b392d0750f88819830e49680', function (err, res) {
      should.not.exist(err);
      res.should.exist;
      res.should.be.instanceof(Array);
      done();
    });
  });

  it('(promise) fails on no username', function (done) {
    lfm.getNews('', '00198b31b392d0750f88819830e49680').fail(function (err) {
      should.exist(err);
      err.should.be.instanceof(Error);
      err.error.should.equal(6);
      done();
    });
  });

  it('(promise) fails on invalid apiKey', function (done) {
    lfm.getNews('saerdnakire', '00198b31b392d0750f88819830e4968--').fail(function (err) {
      should.exist(err);
      err.should.be.instanceof(Error);
      err.error.should.equal(10);
      done();
    });
  });

  it('(promise) fetches news provided valid username and apiKey', function (done) {
    lfm.getNews('saerdnakire', '00198b31b392d0750f88819830e49680').then(function (res) {
      res.should.exist;
      res.should.be.instanceof(Array);
      done();
    }).fail(function (err) {
      console.log(err);
      done(err);
    });
  });
});
