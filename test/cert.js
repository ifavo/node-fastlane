var should = require('should');
var nodeFastlane = require('../index');
var Cert = new nodeFastlane.Cert();


describe('cert Tests', function() {
  this.timeout(60000);

  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  it('should allow to get/setIdentity()', function(done) {
    var identity = Cert.getIdentity();
    Cert.setIdentity(identity);
    identity.should.equal(Cert.getIdentity());
    done();
  });


});