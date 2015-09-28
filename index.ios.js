'use strict';

var MOCKED_DIVESITE_DATA = [
  {name: 'Name 01', location: 'Tossa de Mar, Girona, Spain'},
  {name: 'Name 02', location: 'Puerto del Carmen, Lanzarote, Spain'},
  {name: 'Name 03', location: 'Illes Medes, Girona, Spain'},
];

var React = require('react-native');
var {
  AppRegistry,
  ListView,
  StyleSheet,
  Text,
  View,
} = React;

var Divebook = React.createClass({
  getInitialState: function () {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }).cloneWithRows(MOCKED_DIVESITE_DATA)
    };
  },
  componentDidMount: function() {
    this.fetchData();
  },
  fetchData: function () {
   // Return mocked data for now
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(MOCKED_DIVESITE_DATA)
    });
  },
  render: function() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderDivesite}
        style={styles.listView}
      />
    );
  },
  renderDivesite: function(divesite) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dive Site: {divesite.name}</Text>
        <Text style={styles.subtitle}>Location: {divesite.location}</Text>
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
