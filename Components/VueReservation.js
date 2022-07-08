import React, { useState } from 'react';
import { View, StyleSheet, Switch, Image, Text, Pressable, ScrollView, ToastAndroid, ActivityIndicator, TouchableOpacity, BackHandler } from 'react-native';
import SwitchBooking from './Switch';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import AsyncStorage from '@react-native-community/async-storage';
import t from 'tcomb-form-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class VueReservation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            menage: { 'menage': true },
            iron: { 'ironing': false },
            pet: { 'pet': false },
            idFreq: null,
            frequency: '',
            idDuree: null,
            duree: '',
            periode: 'matin',
            idHour: null,
            hour: '',
            month: true,
            day: '',
            majoration: 0,
            dataList: undefined,
            dispo: undefined,
            creno: undefined,
            freq: undefined,
            isLoading: true,
            price: 0,
            valeur: null,
            isConnected: false,
            isAvailable: undefined,
            zip: {},
            isConnected0: true
        }

        this.url = 'https://ayline-services.fr';
        this.customForm = React.createRef();
        this.needsForm = React.createRef();
        this.ironForm = React.createRef();
        this.petForm = React.createRef();
        this.placeForm = React.createRef();
        this.today = new Date();
        this.month0 = this.today.getMonth() + 1;
        this.tomorrow = this.today.setDate(this.today.getDate() + 1);
        this.isConnected = true
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

    componentDidMount() {
        this._getData()
    }

    _getData = () => {
        NetInfo.fetch().then(state => {

            if (state.isConnected) {

                fetch(this.url + '/api/elements', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                    .then(response => response.json())
                    .then(data => {

                        this.setState({
                            dataList: data,
                            creno: data.liste_creneau,
                            dispo: data.liste_disponibilite,
                            freq: data.liste_frequence,
                            isLoading: false,
                            isConnected: this.props.route.params.isConnected,
                            isConnected0: state.isConnected
                        })
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
            else {
                this.setState({ isConnected0: false })
            }
        });
    }

    _selectFrequency = (frequency, idFreq, price) => {
        this.setState({ frequency, idFreq, price })
    }
    _selectDuree = (duree, idDuree, valeur) => {
        this.setState({ duree, idDuree, valeur })
    }
    _selectPeriode = (periode) => {
        this.setState({ periode })
    }
    _selectHour = (hour, idHour) => {
        this.setState({ hour, idHour })
    }

    onChangeMenage = (menage) => {
        this.setState({ menage });
    }

    onChangeIron = (iron) => {
        this.setState({ iron });
    }

    onChangePet = (pet) => {
        this.setState({ pet });
    }

    onChangeZip = (zip) => {
        this.setState({ zip })
    }

    _disableLeftArrow = (month) => {
        month === this.month0 ? this.setState({ month: true }) :
            this.setState({ month: false })
    }

    _selectDay = (day) => {

        this.setState({ day })

        if (moment(day).format('dddd') === 'dimanche') {
            this.setState({ majoration: 5 })
            ToastAndroid.show('La prestation est majorée de 5 € le Dimanche', ToastAndroid.LONG);
        }
        else {
            this.setState({ majoration: 0 })
        }
    }

    _submitZipCode = () => {

        let zipCode = this.placeForm.current.getValue() === null ? null : this.placeForm.current.getValue().codePostal

        fetch(this.url + '/api/rech_code_postal', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code_postal: zipCode
            }),
        })
            .then(response => response.json())
            .then(data => {

                if (data.rech === 1) {
                    this.setState({ isAvailable: true })
                    console.log('true:', data)
                }
                else {
                    this.setState({ isAvailable: false })
                    console.log('false:', data)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }

    _displayRecap = () => {

        const { frequency, duree, hour, day, majoration, idFreq, idDuree, idHour, price, valeur, isConnected } = this.state

        if (this.needsForm.current.getValue().menage === false || frequency === '' || duree === '' || hour === '' || day === '') {
            ToastAndroid.show('Une ou plusieurs données manquantes, Veuillez selectionnez correctement toutes les informations relatives à la réservation ', ToastAndroid.LONG);
        }
        else {

            this.props.navigation.navigate('RECAPITULATIF', {

                menage: this.needsForm.current.getValue().menage,
                iron: this.ironForm.current.getValue().ironing,
                pet: this.petForm.current.getValue().pet,
                frequency: frequency,
                duree: duree,
                hour: hour,
                day: day,
                instruction: this.customForm.current.getValue().instruction,
                autreDispo: this.customForm.current.getValue().availability,
                majoration: majoration,
                idFreq: idFreq,
                idDuree: idDuree,
                idHour: idHour,
                price: price,
                valeur: valeur,
                isConnected,
                zip: this.placeForm.current.getValue().codePostal

            })

        }

    }

    _displayLoading() {
        return (
            <View style={styles.loading_container}>
                <ActivityIndicator size={50} color='#08CC' />
            </View>
        )
    }

    _notConnected() {

        NetInfo.fetch().then(state => {
            this.isConnected = state.isConnected
        })

        return (
            <View style={styles.message}>
                <MaterialCommunityIcons name="wifi-off" size={hp(15)} color="#33A0D6" />
                <Text style={styles.messageText}>Il semble que vous n'êtes pas connecté à Internet Nous ne trouvons aucun réseau</Text>
                <TouchableOpacity style={styles.retry} onPress={() => this._getData()}>
                    <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {

        const { duree, frequency, periode, hour, month, day, creno, dispo, freq, dataList, isLoading, isAvailable, zip, isConnected0 } = this.state

        LocaleConfig.locales['fr'] = {
            monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            monthNamesShort: ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
            dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
            today: 'Aujourd\'hui'
        };
        LocaleConfig.defaultLocale = 'fr';

        const Form = t.form.Form;

        const needs = t.struct({
            menage: t.Boolean,
        })

        const iron = t.struct({
            ironing: t.Boolean
        })

        const pet = t.struct({
            pet: t.Boolean
        })

        const Custom = t.struct({
            instruction: t.maybe(t.String),
            availability: t.maybe(t.String)
        })

        const Place = t.struct({
            codePostal: t.String
        })

        const formStyles = {
            ...Form.stylesheet,
            controlLabel: {
                normal: {
                    color: '#08CC',
                    fontSize: 17,
                    marginBottom: 7,
                    fontWeight: 'bold'
                },
                error: {
                    color: "#a94442",
                    fontSize: 17,
                    marginBottom: 7,
                    fontWeight: "bold"
                }
            },
            textbox: {
                normal: {
                    color: "#000000",
                    fontSize: hp(2.5),
                    textAlignVertical: 'top',
                    height: hp(10),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(1.5),
                    paddingHorizontal: hp(3),
                    borderRadius: hp(2.4),
                    borderColor: '#08CC',
                    borderWidth: hp(0.4),
                    backgroundColor: 'white',
                    fontFamily: 'Raleway-Regular',

                },
                error: {
                    color: "#000000",
                    fontSize: hp(2.5),
                    height: hp(10),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(1.5),
                    paddingHorizontal: hp(3),
                    borderRadius: hp(2.4),
                    borderColor: "#a94442",
                    borderWidth: hp(0.4),
                    backgroundColor: 'white',
                    fontFamily: 'Raleway-Regular',
                }
            },
            checkbox: {
                normal: {
                    marginBottom: 50
                },
                // the style applied when a validation error occours
                error: {
                    marginBottom: 50
                }
            },
        };

        const formStyles0 = {
            ...Form.stylesheet,
            controlLabel: {
                normal: {
                    color: '#08CC',
                    fontSize: 17,
                    marginBottom: 7,
                    fontWeight: 'bold'
                },
                error: {
                    color: "#a94442",
                    fontSize: 17,
                    marginBottom: 7,
                    fontWeight: "600"
                }
            },
            errorBlock: {
                fontSize: hp(2),
                marginTop: hp(1.5),
                textAlign: 'center',
                color: '#a94442',
                fontFamily: 'Raleway-Regular'
            },
            textbox: {
                normal: {
                    color: "black",
                    fontSize: hp(3),
                    fontFamily: 'Raleway-Regular',
                    height: hp(8),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(1.5),
                    paddingHorizontal: hp(3),
                    borderRadius: hp(2.4),
                    borderColor: isAvailable ? 'green' : isAvailable === false ? '#a94442' : '#08CC',
                    borderWidth: hp(0.4),
                    marginHorizontal: wp(4),
                    backgroundColor: 'white'
                },
                error: {
                    color: "black",
                    fontSize: hp(3),
                    fontFamily: 'Raleway-Regular',
                    height: hp(8),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(1.5),
                    paddingHorizontal: hp(3),
                    borderRadius: hp(2.4),
                    borderColor: "#a94442",
                    borderWidth: hp(0.4),
                    marginHorizontal: wp(4),
                    backgroundColor: 'white'
                },
                notEditable: {
                    color: "#777777",
                    fontSize: hp(3),
                    fontFamily: 'Raleway-Regular',
                    height: hp(8),
                    paddingVertical: Platform.OS === "ios" ? 7 : hp(1.5),
                    paddingHorizontal: hp(3),
                    borderRadius: hp(2.4),
                    borderColor: isAvailable ? 'green' : isAvailable === false ? '#a94442' : '#08CC',
                    borderWidth: hp(0.4),
                    marginHorizontal: wp(4),
                    backgroundColor: '#cacdd1'
                }
            },
        };

        const options = {
            auto: 'placeholders',
            fields: {
                menage: {
                    disabled: true,
                    label: ' ',
                    trackColor: { false: "#767577", true: "#81b0ff" },
                    thumbColor: 'blue',
                    value: true
                },
                ironing: {
                    label: ' '
                },
                pet: {
                    label: " "
                },
                instruction: {
                    placeholder: "Avez vous d'autres disponibilités",
                    multiline: true,
                },
                availability: {
                    placeholder: 'Vos instructions',
                    multiline: true,
                },
            },
            stylesheet: formStyles,
        }

        const options0 = {
            auto: 'placeholders',
            fields: {
                codePostal: {
                    onSubmitEditing: this._submitZipCode,
                    hasError: isAvailable === false ? true : false,
                    error: 'Nos services ne sont pas disponibles chez vous !',
                    placeholder: 'Code Postal',
                    placeholderTextColor: '#777777',
                    editable: isAvailable === true ? false : true,
                    keyboardType: 'number-pad',
                    textContentType: 'postalCode',
                    autoFocus: true
                },
            },
            stylesheet: formStyles0,
        }

        return (
            <View style={styles.container}>

                {isConnected0 ? isLoading ?
                    this._displayLoading() : (
                        <ScrollView
                            keyboardShouldPersistTaps='always'>

                            <View style={[styles.sectionTitle, { borderTopWidth: 0, paddingTop: hp(1.5), paddingBottom: hp(1.5), marginTop: hp(1.5) }]}>
                                <Text style={styles.sectionText}>LIEU DE PRESTATION</Text>
                            </View>

                            <View style={{ marginHorizontal: wp(2.5), marginVertical: hp(1.5), marginBottom: 0 }}>
                                <Form
                                    ref={this.placeForm}
                                    type={Place}
                                    value={zip}
                                    onChange={() => this.onChangeZip(this.placeForm.current.getValue())}
                                    options={options0}
                                />
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.edit} onPress={this._submitZipCode}>
                                    <Text style={styles.touchableText}>Valider</Text>
                                </TouchableOpacity>
                            </View>

                            {isAvailable ? <View>
                                <View style={styles.sectionTitle}>
                                    <Text style={styles.sectionText}>MES BESOINS</Text>
                                </View>
                                <View style={styles.needsContainer}>
                                    <View style={styles.needs}>
                                        <View style={styles.menage}>
                                            <Image style={styles.menagePic} source={require('../assets/menage.png')} />
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: wp(2.5) }}>
                                                <Form
                                                    ref={this.needsForm}
                                                    type={needs}
                                                    options={options}
                                                    value={this.state.menage}
                                                    onChange={() => this.onChangeMenage(this.needsForm.current.getValue())}
                                                />
                                                <Text style={styles.checkboxText}>Ménage</Text>
                                            </View>
                                        </View>
                                        <View style={styles.iron}>
                                            <Image style={styles.menagePic} source={require('../assets/fer.png')} />
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: wp(2.5) }}>
                                                <Form
                                                    ref={this.ironForm}
                                                    type={iron}
                                                    options={options}
                                                    value={this.state.iron}
                                                    onChange={() => this.onChangeIron(this.ironForm.current.getValue())}
                                                />
                                                <Text style={styles.checkboxText}>Repassage</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.pet}>
                                        <Image style={styles.menagePic} source={require('../assets/animaux.png')} />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: wp(2.5) }}>
                                            <Form
                                                ref={this.petForm}
                                                type={pet}
                                                options={options}
                                                value={this.state.pet}
                                                onChange={() => this.onChangePet(this.petForm.current.getValue())}
                                            />
                                            <Text style={styles.checkboxText}>J'ai des animaux</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.sectionTitle}>
                                    <Text style={styles.sectionText}>FRÉQUENCE</Text>
                                </View>

                                <View style={styles.boxContainer}>
                                    <Pressable style={[styles.pressable, {
                                        paddingVertical: hp(2),
                                        paddingHorizontal: wp(2), height: hp(22), backgroundColor: frequency === freq[0].libelle ? '#33A0D6' : 'white'
                                    }]} onPress={() => this._selectFrequency(freq[0].libelle, freq[0].id, freq[0].montant)}>
                                        <Text style={[styles.pressableTitle, { color: frequency === freq[0].libelle ? 'white' : '#33A0D6' }]}>{freq[0].libelle}</Text>
                                        <Text style={[styles.pressablePrice, { marginBottom: hp(1), color: frequency === freq[0].libelle ? 'white' : 'black' }]}>{numeral(freq[0].montant).format('0.00')} € / h</Text>
                                        <Text style={[styles.pressableText, { color: frequency === freq[0].libelle ? 'white' : 'black' }]}>Sans engagement</Text>
                                        <Text style={[styles.pressableDuree, { color: frequency === freq[0].libelle ? 'white' : 'black' }]}>Juste une fois</Text>
                                    </Pressable>
                                    <Pressable style={[styles.pressable, {
                                        paddingVertical: hp(2),
                                        paddingHorizontal: wp(2), height: hp(22), backgroundColor: frequency === freq[1].libelle ? '#33A0D6' : 'white'
                                    }]} onPress={() => this._selectFrequency(freq[1].libelle, freq[1].id, freq[1].montant)}>

                                        <Text style={[styles.pressableTitle, { color: frequency === freq[1].libelle ? 'white' : '#33A0D6' },]}>{freq[1].libelle}</Text>
                                        <Text style={[styles.pressablePrice, { marginBottom: hp(1), color: frequency === freq[1].libelle ? 'white' : 'black' }]}>{numeral(freq[1].montant).format('0.00')} € / h</Text>
                                        <Text style={[styles.pressableText, { color: frequency === freq[1].libelle ? 'white' : 'black' }]}>Sans engagement</Text>
                                        <Text style={[styles.pressableDuree, { color: frequency === freq[1].libelle ? 'white' : 'black' }]}>Jusqu'à 5h30 / semaine</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.boxContainer}>
                                    <Pressable style={[styles.pressable, {
                                        paddingVertical: hp(2),
                                        paddingHorizontal: wp(2), height: hp(22), backgroundColor: frequency === freq[2].libelle ? '#33A0D6' : 'white'
                                    }]} onPress={() => this._selectFrequency(freq[2].libelle, freq[2].id, freq[2].montant)}>
                                        <Text style={[styles.pressableTitle, { color: frequency === freq[2].libelle ? 'white' : '#33A0D6' },]}>{freq[2].libelle}</Text>
                                        <Text style={[styles.pressablePrice, { marginBottom: hp(1), color: frequency === freq[2].libelle ? 'white' : 'black' }]}>{numeral(freq[2].montant).format('0.00')} € / h</Text>
                                        <Text style={[styles.pressableText, { color: frequency === freq[2].libelle ? 'white' : 'black' }]}>Sans engagement</Text>
                                        <Text style={[styles.pressableDuree, { color: frequency === freq[2].libelle ? 'white' : 'black' }]}>2 fois / mois</Text>
                                    </Pressable>
                                    <Pressable style={[styles.pressable, {
                                        paddingVertical: hp(2),
                                        paddingHorizontal: wp(2), height: hp(22), backgroundColor: frequency === freq[3].libelle ? '#33A0D6' : 'white'
                                    }]} onPress={() => this._selectFrequency(freq[3].libelle, freq[3].id, freq[3].montant)}>

                                        <Text style={[styles.pressableTitle, { color: frequency === freq[3].libelle ? 'white' : '#33A0D6' },]}>{freq[3].libelle}</Text>
                                        <Text style={[styles.pressablePrice, { marginBottom: hp(1), color: frequency === freq[3].libelle ? 'white' : 'black' }]}>{numeral(freq[3].montant).format('0.00')} € / h</Text>
                                        <Text style={[styles.pressableText, { color: frequency === freq[3].libelle ? 'white' : 'black' }]}>Sans engagement</Text>
                                        <Text style={[styles.pressableDuree, { color: frequency === freq[3].libelle ? 'white' : 'black' }]}>A partir de 6h / semaine</Text>
                                    </Pressable>
                                </View>

                                <View style={styles.sectionTitle}>
                                    <Text style={styles.sectionText}>DURÉE DU SERVICE</Text>
                                </View>
                                <View style={styles.dureeContainer}>
                                    {frequency !== freq[3].libelle ? <View style={styles.boxContainer}>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[0].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[0].nbre_heure, creno[0].id, creno[0].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[0].nbre_heure ? 'white' : 'black' }]}>{creno[0].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[1].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[1].nbre_heure, creno[1].id, creno[1].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[1].nbre_heure ? 'white' : 'black' }]}>{creno[1].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[2].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[2].nbre_heure, creno[2].id, creno[2].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[2].nbre_heure ? 'white' : 'black' }]}>{creno[2].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[3].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[3].nbre_heure, creno[3].id, creno[3].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[3].nbre_heure ? 'white' : 'black' }]}>{creno[3].nbre_heure}</Text>
                                        </Pressable>
                                    </View> : null}
                                    {frequency !== freq[3].libelle ? <View style={styles.boxContainer}>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[4].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[4].nbre_heure, creno[4].id, creno[4].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[4].nbre_heure ? 'white' : 'black' }]}>{creno[4].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[5].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[5].nbre_heure, creno[5].id, creno[5].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[5].nbre_heure ? 'white' : 'black' }]}>{creno[5].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[6].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[6].nbre_heure, creno[6].id, creno[6].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[6].nbre_heure ? 'white' : 'black' }]}>{creno[6].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[7].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[7].nbre_heure, creno[7].id, creno[7].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[7].nbre_heure ? 'white' : 'black' }]}>{creno[7].nbre_heure}</Text>
                                        </Pressable>
                                    </View> : null}
                                    {frequency !== freq[1].libelle ? <View style={[styles.boxContainer, { paddingHorizontal: 50 }]}>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[8].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[8].nbre_heure, creno[8].id, creno[8].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[8].nbre_heure ? 'white' : 'black' }]}>{creno[8].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[9].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[9].nbre_heure, creno[9].id, creno[9].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[9].nbre_heure ? 'white' : 'black' }]}>{creno[9].nbre_heure}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: duree === creno[10].nbre_heure ? '#33A0D6' : 'white' }]} onPress={() => this._selectDuree(creno[10].nbre_heure, creno[10].id, creno[10].valeur)}>
                                            <Text style={[styles.pressablePrice, { color: duree === creno[10].nbre_heure ? 'white' : 'black' }]}>{creno[10].nbre_heure}</Text>
                                        </Pressable>
                                    </View> : null}
                                </View>

                                <View style={styles.sectionTitle}>
                                    <Text style={styles.sectionText}>CALENDRIER</Text>
                                </View>
                                <Calendar 
                                minDate={this.tomorrow}
                                    onDayPress={(day) => {
                                        this._selectDay(day.dateString)
                                    }}
                                    disableArrowLeft={month}
                                    onMonthChange={(month) => { this._disableLeftArrow(month.month) }}
                                    markedDates={{
                                        [day]: { selected: true },
                                    }}
                                    theme={{
                                        textSectionTitleColor: '#33A0D6',
                                        selectedDayBackgroundColor: '#33A0D6',
                                        todayTextColor: '#33A0D6',
                                        dayTextColor: 'black',
                                        monthTextColor: '#33A0D6',
                                        indicatorColor: '#33A0D6',
                                        textMonthFontFamily: 'Raleway-Bold',
                                        textDayHeaderFontFamily: 'Raleway-Regular',
                                    }}
                                />
                                <View style={{ paddingHorizontal: wp(2), marginTop: hp(1.5) }}>
                                    <Form
                                        ref={this.customForm}
                                        type={Custom}
                                        options={options}
                                    />
                                </View>
                                <View style={styles.sectionTitle}>
                                    <Text style={styles.sectionText}>HORAIRE DISPONIBLE</Text>
                                </View>

                                <View style={[styles.boxContainer, { paddingHorizontal: wp(8), marginBottom: hp(3) }]}>
                                    <Pressable style={[styles.pressable, { backgroundColor: periode === 'matin' ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectPeriode('matin')}>
                                        <Text style={[styles.pressablePrice, { color: periode === 'matin' ? 'white' : 'black' }]}>Matin</Text>
                                    </Pressable>
                                    <Pressable style={[styles.pressable, { backgroundColor: periode === 'soir' ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectPeriode('soir')}>
                                        <Text style={[styles.pressablePrice, { color: periode === 'soir' ? 'white' : 'black' }]}>Après-Midi</Text>
                                    </Pressable>
                                </View>

                                {periode === 'matin' ? <View style={styles.dureeContainer}>
                                    <View style={styles.boxContainer}>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[0].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[0].horaire, dispo[0].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[0].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[0].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[1].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[1].horaire, dispo[1].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[1].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[1].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[2].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[2].horaire, dispo[2].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[2].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[2].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[3].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[3].horaire, dispo[3].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[3].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[3].horaire).format('LT')}</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.boxContainer}>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[4].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[4].horaire, dispo[4].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[4].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[4].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[5].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[5].horaire, dispo[5].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[5].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[5].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[6].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[6].horaire, dispo[6].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[6].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[6].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[7].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[7].horaire, dispo[7].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[7].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[7].horaire).format('LT')}</Text>
                                        </Pressable>
                                    </View>
                                    <View style={[styles.boxContainer, { paddingHorizontal: wp('25%') }]}>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[8].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[8].horaire, dispo[8].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[8].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[8].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[9].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[9].horaire, dispo[9].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[9].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[9].horaire).format('LT')}</Text>
                                        </Pressable>
                                    </View>
                                </View> : null}

                                {periode === 'soir' ? <View style={styles.dureeContainer}>
                                    <View style={styles.boxContainer}>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[10].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[10].horaire, dispo[10].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[10].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[10].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[11].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[11].horaire, dispo[11].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[11].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[11].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[12].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[12].horaire, dispo[12].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[12].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[12].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[13].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[13].horaire, dispo[13].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[13].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[13].horaire).format('LT')}</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.boxContainer}>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[14].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[14].horaire, dispo[14].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[14].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[14].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[15].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[15].horaire, dispo[15].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[15].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[15].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[16].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[16].horaire, dispo[16].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[16].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[16].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[17].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[17].horaire, dispo[17].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[17].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[17].horaire).format('LT')}</Text>
                                        </Pressable>
                                    </View>
                                    <View style={[styles.boxContainer, { paddingHorizontal: wp('25%') }]}>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[18].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[18].horaire, dispo[18].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[18].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[18].horaire).format('LT')}</Text>
                                        </Pressable>
                                        <Pressable style={[styles.pressable, { backgroundColor: hour === dispo[19].horaire ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectHour(dispo[19].horaire, dispo[19].id)}>
                                            <Text style={[styles.pressablePrice, { color: hour === dispo[19].horaire ? 'white' : 'black' }]}>{moment('2020-04-24' + ' ' + dispo[19].horaire).format('LT')}</Text>
                                        </Pressable>
                                    </View>
                                </View> : null}

                                <Pressable style={({ pressed }) =>

                                    pressed ? styles.signOut0 : styles.signOut
                                } onPress={this._displayRecap}>
                                    {({ pressed }) => (
                                        <View style={styles.signOutView}>
                                            <Text style={pressed ? styles.signOutText0 : styles.signOutText}>SUIVANT</Text>
                                            {pressed ? <Icon name="chevron-right" size={hp(4)} color="white" /> : <Icon name="chevron-right" size={hp(4)} color="#08CC" />}
                                        </View>
                                    )}
                                </Pressable>
                            </View> : null}
                        </ScrollView>
                    ) : this._notConnected()}
            </View>
        )
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    sectionTitle: {
        marginTop: hp(3),
        paddingTop: hp(7),
        paddingBottom: hp(3),
        marginHorizontal: wp(5),
        borderTopWidth: hp(0.4),
        borderColor: 'black'
    },
    sectionText: {
        fontSize: hp(2.5),
        color: 'black',
        fontFamily: 'Raleway-Bold',
        textAlign: 'center'
    },
    needsContainer: {
        paddingVertical: hp(3),
        paddingHorizontal: wp(3),
        //elevation: 5,
        borderRadius: hp(1),
    },
    needs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: hp(0.3),
        borderBottomColor: '#cacdd1',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(2)
    },
    menage: {
        flex: 2,
        alignItems: 'center',
        borderRightWidth: hp(0.3),
        borderColor: '#cacdd1'
    },
    iron: {
        flex: 2,
        borderColor: '#cacdd1',
        alignItems: 'center',
    },
    pet: {
        flexDirection: 'row',
        borderColor: '#cacdd1',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(1.5)
    },
    menagePic: {
        height: 70,
        width: 70
    },
    checkboxText: {
        marginTop: 30,
        marginLeft: 10,
        fontSize: hp(2.5),
        color: 'black',
        fontFamily: 'Raleway-Bold'
    },
    boxContainer: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: wp(1),
        marginRight: wp(1)
    },
    pressable: {
        backgroundColor: 'white',
        flex: 1,
        marginVertical: hp(1.4),
        marginHorizontal: wp(1.9),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: hp(3),
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(2)
    },
    pressableTitle: {
        color: '#08CC',
        textAlign: 'center',
        fontSize: hp(2.5),
        marginBottom: hp(1.5),
        fontFamily: 'Raleway-Bold',
    },
    pressableText: {
        color: 'black',
        textAlign: 'center',
        fontSize: hp(2),
        fontFamily: 'Raleway-Regular',
        marginBottom: hp(1.4)

    },
    pressablePrice: {
        color: 'black',
        textAlign: 'center',
        fontSize: hp(2.2),
        fontFamily: 'Raleway-Bold',

    },
    pressableDuree: {
        color: 'black',
        textAlign: 'center',
        fontSize: hp(1.5),
        fontFamily: 'Raleway-Regular',

    },
    signOut: {
        backgroundColor: 'white',
        flexDirection: 'row',
        height: hp(6),
        width: wp(50),
        marginTop: hp(3),
        marginBottom: hp(2.4),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: hp(3),
        paddingVertical: hp(1),
        paddingHorizontal: wp(1.2),
        alignSelf: 'center'
    },
    signOut0: {
        backgroundColor: '#33A0D6',
        flexDirection: 'row',
        height: hp(6),
        width: wp(50),
        marginTop: hp(3),
        marginBottom: hp(2.4),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: hp(3),
        paddingVertical: hp(1),
        paddingHorizontal: wp(1.2),
        alignSelf: 'center'
    },
    signOutText: {
        color: '#08CC',
        textAlign: 'center',
        fontSize: hp(2.7),
        marginRight: wp(2),
        fontFamily: 'Raleway-Bold',
    },
    signOutText0: {
        color: 'white',
        textAlign: 'center',
        fontSize: hp(2.7),
        marginRight: wp(2),
        fontFamily: 'Raleway-Bold',
    },
    signOutView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loading_container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    edit: {
        backgroundColor: '#33A0D6',
        height: hp(6),
        width: wp(50),
        borderRadius: hp(2.4),
        elevation: hp(1),
        justifyContent: 'center'
    },
    footer: {
        flexDirection: 'row',
        paddingVertical: hp(2.4),
        justifyContent: 'center',
    },
    touchableText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: hp(2.5),
        fontFamily: 'Raleway-Bold'
    },
    message: {
        flex: 1,
        paddingHorizontal: wp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    messageText: {
        color: 'black',
        fontSize: hp(2.5),
        textAlign: 'center',
        fontFamily: 'Raleway-Bold',
        marginTop: hp(5)
    },
    retry: {
        backgroundColor: '#08CC',
        height: hp(6),
        width: wp(35),
        borderRadius: hp(1),
        justifyContent: 'center',
        marginTop: hp(5)
    },
    retryText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: hp(2.5),
        fontFamily: 'Raleway-Bold'
    },
})

export default VueReservation