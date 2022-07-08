import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AffichageReservations from './AffichageReservations';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class VueServices extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            isConnected: false
        }
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

    _afficherVueReservation = () => {
        this.props.navigation.navigate("RESERVATION", {
            isConnected: this.props.route.params.isConnected
        })
    }

    render() {

        console.log(this.props.route.params.value)
        return (
            <ScrollView style={styles.container}>
                <View style={styles.boxContainer}>

                    <TouchableOpacity style={styles.touchable} onPress={this._afficherVueReservation}>

                        <Image style={styles.logo} source={require('../assets/menage1.jpg')} />
                        <View style={styles.pressableView}>
                            <Text style={styles.pressableTitle}>MENAGE</Text>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity style={styles.touchable} onPress={() => this.props.navigation.navigate("DEMANDE DE DEVIS")}>

                        <Image style={styles.logo} source={require('../assets/garde.jpg')} />
                        <View style={styles.pressableView}>
                            <Text style={styles.pressableTitle}>GARDE D'ENFANTS</Text>
                        </View>

                    </TouchableOpacity>

                </View>
                <View style={styles.boxContainer}>

                    <TouchableOpacity style={styles.touchable}>

                        <Image style={styles.logo} source={require('../assets/bricolage.jpg')} />
                        <View style={styles.pressableView}>
                            <Text style={styles.pressableTitle}>BRICOLAGE</Text>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity style={styles.touchable}>

                        <Image style={styles.logo} source={require('../assets/jardinage.jpg')} />
                        <View style={styles.pressableView}>
                            <Text style={styles.pressableTitle}>JARDINAGE</Text>
                        </View>

                    </TouchableOpacity>

                </View>
                <View style={styles.boxContainer}>

                    <TouchableOpacity style={styles.touchable}>

                        <Image style={styles.logo} source={require('../assets/informatique.jpg')} />
                        <View style={styles.pressableView}>
                            <Text style={styles.pressableTitle}>INFORMATIQUE</Text>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity style={styles.touchable}>

                        <Image style={styles.logo} source={require('../assets/cours.jpg')} />
                        <View style={styles.pressableView}>
                            <Text style={styles.pressableTitle}>COURS A DOMICILE</Text>
                        </View>

                    </TouchableOpacity>

                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    boxContainer: {
        flexDirection: 'row',
        marginLeft: wp(0.5),
        marginRight: wp(0.5)
    },
    touchable: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: wp(2),
        marginVertical: hp(2),
        height: hp(26),
        borderRadius: hp(1),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        paddingHorizontal: wp(2)
    },
    pressableView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pressableTitle: {
        color: '#08CC',
        fontFamily: 'Lato-Bold',
        textAlign: 'center',
        fontSize: hp(1.5),
        //marginBottom: hp(1),
        marginTop: hp(0.5)
    },
    pressableText: {
        color: 'black',
        textAlign: 'center',
        fontSize: hp(2),
        fontFamily: 'Lato-Bold',
    },
    logo: {
        height: hp(20),
        width: wp(45.5)
    },
})

export default VueServices