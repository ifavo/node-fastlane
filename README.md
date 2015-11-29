app binary handling utilities

## Install

    npm install node-fastlane


## Test

    npm install node-fastlane
    npm test
    
* coverage report is generated under `docs/coverage/index.html`

## Documentation

    sudo gem install jsduck
    npm run docs


## sigh

### resign

    var sigh = new Sigh();
    sigh.resign({
        ipa: 'test.ipa',
        profile: 'profile.mobileprovision',
        
         /**
          * (optional) identity
          * will response with this identity if prompted for an identity
          */
        identity: 'iPhone Distribution: Your Company'
      })
      .then(function() {
        deferred.resolve();
      }, deferred.reject);


* documentation is generated under `docs/index.html`