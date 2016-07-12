var childProcess = require('child_process');
var Q = require('q');
var fs = require('fs');

/**
 * bridge to fastlane.tools cli tools
 * @class Fastlane
 */
var Fastlane = function() {
  var identity = {
    user: 'user@apple.com',
    password: '******'
  };
  var binaryPaths = ['/usr/bin/', '/usr/local/bin/'];
  var self = this;

  /**
   * sets the current identity which should be used
   * @param {Object} newIdentity
   */
  self.setIdentity = function(newIdentity) {
    identity = newIdentity;
  };

  /**
   * returns the current identity
   * @return {String}
   */
  self.getIdentity = function() {
    return identity;
  };

  /**
   * run any fastlane tool
   * @param {String} tool which tool to run
   * @param {Array} args optional
   * @param {Array} argsHelper optional
   * @return {Promise}
   */
  self.run = function(tool, args, argsHelper) {

    var deferred = Q.defer();
    var pArgs = args || [];

    if (pArgs.indexOf('-o') == -1 && pArgs.indexOf('--output-path') == -1) {
      pArgs.push('-o', 'cache');
    }

    var binary = locateBinary(tool);
    if (!binary) {
      deferred.reject(tool + " not installed");
      return deferred.promise;
    }
    var process = childProcess.spawn(binary, pArgs, {
      env: {
        "FASTLANE_USER": identity.user,
        "FASTLANE_PASSWORD": identity.password
      }
    });

    console.log('fastlane started: ', binary, pArgs);

    console.log('fastlane command: ', binary + ' ' + pArgs.join(' '));

    var response = '';
    process.stdout.on('close', function(data) {
      deferred.resolve(response);
    });

    process.stdout.on('exit', function(data) {
      console.log("fastlane exit: ", data);
      deferred.resolve();
    });

    process.stdout.on('close', function(data) {
      console.log("fastlane close: ", data);
      deferred.resolve();
    });

    process.stdout.on('error', function(data) {
      console.log("fastlane error: ", data);
      deferred.reject(data);
    });

    // mostly error handling
    process.stdout.on('data', function(data) {
      response += data;
      var lines = String(data).split("\n");
      var line;
      while (line = lines.shift()) {
        console.log(line);
        if (line.indexOf('seem to be wrong') !== -1) {
          deferred.reject(line);
          process.kill();
          return;
        }

        // password re-enter request
        if (line.indexOf('Do you want to re-enter your password?') !== -1) {
          deferred.reject(line);
          process.kill();
          return;
        }

        // asking for an identity?
        if (line.indexOf('Available identities:') !== -1) {
          // argsHelper provides an identity?
          if (argsHelper && argsHelper.identity) {
            process.stdin.write(argsHelper.identity + "\n");
          }
          else {
            deferred.reject("Identity was ambiguous, please provide it as a parameter");
            process.kill();
          }
          return;
        }
      }
    });

    process.stderr.on('data', function(data) {
      response += 'error: ' + data;
    });

    return deferred.promise;
  };


  /**
   * find binary path for a command
   * @private
   * @return {String|Boolean}
   */
  function locateBinary(cmd) {
    for (var i in binaryPaths) {
      if (fs.existsSync(binaryPaths[i] + cmd)) {
        return binaryPaths[i] + cmd;
      }
    }
    return false;
  }

};

module.exports = Fastlane;