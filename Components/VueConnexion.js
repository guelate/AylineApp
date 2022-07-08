import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Modal, ScrollView, Platform, ToastAndroid, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import t from 'tcomb-form-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

class VueConnexion extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: undefined,
            userData: {},
            isConnected: true,
            modalVisible: false
        }
        this.url = 'https://ayline-services.fr'
        this.form = React.createRef()
        this.recoveryForm = React.createRef()
        this.value = {}
    }

    disableBackButton = () => {
        this.props.navigation.goBack()
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

    _submitData = () => {

        if (this.props.route.params.booking === true) {

            const { menage, iron, pet, frequency, hour,
                duree, day, instruction, autreDispo, majoration,
                idFreq, idDuree, idHour } = this.props.route.params

            //console.log(idFreq)

            if (this.form.current.getValue() !== null) {

                this.props.navigation.navigate('CLIENT', {
                    value: this.form.current.getValue(),
                    menage: menage,
                    iron: iron,
                    pet: pet,
                    frequency: frequency,
                    hour: hour,
                    duree: duree,
                    day: day,
                    instruction: instruction,
                    autreDispo: autreDispo,
                    majoration: majoration,
                    idFreq, idDuree, idHour,
                    isLogged: true
                })
            }
            else {
                this.value = {
                    email: '',
                    password: ''
                }
            }
        } else {
            if (this.form.current.getValue() !== null) {

                let value = this.form.current.getValue()

                console.log(value.email)

                if (value.email.toLowerCase().includes('@') && value.email.toLowerCase().includes('.')) {

                    if (value.password.length >= 8) {

                        /* this.props.navigation.navigate('Ayline Services', {
                            value: this.form.current.getValue(),
                        }) */

                        this.props.navigation.navigate('Ayline', {
                            screen: 'Menu',
                            params: {
                                isLogged: true,
                                value: this.form.current.getValue(),
                                isConnected: true
                            },
                        })

                        /* this.props.navigation.navigate('CLIENT', {
                              isLogged: true, 
                              value: this.form.current.getValue(),
                              isConnected: true
                        }) */
                    }
                    else {
                        ToastAndroid.show('le mot de passe doit contenir au minimum 8 charactères', ToastAndroid.LONG)
                    }
                }
                else {
                    ToastAndroid.show('Adresse email invalide', ToastAndroid.LONG)
                }
            }
            else {
                this.value = {
                    email: '',
                    password: ''
                }
            }
        }
    }

    _sendEmail = () => {

        let email

        if (this.recoveryForm.current.getValue() !== null) {

            console.log(this.recoveryForm.current.getValue().recoveryEmail)

            email = this.recoveryForm.current.getValue().recoveryEmail

            if (email.toLowerCase().includes('@') && email.toLowerCase().includes('.')) {


                fetch(this.url + "/api/espace_client/reinitialiser_password", {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                    })
                })
                    .then(response => response.json())
                    .then(data => {

                        console.log(data.message)

                        if (data.errors) {
                            ToastAndroid.show('Nous ne pouvons pas trouver un utilisateur avec cette adresse e-mail.', ToastAndroid.LONG);
                        }
                        else if (data.message === 'Nous avons envoyé votre lien de réinitialisation de mot de passe par e-mail!') {
                            //ToastAndroid.show('Nous avons envoyé votre lien de réinitialisation de mot de passe par e-mail !', ToastAndroid.LONG);
                            Alert.alert(
                                null,
                                "Nous avons envoyé votre lien de réinitialisation de mot de passe par e-mail !",
                                [
                                    { text: "OK" }
                                ],
                                { cancelable: true }
                            );
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
            else {
                ToastAndroid.show('Adresse email invalide', ToastAndroid.LONG)
            }
        }
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    //'ghislainassi48@gmail.com'
    //'Ghislain03'
    //ghislainassi.t2r@gmail.com

    render() {
        //console.log('test:', this.form.current.getValue())
        const { userData, modalVisible } = this.state

        const Form = t.form.Form;

        const User = t.struct({
            email: t.String,
            password: t.String
        });

        const Recovery = t.struct({
            recoveryEmail: t.String,
        });

        const formStyles = {
            ...Form.stylesheet,
            errorBlock: {
                fontSize: hp(2.2),
                marginBottom: 2,
                color: '#a94442',
                textAlign: 'center',
                fontFamily: 'Raleway-Regular'
            },
            textbox: {
                normal: {
                    color: "#000000",
                    fontSize: hp(2.5),
                    height: hp(8),
                    width: wp(75),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
                    paddingHorizontal: wp(5),
                    borderRadius: hp(4),
                    borderColor: "#11539F",
                    borderWidth: 3,
                    marginBottom: hp(1),
                    backgroundColor: 'white',
                    fontFamily: 'Raleway-Regular'
                },
                error: {
                    color: "#000000",
                    fontSize: hp(2.5),
                    height: hp(8),
                    width: wp(75),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
                    paddingHorizontal: wp(5),
                    borderRadius: hp(4),
                    borderColor: "#a94442",
                    borderWidth: 3,
                    marginBottom: hp(1),
                    backgroundColor: 'white',
                    fontFamily: 'Raleway-Regular'
                }
            }
        }
        //a94442

        const options = {
            auto: 'placeholders',
            fields: {
                email: {
                    onSubmitEditing: this._submitData,
                    error: 'Veuillez entrer un email valide',
                    autoCorrect: false,
                    //autoFocus: true,
                    keyboardType: 'email-address',
                    textContentType: 'emailAddress'
                },
                recoveryEmail: {
                    onSubmitEditing: this._submitData,
                    error: 'Veuillez entrer un email valide',
                    autoCorrect: false,
                    placeholder: 'Email',
                    //autoFocus: true,
                    keyboardType: 'email-address',
                    textContentType: 'emailAddress'
                },
                password: {
                    onSubmitEditing: this._submitData,
                    secureTextEntry: true,
                    error: 'Veuillez entrer un mot de passe',
                    textContentType: 'password'
                }
            },
            stylesheet: formStyles,
        }

        return (

            <ScrollView
                centerContent={true}
                contentContainerStyle={styles.contentContainer}
                style={styles.container}
                keyboardShouldPersistTaps='always'>

                <Modal
                    animationType="slide"
                    //transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        this.setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={{ color: 'black', fontSize: hp(3.5), marginBottom: hp(2), fontFamily: 'Raleway-Bold', textAlign: 'center' }}>Réinitialiser votre mot de passe</Text>
                            <Text style={{ color: 'black', fontSize: hp(2), marginBottom: hp(2), fontFamily: 'Raleway-Bold', textAlign: 'center' }}>Après avoir envoyé ce formulaire vous recevrez un mail avec un lien vers une page vous permettant de réinitialiser votre mot de passe</Text>
                            <Text style={{ color: 'black', fontSize: hp(2), marginBottom: hp(2), fontFamily: 'Raleway-Bold', textAlign: 'center' }}>Veuillez fournir l'adresse e-mail que vous avez utilisée lors de votre inscription à Ayline Services</Text>
                            <Form
                                ref={this.recoveryForm}
                                type={Recovery}
                                options={options}
                            />
                            <View style={[styles.meConnecter, { flex: 0, marginTop: hp(1), marginBottom: hp(1) }]}>
                                <TouchableOpacity style={[styles.meConnecterTouchable, { width: wp(40) }]} onPress={this._sendEmail}>
                                    <Text style={styles.meConnecterText}>ENVOYER</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Image style={styles.logo} source={require('../assets/logo_complet.png')}></Image>
                <Form
                    ref={this.form}
                    type={User}
                    options={options}
                />
                <View style={styles.meConnecter}>
                    <Text style={{ color: 'black' }} onPress={() => this.setModalVisible(true)}>Mot de passe oublié ?</Text>
                    <TouchableOpacity style={styles.meConnecterTouchable} onPress={this._submitData}>
                        <Text style={styles.meConnecterText}>ME CONNECTER</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    contentContainer: {
        alignItems: 'center',
    },
    meConnecter: {
        flex: 1,
        alignItems: 'center',
        marginTop: hp(7),
        marginBottom: hp(5)
    },
    meConnecterTouchable: {
        backgroundColor: '#CD3A38',
        height: hp(6),
        width: wp(60),
        borderRadius: hp(4),
        elevation: hp(1),
        marginTop: wp(2),
        justifyContent: 'center'
    },
    meConnecterText: {
        textAlign: 'center',
        color: 'white',
        fontSize: hp(2.1),
        fontFamily: 'Raleway-Bold'
    },
    logo: {
        height: hp(30),
        width: wp(50),
        resizeMode: 'contain',
        borderColor: 'black',
        marginBottom: hp(8),
        marginTop: hp(4)
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        marginVertical: hp(3),
        marginHorizontal: wp(4.5),
        backgroundColor: "white",
        borderRadius: hp(3),
        paddingVertical: wp(4.5),
        paddingHorizontal: hp(2),
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
})

export default VueConnexion