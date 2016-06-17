/**
 * bridge to fastlane.tools/cert
 *
 *       @example
 *       var Cert = require('node-fastlane').Cert();
 *
 *       Cert.setIdentity({
 *           user: process.env.FASTLANE_USER,
 *           password: process.env.FASTLANE_PASSWORD
 *       });
 *       Cert.refresh()
 *           .then(function(data) {
 *               console.log("OK", data);
 *           })
 *           .catch(function (err) {
 *               console.log("ERROR", err);
 *           });
 * @class Cert
 * @requires Fastlane
 */
var Cert = function() {
  var self = this;

  var Fastlane = require('./lib/fastlane');
  fastlane = new Fastlane();

  // make some fastlane functions public
  /**
   * @method setIdentity
   * @inheritdoc faab.Fastlane#setIdentity
   */
  self.setIdentity = fastlane.setIdentity;

  /**
   * @method getIdentity
   * @inheritdoc faab.Fastlane#getIdentity
   */
  self.getIdentity = fastlane.getIdentity;

  /**
   * refresh certificates
   * @param {Array} args optional
   * @return {Promise}
   */
  self.refresh = function(args) {
    return fastlane.run("cert", args);
  };

};


module.exports = Cert;