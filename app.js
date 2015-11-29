var nodeFastlane = require('./index');

var Cert = new nodeFastlane.Cert();

Cert.setIdentity({
    user: process.env.FASTLANE_USER,
    password: process.env.FASTLANE_PASSWORD
});
Cert.refresh()
    .then(function(data) {
        console.log("OK", data);
    })
    .catch(function (err) {
        console.log("ERROR", err);
    });



var Sigh = new nodeFastlane.Sigh();

Sigh.setIdentity({
    user: process.env.FASTLANE_USER,
    password: process.env.FASTLANE_PASSWORD
});
Sigh.refresh()
    .then(function(data) {
        console.log("OK", data);
    })
    .catch(function (err) {
        console.log("ERROR", err);
    });

Sigh.resign({
        ipa: 'test.ipa',
        profile: 'test.mobileprovision',
        identity: 'iPhone Distribution: Company'
    })
    .then(function(data) {
        console.log("OK", data);
    })
    .catch(function (err) {
        console.log("ERROR", err);
    });
