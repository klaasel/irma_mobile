import { NativeModules } from 'react-native';
const { IrmaBridge } = NativeModules;

import { LogToFileWithLocation } from './utils';

// Dispatch the action to IrmaBridge _after_ the action has been dispatched through all reducers
export default (/*store*/) => next => action => {
  const result = next(action);

  if (
      typeof action === 'object' &&
      typeof action.type === 'string' &&
      action.type.substring(0, 11) === 'IrmaBridge.'
  ) {
    if (__DEV__) {
      const actionJson = JSON.stringify({
        ...action,
        type: action.type.substring(11),
      });
      const logtext = 'Sending action from bridge: |' + actionJson;
      const timestamp = new Date().toISOString();
      console.log(timestamp + ' - Sending action to bridge:', action); // eslint-disable-line no-console
      LogToFileWithLocation(logtext);
    }
    IrmaBridge.dispatch(
      JSON.stringify({
        ...action,
        type: action.type.substring(11),
      })
    );
  }

  return result;
};
