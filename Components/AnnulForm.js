import React, { Component } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ToastAndroid, ActivityIndicator, BackHandler, Alert } from 'react-native';
import t from 'tcomb-form-native';
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment';
import 'moment/locale/fr';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from "@react-native-community/netinfo";

class AnnulForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      orderData: undefined,
      isLoading: true,
      dataList: undefined,
      motif: {},
      value: {},
      id: this.props.route.params.id,
      isConnected: true
    }

    this.url = 'https://ayline-services.fr'
    this.formMotif = React.createRef()
    this.form = React.createRef()

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

              let motif = {}

              for (let i = 0; i < data.liste_motif.length; i++) {

                motif['' + data.liste_motif[i].lib_motif] = '' + data.liste_motif[i].lib_motif
              }


              console.log('motif:', motif)

              this.setState({
                motif,
                dataList: data,
                isConnected: state.isConnected
              })
              //console.log(data)
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

  _launchAlert = () => {

    if (this.form.current.getValue() === null) {

      ToastAndroid.show("Erreur vous n'avez pas selectionné de motif", ToastAndroid.LONG);

    }
    else if (this.form.current.getValue().motif0 === 'Autres') {
      if (this.formMotif.current.getValue() === null) {
        ToastAndroid.show("Erreur vous n'avez pas rentrez de motif", ToastAndroid.LONG);
      }

    }
    else {

      Alert.alert(
        "Voulez vous vraiment annuler cette prestation ?",
        "Cette action est irreversible !",
        [
          { text: "Fermer" },
          { text: "oui j'annule", onPress: () => this._handleSubmit() }
        ],
        { cancelable: true }
      );

    }

  }

  _handleSubmit = () => {
    let motif;
    let autreMotif;
    let id = this.state.id

    if (this.form.current.getValue() === null) {

      ToastAndroid.show("Erreur vous n'avez pas selectionné de motif", ToastAndroid.LONG);

    }
    else if (this.form.current.getValue().motif0 === 'Autres') {
      if (this.formMotif.current.getValue() === null) {
        ToastAndroid.show("Erreur vous n'avez pas rentrez de motif", ToastAndroid.LONG);
      }
      else {

        if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 !== 'Autres') {
          motif = this.form.current.getValue().motif0
          autreMotif = null
        }
        else if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 === 'Autres' && this.formMotif.current.getValue().Autre_motif !== null) {
          motif = this.form.current.getValue().motif0
          autreMotif = this.formMotif.current.getValue().Autre_motif
        }
        //console.log(this.formMotif.current.getValue())
        //console.log(this.props.route.params)

        AsyncStorage.getItem('token').then(value => {
          if (value !== null) {

            fetch(this.url + '/api/client/Annulation_prestation_cli', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + value
              },
              body: JSON.stringify({
                prestation_id: id,
                motif: motif,
                autre_motif: autreMotif
              }),
            })
              .then(response => response.json())
              .then(data => {
                let intitule = "La prestation du " + moment(data.date_prestation).format('LL') + " du client " + data.nom_cli + " a été annulée pour le motif suivant : " + data.motif_annulation + " !"
                let user_id = '1'
                let lien_notif = ''
                let type_notif = 2
                let statut_notif = 'info'

                this._addNotification(user_id, intitule, lien_notif, type_notif, statut_notif)
                intitule = "Annulation de la prestation en cours de traitement, vous recevrez une notification dès que celle-ci sera traitée !"
                this._addNotification(0, intitule, lien_notif, type_notif, statut_notif)
                console.log(data)

                this.props.navigation.goBack()

                Alert.alert(
                  null,
                  "La prestation a bien été Annulée !",
                  [
                    { text: "OK" }
                  ],
                  { cancelable: true }
                );
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }

        })
      }
    }
    else {

      if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 !== 'Autres') {
        motif = this.form.current.getValue().motif0
        autreMotif = null
      }
      else if (this.form.current.getValue().motif0 !== null && this.form.current.getValue().motif0 === 'Autres' && this.formMotif.current.getValue().Autre_motif !== null) {
        motif = this.form.current.getValue().motif0
        autreMotif = this.formMotif.current.getValue().Autre_motif
      }
      console.log(motif)
      //console.log(this.props.route.params)

      AsyncStorage.getItem('token').then(value => {
        if (value !== null) {

          fetch(this.url + '/api/client/Annulation_prestation_cli', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + value
            },
            body: JSON.stringify({
              prestation_id: id,
              motif: motif,
              autre_motif: autreMotif
            }),
          })
            .then(response => response.json())
            .then(data => {
              let intitule = "La prestation du " + moment(data.date_prestation).format('LL') + " du client " + data.nom_cli + " a été annulée pour le motif suivant : " + data.motif_annulation + " !"
              let user_id = '1'
              let lien_notif = ''
              let type_notif = 2
              let statut_notif = 'info'

              this._addNotification(user_id, intitule, lien_notif, type_notif, statut_notif)
              intitule = "Annulation de la prestation en cours de traitement, vous recevrez une notification dès que celle-ci sera traitée !"
              this._addNotification(0, intitule, lien_notif, type_notif, statut_notif)
              console.log(data)

              this.props.navigation.goBack()

              Alert.alert(
                null,
                "La prestation a bien été Annulée !",
                [
                  { text: "OK" }
                ],
                { cancelable: true }
              );

            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }
      })

    }
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

  onChangeValue = (value) => {
    this.setState({ value });
  }

  render() {

    const { dataList, value, isConnected, motif } = this.state

    console.log(motif)

    const Form = t.form.Form;

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
          fontSize: hp(2.5),
          marginBottom: hp(1),
          fontFamily: 'Raleway-Bold',
        },
        error: {
          color: "#a94442",
          fontSize: hp(2.5),
          marginBottom: hp(1),
          fontFamily: 'Raleway-Bold',
        }
      },
      textbox: {
        normal: {
          color: "#000000",
          fontSize: hp(2.5),
          fontFamily: 'Raleway-Regular',
          height: hp(7),
          width: wp(80),
          paddingVertical: Platform.OS === "ios" ? hp(1) : hp(1),
          paddingHorizontal: wp(3),
          borderRadius: 25,
          borderColor: "#08CC",
          borderWidth: 3,
          marginBottom: hp(0.5),
          backgroundColor: 'white',
          alignSelf: 'center'
        },
        error: {
          color: "#000000",
          fontSize: hp(2.5),
          fontFamily: 'Raleway-Regular',
          height: hp(7),
          width: wp(80),
          paddingVertical: Platform.OS === "ios" ? hp(1) : hp(1),
          paddingHorizontal: wp(3),
          borderRadius: 25,
          borderColor: "#a94442",
          borderWidth: 3,
          marginBottom: hp(0.5),
          backgroundColor: 'white',
          alignSelf: 'center'
        }
      },
      pickerContainer: {
        normal: {
          color: 'black'
        },
        error: {
          color: '#a94442'
        },
      },

    }

    const options = {
      auto: 'placeholders',
      i18n: {
        optional: '',
        required: '',
      },
      fields: {
        motif0: {
          label: "Motif d'annulation",
          nullOption: { value: 'Pas de motif', text: "Selectionnez le motif" }
        },
      },
      stylesheet: formStyles,
    }

    // console.log(value.motif0)

    return (
      <View style={styles.container}>
        {isConnected ? <View style={styles.listContainer}>
          <View style={styles.title}>
          </View>
          <Form
            ref={this.form}
            type={User}
            value={value}
            onChange={() => this.onChangeValue(this.form.current.getValue())}
            options={options}
          />
          {value !== null && value.motif0 === 'Autres' ? <Form
            ref={this.formMotif}
            type={Motif}
            options={options}
          /> : null}
          <View style={styles.addTouchable}>
            <TouchableOpacity style={styles.addPrestation} onPress={this._launchAlert}>
              <Text style={styles.touchableText}>Annuler la prestation</Text>
            </TouchableOpacity>
          </View>
        </View> : this._notConnected()}
      </View>
    )
  }
}


//#a94442



const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  listContainer: {
    backgroundColor: '#F7F7F7',
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
  touchableText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold'
  },
  addPrestation: {
    backgroundColor: '#33A0D6',
    height: hp(6),
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: wp(2.5),
    elevation: 10
  },
  addTouchable: {
    alignItems: 'center',
    paddingTop: hp(1.5),
    marginTop: hp(0.5),
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

export default AnnulForm