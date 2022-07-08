import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import stripe from 'tipsi-stripe';
import { WebView } from 'react-native-webview';

export default class CardFormScreen extends PureComponent {


    constructor(props) {
        super(props);

        this.state = {
          loading: false,
          loadingText: '',
          renderedOnce: false
           
        }
        this.webviewRef = React.createRef()
    }

    componentDidMount() {
      this.setState({ renderedOnce: true });
    }
    
  
  render() {

    const html = require('../assets/StripeWebView/index.html');

    const onMessage = (data) => {
      if (data == 'loading') {
        // Show progress bar
      } else if (data == 'error') {
        // display error notifcation
      } else {
        // On Success, attach and pay or attach the card to 
        customer
      }
    };

    const injectedJavascript = `(function() {
    window.postMessage = function(data) {
      window.ReactNativeWebView.postMessage(data);
    };
})()`;

    return (
        <WebView 
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        allowFileAccess={true}
// Conditionally add the source path
source={
  Platform.OS === 'android'
    ? {uri: 'file:///android_asset/StripeWebView/stripe.html'}
    : html
} 
            //Enable javascript, it also defaults to true only. 
            javaScriptEnabled
            // originWhitelist is important as the webpage hosted locally
            originWhitelist={['*']}
            // To avoid the flickering during render, RN Webview is powerful yet some glitches are there.
            //style={{opacity: this.state.loading ? 0 : 1}}
            // Hook Reference to this component
            ref={this.webviewRef}
            // We are showing the loading progress while getting the webpage
            onLoadStart={() => {
              this.setState({loadingText: 'Loading Secured Credit/Debit Card Input'});
              this.setState({loading: true});
            }}
            // We will send some data by injecting the javascript to webview
            injectedJavaScript={injectedJavascript}
            //after the load, we are sending the data like user name (Optional)
            onLoad={() => {
              this.webviewRef.current.postMessage('Hi');
              this.setState({loading: true});
            }}
            // Required for android only
            domStorageEnabled
            // onMessage will give us the payment method id back to app
            onMessage={(e) => onMessage(e.nativeEvent.data)}/>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instruction: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  paymentMethod: {
    height: 20,
  },
})