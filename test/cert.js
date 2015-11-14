var should = require('should');
var nodeFastlane = require('../index');
var Cert = new nodeFastlane.Cert();


describe('cert Tests', function(){
  this.timeout(60000);

  before(function(done){
      done();
  });

  after(function(done){
      done();
  })

  it('should allow to get/setIdentity()', function (done) {
    var identity = Cert.getIdentity();
    Cert.setIdentity(identity);
    identity.should.equal(Cert.getIdentity());
    done();
  });


  it('should return a password error with default settings', function (done) {
    Cert.refresh()
        .then(function(data) {
            done(new Error(data));
        })
        .fail(function (err) {
            err = String(err);

            if ( err.indexOf('not installed') !== -1 ) {
                return done(new Error(err));
            }

            if (err.indexOf('seem to be wrong') !== -1 ) {
                return done();
            }

            if (err.indexOf('Starting login with user') === -1 ) {
                return done(new Error("did not see a login try"));
            }

            done();
        })
        ;
  });


});