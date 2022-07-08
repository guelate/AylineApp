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

class VueEspaceClient extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            userData: undefined,
            value: this.props.route.params.value,
            isLogged: this.props.route.params.isLogged,
            isLoading: true,
            booking: undefined,
            isConnected: true,
            pass: this.props.route.params.value
        }
        this.url = 'https://ayline-services.fr'
        this.value = {
            email: '',
            password: ''
        }
        this.isConnected = true
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
        console.log('unmounted')
    }

    _navigate = (view, user) => {
        this.props.navigation.navigate(view, user)
    }

    componentDidMount() {
        console.log('mounted')
        
            this._getData()

            this.props.navigation.navigate('Ayline', {
                screen: 'Reserver',
                params: {
                    isLogged: true,
                    isConnected: true
                },
            })
    }

    componentDidUpdate(prevProps, prevState) {

        if (prevState.userData !== undefined && prevState.userData === this.state.userData) {

            this._getData()
            /* this.props.navigation.navigate('Ayline', {
                screen: 'Reserver',
                params: {
                    isLogged: true,
                    isConnected: true
                },
            }) */
        }
    }

    _getData = () => {

        NetInfo.fetch().then(state => {

            AsyncStorage.getItem('token').then(value => {

                if (this.state.isLogged) {

                    console.log('connected:', state.isConnected)
                    console.log('token:', value)

                    if (value === null) {

                        if (state.isConnected) {

                            if (this.state.value !== undefined && this.state.value !== null) {
                                this.value = this.state.value
                                console.log(this.state.value)
                            }

                            /*  AsyncStorage.getItem('password').then(pass => {
                                 this.setState({pass: pass})
                             }) */

                            fetch(this.url + "/api/connexion", {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({

                                    email: this.state.value.email,
                                    password: this.state.value.password

                                    // email: 'ghislainassi.t2r@gmail.com',
                                    // password: 'Ghislain03'

                                })
                            })
                                .then(response => response.json())
                                .then(data => {

                                    if (data !== "Données d'identification incorrect" && data.errors === undefined && data.message !== 'Unauthenticated') {

                                        console.log(data, data.errors, data.message)

                                        AsyncStorage.setItem('token', data)
                                        AsyncStorage.setItem('password', this.props.route.params.value.password)

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
                                                    //this.setState({ isLoading: true })
                                                    this.setState({
                                                        userData: data,
                                                        isLoading: false,
                                                        isConnected: state.isConnected,
                                                    })


                                                })
                                                .catch((error) => {
                                                    console.error('Error:', error);
                                                });
                                        })
                                    }
                                    else {
                                        console.log(data)
                                        this.props.navigation.navigate('CONNEXION', { booking: false })
                                        ToastAndroid.show('Email ou Mot de passe ou incorrect, Veuillez rentrez correctement toutes les donnees ', ToastAndroid.LONG);
                                    }

                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                        }
                        else {
                            this.props.navigation.navigate('CONNEXION')
                            ToastAndroid.show("Il semble que vous n'êtes pas connecté à Internet, nous ne trouvons aucun réseau", ToastAndroid.LONG);
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
                                        console.log(data)
                                        this.setState({
                                            userData: data,
                                            isLoading: false,
                                            isConnected: state.isConnected
                                        })
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
                <TouchableOpacity style={[styles.edit, { height: hp(5), width: wp(45), borderRadius: hp(2.5) }]} onPress={() => this._navigate('Ayline', {
                    screen: 'Reserver',
                    params: {
                        isConnected: true,
                        isLogged: false
                    },
                })}>
                    <Text style={[styles.touchableText, { fontSize: hp(2) }]}>Réserver un service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.edit, { height: hp(5), width: wp(45), borderRadius: hp(2.5), marginTop: hp(3), backgroundColor: 'white', borderWidth: hp(0.1), borderColor: '#33A0D6' }]} onPress={() => this._navigate('CONNEXION', { booking: false })}>
                    <Text style={[styles.touchableText, { fontSize: hp(2), color: '#33A0D6' }]}>Me connecter</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {

        const { userData, isLoading, isConnected, isLogged, pass } = this.state;

        // console.log('pass:', pass)

        return (
            <View style={styles.container}>

                {isLogged ? isConnected ? isLoading ?
                    this._displayLoading() : (
                        <ScrollView style={styles.container}>
                            <View style={styles.entete}>
                                <Text style={styles.text}>Bienvenue {userData.nom} </Text>
                                <TouchableOpacity onPress={() => this._navigate('MES INFORMATIONS', { userData: userData, pass: this.props.route.params.value.password })}>
                                    <FontAwesome5 name={"user-edit"} solid size={hp(4)} color="white" />
                                </TouchableOpacity>
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
                                } onPress={() => this._navigate('FACTURES')}>
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
                                } onPress={() => this._navigate('MES DOCUMENTS', { id: userData.id })}>
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
                                            <Text style={pressed ? styles.pressableTitle0 : styles.pressableTitle}>MES MOYENS DE PAIEMENTS</Text>
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
        backgroundColor: '#33A0D6',
        flexDirection: 'row',
        // borderWidth: 3,
        // borderColor: '#08CC',
        borderRadius: hp(1.5),
        height: hp(8),
        marginVertical: hp(1),
        marginHorizontal: wp(4),
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(3),
        paddingBottom: hp(0.5)
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontSize: hp(3.9),
        fontFamily: 'Raleway-Bold',
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
        marginVertical: hp(1),
        height: hp(21),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        paddingHorizontal: wp(2)
    },
    pressable0: {
        backgroundColor: '#33A0D6',
        flex: 1,
        marginHorizontal: wp(2),
        marginVertical: hp(1),
        height: hp(21),
        borderRadius: hp(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
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
        marginTop: hp(0.5),
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
        //marginTop: hp(5),
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
export default VueEspaceClient