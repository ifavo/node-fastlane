var should = require('should');
var nodeFastlane = require('../index');

describe('utils Tests', function(){

  before(function(done){
      done();
  });

  after(function(done){
      done();
  })
/*
  it('should load profile from *.mobileprovision file', function (done) {
    nodeFastlane.Utils.loadProfile("test/Test.mobileprovision")
        .then(function(data) {
            data.UUID.should.equal('68501ffe-7bba-4d5c-854b-c1e269c0d971');
            done();
        }, function (err) {
            should.not.exist(err);
            done();
        })
        ;
  });
*/

  it('should fail to load profile from random files', function (done) {
    nodeFastlane.Utils.loadProfile("package.json")
        .then(function(data) {
            should.not.exist(data);
            done();
        }, function (err) {
            should.exist(err);
            done();
        })
        ;
  });

/*
  it('should unlock a keychain without an error', function (done) {
    nodeFastlane.Utils.unlockKeychain(process.cwd() + "/test/Test.keychain", "password")
        .then(function(data) {
            done();
        }, function (err) {
            should.not.exist(err);
            done();
        })
        ;
  });
*/  

  it('should fail to unlock a none-keychain', function (done) {
    nodeFastlane.Utils.unlockKeychain("package.json", "password")
        .then(function(data) {
            done(new Error("should not be able to unlock none-keychains"));
        }, function (err) {
            should.exist(err);
            done();
        })
        ;
  });
/*
  it('should load profile from an .ipa file', function (done) {
    nodeFastlane.Utils.loadIpaProfile(process.cwd() + "/test/Test.ipa")
        .then(function(data) {
            should.exist(data);
            should.exist(data.CFBundleIdentifier);
            done();
        }, function (err) {
            should.not.exist(err);
            done();
        })
        ;
  });
*/
  it('should not load .ipa profile from a random file', function (done) {
    nodeFastlane.Utils.loadIpaProfile("package.json")
        .then(function(data) {
            should.not.exist(data);
            done();
        }, function (err) {
            should.exist(err);
            done();
        })
        ;
  });

  

});