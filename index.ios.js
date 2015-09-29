'use strict';

var PARSE_APPLICATION_ID = 'Y31uHUHsSOcmfEjLPt2uvT2Qmc53EuX2JCB0iHsK';
var PARSE_JAVASCRIPT_KEY = 'PUA1mxzlF8dA6DgQQlK5UhO3zHDOH3tr7mp2usNu';
var GOOGLE_MAPS_API_KEY = 'AIzaSyBDZOWrvmGMgmhimndfQa9TnFn21M_rTAQ';

var React = require('react-native');
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var RefreshableListView = require('react-native-refreshable-listview')

var {
  AppRegistry,
  Button,
  Image,
  ListView,
  NavigatorIOS,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} = React;

Parse.initialize(
  PARSE_APPLICATION_ID,
  PARSE_JAVASCRIPT_KEY,
);

var Divebook = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.navigator}
        initialRoute={{
          title: 'Divebook',
          component: DivesitesList,
        }}
      />
    );
  }
});

var EmptyView = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>Empty View</Text>
      </View>
    );
  },
});

var DivesitesList = React.createClass({
  mixins: [ParseReact.Mixin], // Enable query subscriptions

  observe: function() {
    // The results will be available at this.data.divesites
    return {
      divesites: (new Parse.Query('divesite')).descending('createdAt')
    };
  },
  getInitialState: function () {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loading: true,
    };
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.loading && (this.pendingQueries().length == 0)) {
      this.setState({ loading: false });
    }
  },
  reloadListView: function() {
    this.refreshQueries();
  },

  render: function() {
    if (this.state.loading) {
      return this.renderLoadingView();
    }

    return (
      <RefreshableListView
        dataSource={this.state.dataSource.cloneWithRows(this.data.divesites)}
        renderRow={this.renderDivesiteView}
        style={styles.listView}
        loadData={this.reloadListView}
        refreshDescription="Finding divesites nearby…"
        renderHeaderWrapper={this.renderHeaderWrapper}
      />
    );
  },

  renderDivesiteView: function(divesite) {
    var src = mapImageSrc(divesite.location)
    return (
      <TouchableHighlight onPress={this.showDivesite.bind(this, divesite)}>
        <View style={styles.rowContainer}>
          <View style={styles.rightContainer}>
            <Text style={styles.title}>{divesite.name}</Text>
            <Text style={styles.subtitle}>{divesite.address}</Text>
          </View>
          <Image style={styles.thumb} source={{uri: src}} />
        </View>
      </TouchableHighlight>
    );
  },
  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading…
        </Text>
      </View>
    );
  },
  renderHeaderWrapper: function(refreshingIndicator) {
    return (
      <View>
        {refreshingIndicator}
      </View>
    )
  },
  showDivesite: function(divesite) {
    this.props.navigator.push({
      component: DivesiteShow,
      passProps: { divesite },
    });
  },
});

var DivesiteShow = React.createClass({
  render: function() {
    var divesite = this.props.divesite;
    var src = mapImageSrc(divesite.location, {width: 800, height: 400});
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{divesite.name}</Text>
        <Text style={styles.subtitle}>{divesite.address}</Text>
        <Image style={styles.map} source={{uri: src}} />
        <TouchableHighlight
          style={styles.button}
          onPress={this.logDive.bind(this, divesite)}>
            <Text style={styles.buttonText}>Log a dive here…</Text>
        </TouchableHighlight>
      </View>
    );
  },

  logDive: function(divesite) {
    // blank on purpose
  }
});

var styles = StyleSheet.create({
  navigator: {
    flex: 1,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5FCFF',
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
  },
  rightContainer: {
    flex: 1,
    padding: 10,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 65,
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    color: '#333333',
  },
  listView: {
    paddingTop: 65,
    backgroundColor: '#F5FCFF',
  },
  thumb: {
    height: 100,
    width: 100,
  },
  map: {
    height: 200,
    width: 400,
    margin: 20,
  },
  button: {
    borderRadius: 5,
    borderWidth: 2,
    marginTop: 20,
    padding: 20,
  },
  buttonText: {
    fontSize: 20,
  }
});

// Auxiliary functions (TODO: modularize)
var mapImageSrc = function(geopoint, options = { width: 200, height: 200 }) {
  return `https://maps.googleapis.com/maps/api/staticmap?markers=size:tiny|${geopoint.latitude},${geopoint.longitude}&zoom=8&size=${options.width}x${options.height}&key=${GOOGLE_MAPS_API_KEY}`
};

AppRegistry.registerComponent('Divebook', () => Divebook);
