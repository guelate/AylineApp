import React, { Component } from 'react'
import { View, StyleSheet, Switch, Image, Text, Pressable, ScrollView, ToastAndroid, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { PaymentCardTextField } from 'tipsi-stripe';
import t from 'tcomb-form-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Container, Header, Content, CheckBox, ListItem, Radio, Right, Left, Body } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


class FieldExample extends Component {

  constructor(props) {
    super(props);
    this.state = {
      condition: false,
      valid: false,
      number: '',
      month: '',
      year: '',
      cvc: '',
      paymentMethod: 'card'
    }
    this.url = 'https://ayline-services.fr';
    this.paymentCardInput = React.createRef();
    this.form = React.createRef();
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

  _onCheck = () => {
    !this.state.condition ? this.setState({ condition: true }) :
      this.setState({ condition: false })
  }

  _handleSubmit = () => {

    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration,
      nom,
      prenom,
      email,
      téléphone,
      mdp,
      adresse,
      postal,
      ville,
      prestAdresse,
      idFreq,
      idDuree,
      idHour
    } = this.props.route.params

    const { condition, number, cvc } = this.state

    let exp = this.state.month + '/20' + this.state.year

    //console.log(exp, day)
    if (condition) {

      fetch(this.url + '/api/client/get_user_info', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: number,
          exp: exp,
          cvc: cvc,
          nom: nom,
          prenom: prenom,
          adresse: adresse,
          email: email,
          ville: ville,
          contact: téléphone,
          postal_code: postal,
          password: mdp,
          creneau_horaire_id: idDuree,
          frequence_id: idFreq,
          disponibilite: idHour,
          autre_dispo: autreDispo,
          instruction: instruction,
          adresse_prestation: prestAdresse === null ? null : prestAdresse['Indiquez votre adresse'],
          majoration: majoration,
          option: pet ? "   J'ai des animaux" : null,
          besoin1: "   ménage",
          besoin2: iron ? "   repassage" : null,
          date_res: day
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          AsyncStorage.setItem('token', data)
          this.props.navigation.navigate('CLIENT', {
            value: {},
            isConnected: true,
            islogged: true
          })
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    else {
      ToastAndroid.show("Vous devez accepter les conditions générales d'utilisation", ToastAndroid.LONG)
    }


  }

  _addPaymentMethods = () => {

    const { nom, prenom, email, id } = this.props.route.params

    const { condition, number, cvc } = this.state

    let exp = this.state.month + '/20' + this.state.year

    if (condition) {

      fetch(this.url + '/api/client/save_new_card_cli', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: number,
          exp: exp,
          cvc: cvc,
          id: id,
          nom: nom,
          prenom: prenom,
          email: email,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)

          if (data === 1) {
            this.props.navigation.navigate('MES MOYENS DE PAIEMENT')

            Alert.alert(
              null,
              "Le moyen de paiement a bien été ajoutée !",
              [
                { text: "OK" }
              ],
              { cancelable: true }
            );
          }
          else {
            ToastAndroid.show("Une erreur est survenue lors de l'enregistrement de votre carte", ToastAndroid.LONG)
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    else {
      ToastAndroid.show("Vous devez accepter les conditions générales d'utilisation", ToastAndroid.LONG)
    }
  }

  /*  _createPaymentIntent = (client_secret, payment_method_id) => {
 
       stripe.confirmCardSetup(client_secret, {
         payment_method: payment_method_id
     }).then(function (result) {
 
     });
   } */

  _selectMethod = (method) => {
    method === 'card' ? this.setState({ paymentMethod: method }) :
      method === 'bank' ? this.setState({ paymentMethod: method }) :
        method === 'cheque' ? this.setState({ paymentMethod: method }) : null
  }


  handleFieldParamsChange = (valid, params) => {

    this.setState({
      valid: valid,
      number: params.number,
      month: params.expMonth,
      year: params.expYear,
      cvc: params.cvc
    })
  }

  isPaymentCardTextFieldFocused = () => this.paymentCardInput.isFocused()

  focusPaymentCardTextField = () => this.paymentCardInput.focus()

  blurPaymentCardTextField = () => this.paymentCardInput.blur()

  resetPaymentCardTextField = () => this.paymentCardInput.setParams({})

  render() {


    const { valid, condition, paymentMethod, number, year, month, cvc } = this.state

    const { nom, prenom, view } = this.props.route.params

    const Form = t.form.Form;

    const CardHolder = t.struct({
      'Nom & Prenom': t.maybe(t.String)
    })

    const formStyles = {
      ...Form.stylesheet,
      controlLabel: {
        normal: {
          color: 'black',
          fontSize: hp(2.6),
          marginBottom: hp(1),
          fontFamily: 'Lato-Bold'
        },
        error: {
          color: "#a94442",
          fontSize: hp(2.6),
          marginBottom: hp(1),
          fontFamily: 'Lato-Bold'
        }
      },
      textbox: {
        normal: {
          color: "#000000",
          fontSize: 15,
          paddingVertical: Platform.OS === "ios" ? hp(1) : hp(1.5),
          paddingHorizontal: hp(3),
          borderRadius: 5,
          borderColor: "#33A0D6",
          borderWidth: 3,
          marginBottom: 5,
          backgroundColor: 'white',
          fontFamily: 'Lato-Regular'
        },
        error: {
          color: "#000000",
          fontSize: 15,
          paddingVertical: Platform.OS === "ios" ? hp(1) : hp(1.5),
          paddingHorizontal: hp(3),
          borderRadius: 5,
          borderColor: "#a94442",
          borderWidth: 3,
          marginBottom: 5,
          backgroundColor: 'white',
          fontFamily: 'Lato-Regular'
        }
      },

    }

    const options = {
      auto: 'placeholders',
      i18n: {
        optional: '',
        required: '',
      },
      fields: {
        'Nom & Prenom': {
          label: "Titulaire de la carte",
          placeholderTextColor: 'black',
          placeholder: nom + ' ' + prenom

        },
      },
      stylesheet: formStyles,
    }

    return (
      <ScrollView style={styles.container}>

        {/* <View style={[styles.boxContainer, { paddingHorizontal: 10, marginBottom: 20 }]}>
          <Pressable style={[styles.pressable, { backgroundColor: paymentMethod === 'card' ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectMethod('card')}>
            <Text style={[styles.pressablePrice, { color: paymentMethod === 'card' ? 'white' : 'black' }]}>Carte Bancaire</Text>
          </Pressable>
          <Pressable style={[styles.pressable, { backgroundColor: paymentMethod === 'bank' ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectMethod('bank')}>
            <Text style={[styles.pressablePrice, { color: paymentMethod === 'bank' ? 'white' : 'black' }]}>Prélevement Bancaire</Text>
          </Pressable>
          <Pressable style={[styles.pressable, { backgroundColor: paymentMethod === 'cheque' ? '#33A0D6' : 'white', borderRadius: 10 }]} onPress={() => this._selectMethod('cheque')}>
            <Text style={[styles.pressablePrice, { color: paymentMethod === 'cheque' ? 'white' : 'black' }]}>Chèque CESU</Text>
          </Pressable>
        </View> */}

        <View style={styles.cardForm}>
          <Form
            ref={this.form}
            type={CardHolder}
            options={options}
          />
          <Text style={formStyles.controlLabel.normal}>Information de la carte</Text>
          <PaymentCardTextField
            ref={this.paymentCardInput}
            style={styles.field}
            cursorColor={'black'}
            textErrorColor={'red'}
            placeholderColor='#33A0D6'
            numberPlaceholder={'42424242424242'}
            expirationPlaceholder={'MM/YY'}
            cvcPlaceholder={'cvc'}
            disabled={false}
            onParamsChange={this.handleFieldParamsChange}
          />
          <View style={styles.secure}>
            <MaterialCommunityIcons name="check-circle-outline" size={hp(3.5)} color="#4CAF50" />
            <Icon name="lock" size={hp(3.5)} color="#4CAF50" style={{ marginLeft: wp(1.5) }} />
            <Text style={styles.secureText}>Paiement 100% sécurisé</Text>
          </View>
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
              <Text style={{ fontSize: hp(1.5), fontFamily: 'Lato-Regular', color: 'black', marginVertical: hp(0.4) }}> J'autorise Ayline Services à envoyer des instructions à l'institution financière qui a émis ma carte pour qu'elle accepte les paiements de mon compte de carte conformément aux conditions Générales.
              </Text>
            </Body>
          </ListItem>
          
          {valid ?
            <View style={styles.footer}>
              <TouchableOpacity style={styles.edit} onPress={view === 'signUp' ? this._handleSubmit : this._addPaymentMethods}>
                <Text style={styles.touchableText}>Valider</Text>
              </TouchableOpacity>
            </View> : null}
            
        </View>

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  cardForm: {
    margin: hp(3),
  },
  field: {
    justifyContent: 'space-between',
    color: '#449aeb',
    borderColor: '#33A0D6',
    borderWidth: 3,
    borderRadius: 5,
    backgroundColor: 'white',
    fontFamily: 'Lato-Regular'
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
    paddingVertical: hp(2.5),
    justifyContent: 'center',
  },
  touchableText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: hp(3),
    fontFamily: 'Lato-Bold'
  },
  secure: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#cacdd1',
    marginVertical: hp(3),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2.5),
    justifyContent: 'flex-start'
  },
  secureText: {
    color: 'black',
    fontFamily: 'Lato-Bold',
    marginLeft: hp(2.5),
    marginTop: hp(0.8),
    fontSize: hp(2)
  },
})
export default FieldExample