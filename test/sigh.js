var should = require('should');
var nodeFastlane = require('../index');
var Sigh = new nodeFastlane.Sigh();


describe('sigh Tests', function(){
  this.timeout(60000);

  before(function(done){
      done();
  });

  after(function(done){
      done();
  })

  it('should allow to get/setIdentity()', function (done) {
    var identity = Sigh.getIdentity();
    Sigh.setIdentity(identity);
    identity.should.equal(Sigh.getIdentity());
    done();
  });

});