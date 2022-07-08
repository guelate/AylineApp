import React, { Component } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ToastAndroid, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import t from 'tcomb-form-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Content, CheckBox, ListItem, Radio, Right, Left, Body } from 'native-base';
import { email, web } from 'react-native-communications';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Input } from 'react-native-elements';

class VueInfoClient extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      yes: true,
      no: false,
      condition: false,
      userData: this.props.route.params.userData,
      value: { "email": this.props.route.params.userData.email, "nom": this.props.route.params.userData.nom, "prénom": this.props.route.params.userData.prenom, "téléphone": this.props.route.params.userData.contact },
      adresse: {},
      adresseName: this.props.route.params.userData.adresse,
      zip: this.props.route.params.userData.postal_code,
      ville: this.props.route.params.userData.ville,
      password: {}
    }

    this.url = 'https://ayline-services.fr';
    this.form = React.createRef();
    this.adresseForm = React.createRef();
    this.adressesForm = React.createRef();
    this.passwordForm = React.createRef();

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


  editData = () => {

    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour } = this.props.route.params

    const { adresseName, ville, zip } = this.state

    let value = this.form.current.getValue()

    let password = this.passwordForm.current.getValue()

    //console.log(value.nom)

    if (value === null) {

      ToastAndroid.show('Une ou plusieurs données manquantes, Veuillez rentrez correctement toutes les informations', ToastAndroid.LONG)

    }
    else {

      AsyncStorage.getItem('password').then(pass => {

        console.log('password:', password['Nouveau Mot de passe'])

        // if (value.email.toLowerCase().includes('@') && value.email.toLowerCase().includes('.')) {

        if (password['Ancien mot de passe'] === pass) {

          if (password['Nouveau Mot de passe'].length >= 8) {

            if (password['Nouveau Mot de passe'] === password['Confirmer le mot de passe']) {

              AsyncStorage.getItem('token').then(token => {

                fetch(this.url + '/api/client/update_user_info', {
                  method: 'POST',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token
                  },
                  body: JSON.stringify({

                    nom: value.nom,
                    prenom: value.prénom,
                    contact: value.téléphone,
                    adresse: adresseName,
                    ville: ville,
                    postal_code: zip,

                  })
                })
                  .then(response => response.json())
                  .then(data => {

                    console.log(data)

                  })
                  .catch((error) => {

                    console.error('Error:', error);

                  });

                fetch(this.url + '/api/client/update_user_password', {
                  method: 'POST',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + token
                  },
                  body: JSON.stringify({

                    nouveau_pwd: password['Nouveau Mot de passe'],

                  })
                })
                  .then(response => response.json())
                  .then(data => {

                    console.log(data)
                    this.setState({ userData: data })
                    AsyncStorage.setItem('password', password['Nouveau Mot de passe'])
                    this.props.navigation.navigate('Ayline', {
                      screen: 'Menu',
                      params: {
                        isLogged: true,
                        value: this.form.current.getValue(),
                        isConnected: true
                      },
                    })

                  })
                  .catch((error) => {

                    console.error('Error:', error);

                  });

              })

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
          ToastAndroid.show('Mot de passe incorrect', ToastAndroid.LONG)
        }
        /* }
        else {
  
          ToastAndroid.show('Adresse email invalide', ToastAndroid.LONG)
        } */
      })
    }

  }

  onChange = (value) => {
    this.setState({ value })
  }

  onChangeAdresse = (adresse) => {
    this.setState({ adresse })
  }

  onChangePassword = (password) => {
    this.setState({ password })
  }

  render() {

    const { value, userData, adresse, zip, ville, password } = this.state
    //console.log('mdp:', password)
    const Form = t.form.Form;

    const User = t.struct({
      nom: t.String,
      prénom: t.String,
      // email: t.String,
      téléphone: t.String,
    });

    const Password = t.struct({
      'Ancien mot de passe': t.String,
      'Nouveau Mot de passe': t.String,
      'Confirmer le mot de passe': t.String,
    })

    const Adresse = t.struct({
      'Code postal': t.String,
      ville: t.String,
    })

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
          borderColor: "#08CC",
          borderWidth: 5,
          borderRadius: 4,
          color: 'black'
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
        nom: {
          placeholder: userData.nom,
          placeholderTextColor: 'black',
          textContentType: 'familyName',
        },
        prénom: {
          placeholder: userData.prenom,
          placeholderTextColor: 'black',
          textContentType: 'givenName'
        },
        email: {
          placeholder: userData.email,
          placeholderTextColor: 'black',
          keyboardType: 'email-address',
        },
        téléphone: {
          placeholder: userData.contact,
          placeholderTextColor: 'black',
          keyboardType: 'phone-pad',
          textContentType: 'telephoneNumber'
        },
        'Ancien mot de passe': {
          secureTextEntry: true,
          textContentType: 'password',
          placeholderTextColor: 'black',
        },
        'Nouveau Mot de passe': {
          secureTextEntry: true,
          textContentType: 'password',
          placeholderTextColor: 'black',
        },
        'Confirmer le mot de passe': {
          secureTextEntry: true,
          textContentType: 'password',
          placeholderTextColor: 'black'
        },
        adresse: {
          placeholder: userData.adresse,
          placeholderTextColor: 'black',
          textContentType: 'fullStreetAddress'
        },
        'Code postal': {
          placeholder: zip,
          placeholderTextColor: '#777777',
          textContentType: 'postalCode',
          editable: false
        },
        ville: {
          placeholder: ville,
          placeholderTextColor: '#777777',
          textContentType: 'addressCity',
          editable: false
        },
      },
      stylesheet: formStyles,
    }

    return (
      <View style={styles.container}>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='always'
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.entete}>
            <Text style={[styles.text, {
              marginBottom: hp(1), fontSize: hp(3),
              fontFamily: 'Raleway-Bold'
            }]}> {userData.nom} {userData.prenom} </Text>
            <Text style={[styles.text, { fontFamily: 'Raleway-Regular' }]}> {userData.email} </Text>
          </View>
          <View style={styles.listContainer}>
            <Form
              ref={this.form}
              type={User}
              value={value}
              onChange={this.onChange}
              options={options}
            />
            <Form
              ref={this.passwordForm}
              type={Password}
              value={password}
              onChange={this.onChangePassword}
              options={options}
            />
            <GooglePlacesAutocomplete
              placeholder={userData.adresse}
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
                console.log(data.description)

                const zip = details.address_components
                const ville = details.address_components
                const address = data.description

                this.setState({ adresseName: address })

                if (zip[6] !== undefined) {

                  this.setState({ zip: zip[6].long_name })
                  this.setState({ ville: ville[2].long_name })

                  this.onChangeAdresse({
                    'Code postal': zip[6].long_name,
                    ville: ville[2].long_name
                  })

                  console.log(this.adresseForm.current.getValue())

                }
                else if (zip[5] !== undefined) {

                  this.setState({ zip: zip[5].long_name })
                  this.setState({ ville: ville[1].long_name })

                  this.onChangeAdresse({
                    'Code postal': zip[5].long_name,
                    ville: ville[1].long_name
                  })

                  console.log(this.adresseForm.current.getValue())

                }
                else {
                  this.setState({ zip: zip[4].long_name })
                  this.setState({ ville: ville[0].long_name })

                  this.onChangeAdresse({
                    'Code postal': zip[4].long_name,
                    ville: ville[0].long_name
                  })

                  console.log(this.adresseForm.current.getValue())
                }

              }}
              textInputProps={{
                InputComp: Input,
                errorStyle: { color: 'red' },
                placeholderTextColor: 'black',
                containerStyle: {
                  paddingHorizontal: 0,
                  justifyContent: 'center',
                  height: hp(6.5),
                  paddingTop: hp(5.5),
                  // marginTop: hp(1.5),
                  marginBottom: hp(2),
                  // borderWidth: 1,
                  // borderColor: '#33A0D6',
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

                key: 'AIzaSyBIUGRaiiLAezSaPnBaf595BO87EjXcj8A',
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
            <Form
              ref={this.adresseForm}
              type={Adresse}
              value={adresse}
              onChange={this.onChangeAdresse}
              options={options}
            />
            <View style={styles.footer}>
              <TouchableOpacity style={styles.edit} onPress={this.editData}>
                <Text style={styles.touchableText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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

})

export default VueInfoClient