import React from 'react';
import { View, StyleSheet, Text, Button, Image, BackHandler } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Carousel, { Pagination } from 'react-native-x2-carousel';
import VueCarousel from "./Carousel";
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


class VuePrincipale extends React.Component {
    constructor(props) {

        super(props);

    }

    disableBackButton = () => {
        BackHandler.exitApp();
        return true;
    }

    UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.disableBackButton)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.disableBackButton)
        this.setState = (state,callback)=>{
            return;
        };
    }

    _afficherVueConnexion = () => {
        this.props.navigation.navigate("CONNEXION", {
            booking: false
        })
    }

    _afficherVueReservation = () => {

        this.props.navigation.navigate('Ayline0', {
            screen: 'Menu',
            params: {
                isLogged: false,
                value: {},
                isConnected: false
            },
        })
    }

    render() {

        const DATA = [
            {
                text: 'DES INTERVENANTS DE QUALITE',
                source: require('../assets/APK.png'),
                style: styles.frontImage,
                textStyle: styles.bodyText
            },
            {
                text: '',
                source: require('../assets/equipeNettoyage.jpg'),
                style: styles.secondImage,
                textStyle: styles.secondImageText
            },
        ];

        const renderItem = data => (

            <View key={data.text} style={styles.item}>
                <Text style={data.textStyle}>{data.text}</Text>
                <Image style={data.style} source={data.source} />
            </View>

        );

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image style={styles.logo} source={require('../assets/logo.png')} />
                    <Image style={styles.headerImage} source={require('../assets/ayline.png')} />
                </View>
                <View style={styles.body}>
                    <Carousel
                        pagination={Pagination}
                        renderItem={renderItem}
                        data={DATA}
                    />
                </View>
                <View style={styles.footer}>
                    <View style={styles.connecter}>
                        <Text style={styles.lien}>Déjà client ?</Text>
                        <TouchableOpacity style={styles.connecterTouchable} onPress={this._afficherVueConnexion}>
                            <Text style={styles.connecterText}>CONNEXION</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.continuer}>
                        <Text style={styles.lien}>Nouveau client ?</Text>
                        <TouchableOpacity style={styles.continuerTouchable} onPress={this._afficherVueReservation}>
                            <Text style={styles.continuerText}>RESERVATION</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        //flex: 2,
        height: hp(12),
        borderBottomWidth: 1,
        borderColor: 'white',
        elevation: hp(0.2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        //paddingBottom: 10
    },
    body: {
        flex: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    footer: {
        flex: 3,
        borderColor: 'white',
        elevation: hp(0.1),
        flexDirection: 'row',
        alignItems: 'center'
    },
    connecter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    connecterTouchable: {
        backgroundColor: '#11539F',
        height: hp(6),
        width: wp(40),
        borderRadius: hp(3.5),
        borderColor: '#11539F',
        borderWidth: 2,
        elevation: hp(0.5),
        marginTop: hp(1.5),
        paddingHorizontal: wp(2),
        justifyContent: 'center'
    },
    connecterText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: hp(2.1),
        fontFamily: 'Raleway-Bold'
    },
    continuer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    continuerTouchable: {
        backgroundColor: '#CD3A38',
        height: hp(6),
        width: wp(40),
        borderRadius: hp(3.5),
        borderColor: '#CD3A38',
        borderWidth: 2,
        elevation: hp(0.5),
        marginTop: hp(1.5),
        paddingHorizontal: wp(2),
        justifyContent: 'center'
    },
    continuerText: {
        textAlign: 'center',
        color: 'white',
        fontSize: hp(2.1),
        fontFamily: 'Raleway-Bold'
    },
    lien: {
        fontSize: hp(2)
    },
    bodyText: {
        textAlign: 'center',
        fontSize: hp(2.5),
        color: 'red',
        fontFamily: 'Raleway-Bold',
        marginTop: hp(1.5),

    },
    frontImage: {
        height: hp(55),
        width: wp(80),
        resizeMode: 'contain',
        borderColor: 'black'
    },
    item: {
        width: wp(100),
        height: hp(100),
        alignItems: 'center',
        backgroundColor: 'white',
    },
    secondImage: {
        height: hp(55),
        width: wp(90),
        resizeMode: 'stretch',
    },
    secondImageText: {
        height: 0
    },
    headerImage: {
        height: hp(50),
        width: wp(65),
        resizeMode: 'contain',
        borderColor: 'black',

    },
    logo: {
        height: hp(20),
        width: wp(25),
        resizeMode: 'contain',
        borderColor: 'black',
    }
})
export default VuePrincipale 