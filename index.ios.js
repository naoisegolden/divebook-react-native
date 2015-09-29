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
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} = React;

Parse.initialize(
  PARSE_APPLICATION_ID,
  PARSE_JAVASCRIPT_KEY,
);

var Divebook = React.createClass({
  mixins: [ParseReact.Mixin], // Enable query subscriptions

  observe: function() {
    // The results will be available at this.data.divesites
    return {
      divesites: (new Parse.Query('divesite')).ascending('createdAt')
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
    var src = this.mapImageSrc(divesite.location)
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={{uri: src}} />
        <View style={styles.rightContainer}>
          <Text style={styles.title}>{divesite.name}</Text>
          <Text style={styles.subtitle}>{divesite.address}</Text>
        </View>
      </View>
    );
  },
  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading...
        </Text>
      </View>
    );
  },
  mapImageSrc: function(geopoint) {
    return `https://maps.googleapis.com/maps/api/staticmap?markers=size:tiny|${geopoint.latitude},${geopoint.longitude}&zoom=8&size=200x200&key=${GOOGLE_MAPS_API_KEY}`
  },
  renderHeaderWrapper: function(refreshingIndicator) {
    return (
      <View>
        {refreshingIndicator}
      </View>
    )
  },
});

var styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 20,
  },
  subtitle: {
    color: '#333333',
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  image: {
    height: 100,
    width: 100,
  }
});

AppRegistry.registerComponent('Divebook', () => Divebook);
