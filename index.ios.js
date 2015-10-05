'use strict';

var PARSE_APPLICATION_ID = 'Y31uHUHsSOcmfEjLPt2uvT2Qmc53EuX2JCB0iHsK';
var PARSE_JAVASCRIPT_KEY = 'PUA1mxzlF8dA6DgQQlK5UhO3zHDOH3tr7mp2usNu';
var GOOGLE_MAPS_API_KEY = 'AIzaSyBDZOWrvmGMgmhimndfQa9TnFn21M_rTAQ';

var React = require('react-native');
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var RefreshableListView = require('react-native-refreshable-listview');
var FBSDKLogin = require('react-native-fbsdklogin');

var {
  AppRegistry,
  Button,
  DatePickerIOS,
  Heading,
  Image,
  ListView,
  NavigatorIOS,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  StatusBarIOS,
  View,
} = React;

var {
  FBSDKLoginButton,
} = FBSDKLogin;

Parse.initialize(
  PARSE_APPLICATION_ID,
  PARSE_JAVASCRIPT_KEY,
);

var Divebook = React.createClass({
  render: function() {
    StatusBarIOS.setStyle('light-content', true);
    return (
      <NavigatorIOS
        style={styles.navigator}
        initialRoute={{
          component: DivebookSplash,
        }}
      />
    );
  }
});

var DivebookSplash = React.createClass({
  render: function() {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText} onPress={this.continue.bind(this)}>Divebook</Text>
        <Image source={require('image!diver')} style={styles.splashImage} />
        <Login />
      </View>
    );
  },

  continue: function() {
    StatusBarIOS.setStyle('default', true);
    this.props.navigator.replace({
      title: 'Divebook',
      component: DivesitesList,
    });
  },
});

var Login = React.createClass({
  render: function() {
    return (
      <View>
        <FBSDKLoginButton
          onLoginFinished={(error, result) => {
            if (error) {
              alert('Error logging in.');
            } else {
              if (result.isCanceled) {
                alert('Login cancelled.');
              } else {
                alert('Logged in.');
              }
            }
          }}
          onLogoutFinished={() => alert('Logged out.')}
          readPermissions={[]}
          publishPermissions={['publish_actions']}/>
      </View>
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
  watchID: (null: ?number), // to store geolocation watcher

  observe: function() {
    // The results will be available at this.data.divesites
    return {
      divesites: (new Parse.Query('divesite')).near('location', this.state.position)
    };
  },

  getInitialState: function () {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loading: true,
      position: undefined,
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.loading && (this.pendingQueries().length == 0)) {
      this.setState({ loading: false });
    }
  },

  componentDidMount: function() {
    navigator.geolocation.getCurrentPosition(
      (position) => this.setState({position: positionToGeoPoint(position)}),
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      positionToGeoPoint(position)
      this.setState({position: positionToGeoPoint(position)});
    });
  },

  componentWillUnmount: function() {
    navigator.geolocation.clearWatch(this.watchID);
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
    this.props.navigator.push({
      component: DivesiteLog,
      passProps: { divesite },
    });
  },
});

var DivesiteLog = React.createClass({
  mixins: [ParseReact.Mixin],

  observe: function() {
    // blank on purpose
  },

  getDefaultProps: function () {
    return {
      date: new Date(),
      timeZoneOffsetInHours: (-1) * (new Date()).getTimezoneOffset() / 60,
    };
  },

  getInitialState: function() {
    return {
      date: this.props.date,
      timeZoneOffsetInHours: this.props.timeZoneOffsetInHours,
    };
  },

  render: function() {
    var divesite = this.props.divesite;

    return (
      <ScrollView
        ref='scrollView'
        contentContainerStyle={styles.container}
        keyboardDismissMode='on-drag'
      >
        <Text style={styles.subtitle}>Log dive in</Text>
        <Text style={styles.title}>{divesite.name}</Text>
        <Text style={styles.subtitle}>{divesite.address}</Text>
        <Text style={styles.label}>Start Time</Text>
        <DatePickerIOS
          date={this.state.date}
          mode="datetime"
          timeZoneOffsetInMinutes={this.state.timeZoneOffsetInHours * 60}
          onDateChange={this.onDateChange}
        />
        <Text style={styles.label}>Max. Depth (meters)</Text>
        <TextInput
          ref='maxDepth'
          style={styles.input}
          onFocus={inputFocused.bind(this, 'maxDepth')}
          keyboardType='numeric'
          onChange={this.onInputMaxDepth.bind(this)}
        />
        <Text style={styles.label}>Water Temperature (celsius)</Text>
        <TextInput
          ref='temperature'
          style={styles.input}
          onFocus={inputFocused.bind(this, 'temperature')}
          keyboardType='numeric'
          onChange={this.onInputTemp.bind(this)}
        />
        <TouchableHighlight
          style={styles.button}
          onPress={this.log}>
            <Text style={styles.buttonText}>Log it</Text>
        </TouchableHighlight>
      </ScrollView>
    );
  },

  onDateChange: function(date) {
    this.setState({
      date: date
    });
  },

  onInputMaxDepth: function(event) {
    this.setState({
      maxDepth: parseFloat(event.nativeEvent.text)
    });
  },

  onInputTemp: function(event) {
    this.setState({
      temperature: parseFloat(event.nativeEvent.text)
    });
  },

  log: function() {
    var divesite = this.props.divesite;
    var data = {
      start: this.state.date,
      maxDepth: this.state.maxDepth,
      temperature: this.state.temperature,
    };

    ParseReact.Mutation.Create('dive', data)
      .dispatch()
      .then(function(dive) {
        ParseReact.Mutation.AddRelation(dive, 'divesite', divesite)
        alert(JSON.stringify(arguments));
      })
      .fail(handleError);
  },
});

var styles = StyleSheet.create({
  splashContainer: {
    alignItems: 'center',
    backgroundColor: '#212342',
    flex: 1,
    justifyContent: 'center',
  },
  splashImage: {
    height: 120,
    width: 260,
    marginBottom: 50,
    marginTop: 50,
  },
  splashText : {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
  },
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
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    height: 40,
    marginLeft: 10,
    marginRight: 10,
  },
});

// Auxiliary functions (TODO: modularize)
var mapImageSrc = function(geopoint, options = { width: 200, height: 200 }) {
  return `https://maps.googleapis.com/maps/api/staticmap?markers=size:tiny|${geopoint.latitude},${geopoint.longitude}&zoom=8&size=${options.width}x${options.height}&key=${GOOGLE_MAPS_API_KEY}`
};

var positionToGeoPoint = function(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  }
};

// Scroll a component into view. Just pass the component ref string.
// http://stackoverflow.com/questions/29313244/how-to-auto-slide-the-window-out-from-behind-keyboard-when-textinput-has-focus
var inputFocused = function(refName) {
  setTimeout(() => {
    let scrollResponder = this.refs.scrollView.getScrollResponder();
    scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
      React.findNodeHandle(this.refs[refName]),
      110, //additionalOffset
      true
    );
  }, 50);
};

var handleError = function(error) {
  alert(error.message);
};

AppRegistry.registerComponent('Divebook', () => Divebook);
