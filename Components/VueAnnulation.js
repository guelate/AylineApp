import React, { Component } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ToastAndroid, ActivityIndicator, Alert, BackHandler } from 'react-native';
import t from 'tcomb-form-native';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from "@react-native-community/netinfo";

class VueAnnulation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            orderData: undefined,
            isLoading: true,
            dataList: undefined,
            value: {},
            motif: {},
            id: this.props.route.params.id,
            date: this.props.route.params.date,
            isConnected: true
        }

        this.url = 'https://ayline-services.fr'
        this.form = React.createRef()
        this.formMotif = React.createRef()

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

    componentDidMount() {
        this._getData()
    }

    _getData = () => {

        NetInfo.fetch().then(state => {

            AsyncStorage.getItem('token').then(value => {

                if (state.isConnected) {

                    fetch(this.url + '/api/liste_elements', {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + value
                        },
                    })
                        .then(response => response.json())
                        .then(data => {
                            //console.log(data)

                            let motif = {}

                            for (let i = 0; i < data.liste_motif.length; i++) {

                                motif['' + data.liste_motif[i].id] = '' + data.liste_motif[i].lib_motif

                            }

                            this.setState({
                                motif,
                                dataList: data,
                                isConnected: state.isConnected
                            })
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });

                    fetch(this.url + this.props.route.params.link, {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + value
                        },
                    })
                        .then(response => response.json())
                        .then(data => {
                            //console.log(data)
                            this.setState({
                                orderData: data,
                                isLoading: false
                            })
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }
                else {
                    this.setState({ isConnected: false })
                }
            })
        })
    }

    _navigate = () => {

        this.props.navigation.goBack()

        /* if (this.props.route.params.view === 'NOUVELLES COMMANDES') {
          this.props.navigation.navigate('NOUVELLES COMMANDES')
        }
        else if (this.props.route.params.view === 'COMMANDES EN COURS') {
          this.props.navigation.navigate('COMMANDES EN COURS')
        } */
    }

    format_motif = (motif) => {
        var str = ""
        if (motif.motif0 === 'm1') {
            str = "Je suis insatisfait de la pr" + id
        } else if (id >= 10 && id < 100) {
            str = "00" + id
        } else if (id >= 100 && id < 1000) {
            str = "0" + id
        } else {
            str += id
        }

        return 'AYLRES' + annee + mois + str
    }

    _launchAlert = () => {

        if (this.form.current.getValue() === null) {

            ToastAndroid.show("Erreur vous n'avez pas selectionné de motif", ToastAndroid.LONG);

        } else if (this.form.current.getValue().motif0 === '13') {
            if (this.formMotif.current.getValue() === null) {
                ToastAndroid.show("Erreur vous n'avez pas rentrez de motif", ToastAndroid.LONG);
            } else {

                Alert.alert(
                    "Voulez vous vraiment annuler cette Reservation ?",
                    "Cette action est irreversible !", [
                    { text: "Fermer" },
                    { text: "oui j'annule", onPress: () => this._handleSubmit() }
                ], { cancelable: true }
                );
            }

        } else {

            Alert.alert(
                "Voulez vous vraiment annuler cette Reservation ?",
                "Cette action est irreversible !", [
                { text: "Fermer" },
                { text: "oui j'annule", onPress: () => this._handleSubmit() }
            ], { cancelable: true }
            );

        }

    }

    _handleSubmit = () => {
        let motif;
        let autreMotif;
        let id = this.state.id

        if (this.form.current.getValue() === null) {

            ToastAndroid.show("Erreur vous n'avez pas selectionné de motif", ToastAndroid.LONG);

        } else if (this.form.current.getValue().motif0 === '13') {
            if (this.formMotif.current.getValue() === null) {
                ToastAndroid.show("Erreur vous n'avez pas rentrez de motif", ToastAndroid.LONG);
            } else {

                if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 !== '13') {
                    motif = this.form.current.getValue().motif0
                    autreMotif = null
                } else if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 === '13' && this.formMotif.current.getValue().Autre_motif !== null) {
                    motif = this.form.current.getValue().motif0
                    autreMotif = this.formMotif.current.getValue().Autre_motif
                }
                //console.log(this.formMotif.current.getValue())
                //console.log(this.props.route.params)

                AsyncStorage.getItem('token').then(value => {
                    if (value !== null) {

                        fetch(this.url + '/api/client/SendDemandeAnnul', {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                "Authorization": "Bearer " + value
                            },
                            body: JSON.stringify({
                                motif_id: motif,
                                reservation_id: id,
                                autre_motif: autreMotif
                            }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data)
                                this._notification(value)

                                Alert.alert(
                                    null,
                                    "La demande d'annulation a bien été envoyée !", [{ text: "OK" }], { cancelable: true }
                                );
                            })
                            .catch((error) => {
                                console.error('Error:', error);
                            });
                    }

                })


            }
        } else {

            if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 !== '13') {
                motif = this.form.current.getValue().motif0
                autreMotif = null
            } else if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 === '13' && this.formMotif.current.getValue().Autre_motif !== null) {
                motif = this.form.current.getValue().motif0
                autreMotif = this.formMotif.current.getValue().Autre_motif
            }
            //console.log(this.formMotif.current.getValue())
            //console.log(this.props.route.params)

            AsyncStorage.getItem('token').then(value => {
                if (value !== null) {

                    fetch(this.url + '/api/client/SendDemandeAnnul', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + value
                        },
                        body: JSON.stringify({
                            motif_id: motif,
                            reservation_id: id,
                            autre_motif: autreMotif
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            this._notification(value)

                            Alert.alert(
                                null,
                                "La demande d'annulation a bien été envoyée !", [
                                { text: "OK" }
                            ], { cancelable: true }
                            );
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }

            })

        }
    }

    _notification = (value) => {

        fetch(this.url + '/api/client/Notifier_demande_annulation', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + value
            },
        })
            .then(response => response.json())
            .then(data => {
                let intitule = "Vous avez " + data.nbre_demande + " demande(s) d'annulation de reservation en attente"
                let user_id = '1'
                let lien_notif = '/admin/annulation_reservation'
                let type_notif = 1
                let statut_notif = 'warning'

                this._addNotification(user_id, intitule, lien_notif, type_notif, statut_notif)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    _addNotification = (user_id, intitule, lien_notif, type_notif, statut_notif) => {

        AsyncStorage.getItem('token').then(value => {
            if (value !== null) {

                fetch(this.url + '/api/admin/add_notification', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + value
                    },
                    body: JSON.stringify({
                        user_id: user_id,
                        intitule: intitule,
                        lien_notif: lien_notif,
                        type_notif: type_notif,
                        statut_notif: statut_notif,
                    })

                })
                    .then(response => response.json())
                    .then(data => {
                        //console.log(data)
                        //this._notification(value)
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        })
    }

    format_code = (id, date) => {
        var str = ""
        if (id >= 0 && id < 10) {
            str = "000" + id
        } else if (id >= 10 && id < 100) {
            str = "00" + id
        } else if (id >= 100 && id < 1000) {
            str = "0" + id
        } else {
            str += id
        }
        //return str;
        var newdate = date.split('-')
        var annee = newdate[0].substr(2, 2)
        var mois = newdate[1]
        return 'AYLRES' + annee + mois + str
    }

    _displayValue = () => {
        console.log(this.form.current.getValue().motif0)
    }


    _displayLoading() {
        return (
            <View style={styles.loading_container}>
                <ActivityIndicator
                    size={hp(8)}
                    color='#08CC' />
            </View>
        )
    }

    _notConnected() {

        NetInfo.fetch().then(state => {
            this.isConnected = state.isConnected
        })

        return (
            <View style={[styles.message, { flex: 1, paddingHorizontal: wp(2), paddingVertical: hp(24.5) }]}>
                <MaterialCommunityIcons name="wifi-off" size={hp(15)} color="#33A0D6" />
                <Text style={[styles.messageText, { color: 'black', fontSize: hp(2.5), marginTop: hp(5) }]}>Il semble que vous n'êtes pas connecté à Internet Nous ne trouvons aucun réseau</Text>
                <TouchableOpacity style={styles.retry} onPress={() => this._getData()}>
                    <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        )
    }

    onChangeValue = (value) => {
        this.setState({ value });
    }

    render() {

        const { orderData, dataList, isLoading, id, date, value, isConnected, motif } = this.state

        const Form = t.form.Form;

        let element = {};

        if (dataList !== undefined) {
            element = {
                motif1: dataList.liste_motif[0].lib_motif,
                idMotif1: dataList.liste_motif[0].id,
                motif2: dataList.liste_motif[1].lib_motif,
                idMotif2: dataList.liste_motif[1].id,
                motif3: dataList.liste_motif[2].lib_motif,
                idMotif3: dataList.liste_motif[2].id,
                motif4: dataList.liste_motif[3].lib_motif,
                idMotif4: dataList.liste_motif[3].id,
                motif5: dataList.liste_motif[4].lib_motif,
                idMotif5: dataList.liste_motif[4].id,
                motif6: dataList.liste_motif[5].lib_motif,
                idMotif6: dataList.liste_motif[5].id,
                motif7: dataList.liste_motif[6].lib_motif,
                idMotif7: dataList.liste_motif[6].id,
                motif8: dataList.liste_motif[7].lib_motif,
                idMotif8: dataList.liste_motif[7].id,
                motif9: dataList.liste_motif[8].lib_motif,
                idMotif9: dataList.liste_motif[8].id,
                motif10: dataList.liste_motif[9].lib_motif,
                idMotif10: dataList.liste_motif[9].id,
                motif11: dataList.liste_motif[10].lib_motif,
                idMotif11: dataList.liste_motif[10].id,
                motif12: dataList.liste_motif[11].lib_motif,
                idMotif12: dataList.liste_motif[11].id,
                motif13: dataList.liste_motif[12].lib_motif,
                idMotif13: dataList.liste_motif[12].id
            }
        }

        const mo = t.enums(motif)

        const User = t.struct({
            motif0: mo,
        });

        const Motif = t.struct({
            Autre_motif: t.String,
        })

        const formStyles = {
            ...Form.stylesheet,
            controlLabel: {
                normal: {
                    color: '#08CC',
                    fontSize: hp(2.2),
                    marginBottom: hp(1),
                    fontFamily: 'Raleway-Bold'
                },
                error: {
                    color: "#a94442",
                    fontSize: hp(2.2),
                    marginBottom: hp(1),
                    fontFamily: 'Raleway-Bold'
                }
            },
            textbox: {
                normal: {
                    color: "#000000",
                    fontSize: hp(2.2),
                    height: hp(7),
                    width: wp(80),
                    paddingVertical: Platform.OS === "ios" ? hp(1) : hp(1),
                    paddingHorizontal: wp(5),
                    borderRadius: hp(4),
                    borderColor: "#08CC",
                    borderWidth: 3,
                    marginBottom: hp(1),
                    backgroundColor: 'white',
                    fontFamily: 'Raleway-Regular',
                    alignSelf: 'center'
                },
                error: {
                    color: "#000000",
                    fontSize: hp(2.2),
                    height: hp(7),
                    width: wp(80),
                    paddingVertical: Platform.OS === "ios" ? hp(1) : hp(1),
                    paddingHorizontal: wp(5),
                    borderRadius: hp(4),
                    borderColor: "#a94442",
                    borderWidth: 3,
                    marginBottom: hp(1),
                    backgroundColor: 'white',
                    fontFamily: 'Raleway-Regular',
                    alignSelf: 'center'
                }
            },


        }
        //a94442

        const options = {
            auto: 'placeholders',
            i18n: {
                optional: '',
                required: '',
            },
            fields: {
                motif0: {
                    label: 'Motif',
                    nullOption: { value: {}, text: "Selectionnez le motif" }
                },
            },
            stylesheet: formStyles,
        }

        return (
            <View style={styles.container}>
                {isConnected ? isLoading ?
                    this._displayLoading() : (
                        <View style={styles.listContainer}>
                            <View style={styles.title}>
                                <Text style={styles.titleText}>CODE DE RESERVATION: {this.format_code(id, date)}</Text>
                            </View>
                            <Form ref={this.form}
                                type={User}
                                value={value}
                                onChange={() => this.onChangeValue(this.form.current.getValue())}
                                options={options}
                            />
                            {value !== null && value.motif0 === '13' ? <Form
                                ref={this.formMotif}
                                type={Motif}
                                options={options}
                            /> : null}
                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancel}
                                    onPress={this._navigate}>
                                    <Text style={styles.touchableText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.edit}
                                    onPress={this._launchAlert}>
                                    <Text style={styles.touchableText}>Envoyer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : this._notConnected()}
            </View>
        )
    }
}






const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    listContainer: {
        backgroundColor: 'white',
        borderWidth: hp(0.5),
        borderColor: '#08CC',
        borderRadius: hp(1.5),
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.5),
        marginHorizontal: wp(2),
        marginVertical: hp(1.5),
        elevation: 20
    },
    title: {
        marginVertical: hp(1.5)
    },
    titleText: {
        fontSize: hp(2),
        fontFamily: 'Raleway-Bold',
        color: '#08CC'
    },
    cancel: {
        backgroundColor: 'red',
        marginRight: wp(5),
        height: hp(6),
        width: wp(35),
        borderRadius: hp(1),
        justifyContent: 'center'
    },
    edit: {
        backgroundColor: '#08CC',
        height: hp(6),
        width: wp(35),
        borderRadius: hp(1),
        justifyContent: 'center'
    },
    footer: {
        flexDirection: 'row',
        paddingVertical: hp(2.5),
        justifyContent: 'center',
    },
    touchableText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: hp(2.5),
        fontFamily: 'Raleway-Bold'
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
    message: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    messageText: {
        color: '#33A0D6',
        fontSize: hp(3),
        textAlign: 'center',
        fontFamily: 'Raleway-Bold'
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

export default VueAnnulation