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
      pArgs.concat(['-o', 'cache']);
    }

    var binary = locateBinary(tool);
    if (!binary) {
      deferred.reject(tool + " not installed");
      return deferred.promise;
    }
    
    var runtime = {
      env: {
        FASTLANE_USER: identity.user,
        FASTLANE_PASSWORD: identity.password,
      }
    };
    
    var spawnedProcess = childProcess.spawn(binary, pArgs, runtime);

    console.log('fastlane started: ', binary, pArgs);
    console.log('fastlane command: ', binary + ' ' + pArgs.join(' '));

    var response = '';
    var error = '';

    spawnedProcess.stdout.on('exit', function(data) {
      if (error) {
        deferred.reject(data);
        return;
      }
      deferred.resolve();
    });

    spawnedProcess.stdout.on('close', function(data) {
      if (error) {
        deferred.reject(data);
        return;
      }
      deferred.resolve(response);
    });

    spawnedProcess.stdout.on('error', function(data) {
      if (String(data).indexOf('SecPolicySetValue: One or more parameters passed to a function were not valid') !== -1) {
        return;
      }
      error += String(data) + '\n';
    });

    // mostly error handling
    spawnedProcess.stdout.on('data', function(data) {
      response += data;
      var lines = String(data).split("\n");
      var line;
      while (line = lines.shift()) {
        console.log(line);
        if (line.indexOf('seem to be wrong') !== -1) {
          deferred.reject(line);
          spawnedProcess.kill();
          return;
        }

        // password re-enter request
        if (line.indexOf('Do you want to re-enter your password?') !== -1) {
          deferred.reject(line);
          spawnedProcess.kill();
          return;
        }

        // asking for an identity?
        if (line.indexOf('Available identities:') !== -1) {
          // argsHelper provides an identity?
          if (argsHelper && argsHelper.identity) {
            spawnedProcess.stdin.write(argsHelper.identity + "\n");
          }
          else {
            deferred.reject("Identity was ambiguous, please provide it as a parameter");
            spawnedProcess.kill();
          }
          return;
        }
      }
    });

    spawnedProcess.stderr.on('data', function(data) {
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