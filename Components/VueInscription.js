import React, { Component } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ToastAndroid, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import t from 'tcomb-form-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Content, CheckBox, ListItem, Radio, Right, Left, Body } from 'native-base';
import { email, web } from 'react-native-communications';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Input } from 'react-native-elements';

class VueInscription extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      yes: true,
      no: false,
      condition: false,
      value: {},
      adresse: {},
      adresses: {},
      adresseName: '',
      zip: 'Code postal',
      ville: 'ville',
      prestZip: 'Code postal',
      prestVille: 'ville'
    }

    this.url = 'https://ayline-services.fr';
    this.form = React.createRef();
    this.adresseForm = React.createRef();
    this.adressesForm = React.createRef();
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

  _selectedRadio = (value) => {
    value === 'yes' ? this.setState({
      yes: true,
      no: false
    }) :
      value === 'no' ? this.setState({
        no: true,
        yes: false
      }) : null
  }

  _onCheck = () => {
    !this.state.condition ? this.setState({ condition: true }) :
      this.setState({ condition: false })
  }
  goToPayment = () => {

    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour, zipCode } = this.props.route.params

    const { condition, adresseName, ville } = this.state

    let value = this.form.current.getValue()
    let zip = this.adressesForm.current.getValue() !== null ? this.adressesForm.current.getValue()['Code postal'] : null

    if (value !== null) {

      if (value.email.toLowerCase().includes('@') && value.email.toLowerCase().includes('.')) {

        if (value['Mot de passe'].length >= 8) {

          if (zip === zipCode) {

            // if (value['Mot de passe'] === value['Entrer à nouveau le mot de passe']) {

            if (condition) {

              this.props.navigation.navigate('MOYEN DE PAIEMENT', {
                menage: menage, iron: iron, pet: pet, frequency: frequency, hour: hour, duree: duree, day: day, instruction: instruction, autreDispo: autreDispo, majoration: majoration,
                idFreq,
                idDuree,
                idHour,
                nom: value.nom,
                prenom: value.prénom,
                email: value.email,
                téléphone: value.téléphone,
                mdp: value['Mot de passe'],
                adresse: value.adresse,
                postal: this.state.zip,
                ville: ville, 
                prestAdresse: this.state.no === true ? adresseName : null,
                view: 'signUp'
              })

              console.log(this.state.zip, ville) 

            }
            else {
              ToastAndroid.show("Vous devez accepter les conditions générales et la politique de confidentialité", ToastAndroid.LONG)
            }

          }
          else {
            ToastAndroid.show("Le code postal doit être identique au code postal fourni lors de la réservation", ToastAndroid.LONG)
          }

          /* }
          else {
            ToastAndroid.show('La confirmation du mot de passe ne correspond pas', ToastAndroid.LONG)
          } */

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

  _handleSubmit() {
    AsyncStorage.getItem('token').then(value => {
      if (value !== null) {

        fetch(this.url + '/client/add_new_prestation_cli', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + value
          },
          body: JSON.stringify({

            email: this.value.email,
            password: this.value.password

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

  onChange = (value) => {
    this.setState({ value })
  }

  onChangeAdresse = (adresse) => {
    this.setState({ adresse })
  }

  onChangeAdresses = (adresses) => {
    this.setState({ adresses })
  }


  render() {

    const { yes, no, condition, value, adresse, adresses, zip, ville, prestZip, prestVille } = this.state
    const { zipCode } = this.props.route.params
    //console.log(yes, no)
    const Form = t.form.Form;

    const User = t.struct({
      nom: t.String,
      prénom: t.String,
      email: t.String,
      téléphone: t.String,
      'Mot de passe': t.String,
      // 'Entrer à nouveau le mot de passe': t.String,
    });

    const Adresse = t.struct({
      prestZip: t.String,
       prestVille: t.String,
    })

    const Adresses = t.struct({
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
          placeholderTextColor: '#08CC',
          textContentType: 'familyName',

        },
        prénom: {
          placeholderTextColor: '#08CC',
          textContentType: 'givenName'
        },
        email: {
          //label: 'Durée',
          placeholderTextColor: '#08CC',
          keyboardType: 'email-address',
        },
        téléphone: {
          //label: 'Motif',
          placeholderTextColor: '#08CC',
          keyboardType: 'phone-pad',
          textContentType: 'telephoneNumber'
        },
        'Mot de passe': {
          secureTextEntry: true,
          textContentType: 'password',
          placeholderTextColor: '#08CC',
        },
        'Entrer à nouveau le mot de passe': {
          //label: 'Heure de service',
          secureTextEntry: true,
          textContentType: 'password',
          placeholderTextColor: '#08CC'
        },
        adresse: {
          placeholderTextColor: '#08CC',
          textContentType: 'fullStreetAddress'
        },
        'Indiquez votre adresse': {
          placeholderTextColor: '#08CC',
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
        prestZip: {
          placeholder: prestZip,
          placeholderTextColor: '#777777',
          textContentType: 'postalCode',
          editable: false
        },
        prestVille: {
          placeholder: prestVille,
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
        >
          <View style={styles.listContainer}>
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
                //console.log(this.adressesForm.current.getValue()['Code postal'])

                const zip = details.address_components
                const ville = details.address_components

                if (zip[6] !== undefined) {

                  this.setState({ zip: zip[6].long_name })
                  this.setState({ ville: ville[2].long_name })

                  this.onChangeAdresses({
                    'Code postal': zip[6].long_name,
                    ville: ville[2].long_name
                  })

                  console.log(this.adressesForm.current.getValue()['Code postal'])

                }
                else if (zip[5] !== undefined) {

                  this.setState({ zip: zip[5].long_name })
                  this.setState({ ville: ville[1].long_name })

                  this.onChangeAdresses({
                    'Code postal': zip[5].long_name,
                    ville: ville[1].long_name
                  })

                  console.log(this.adressesForm.current.getValue()['Code postal'])

                }
                else {
                  this.setState({ zip: zip[4].long_name })
                  this.setState({ ville: ville[0].long_name })

                  this.onChangeAdresses({
                    'Code postal': zip[4].long_name,
                    ville: ville[0].long_name
                  })

                  console.log(this.adressesForm.current.getValue()['Code postal'])
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
                  height: hp(6.5),
                  fontFamily: 'Raleway-Bold',
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
              ref={this.adressesForm}
              type={Adresses}
              value={adresses}
              onChange={this.onChangeAdresses}
              options={options}
            />
            <Text style={styles.formText}>L’adresse de facturation est-elle la même que celle de la prestation ? </Text>
            <ListItem>
              <Left>
                <Text style={styles.formText}>oui</Text>
              </Left>
              <Right>
                <Radio
                  color={"black"}
                  selectedColor={"#33A0D6"}
                  selected={yes}
                  onPress={() => this._selectedRadio('yes')}/>
              </Right>
            </ListItem>
            <ListItem>
              <Left>
                <Text style={styles.formText}>non</Text>
              </Left>
              <Right>
                <Radio
                  color={"black"}
                  selectedColor={"#33A0D6"}
                  selected={no}
                  onPress={() => this._selectedRadio('no')} />
              </Right>
            </ListItem>
            {no === true ? 
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
              //console.log(this.adressesForm.current.getValue()['Code postal'])

              const zip = details.address_components
              const ville = details.address_components
              const address = data.description

              this.setState({ adresseName: address })

              if (zip[6] !== undefined) {

                this.setState({ prestZip: zip[6].long_name })
                this.setState({ prestVille: ville[2].long_name })

                this.onChangeAdresse({
                  prestZip: zip[6].long_name,
                  prestVille: ville[2].long_name
                })
              }
              else if (zip[5] !== undefined) {

                this.setState({ prestZip: zip[5].long_name })
                this.setState({ prestVille: ville[1].long_name })

                this.onChangeAdresse({
                  prestZip: zip[5].long_name,
                  prestVille: ville[1].long_name
                })
              }
              else {
                this.setState({ prestZip: zip[4].long_name })
                this.setState({ prestVille: ville[0].long_name })

                this.onChangeAdresse({
                  prestZip: zip[4].long_name,
                  prestVille: ville[0].long_name
                })  
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
                height: hp(6.5),
                fontFamily: 'Raleway-Bold',
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
            : null}
            {no === true ? <Form
              ref={this.adresseForm}
              type={Adresse}
              value={adresse}
              onChange={this.onChangeAdresse}
              options={options}
            /> : null}
            <ListItem>
              <CheckBox
                onPress={this._onCheck}
                checked={condition}
                color={"#33A0D6"}
                style={{
                  borderRadius: hp(0.5),
                  justifyContent: 'space-evenly',
                  paddingLeft: 0,
                  paddingTop: hp(0.6),
                  height: 20,
                  width: 20,
                  fontSize: hp(5),
                  alignSelf: 'flex-start'
                }}
              />
              <Body style={{ marginLeft: wp(2) }}>
                <Text style={{ fontSize: hp(1.5), fontFamily: 'Raleway-Regular', color: 'black', marginVertical: hp(0.4) }}>J'accepte <Text style={{ color: '#33A0D6' }} onPress={() => { web('https://ayline-services.fr/conditions_generales') }}>les conditions générales</Text> et <Text style={{ color: '#33A0D6' }} onPress={() => { web('https://ayline-services.fr/politique_de_confidentialite') }}>la politique de confidentialité</Text>. En tant qu'utillisateur de la plateforme AYLINE SERVICES, les informations fournies sont nécessaires pour votre reservation et sont collectées dans le but de recevoir des informations sur la plateforme AYLINE SERVICES via email. Vous pouvez vous désinscrire de la newsletter via un lien présent dans les mails.</Text>
              </Body>
            </ListItem>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.edit} onPress={this.goToPayment}>
                <Text style={styles.touchableText}>Passer au paiement</Text>
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
    height: hp(7),
    width: wp(55),
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
    fontSize: hp(2),
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

export default VueInscription