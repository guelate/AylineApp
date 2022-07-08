import React from 'react';
import { View, StyleSheet, Text, Button, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class StartScreen extends React.Component {

    componentDidMount() {
        AsyncStorage.getItem('token').then(value => {
            if (value === null) {
                this.props.navigation.navigate('Acceuil')
            }
            else {
                // this.props.navigation.navigate('ESPACE CLIENT')
                this.props.navigation.navigate('Ayline', {
                    screen: 'Menu',
                    params: {
                        isLogged: true,
                        value: {},
                        isConnected: true
                    },
                })
            }
        })
    }

    componentWillUnmount() {
       
        this.setState = (state,callback)=>{
            return;
        };
        
    }

    render() {
        return (
            <ImageBackground source={require('../assets/start.jpg')} style={styles.container}>

            </ImageBackground>
        )
    }


}
const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
})
export default StartScreen