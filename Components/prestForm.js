import React from 'react'
import { StyleSheet, Text, View, Pressable, TouchableOpacity, ToastAndroid, ScrollView, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import t from 'tcomb-form-native';
import moment from 'moment';
import 'moment/locale/fr';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class prestForm extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      token: '',
      dataList: undefined,
      hour: {},
      duree: {},
      instruction: {},
      month: true,
      day: '',
      orderData: undefined,
      isConnected: true,
      heure: {},
      duration: {}
    };
    this.url = 'https://ayline-services.fr'
    this.formHour = React.createRef()
    this.formDuree = React.createRef()
    this.formInstruction = React.createRef()
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
        if (value !== null) {

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

                let heure = {}
                let duration = {}

                for (let i = 0; i < data.liste_disponibilite.length; i++) {

                  heure['' + data.liste_disponibilite[i].id] = moment('2021-01-20' + ' ' + '' + data.liste_disponibilite[i].horaire).format('LT')

                }

                for (let i = 0; i < data.liste_creneau.length; i++) {

                  duration['' + data.liste_creneau[i].id] = '' + data.liste_creneau[i].nbre_heure
                }

                this.setState({
                  heure,
                  duration,
                  dataList: data,
                  isConnected: state.isConnected
                })
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          }
          else {
            this.setState({ isConnected: false })
          }
        }
      })
    })
  }

  _handleSubmit = () => {

    const { orderData } = this.state

    if (orderData !== undefined && orderData.length === 0) {
      ToastAndroid.show("Vous n'avez pas de réservation en cours, vous ne pouvez pas ajouter de prestation", ToastAndroid.LONG);
    }
    else {

      let hour;
      let duree;
      let Instruction = this.formInstruction.current.getValue().Instruction
      let date;
      let majoration = 0

      if (this.formHour.current.getValue() === null || this.formDuree.current.getValue() === null || this.state.day === '') {
        ToastAndroid.show('Une ou plusieurs donnees manquantes, Veuillez rentrez correctement toutes les donnees', ToastAndroid.LONG);
      }
      else {
        hour = this.formHour.current.getValue().prestHour
        duree = this.formDuree.current.getValue().prestDuree
        date = this.state.day

        if (moment(date).format('dddd') === 'dimanche') {
          majoration = 5
        }

        AsyncStorage.getItem('token').then(value => {
          if (value !== null) {

            fetch(this.url + '/api/client/add_new_reservation_cli', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + value
              },
              body: JSON.stringify({

                creneau_id: duree,
                disponibilite_id: hour,
                date_res: date,
                majoration: majoration,
                Instruction: Instruction
              })
            })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                let intitule = "Le client " + data.user_info + " a ajouté une nouvelle prestation le " + moment(data.date).format('LL') + "!"
                let user_id = '1'
                let lien_notif = ''
                let type_notif = 2
                let statut_notif = 'info'

                this._addNotification(user_id, intitule, lien_notif, type_notif, statut_notif)

                this.props.navigation.goBack()

                Alert.alert(
                  null,
                  "La prestation a bien été ajoutée !",
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

  onChangeHour = (hour) => {
    this.setState({ hour });
  }

  onChangeDuree = (duree) => {
    this.setState({ duree });
  }

  onChangeInstruction = (instruction) => {
    this.setState({ instruction });
  }


  render() {
    const { duree, frequency, periode, hour, month, day, isConnected, heure, duration } = this.state

    LocaleConfig.locales['fr'] = {
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
      dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      today: 'Aujourd\'hui'
    };
    LocaleConfig.defaultLocale = 'fr';

    const Form = t.form.Form;

    const { dataList } = this.state

    const h = t.enums(heure);

    const d = t.enums(duration)

    const CustomHour = t.struct({
      prestHour: t.maybe(h)
    });

    const CustomDuree = t.struct({
      prestDuree: t.maybe(d)
    });

    const CustomInstruction = t.struct({
      Instruction: t.maybe(t.String)
    });



    var LABEL_COLOR = "#000000";
    var INPUT_COLOR = "#000000";
    var ERROR_COLOR = "#a94442";
    var HELP_COLOR = "#999999";
    var BORDER_COLOR = "#cccccc";
    var DISABLED_COLOR = "#777777";
    var DISABLED_BACKGROUND_COLOR = "#eeeeee";
    var FONT_SIZE = 17;
    var FONT_WEIGHT = "500";

    const formStyles = {
      ...Form.stylesheet,
      ccontrolLabel: {
        normal: {
          color: '#08CC',
          fontSize: hp(2.5),
          marginBottom: hp(1),
          fontWeight: 'bold'
        },
        error: {
          color: "#a94442",
          fontSize: hp(2.5),
          marginBottom: hp(1),
          fontWeight: "600"
        }
      },
      textbox: {
        normal: {
          color: "#000000",
          fontSize: hp(2.5),
          textAlign: 'center',
          textAlignVertical: 'top',
          height: hp(15),
          width: wp(80),
          paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: "#08CC",
          borderWidth: hp(0.4),
          marginTop: hp(1.5),
          backgroundColor: 'white',
          alignSelf: 'center',
          fontFamily: 'Raleway-Regular'
        },
        error: {
          color: "#000000",
          fontSize: hp(2.5),
          textAlignVertical: 'top',
          height: hp(15),
          width: wp(80),
          paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: "#a94442",
          borderWidth: hp(0.4),
          marginTop: hp(1.5),
          backgroundColor: 'white',
          alignSelf: 'center',
          fontFamily: 'Raleway-Regular'
        }
      },
      pickerContainer: {
        normal: {
          height: 20,
          marginTop: 5,
        },
        error: {
          height: 20,
          marginTop: 5,
        },
        open: {
          // Alter styles when select container is open
        }
      },
      select: {
        normal: Platform.select({
          android: {
            paddingLeft: 7,
            color: 'black',
          },
          ios: {}
        }),
        // the style applied when a validation error occours
        error: Platform.select({
          android: {
            paddingLeft: 7,
            color: ERROR_COLOR
          },
          ios: {}
        })
      },
      pickerTouchable: {
        normal: {
          height: 20,
          flexDirection: "row",
          alignItems: "center",
        },
        error: {
          height: 20,
          flexDirection: "row",
          alignItems: "center"
        },
        active: {
          borderBottomWidth: 1,
          borderColor: BORDER_COLOR
        },
        notEditable: {
          height: 20,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: DISABLED_BACKGROUND_COLOR
        }
      },
      pickerValue: {
        normal: {
          fontSize: FONT_SIZE,
          paddingLeft: 7,
          fontWeight: 'bold'
        },
        error: {
          fontSize: FONT_SIZE,
          paddingLeft: 7
        }
      },
    }

    const options = {
      auto: 'placeholders',
      fields: {
        prestHour: {
          //label: 'Heure de service',
          nullOption: { value: '', text: "Selectionnez une heure" },
        },
        prestDuree: {
          //label: 'Heure de service',
          nullOption: { value: '', text: "Selectionnez une duree" },
        },
        Instruction: {
          //label: 'Instruction',
          placeholder: 'Veuillez rentrez vos instructions ici',
          multiline: true,

        }
      },
      stylesheet: formStyles,
    }
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {isConnected ? <View style={styles.modalView}>

          <View style={styles.title}>
            <Text style={styles.titleText}>Ajouter une prestation au cycle</Text>
          </View>

          <View style={styles.selectContainer}>
            <Form
              ref={this.formHour}
              type={CustomHour}
              value={this.state.hour}
              onChange={() => this.onChangeHour(this.formHour.current.getValue())}
              options={options}
            />
          </View>

          <View style={styles.selectContainer}>
            <Form
              ref={this.formDuree}
              type={CustomDuree}
              value={this.state.duree}
              onChange={() => this.onChangeDuree(this.formDuree.current.getValue())}
              options={options}
            />
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
              textDayHeaderFontFamily: 'Raleway-Bold',
            }}
          />

          <Form
            ref={this.formInstruction}
            type={CustomInstruction}
            value={this.state.instruction}
            onChange={() => this.onChangeInstruction(this.formInstruction.current.getValue())}
            options={options}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.addPrestation} onPress={this._handleSubmit}>
              <Text style={styles.touchableText}>Ajouter la prestation</Text>
            </TouchableOpacity>
          </View>
        </View> : this._notConnected()}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({

  container: {
    //flex: 1
    backgroundColor: "white",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: hp(3),
    borderWidth: hp(0.5),
    borderColor: '#33A0D6',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2.5),
    marginVertical: hp(2.5),
    marginHorizontal: wp(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  title: {
    alignItems: 'center',
    marginVertical: hp(2),
    marginHorizontal: wp(4),
  },
  titleText: {
    fontSize: hp(2),
    color: '#08CC',
    fontFamily: 'Raleway-Bold'
  },

  footer: {
    alignItems: 'center',
    paddingBottom: hp(1.5),
    justifyContent: 'center',
    marginTop: hp(2),
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
  selectContainer: {
    backgroundColor: 'white',
    borderWidth: hp(0.3),
    borderColor: '#33A0D6',
    borderRadius: 8,
    width: wp(80),
    justifyContent: 'center',
    paddingHorizontal: wp(2.5),
    elevation: 5,
    marginTop: hp(1.5),
    alignSelf: 'center'
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

export default prestForm