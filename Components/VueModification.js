import React, { Component } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ToastAndroid, ScrollView, ActivityIndicator, Alert, BackHandler } from 'react-native';
import t from 'tcomb-form-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import 'moment/locale/fr';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from "@react-native-community/netinfo";

class VueModification extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      orderData: undefined,
      isLoading: true,
      dataList: undefined,
      value: {},
      id: this.props.route.params.id,
      date: this.props.route.params.date,
      hour: this.props.route.params.hour,
      frequency: this.props.route.params.frequency,
      duree: this.props.route.params.duree,
      month: false,
      day: this.props.route.params.date,
      isConnected: true,
      heure: {},
      duration: {},
      frequence: {},
      motif: {}
    }

    this.url = 'https://ayline-services.fr'
    this.form = React.createRef()
    this.formMotif = React.createRef()
    this.today = new Date();
    this.month0 = this.today.getMonth() + 1
    this.tomorrow = this.today.setDate(this.today.getDate() + 1)
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

              let heure = {}
              let duration = {}
              let frequence = {}
              let motif = {}

              for (let i = 0; i < data.liste_disponibilite.length; i++) {

                heure['' + data.liste_disponibilite[i].id] = moment('2021-01-20' + ' ' + '' + data.liste_disponibilite[i].horaire).format('LT')

              }

              for (let i = 0; i < data.liste_creneau.length; i++) {

                duration['' + data.liste_creneau[i].id] = '' + data.liste_creneau[i].nbre_heure
              }

              for (let i = 0; i < data.liste_frequence.length; i++) {

                frequence['' + data.liste_frequence[i].id] = '' + data.liste_frequence[i].libelle
              }

              for (let i = 0; i < data.liste_motif.length; i++) {

                motif['' + data.liste_motif[i].id] = '' + data.liste_motif[i].lib_motif
              }

              this.setState({
                heure,
                duration,
                frequence,
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

  _handleSubmit = () => {

    //const {hour, duree, date, frequency, id, day} = this.state

    let value = this.form.current.getValue()

    let motif;
    let autreMotif;
    let hour = value === null ? this.state.hour : value.heure
    let freq = value === null ? this.state.frequency : value.frequence
    let duree = value === null ? this.state.duree : value.duree
    let date = this.state.day
    let id = this.state.id

    console.log(value)

    if ((value === null || value.heure === null || value.frequence === null || value.duree === null) && this.state.day === this.props.route.params.date) {

      ToastAndroid.show("Attention vous n'avez pas effectué de modification", ToastAndroid.LONG);

    }
    else {

      if (value === null) {

        ToastAndroid.show("Erreur vous n'avez pas selectionné de motif", ToastAndroid.LONG);

      }
      else if (value.motif0 === '13') {
        if (this.formMotif.current.getValue() === null) {
          ToastAndroid.show("Erreur vous n'avez pas rentrez de motif", ToastAndroid.LONG);
        }
        else {

          if (value.motif0 !== null && value.motif0 !== '13') {
            motif = value.motif0
            autreMotif = null
          }
          else if (value.motif0 !== null && value.motif0 === '13' && this.formMotif.current.getValue().Autre_motif !== null) {
            motif = value.motif0
            autreMotif = this.formMotif.current.getValue().Autre_motif
          }
          //console.log(this.formMotif.current.getValue())
          //console.log(this.props.route.params)

          AsyncStorage.getItem('token').then(value => {
            if (value !== null) {

              fetch(this.url + '/api/client/SendDemandeModif', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  "Authorization": "Bearer " + value
                },
                body: JSON.stringify({
                  id: id,
                  disponibilite_id: hour,
                  frequence_id: freq,
                  creneau_horaire_id: duree,
                  motif: motif,
                  autre_motif: autreMotif,
                  date: date
                }),
              })
                .then(response => response.json())
                .then(data => {
                  console.log(data)
                  this._notification(value)

                  Alert.alert(
                    null,
                    "La demande de modification a bien été envoyée !",
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

        if (value.motif0 !== null && value.motif0 !== '13') {
          motif = value.motif0
          autreMotif = null
        }
        else if (value.motif0 !== null && value.motif0 === '13' && this.formMotif.current.getValue().Autre_motif !== null) {
          motif = value.motif0
          autreMotif = this.formMotif.current.getValue().Autre_motif
        }
        //console.log(this.formMotif.current.getValue())
        //console.log(this.props.route.params)

        AsyncStorage.getItem('token').then(value => {
          if (value !== null) {

            fetch(this.url + '/api/client/SendDemandeModif', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + value
              },
              body: JSON.stringify({
                id: id,
                disponibilite_id: hour,
                frequence_id: freq,
                creneau_horaire_id: duree,
                motif: motif,
                autre_motif: autreMotif,
                date: date
              }),
            })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                this._notification(value)

                Alert.alert(
                  null,
                  "La demande de modification a bien été envoyée !",
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
  }

  _notification = (value) => {

    fetch(this.url + '/api/admin/Notification_admin_edit_res', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + value
      },
      body: JSON.stringify({
        demande_id: this.state.id
      })
    })
      .then(response => response.json())
      .then(data => {
        let intitule = "Vous avez une nouvelle demande de modification"
        let user_id = '1'
        let lien_notif = ''
        let type_notif = 1
        let statut_notif = 'info'

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
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
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

  _displayLoading() {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size={hp(8)} color='#08CC' />
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

  _disableLeftArrow = (month) => {
    month === this.month0 ? this.setState({ month: true }) :
      this.setState({ month: false })
  }
  _selectDay = (day) => {

    this.setState({ day })

    if (moment(day).format('dddd') === 'dimanche') {
      ToastAndroid.show('La prestation est majorée de 5 € le Dimanche', ToastAndroid.LONG);
    }
  }

  onChangeValue = (value) => {
    this.setState({ value });
  }

  render() {
    LocaleConfig.locales['fr'] = {
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
      dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      today: 'Aujourd\'hui'
    };
    LocaleConfig.defaultLocale = 'fr';

    const { orderData, dataList, isLoading, id, date, value, month, day, isConnected, heure, duration, frequence, motif } = this.state

    const { hour, frequency, duree } = this.props.route.params

    const Form = t.form.Form;

    const h = t.enums(heure);

    const f = t.enums(frequence)

    const d = t.enums(duration)

    const mo = t.enums(motif)

    const User = t.struct({
      heure: t.maybe(h),
      frequence: t.maybe(f),
      duree: t.maybe(d),
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
          paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
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
          paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
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
      pickerContainer: {
        normal: {
          borderColor: "#08CC",
          borderWidth: 5,
          borderRadius: 4,
        },
        error: {
          marginBottom: 4,
          borderRadius: 4,
          borderColor: '#a94442',
          borderWidth: 1
        },
        open: {
          fontSize: hp(1),
          width: wp(100),
        }
      },
      select: {
        normal: Platform.select({
          android: {
            paddingLeft: 7,
            color: 'black',
            flexWrap: 'wrap',
          },
          ios: {}
        }),
        // the style applied when a validation error occours
        error: Platform.select({
          android: {
            paddingLeft: 7,
            color: '#a94442'
          },
          ios: {}
        })
      },
      pickerTouchable: {
        normal: {
          height: hp(7.4),
          width: wp(50),
          flexDirection: "row",
          alignItems: "center"
        },
        error: {
          height: hp(7.4),
          width: wp(50),
          flexDirection: "row",
          alignItems: "center"
        },
        active: {
          borderBottomWidth: 1,
        },
        notEditable: {
          height: hp(7.4),
          width: wp(50),
          flexDirection: "row",
          alignItems: "center",
        }
      },
      pickerValue: {
        normal: {
          fontSize: hp(1),
          flexWrap: 'wrap',
          paddingLeft: 7,
        },
        error: {
          paddingLeft: 7
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
        heure: {
          label: 'Heure de service',
          nullOption: { value: '', text: moment(this.state.date + ' ' + hour).format('LT') },
        },
        frequence: {
          label: 'Fréquence',
          nullOption: { value: '', text: frequency }
        },
        duree: {
          label: 'Durée',
          nullOption: { value: '', text: duree }
        },
        motif0: {
          label: 'Motif',
          nullOption: { value: '', text: "Selectionnez le motif" }
        },
        Autre_motif: {
          onSubmitEditing: this._handleSubmit,
        }
      },
      stylesheet: formStyles,
    }
    //console.log(this.month0)
    return (
      <View style={styles.container}>
        {isConnected ? isLoading ?
          this._displayLoading() : (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps='always'>

              <View style={styles.listContainer}>
                <View style={styles.title}>
                  <Text style={styles.titleText}>CODE DE RESERVATION: {this.format_code(id, date)}</Text>
                </View>
                <Form
                  ref={this.form}
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
                <Text style={styles.titleText}>Date</Text>
                <Calendar
                  current={date}
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
                    textDayHeaderFontFamily: 'Raleway-Bold',
                  }}
                />
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.cancel} onPress={this._navigate}>
                    <Text style={styles.touchableText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.edit} onPress={this._handleSubmit}>
                    <Text style={styles.touchableText}>Envoyer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.5),
    margin: hp(1.5),
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

export default VueModification