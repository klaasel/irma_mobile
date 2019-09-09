import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Animated, Dimensions, Keyboard, Image as RNImage } from 'react-native';
import nbVariables from 'lib/native-base-theme/variables/platform';

import {
  Button,
  Text,
  View,
  Spinner,
} from 'native-base';

import Container from 'components/Container';
import HeaderButton from 'components/HeaderButton';
import PinEntry from './children/PinEntry';
import { STATUS_AUTHENTICATED, STATUS_AUTHENTICATING } from 'store/reducers/appUnlock';
import { namespacedTranslation } from 'lib/i18n';
import irmaLogo from 'assets/irmaLogoAppUnlock.png';

export const t = namespacedTranslation('AppUnlock');

export const headerTitle = t('.title');
export const HeaderLeftButton = () => 
  <HeaderButton source={irmaLogo} />;

export default class AppUnlock extends Component {

  static propTypes = {
    authenticate: PropTypes.func.isRequired,
    blockedDuration: PropTypes.number.isRequired,
    error: PropTypes.object,
    hadFailure: PropTypes.bool.isRequired,
    remainingAttempts: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    dismissAppUnlock: PropTypes.func.isRequired,
  }

  static defaultProps = {
    error: null,
  };

  componentDidUpdate(prevProps) {
    const { status, dismissAppUnlock } = this.props;
    if (prevProps.status !== STATUS_AUTHENTICATED && status === STATUS_AUTHENTICATED)
      dismissAppUnlock();
  }

  renderSpinner() {
    const { status } = this.props;
    if (status !== STATUS_AUTHENTICATING)
      return null;

    return (
      <>
        <View>
          <Spinner
            style={styles.spinnerStyle}
            color="#004C92"
          />
        </View>
        <Text style={styles.statusText}>
          {t('.checkingPin')}
        </Text>
      </>
    );
  }

  renderFailure() {
    const { hadFailure, remainingAttempts, blockedDuration } = this.props;
    if (!hadFailure)
      return null;

    return (
      <Text style={styles.errorText}>
        { blockedDuration === 0 ?
            t('Session.PinEntry.incorrectMessage', {attempts: t('Session.PinEntry.attempts', {count: remainingAttempts})}) :
            t('Session.PinEntry.blocked', {duration: t('Session.PinEntry.duration', {count: blockedDuration})})
        }
      </Text>
    );
  }

  renderError() {
    const { error } = this.props;
    if (!error)
      return null;

    return (
      <Text style={styles.errorText}>
        { error.ErrorType && error.ErrorType === 'transport' ?
            t('Session.PinEntry.error.transport') :
            t('Session.PinEntry.error.unknown')
        }
      </Text>
    );
  }

  render() {
    const { authenticate, remainingAttempts } = this.props;

    return (
      <Container transparent>
        <Animated.View style={{flex: 1, flexDirection: 'column'}}>
          <PinEntry
            clearKey={remainingAttempts}
            minLength={5}
            onPinSubmit={authenticate}
            recommendedLength={7}
            style={{marginTop: Dimensions.get('window').width / 500 * 250 - 20}}
          />
          { this.renderSpinner() }
          { this.renderFailure() }
          { this.renderError() }
        </Animated.View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  spinnerStyle: {
    marginTop: -5,
  },
  statusText: {
    marginTop: 20,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 16*Dimensions.get('window').width / 450,
  },
  errorText: {
    marginTop: 20,
    paddingHorizontal: 10,
    textAlign: 'center',
    color: nbVariables.colors.iosRed,
    fontSize: 16 * Dimensions.get('window').width / 450,
  },
});
