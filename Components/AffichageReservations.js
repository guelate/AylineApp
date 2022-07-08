import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-community/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


class AffichageReservations extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

        }

        this.url = 'https://ayline-services.fr'
    }

    enableBackButton = () => {
        this.props.navigation.goBack()
        return true;
    }

    UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.enableBackButton)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.enableBackButton)
        this.setState = (state,callback)=>{
            return;
        };
    }


    _getTheData = (view) => {
        this.props.navigation.navigate(view)
    }

    _afficherVueReservation = () => {
        this.props.navigation.navigate("RESERVATION", { isConnected: true })
    }

    render() {
        return (
            <ScrollView style={styles.container}
                contentContainerStyle={styles.container}>
                <View style={styles.boxContainer}>
                    <Pressable style={({ pressed }) =>
                        pressed ? styles.pressable0 : styles.pressable
                    } onPress={() => this._getTheData('NOUVELLES COMMANDES')}>
                        {({ pressed }) => (
                            <View style={styles.pressableView}>
                                {pressed ? <FontAwesome5 name={"calendar-alt"} solid size={hp(6)} color="white" /> : <FontAwesome5 name={"calendar-alt"} solid size={hp(6)} color="#08CC" />}
                                <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>NOUVELLE DEMANDE</Text>
                                <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter, modifier ou supprimer vos réservations</Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable style={({ pressed }) =>
                        pressed ? styles.pressable0 : styles.pressable
                    } onPress={() => this._getTheData('COMMANDES EN COURS')}>
                        {({ pressed }) => (
                            <View style={styles.pressableView}>
                                {pressed ? <FontAwesome5 name={"calendar-check"} solid size={hp(6)} color="white" /> : <FontAwesome5 name={"calendar-check"} solid size={hp(6)} color="#08CC" />}
                                <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>COMMANDE EN COURS</Text>
                                <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter, modifier ou annuler votre cycle de prestations</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
                <View style={styles.boxContainer}>
                    <Pressable style={({ pressed }) =>
                        pressed ? styles.pressable0 : styles.pressable
                    } onPress={() => this._getTheData("DEMANDE D'ANNULATION")}>
                        {({ pressed }) => (
                            <View style={styles.pressableView}>
                                {pressed ? <FontAwesome5 name={"calendar-times"} solid size={hp(6)} color="white" /> : <FontAwesome5 name={"calendar-times"} solid size={hp(6)} color="#08CC" />}
                                <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>DEMANDE D'ANNULATION</Text>
                                <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter le statut de vos différentes demandes d'annulation</Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable style={({ pressed }) =>
                        pressed ? styles.pressable0 : styles.pressable
                    } onPress={() => this._getTheData("DEMANDE DE MODIFICATION")}>
                        {({ pressed }) => (
                            <View style={styles.pressableView}>
                                {pressed ? <FontAwesome5 name="edit" size={hp(6)} color="white" /> : <FontAwesome5 name="edit" size={hp(6)} color="#08CC" />}
                                <Text style={pressed ? [styles.pressableTitle0, { marginTop: 0 }] : [styles.pressableTitle, { marginTop: 0 }]}>DEMANDE DE MODIFICATION</Text>
                                <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter le statut de vos différentes demandes de modifications</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        marginTop: hp(1.5)
    },
    boxContainer: {
        flexDirection: 'row',
        marginLeft: wp(0.5),
        marginRight: wp(0.5)
    },
    pressable: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: wp(2),
        marginVertical: hp(2),
        height: hp(22),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 20,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2)
    },
    pressable0: {
        backgroundColor: '#33A0D6',
        flex: 1,
        marginHorizontal: wp(2),
        marginVertical: hp(2),
        height: hp(22),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 20,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2)
    },
    pressableView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressableTitle: {
        color: '#08CC',
        fontFamily: 'Raleway-Bold',
        textAlign: 'center',
        fontSize: hp(2),
        marginBottom: hp(2),
        marginTop: hp(0.5)
    },
    pressableTitle0: {
        color: 'white',
        fontFamily: 'Raleway-Bold',
        textAlign: 'center',
        fontSize: hp(2),
        marginBottom: hp(2),
        marginTop: hp(0.5)
    },
    pressableText: {
        color: 'black',
        textAlign: 'center',
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
    },
    pressableText0: {
        color: 'white',
        textAlign: 'center',
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Bold',
    },

})

export default AffichageReservations