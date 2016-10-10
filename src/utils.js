var childProcess = require('child_process');
var plist = require('plist');
var Q = require('q');
var AdmZip = require('adm-zip');
var fs = require('fs');
var parseApk = require('apk-parser');

/**
 * some little helper to handle everything regarding apps better
 *
 *       @example
 *       var Utils = require('node-fastlane').Utils();
 *
 *       Utils.LoadIpaProfile("test.ipa")
 *           .then(function(data) {
 *               console.log("Profile", data);
 *           })
 *           .catch(function (err) {
 *               console.log("ERROR", err);
 *           });
 * @class Utils
 */


/**
 * load a file from an .ipa file
 * this is not exact because it uses "indexOf", so be careful about the filename param
 * @param {String} ipa
 * @param {String} filename
 * @return {Promise}
 */
exports.loadIpaFile = function(ipa, filename, outputFile) {
  var deferred = Q.defer();

  setTimeout(function() {
    try {
      var zip = new AdmZip(ipa);
      var zipEntries = zip.getEntries();
      var hasFile = false;
      zipEntries.forEach(function(zipEntry) {
        if (hasFile) {
          return;
        }

        if (zipEntry.entryName.indexOf(filename) !== -1) {

          // unzip to temp. file
          fs.writeFileSync(outputFile, zip.readFile(zipEntry));
          deferred.resolve();
          hasFile = true;
        }
      });

    }
    catch (err) {
      deferred.reject(err);
    }

    if (!hasFile) {
      deferred.reject("file not found");
    }
  }, 0);

  return deferred.promise;
};

/**
 * load data from an .ipa file
 * @param {String} ipa
 * @return {Promise}
 */
exports.loadIpaProfile = function(ipa) {
  var deferred = Q.defer();

  var tmpFile = ipa + '-temp.plist';
  exports.loadIpaFile(ipa, 'app/Info.plist', tmpFile)
    .then(function() {

      // convert to readable text xml
      var process = childProcess.spawn('plutil', ['-convert', 'xml1', tmpFile]);
      process.stdout.on('close', function(data) {
        // read converted plist
        var profile = fs.readFileSync(tmpFile);

        // parse it
        var result = plist.parse(String(profile));

        // clean up
        fs.unlinkSync(tmpFile)

        // return it
        deferred.resolve(result);
      });
    }, deferred.reject);

  return deferred.promise;
};

/**
 * load data from an .apk file
 * @param {String} apk
 * @return {Promise}
 */
exports.loadApkProfile = function(apk) {
  var deferred = Q.defer();

  parseApk(apk, function(err, data) {
    err ? deferred.reject(data) : deferred.resolve(data);
  });

  return deferred.promise;
};

/**
 * load plist profile from a mobile provisioning file
 * @param {String} filename
 * @return {Promise}
 */
exports.loadProfile = function(filename) {
  var deferred = Q.defer();
  var process = childProcess.spawn('security', ['cms', '-D', '-i', filename]);

  var profile = '';
  process.stdout.on('close', function(data) {
    if (profile) {
      var result = plist.parse(profile);
      deferred.resolve(result);
    }
    else {
      deferred.reject("could not extract profile");
    }
  });

  process.stdout.on('data', function(data) {
    profile += String(data);
  });

  process.stderr.on('data', function(data) {
    // workaround for macOS (sierra 10.12) error message
    if (String(data).indexOf('SecPolicySetValue: One or more parameters passed to a function were not valid') !== -1) {
      return;
    }
    deferred.reject(String(data));
  });

  return deferred.promise;
};

/**
 * changes the bundleid in all Info.plist-files inside an IPA file
 * @param  {Object} params {filepath: STRING, oldBundleId: STRING, newBundleId: STRING, tempFolderPath: STRING}
 * @return {Promise}
 */
exports.changeBundleId = function(params) {
  var deferred = Q.defer();

  childProcess.execFile(__dirname + "/lib/change_bundle_id.sh", [params.filepath, params.newBundleId, params.tempFolderPath], {
    maxBuffer: 1024 * 1024,
  }, function(err, out) {
    if (err) {
      return deferred.reject(err);
    }
    deferred.resolve(true);
  });

  return deferred.promise;
}

/**
 * tries to unlock the given keychain
 * @param {String} keychain filename
 * @param {String} password
 * @return {Promise}
 */
exports.unlockKeychain = function(keychain, password) {
  var deferred = Q.defer();


  var process = childProcess.spawn('security', ['unlock-keychain', '-p', password, keychain]);

  process.stdout.on('close', function(data) {
    deferred.resolve();
  });

  process.stdout.on('data', function(data) {});

  process.stderr.on('data', function(data) {
    deferred.reject(String(data));
  });

  return deferred.promise;
};

/**
 * creates a new keychain
 * @param {String} keychain filename
 * @param {String} password
 * @return {Promise}
 */
exports.createKeychain = function(keychain, password) {
  var deferred = Q.defer();


  var process = childProcess.spawn('security', ['create-keychain', '-p', password, keychain]);

  process.stdout.on('close', function(data) {
    deferred.resolve();
  });

  process.stdout.on('data', function(data) {});

  process.stderr.on('data', function(data) {
    deferred.reject(String(data));
  });

  return deferred.promise;
};

/**
 * deletes a keychain
 * @param {String} keychain filename
 * @return {Promise}
 */
exports.deleteKeychain = function(keychain) {
  var deferred = Q.defer();


  var process = childProcess.spawn('security', ['delete-keychain', keychain]);

  process.stdout.on('close', function(data) {
    deferred.resolve();
  });

  process.stdout.on('data', function(data) {});

  process.stderr.on('data', function(data) {
    deferred.reject(String(data));
  });

  return deferred.promise;
};


/**
 * import a certificate into a keychain
 * @param {String} keychain filename
 * @param {String} password
 * @param {String} file
 * @param {String} filePassword
 * @return {Promise}
 */
exports.keychainImport = function(keychain, file, filePassword) {
  var deferred = Q.defer();


  var process = childProcess.spawn('security', ['import', file, '-k', keychain, '-P', filePassword, '-A']);

  process.stdout.on('close', function(data) {
    deferred.resolve();
  });

  process.stdout.on('data', function(data) {});

  process.stderr.on('data', function(data) {
    deferred.reject(String(data));
  });

  return deferred.promise;
};