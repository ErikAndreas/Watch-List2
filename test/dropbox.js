var should = require('chai').should();

/*global describe, it, before, beforeEach, after, afterEach */
describe('dropbox', function () {
  /* jshint -W030 */
  var dropbox = require('../js/dropbox');
  it('auths', function (done) {
  	dropbox.isAuth().should.be.false;
  	done();
  });
});