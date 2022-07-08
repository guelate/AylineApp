import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Communications from 'react-native-communications';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GiftedChat } from 'react-native-gifted-chat';

class Contact extends React.Component {

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

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.contact}>
                    <Text style={styles.contactTitre}>Ecrivez Nous</Text>
                    <TouchableOpacity style={styles.contactTouchable} onPress={() => Communications.email(['contact@ayline-services.fr'], null, null, null, null)}>
                        <Ionicons name="mail" size={hp(4.5)} color="white" />
                        <Text style={styles.contactText}> contact@ayline-services.fr</Text>
                    </TouchableOpacity>

                    <Text style={styles.contactTitre}>Appellez Nous</Text>
                    <TouchableOpacity style={styles.contactTouchable} onPress={() => Communications.phonecall('+331 40 12 46 37', true)}>
                        <MaterialCommunityIcons name="phone-in-talk" size={hp(4.5)} color="white" />
                        <Text style={styles.contactText}> (+331) 40 12 46 37</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: wp(4)
    },
    contact: {
        marginTop: hp(3),
        backgroundColor: 'white',
        borderWidth: hp(0.4),
        borderColor: '#33A0D6',
        borderRadius: hp(1.5),
        elevation: hp(1.5),
        marginBottom: hp(4),
    },
    contactTitre: {
        borderWidth: hp(0.4),
        borderColor: '#33A0D6',
        borderRadius: hp(1.5),
        width: wp(50),
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: hp(2.5),
        color: 'black',
        fontFamily: 'Raleway-Regular',
        paddingVertical: hp(0.5),
        paddingHorizontal: wp(2),
        marginTop: hp(2),
        alignSelf: 'center'
    },
    contactText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: hp(2),
        color: 'white',
        fontFamily: 'Raleway-Bold',
        marginLeft: wp(2)
    },
    contactTouchable: {
        flexDirection: 'row',
        backgroundColor: '#33A0D6',
        height: hp(7),
        borderWidth: hp(0.2),
        borderColor: 'white',
        borderRadius: hp(1.5),
        elevation: hp(0.5),
        marginVertical: hp(1.5),
        marginHorizontal: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(1),
        paddingHorizontal: wp(0.5)
    },

})

export default Contact