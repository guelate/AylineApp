import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, BackHandler, ActivityIndicator, ToastAndroid, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AffichageReservations from './AffichageReservations';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class VueDeco extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            userData: undefined,
            value: this.props.route.params.value,
            isLogged: this.props.route.params.isLogged,
            isLoading: true,
            booking: undefined,
            isConnected: true
        }
        this.url = 'https://ayline-services.fr'
        this.value = {
            email: '',
            password: ''
        }
        this.isConnected = true
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

    _navigate = (view, user) => {
        this.props.navigation.navigate(view, user)
    }

    componentDidMount() {
        this._getData()
        this.props.navigation.navigate('Ayline0', {
            screen: 'Reserver',
            params: {
                isConnected: false,
                isLogged: true
            },
        })
    }

    componentDidUpdate(prevProps, prevState) {

        if (prevState.userData !== undefined && prevState.userData === this.state.userData) {
            this._getData()
            this.props.navigation.navigate('Ayline0', {
                screen: 'Reserver',
                params: {
                    isConnected: false,
                    isLogged: true
                },
            })
        }
    }

    _getData = () => {
        const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour } = this.props.route.params

        NetInfo.fetch().then(state => {

            AsyncStorage.getItem('token').then(value => {

                if (this.state.isLogged) {

                    if (value === null) {

                        if (state.isConnected) {

                            if (this.state.value !== undefined && this.state.value !== null) {
                                this.value = this.state.value
                                //console.log(this.value)
                            }

                            fetch(this.url + "/api/connexion", {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({

                                    email: this.state.value.email,
                                    password: this.state.value.password

                                })
                            })
                                .then(response => response.json())
                                .then(data => {

                                    //console.log("No booking:", data)

                                    if (data !== "Données d'identification incorrect" && data.errors === undefined && data.message !== 'Unauthenticated') {

                                        AsyncStorage.setItem('token', data)
                                        AsyncStorage.getItem('token').then(value => {

                                            fetch(this.url + '/api/user', {
                                                method: 'GET',
                                                headers: {
                                                    Accept: 'application/json',
                                                    'Content-Type': 'application/json',
                                                    "Authorization": "Bearer " + value
                                                },
                                            })
                                                .then(response => response.json())
                                                .then(data => {
                                                    console.log(data)
                                                    //console.log(value)
                                                    this.setState({ isLoading: true })
                                                    this.setState({
                                                        userData: data,
                                                        isLoading: false,
                                                        isConnected: state.isConnected
                                                    })

                                                    fetch(this.url + '/api/client/reservation_client_appli', {
                                                        method: 'POST',
                                                        headers: {
                                                            Accept: 'application/json',
                                                            'Content-Type': 'application/json',
                                                            "Authorization": "Bearer " + value
                                                        },
                                                        body: JSON.stringify({

                                                            creneau_horaire_id: idDuree,
                                                            frequence_id: idFreq,
                                                            disponibilite: idHour,
                                                            autre_dispo: autreDispo,
                                                            instruction: instruction,
                                                            majoration: majoration,
                                                            option: pet ? "   J'ai des animaux" : null,
                                                            besoin1: "   ménage",
                                                            besoin2: iron ? "   repassage" : null,
                                                            user_id: data.id,
                                                            date_res: day,
                                                            produit_id: idFreq
                                                        })
                                                    })
                                                        .then(response => response.json())
                                                        .then(data => {
                                                            console.log(data)

                                                        })
                                                        .catch((error) => {
                                                            console.error('Error:', error);
                                                        });
                                                })
                                                .catch((error) => {
                                                    console.error('Error:', error);
                                                });
                                        })
                                    }
                                    else {
                                        //console.log(data)
                                        this.props.navigation.navigate('CONNEXION')
                                        ToastAndroid.show('Email ou Mot de passe ou incorrect, Veuillez rentrez correctement toutes les donnees ', ToastAndroid.LONG);
                                    }

                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                        }
                        else {
                            this.props.navigation.navigate('CONNEXION')
                            ToastAndroid.show('Email ou Mot de passe ou incorrect, Veuillez rentrez correctement toutes les donnees ', ToastAndroid.LONG);
                        }
                    }
                    else {

                        if (state.isConnected) {

                            AsyncStorage.getItem('token').then(value => {

                                fetch(this.url + '/api/user', {
                                    method: 'GET',
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                        "Authorization": "Bearer " + value
                                    },
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log('id - ', data.id)
                                        //console.log(value)
                                        this.setState({ isLoading: true })
                                        this.setState({
                                            userData: data,
                                            isLoading: false,
                                            isConnected: state.isConnected
                                        })


                                        fetch(this.url + '/api/client/reservation_client_appli', {
                                            method: 'POST',
                                            headers: {
                                                Accept: 'application/json',
                                                'Content-Type': 'application/json',
                                                "Authorization": "Bearer " + value
                                            },
                                            body: JSON.stringify({

                                                creneau_horaire_id: idDuree,
                                                frequence_id: idFreq,
                                                disponibilite: idHour,
                                                autre_dispo: autreDispo,
                                                instruction: instruction,
                                                majoration: majoration,
                                                option: pet ? "   J'ai des animaux" : null,
                                                besoin1: "   ménage",
                                                besoin2: iron ? "   repassage" : null,
                                                user_id: data.id,
                                                date_res: day,
                                                produit_id: idFreq
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                console.log(data)

                                            })
                                            .catch((error) => {
                                                console.error('Error:', error);
                                            });

                                    })
                                    .catch((error) => {
                                        console.error('Error:', error);
                                    });


                            })
                        }
                        else {
                            this.setState({ isConnected: false })
                        }
                    }
                }
            })
        });
    }

    _deleteToken = () => {
        AsyncStorage.removeItem('token')
        this.props.navigation.navigate('Acceuil')

    }

    _displayLoading() {

        return (
            <View style={styles.loading_container}>
                <ActivityIndicator size={80} color='#33A0D6' />
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
                <TouchableOpacity style={styles.edit} onPress={() => this._getData()}>
                    <Text style={styles.touchableText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        )
    }

    _notLogged() {

        return (
            <View style={styles.message}>
                <FontAwesome5 name="user-alt-slash" size={hp(10)} color="#33A0D6" />
                <Text style={styles.messageText}>Veuillez vous connecter ou effectuer votre première réservation</Text>
                <TouchableOpacity style={[styles.edit, { height: hp(5), width: wp(50), borderRadius: hp(2.5), paddingHorizontal: wp(1) }]} onPress={() => this._navigate('Ayline0', {
                    screen: 'Reserver',
                    params: {
                        isConnected: true,
                        isLogged: false
                    },
                })}>
                    <Text style={[styles.touchableText, { fontSize: hp(2) }]}>Réserver un service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.edit, { height: hp(5), width: wp(50), borderRadius: hp(2.5), marginTop: hp(3), backgroundColor: 'white', borderWidth: hp(0.1), borderColor: '#33A0D6' }]} onPress={() => this._navigate('CONNEXION', { booking: false })}>
                    <Text style={[styles.touchableText, { fontSize: hp(2), color: '#33A0D6' }]}>Me connecter</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { userData, isLoading, isConnected, isLogged } = this.state;
        console.log(userData)
        return (
            <View style={styles.container}>

                {isLogged ? isConnected ? isLoading ?
                    this._displayLoading() : (
                        <ScrollView style={styles.container}>
                            <View style={styles.entete}>
                                <Text style={styles.text}>Bonjour {userData.nom} </Text>
                            </View>
                            <View style={styles.boxContainer}>

                                <Pressable style={({ pressed }) =>
                                    pressed ? styles.pressable0 : styles.pressable
                                } onPress={() => this._navigate('MES RESERVATIONS')}>
                                    {({ pressed }) => (
                                        <View style={styles.pressableView}>
                                            {pressed ? <Icon name="history" size={hp(6)} color="white" /> : <Icon name="history" size={hp(6)} color="#08CC" />}
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>MES RESERVATIONS</Text>
                                            <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter, modifier ou annuler mes réservations</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <Pressable style={({ pressed }) =>
                                    pressed ? styles.pressable0 : styles.pressable
                                } onPress={() => this._navigate('MES PRESTATIONS')}>
                                    {({ pressed }) => (
                                        <View style={styles.pressableView}>
                                            {pressed ? <FontAwesome5 name={"calendar-day"} solid size={hp(6)} color="white" /> : <FontAwesome5 name={"calendar-day"} solid size={hp(6)} color="#08CC" />}
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>MES PRESTATIONS</Text>
                                            <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter, modifier ou annuler mes prestations</Text>
                                        </View>
                                    )}
                                </Pressable>

                            </View>
                            <View style={styles.boxContainer}>

                                <Pressable style={({ pressed }) =>
                                    pressed ? styles.pressable0 : styles.pressable
                                } onPress={() => this._navigate('CLIENT', { value: {} })}>
                                    {({ pressed }) => (
                                        <View style={styles.pressableView}>
                                            {pressed ? <FontAwesome5 name={"file-invoice"} solid size={hp(6)} color="white" /> : <FontAwesome5 name={"file-invoice"} solid size={hp(6)} color="#08CC" />}
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>MES FACTURES</Text>
                                            <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter mes commandes passées et télécharger mes factures</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <Pressable style={({ pressed }) =>
                                    pressed ? styles.pressable0 : styles.pressable
                                } onPress={() => this._navigate('MES DOCUMENTS')}>
                                    {({ pressed }) => (
                                        <View style={styles.pressableView}>
                                            {pressed ? <Ionicons name="folder-open" size={hp(6)} color="white" /> : <Ionicons name="folder-open" size={hp(6)} color="#08CC" />}
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>MES DOCUMENTS</Text>
                                            <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Consulter et télécharger mes demandes de devis et mes attestations</Text>
                                        </View>
                                    )}
                                </Pressable>

                            </View>
                            <View style={styles.boxContainer}>

                                <Pressable style={({ pressed }) =>
                                    pressed ? styles.pressable0 : styles.pressable
                                } onPress={() => this._navigate('MES MOYENS DE PAIEMENT', {
                                    id: userData.id,
                                    nom: userData.nom,
                                    prenom: userData.prenom,
                                    email: userData.email
                                })}>
                                    {({ pressed }) => (
                                        <View style={styles.pressableView}>
                                            {pressed ? <Icon name="credit-card-alt" size={hp(6)} color="white" /> : <Icon name="credit-card-alt" size={hp(6)} color="#08CC" />}
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>MES MOYENS DE PAIMENTS</Text>
                                            <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Modifier mes cartes bancaires</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <Pressable style={({ pressed }) =>
                                    pressed ? styles.pressable0 : styles.pressable
                                } onPress={() => this._navigate('NOUS CONTACTER')}>
                                    {({ pressed }) => (
                                        <View style={styles.pressableView}>
                                            {pressed ? <MaterialCommunityIcons name="phone-in-talk" size={hp(6)} color="white" /> : <MaterialCommunityIcons name="phone-in-talk" size={hp(6)} color="#33A0D6" />}
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>NOUS CONTACTER</Text>
                                            <Text style={pressed ? styles.pressableText0 : styles.pressableText}>Echangez avec l'un de nos conseillés et profitez d'une assistance en ligne</Text>
                                        </View>
                                    )}
                                </Pressable>

                            </View>
                            <Pressable style={({ pressed }) =>
                                pressed ? styles.signOut0 : styles.signOut
                            } onPress={this._deleteToken}>
                                {({ pressed }) => (
                                    <View style={styles.signOutView}>
                                        <Text style={pressed ? styles.signOutText0 : styles.signOutText}>DECONNEXION</Text>
                                        {pressed ? <Icon name="sign-out" size={hp(5)} color="white" /> : <Icon name="sign-out" size={hp(5)} color="#08CC" />}
                                    </View>
                                )}
                            </Pressable>
                        </ScrollView>
                    ) : this._notConnected() : this._notLogged()}
            </View>
        )
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    entete: {
        borderWidth: 3,
        borderColor: '#08CC',
        borderRadius: hp(1.5),
        height: hp(8),
        margin: hp(3),
        justifyContent: 'center'
    },
    text: {
        color: '#08CC',
        textAlign: 'center',
        fontSize: hp(3.9),
        fontFamily: 'Raleway-Bold'
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
    signOut: {
        backgroundColor: 'white',
        flexDirection: 'row',
        height: hp(7),
        width: wp(70),
        //marginTop: hp(20),
        marginBottom: hp(2),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        padding: hp(1),
        alignSelf: 'center'
    },
    signOut0: {
        backgroundColor: '#33A0D6',
        flexDirection: 'row',
        height: hp(7),
        width: wp(70),
        //marginTop: hp(20),
        marginBottom: hp(2),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        padding: hp(1),
        alignSelf: 'center'
    },
    signOutText: {
        color: '#08CC',
        textAlign: 'center',
        fontSize: hp(2.5),
        marginRight: wp(2.5),
        fontFamily: 'Raleway-Bold',
    },
    signOutText0: {
        color: 'white',
        textAlign: 'center',
        fontSize: hp(2.5),
        marginRight: wp(2.5),
        fontFamily: 'Raleway-Bold',
    },
    signOutView: {
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
        justifyContent: 'center',
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
    edit: {
        backgroundColor: '#08CC',
        height: hp(6),
        width: wp(35),
        borderRadius: hp(1),
        justifyContent: 'center',
        marginTop: hp(5)
    },
    touchableText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: hp(2.5),
        fontFamily: 'Raleway-Bold'
    },
})
export default VueDeco