import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import LogDashboard, { t } from './LogDashboard';

import fullCredentials from 'store/mappers/fullCredentials';
import fullDisclosureCandidatesFromLogs from '../../store/mappers/fullDisclosuresCandidatesFromLogs';
import fullRemovedCredentials from "../../store/mappers/fullRemovedCredentials";

const MAX_LOAD_LOGS = 20;

const mapStateToProps = (state) => {
  const {
    irmaConfiguration,
    logs: {
      loadedLogs
    },

  } = state;

  if (loadedLogs === null) {
    return {
      loadedLogs: null,
    };
  }

  return {
    loadedLogs: loadedLogs.map(log => ({
      ...log,
      issuedCredentials: fullCredentials(log.issuedCredentials, irmaConfiguration),
      disclosuresCandidates: fullDisclosureCandidatesFromLogs(log.disclosedCredentials, irmaConfiguration),
      removedCredentials: fullRemovedCredentials(log.removedCredentials, irmaConfiguration),
    }))
  };
};

@connect(mapStateToProps)
export default class LogDashboardContainer extends Component {

  static propTypes = {
    loadedLogs: PropTypes.array
  };

  static options = {
    topBar: {
      title: {
        text: t('.title'),
      },
    },
  };

  state = {
    logs: [],
    loadingFinished: false,
  };

  render() {
    const { logs, loadingFinished } = this.state;

    return (
        <LogDashboard
            logs={logs}
            loadingFinished={loadingFinished}
            loadNewLogs={this.loadNewLogs.bind(this)}
        />
    );
  }

  loadNewLogs() {
    const { dispatch } = this.props;
    const { logs, loadingFinished } = this.state;

    if (!loadingFinished) {
      dispatch({
        type: 'IrmaBridge.LoadLogs',
        before: logs[logs.length - 1].time,
        max: MAX_LOAD_LOGS,
      });
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'IrmaBridge.LoadLogs',
      before: moment().format('X'),
      max: MAX_LOAD_LOGS,
    });
  }

  componentDidUpdate() {
    const { loadedLogs } = this.props;
    const { logs, loadingFinished } = this.state;

    if (loadedLogs !== null && !loadingFinished) {
      if (loadedLogs.length === 0) { // All logs are loaded
        this.setState({
          loadingFinished: true,
        });
        return;
      }

      let lastLoaded = loadedLogs[loadedLogs.length - 1].time;
      if (logs.length === 0 || lastLoaded !== logs[logs.length - 1].time) {
        this.setState({
          logs: logs.concat(loadedLogs),
          loadingFinished: loadedLogs.length < MAX_LOAD_LOGS,
        });
      }
    }
  }
}
