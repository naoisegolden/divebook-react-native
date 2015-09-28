'use strict';

var MOCKED_DIVESITE_DATA = [
  {name: 'Name 01', location: 'Tossa de Mar, Girona, Spain'},
  {name: 'Name 02', location: 'Puerto del Carmen, Lanzarote, Spain'},
  {name: 'Name 03', location: 'Illes Medes, Girona, Spain'},
];

var PARSE_APPLICATION_ID = 'Y31uHUHsSOcmfEjLPt2uvT2Qmc53EuX2JCB0iHsK';
var PARSE_JAVASCRIPT_KEY = 'PUA1mxzlF8dA6DgQQlK5UhO3zHDOH3tr7mp2usNu';

var React = require('react-native');
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');

var {
  AppRegistry,
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

  render: function() {
    if (this.state.loading) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource.cloneWithRows(this.data.divesites)}
        renderRow={this.renderDivesiteView}
        style={styles.listView}
      />
    );
  },

  renderDivesiteView: function(divesite) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dive Site: {divesite.name}</Text>
        <Text style={styles.subtitle}>Address: {divesite.address}</Text>
        <Text style={styles.subtitle}>Location: {divesite.location}</Text>
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
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('Divebook', () => Divebook);
