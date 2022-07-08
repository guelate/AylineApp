import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { MyStack } from './Components/Stack';
import RNBootSplash from "react-native-bootsplash";



export default class App extends Component {
  
  constructor(props) {
    
    super(props);
    
    this.state = {
      
    };
    
}

componentDidMount() {

  RNBootSplash.hide({ fade: true }); // fade
  
}

render() {

  return(
    <MyStack />
  )
  
}

}
