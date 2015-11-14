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
var Sigh = function () {
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
    self.refresh = function (args) {
        if ( !args ) {
            args = ["download_all"];
        }
        else {
            args.unshift("download_all");
        }
        return fastlane.run("sigh", args);
    };
    
};

module.exports = Sigh;