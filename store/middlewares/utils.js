/* eslint-disable no-console */
import {PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const RNFS = require('react-native-fs');
const path = RNFS.DocumentDirectoryPath + '/test_' +  new Date().toDateString() + '.txt';

export function LogToFileWithLocation(text) {
    console.log('log to file...');
    writeToFile(text);

    console.log('trying to log position to file...');
    PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION ).then(
      (granted) => {
        if (granted) {
          Geolocation.getCurrentPosition(
            (position) => {
              // position is not always got, write it to the log separately.
              // eslint-disable-next-line prefer-template
              let geoInfo = 'position unknown';
              if (position !== undefined)
                  geoInfo = 'Position:|' + position.coords.latitude + ',' + position.coords.longitude;

              writeToFile(geoInfo);
            },
            (error) => {
              console.log(error); 
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 6000 }
          );
        } else {
          console.log( 'ACCESS_FINE_LOCATION permission denied, ask for permission' );
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Access location',
              message:
                'App needs location permission',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          ).then(
            (success) => {
                if (success === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use location, retry logging...');
                    LogToFileWithLocation(text);
                } else {
                    console.log('Location permission denied');
                }
            }
          );
        }
      }
    );
}

function writeToFile(text) {
    const timestamp = new Date().toISOString();

    // write the file if not existing, else appendFile
    // eslint-disable-next-line no-unused-expressions
    !RNFS.exists(path).then((exists) => {
        if (!exists) {
         // eslint-disable-next-line prefer-template
         RNFS.writeFile(path, '[' + timestamp + ']| ' + text + '\n', 'utf8')
         // eslint-disable-next-line no-unused-vars
         .then((writeSuccess) => {
           console.log('File created and written to');
         })
         .catch((err) => {
           console.log(err.message);
         });
        } else {
         RNFS.appendFile(path, '[' + timestamp + ']| ' + text + '\n', 'utf8')
         // eslint-disable-next-line no-unused-vars
         .then((appendSuccess) => {
           console.log('File appended');
         })
         .catch((err) => {
           console.log(err.message);
         });
        }
     });
}

