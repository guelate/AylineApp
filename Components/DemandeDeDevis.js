import React, { Component } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ToastAndroid, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import t from 'tcomb-form-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Content, CheckBox, ListItem, Radio, Right, Left, Body } from 'native-base';
import { email, web } from 'react-native-communications';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Input } from 'react-native-elements';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import 'moment/locale/fr';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from "@react-native-community/netinfo";

class DemandeDeDevis extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      yes: true,
      no: false,
      condition: false,
      value: {},
      needs: {},
      service: {},
      formule: {},
      childs: {},
      zip: '',
      ville: '',
      day: '',
      month: true,
      show: false,
      date: new Date(),
      hour: '00:00',
      isConnected: true,
      isLoading: true
    }

    this.url = 'https://ayline-services.fr';
    this.form = React.createRef();
    this.needsForm = React.createRef();
    this.adressesForm = React.createRef();
    this.servicesForm = React.createRef();
    this.formulesForm = React.createRef();
    this.childForm = React.createRef();
    this.today = new Date();
    this.tomorrow = this.today.setDate(this.today.getDate() + 1);
    this.month0 = this.today.getMonth() + 1;
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

  goToPayment = () => {

    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour } = this.props.route.params

    const { condition } = this.state

    let value = this.form.current.getValue()

    if (value !== null) {

      if (value.email.toLowerCase().includes('@') && value.email.toLowerCase().includes('.')) {

        if (value['Mot de passe'].length >= 8) {

          if (value['Mot de passe'] === value['Entrer à nouveau le mot de passe']) {

            if (condition) {

              this.props.navigation.navigate('MOYEN DE PAIEMENT', {
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
                idFreq,
                idDuree,
                idHour,
                nom: value.nom,
                prenom: value.prénom,
                email: value.email,
                téléphone: value.téléphone,
                mdp: value['Mot de passe'],
                adresse: value.adresse,
                postal: value['Code postal'],
                ville: value.ville,
                prestAdresse: this.state.no === true ? this.adresseForm.current.getValue() : null,
                view: 'signUp'
              })

            }
            else {
              ToastAndroid.show("Vous devez accepter les conditions générales et la politique de confidentialité", ToastAndroid.LONG)
            }

          }
          else {
            ToastAndroid.show('La confirmation du mot de passe ne correspond pas', ToastAndroid.LONG)
          }

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
      ToastAndroid.show('Une ou plusieurs données manquantes, Veuillez rentrez correctement toutes les informations', ToastAndroid.LONG)
    }

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
              isLoading: false,
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
    });

  }

  onChange = (value) => {
    this.setState({ value })
  }

  onChangeChild = (childs) => {
    this.setState({ childs })
  }

  onChangeService = (service) => {
    this.setState({ service })
  }

  onChangeFormule = (formule) => {
    this.setState({ formule })
  }

  onChangeNeeds = (needs) => {
    this.setState({ needs })
  }

  _selectDay = (day) => {
    this.setState({ day })
  }

  _disableLeftArrow = (month) => {
    month === this.month0 ? this.setState({ month: true }) :
      this.setState({ month: false })
  }

  _showTimepicker = () => {
    this.setState({ show: true })
  };

  onChangeDate = (event, selectedDate) => {
    const currentDate = moment(selectedDate).format('LT') || this.state.date;
    this.setState({ date: currentDate, show: false, hour: currentDate })

    console.log(this.state.date)
  };

  _notConnected() {

    NetInfo.fetch().then(state => {
      this.isConnected = state.isConnected
    })

    return (
      <View style={[styles.message, { paddingHorizontal: wp(2) }]}>
        <MaterialCommunityIcons name="wifi-off" size={hp(15)} color="#33A0D6" />
        <Text style={[styles.messageText, { color: 'black', fontSize: hp(2.5), marginTop: hp(5) }]}>Il semble que vous n'êtes pas connecté à Internet Nous ne trouvons aucun réseau</Text>
        <TouchableOpacity style={styles.retry} onPress={() => this._getData()}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _displayLoading() {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size='large' color='#08CC' />
      </View>
    )
  }


  render() {

    const { value, userData, needs, zip, ville, day, month, show, hour, childs, formule, service, isConnected, isLoading } = this.state

    LocaleConfig.locales['fr'] = {
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
      dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      today: 'Aujourd\'hui'
    };
    LocaleConfig.defaultLocale = 'fr';

    //console.log(yes, no)
    const Form = t.form.Form;

    const User = t.struct({
      nom: t.String,
      prénom: t.String,
      email: t.String,
      téléphone: t.String,
    });

    const Childs = t.struct({
      number: t.String,
      age: t.String
    })

    const s = t.enums({
      s1: "Garde d'enfant",
      s2: 'Bricolage'
    });

    const f = t.enums({
      f1: 'Standard',
      f2: 'Périscolaire'
    })

    const Needs = t.struct({
      besoin: t.maybe(t.String)
    })

    const Services = t.struct({
      services: s
    })

    const Formules = t.struct({
      formules: f
    })

    var ERROR_COLOR = "#a94442";
    var BORDER_COLOR = "#cccccc";
    var DISABLED_BACKGROUND_COLOR = "#eeeeee";
    var FONT_SIZE = 17;

    const formStyles = {
      ...Form.stylesheet,
      controlLabel: {
        normal: {
          color: '#33A0D6',
          fontSize: 15,
          marginBottom: 7,
          //fontWeight: 'bold'
        },
        error: {
          color: "#a94442",
          fontSize: 17,
          marginBottom: 7,
          fontWeight: "600"
        }
      },
      textbox: {
        normal: {
          color: "#000000",
          fontFamily: 'Raleway-Bold',
          fontSize: hp(2),
          height: hp(6.5),
          paddingVertical: Platform.OS === "ios" ? 5 : 5,
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: "#33A0D6",
          borderWidth: 1,
          marginBottom: hp(0.5),
          backgroundColor: 'white'
        },
        error: {
          color: "#000000",
          fontSize: hp(2),
          height: hp(6.5),
          fontFamily: 'Raleway-Bold',
          paddingVertical: Platform.OS === "ios" ? 5 : 5,
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: "#a94442",
          borderWidth: 3,
          marginBottom: hp(0.5),
          backgroundColor: 'white'
        },
        notEditable: {
          color: "#777777",
          fontSize: hp(2),
          fontFamily: 'Raleway-Bold',
          height: hp(6.5),
          paddingVertical: Platform.OS === "ios" ? 5 : 5,
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: '#33A0D6',
          borderWidth: hp(0.1),
          marginBottom: hp(0.5),
          backgroundColor: '#cacdd1'
        }
      },
      pickerContainer: {
        normal: {
          height: hp(3),
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
            color: 'white',
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

    const options = {
      auto: 'placeholders',
      i18n: {
        optional: '',
        required: '',
      },
      fields: {
        nom: {
          placeholderTextColor: '#33A0D6',
          textContentType: 'familyName',
        },
        prénom: {
          placeholderTextColor: '#33A0D6',
          textContentType: 'givenName'
        },
        email: {
          placeholderTextColor: '#33A0D6',
          keyboardType: 'email-address',
        },
        téléphone: {
          placeholderTextColor: '#33A0D6',
          keyboardType: 'phone-pad',
          textContentType: 'telephoneNumber'
        },
        adresse: {
          placeholderTextColor: '#33A0D6',
          textContentType: 'fullStreetAddress'
        },
        besoin: {
          placeholder: "Décrivez nous vos besoins",
          multiline: true,
          stylesheet: formStyles0,
        },
        services: {
          nullOption: { value: '', text: "Selectionnez un service" }
        },
        formules: {
          nullOption: { value: '', text: "Selectionnez une formule" }
        },
        number: {
          placeholder: "Combien d'enfant(s) à garder ?",
          placeholderTextColor: '#33A0D6',
          textContentType: 'familyName',
          multiline: true,
        },
        age: {
          placeholder: "Quelle est la tranche d'âge ?",
          placeholderTextColor: '#33A0D6',
          textContentType: 'familyName',
        },
      },
      stylesheet: formStyles,
    }

    return (
      <View style={styles.container}>

        {isConnected ? isLoading ?
          this._displayLoading() : (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps='always'
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.listContainer}>

                <View style={styles.selectContainer0}>
                  <Form
                    ref={this.servicesForm}
                    type={Services}
                    value={service}
                    onChange={() => this.onChangeService(this.servicesForm.current.getValue())}
                    options={options}
                  />
                </View>

                <View style={styles.selectContainer0}>
                  <Form
                    ref={this.formulesForm}
                    type={Formules}
                    value={formule}
                    onChange={() => this.onChangeFormule(this.formulesForm.current.getValue())}
                    options={options}
                  />
                </View>

                <View style={styles.description}>

                  <Text style={styles.descriptionText}>Du lundi au samedi en journée de 6h à 18h.. Préparation du petit déjeuner, déjeuner, goûter et repas du soir. Suivi des devoirs jusqu'au CM2. Activités ludiques et d'éveil. Toilette du matin, douche ou bain du soir. à partir de 2h.</Text>

                  {/* <Text style={styles.descriptionText}>Matin entre 6h et 8h30 . Soir entre 16h20 et 21h. accompagnement ecole, activités extrascolaires . activité ludique et d'eveil jusqu'au CM2. toillette du matin, douche ou bain du soir . à partir de 2h.</Text>

              <Text style={styles.descriptionText}>Lundi au vendredi entre 11h30 et 13h30. Accompagnement a l'école . Préparation du déjeuner. à partir de 2h .</Text>

              <Text style={styles.descriptionText}>Lundi au samedi de 19h à 6h du matin. Douche ou bain du soir. Activités ludiques et d'éveil. Préparation du repas. à partir de 2h.</Text>

              <Text style={styles.descriptionText}>Les dimanches de 6h à 18h. Préparation du petit déjeuner, déjeuner, goûter et repas du soir. Suivi des devoirs jusqu'au CM2. Activités ludiques et d'éveil. Toilette du matin, douche ou bain du soir. à partir de 2h.</Text> */}

                </View>
                <Form
                  ref={this.form}
                  type={User}
                  value={value}
                  onChange={this.onChange}
                  options={options}
                />
                <GooglePlacesAutocomplete
                  placeholder='Adresse'
                  placeholderTextColor={'#33A0D6'}
                  minLength={2} // minimum length of text to search
                  autoFocus={false}
                  returnKeyType={'search'}
                  listViewDisplayed="auto"
                  fetchDetails={true}
                  renderDescription={row => row.description || row.formatted_address || row.name}
                  onPress={(data, details = null) => {
                    console.log(data)
                    console.log(details)
                    console.log(this.needsForm.current.getValue())

                    const zip = details.address_components
                    const ville = details.address_components

                    if (zip[6] !== undefined) {

                      this.setState({ zip: zip[6].long_name })
                      this.setState({ ville: ville[2].long_name })

                      this.onChangeNeeds({
                        'Code postal': zip[6].long_name,
                        ville: ville[2].long_name
                      })

                      console.log(this.needsForm.current.getValue())

                    }
                    else if (zip[5] !== undefined) {

                      this.setState({ zip: zip[5].long_name })
                      this.setState({ ville: ville[1].long_name })

                      this.onChangeNeeds({
                        'Code postal': zip[5].long_name,
                        ville: ville[1].long_name
                      })

                      console.log(this.needsForm.current.getValue())

                    }
                    else {
                      this.setState({ zip: zip[4].long_name })
                      this.setState({ ville: ville[0].long_name })

                      this.onChangeNeeds({
                        'Code postal': zip[4].long_name,
                        ville: ville[0].long_name
                      })

                      console.log(this.needsForm.current.getValue())
                    }

                  }}
                  textInputProps={{
                    InputComp: Input,
                    errorStyle: { color: 'red' },
                    placeholderTextColor: '#33A0D6',
                    containerStyle: {
                      paddingHorizontal: 0,
                      justifyContent: 'center',
                      height: hp(6.5),
                      paddingTop: hp(5.5),
                      marginBottom: hp(2),
                    },
                    inputContainerStyle: {
                      borderBottomWidth: 0,
                      borderColor: 'black',
                    },
                    inputStyle: {
                      fontSize: hp(2),
                    }
                  }}
                  getDefaultValue={() => {
                    return ''; // text input default value
                  }}
                  query={{

                    key: 'AIzaSyAFzpW2cBYP9_8QNgNiqx5M5n3aJr6X1FQ',
                    language: 'Fr', // language of the results
                    components: 'country:fr',
                    types: 'address', // default: 'geocode'
                  }}
                  styles={{
                    description: {
                      fontFamily: 'Raleway-Bold',
                    },
                    /* predefinedPlacesDescription: {
                      color: '#000000',
                    }, */
                    textInput: {
                      borderWidth: 1,
                      borderColor: '#33A0D6',
                      borderRadius: hp(2.5),
                      marginBottom: hp(2),
                      fontSize: hp(2),
                      fontFamily: 'Raleway-Bold',
                      height: hp(6.5),
                    }
                  }}
                  enablePoweredByContainer={true}

                  nearbyPlacesAPI="GoogleReverseGeocoding"

                  GooglePlacesSearchQuery={{

                    rankby: 'distance',
                    types: 'food',
                  }}
                  /* filterReverseGeocodingByTypes={[
                      'locality',
                      'administrative_area_level_3',
                  ]} */

                  debounce={200}
                />
                <View style={styles.hourContainer}>

                  <Text style={[styles.touchableText, { color: '#33A0D6', fontSize: hp(2.5) }]}>Heure de début: </Text>
                  <TouchableOpacity style={styles.selectContainer} onPress={this._showTimepicker}>
                    <Text style={[styles.touchableText, { fontSize: hp(2.5) }]}>{hour}  <FontAwesome5 name={"clock"} solid size={hp(2.3)} color="white" /></Text>
                  </TouchableOpacity>

                </View>
                {show && (<DateTimePicker
                  display="default"
                  value={new Date()}
                  mode="time"
                  textColor="#33A0D6"
                  onChange={this.onChangeDate}
                />)}

                <Calendar minDate={this.tomorrow}
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

                <Form
                  ref={this.childForm}
                  type={Childs}
                  value={childs}
                  onChange={this.onChangeChild}
                  options={options}
                />

                <Form
                  ref={this.needsForm}
                  type={Needs}
                  value={needs}
                  onChange={this.onChangeNeeds}
                  options={options}
                />
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.edit} onPress={this._showTimepicker}>
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
//https://ayline-services.fr/politique_de_confidentialite

const styles = StyleSheet.create({
  scrollContainer: {
    //flex: 1
    //height: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: wp(2),
  },
  entete: {
    backgroundColor: '#33A0D6',
    borderWidth: 2,
    borderColor: '#33A0D6',
    borderRadius: hp(1.5),
    paddingVertical: hp(2),
    marginVertical: hp(2),
    marginHorizontal: wp(1),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(2),
    elevation: 10
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: hp(2.5),
    //fontFamily: 'Raleway-Bold'
  },
  listContainer: {
    backgroundColor: 'white',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    marginTop: hp(1.5),
    marginBottom: hp(2),
  },
  formText: {
    textAlign: 'center',
    color: 'black',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold',
  },
  edit: {
    backgroundColor: '#33A0D6',
    height: hp(6),
    width: wp(45),
    borderRadius: hp(2.5),
    elevation: 5,
    justifyContent: 'center'
  },
  footer: {
    flexDirection: 'row',
    paddingTop: hp(2),
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
  selectContainer: {
    backgroundColor: '#33A0D6',
    flexDirection: 'row',
    borderRadius: 8,
    width: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(1),
    paddingHorizontal: wp(2.5),
    elevation: 5,
    marginTop: hp(0.5),
    alignSelf: 'center'
  },

  selectContainer0: {
    backgroundColor: '#33A0D6',
    borderRadius: 8,
    width: wp(90),
    justifyContent: 'center',
    paddingHorizontal: wp(2.5),
    elevation: 5,
    alignSelf: 'center',
    marginBottom: hp(2)
  },
  hourContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  description: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#33A0D6',
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
    borderRadius: 8,
    marginBottom: hp(2)
  },
  descriptionText: {
    textAlign: 'center',
    color: 'black',
    fontFamily: 'Raleway-Regular',
    fontSize: hp(1.2)
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

export default DemandeDeDevis