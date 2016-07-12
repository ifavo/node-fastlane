#!/bin/bash

# Example Usage
# ./rename.sh /PATH/TO/IPA/FILE.ipa the.old.bundleid the.new.bundleid TEMPFOLDERNAME

IPA_FILE=$1
NEW_BASE_BUNDLE_ID=$2
TEMP_DIR=$3

rm -rf $TEMP_DIR

# create temp folder
mkdir $TEMP_DIR

# unzip ipa
echo "Extracting IPA..."
unzip -q $IPA_FILE -d $TEMP_DIR
echo ""

# Make sure that PATH includes the location of the PlistBuddy helper tool as its location is not standard
export PATH=$PATH:/usr/libexec

# Set the app name
# The app name is the only file within the Payload directory
APP_NAME=$(ls "$TEMP_DIR/Payload/")

# Get current bundle id
OLD_BASE_BUNDLE_ID=`PlistBuddy -c "Print :CFBundleIdentifier" "$TEMP_DIR/Payload/$APP_NAME/Info.plist"`

if [ $OLD_BASE_BUNDLE_ID = $NEW_BASE_BUNDLE_ID ]; then
  echo "bundleid is already set"
  exit
fi

# Replace bundle id in all .plist files
find $TEMP_DIR -type f -name "Info.plist" -print0 | while read -d $'\0' file
do
  OLD_BUNDLE_ID=`PlistBuddy -c "Print :CFBundleIdentifier" "$file"`
  NEW_BUNDLE_ID=`echo $OLD_BUNDLE_ID | sed "s/$OLD_BASE_BUNDLE_ID/$NEW_BASE_BUNDLE_ID/g"`
  
  echo "---> Changing: $OLD_BUNDLE_ID -> $NEW_BUNDLE_ID ($file)"
  
  PlistBuddy -c "Set :CFBundleIdentifier $NEW_BUNDLE_ID" "$file"
  
  HAS_WKCOMPANION=`PlistBuddy -c "Print :WKCompanionAppBundleIdentifier" "$file"`
  if [ -n "$HAS_WKCOMPANION" ]; then
    PlistBuddy -c "Set :WKCompanionAppBundleIdentifier $NEW_BASE_BUNDLE_ID" "$file"
  fi
  
  HAS_NSEXTENSION=`PlistBuddy -c "Print :NSExtension:NSExtensionAttributes:WKAppBundleIdentifier" "$file"`
  if [ -n "$HAS_NSEXTENSION" ]; then
    PlistBuddy -c "Set :NSExtension:NSExtensionAttributes:WKAppBundleIdentifier $NEW_BASE_BUNDLE_ID.watch.watchkitapp" "$file"
  fi
  
  echo "done"
  echo ""
done

# zip up folder as ipa
echo "Zipping up new IPA..."
cd $TEMP_DIR
rm -f $IPA_FILE
zip -qr $IPA_FILE ./*
cd ..
rm -rf $TEMP_DIR
echo ""