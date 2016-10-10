/**
 * bridge to fastlane.tools/sigh
 *
 *      @example
 *      var Sigh = require('node-fastlane').Sigh();
 *
 *      Sigh.setIdentity({
 *           user: process.env.FASTLANE_USER,
 *          password: process.env.FASTLANE_PASSWORD
 *      });
 *      Sigh.refresh()
 *          .then(function(data) {
 *              console.log("OK", data);
 *          })
 *          .catch(function (err) {
 *              console.log("ERROR", err);
 *          });
 *
 * @class Sigh
 * @requires Fastlane
 */
var Sigh = function() {
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
   * refresh provisioning profiles
   * @param {Array} args optional
   * @return {Promise}
   */
  self.refresh = function(args) {
    if (!args) {
      args = ["download_all"];
    }
    else {
      args.unshift("download_all");
    }
    return fastlane.run("sigh", args);
  };


  /**
   * resign a binary
   * @param {Object} data {{ipa: <IPA FILE>, bundleid: <APP BUNDLEID>, profiles: {<MOBILEPROVISIONING BUNDLEID>: <MOBILEPROVISIONING FILE>, ...}, identity: <OPTIONAL IDENTITY NAME>}}
   * @return {Promise}
   */
  self.resign = function(data) {
    var args = ['resign', data.ipa];

    // flag for bundleid changing (@CHECK as of 12.07.16 this does not handle changing extension or watchapp bundleid)
    args = args.concat(['--new_bundle_id', data.bundleid]);
    
    // flag for identity selection
    args = args.concat(['--signing_identity', data.identity]);

    // add provisioning profile flag for all given profiles ( we have to do is with decreasing length of bundleid )
    var bundleids = Object.keys(data.profiles)
      .sort()
      .reverse()
      .forEach(function(bundleid) {
        args = args.concat(['--provisioning_profile', bundleid + '=' + data.profiles[bundleid]]);
      });
    return fastlane.run("sigh", args);
  };

};

module.exports = Sigh;