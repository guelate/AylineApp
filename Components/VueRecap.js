import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, BackHandler, Modal, ScrollView } from 'react-native';
import t from 'tcomb-form-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

class VueRecap extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    }
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

  _afficherVueConnexion = () => {
    this.setModalVisible(!this.state.modalVisible)
    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour } = this.props.route.params
    this.props.navigation.navigate("CONNEXION", {
      menage: menage, iron: iron, pet: pet, frequency: frequency, hour: hour, duree: duree, day: day, instruction: instruction, autreDispo: autreDispo, majoration: majoration,
      booking: true, idFreq, idDuree, idHour
    })

  }

  _afficherVueInscription = () => {
    this.setModalVisible(!this.state.modalVisible)
    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour, zip } = this.props.route.params
    this.props.navigation.navigate("INSCRIPTION", {
      menage: menage, iron: iron, pet: pet, frequency: frequency, hour: hour, duree: duree, day: day, instruction: instruction, autreDispo: autreDispo, majoration: majoration, idFreq, idDuree, idHour, zipCode: zip
    })

  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  _submitData = () => {

    const { menage, iron, pet, frequency, hour, duree, day, instruction, autreDispo, majoration, idFreq, idDuree, idHour } = this.props.route.params

    this.props.navigation.navigate('CLIENT', {
      isLogged: true,
      isConnected: true,
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
      idFreq, idDuree, idHour
    })

  }



  render() {

    const { menage, iron, pet, frequency, hour, duree, day, majoration, price, valeur, isConnected, zip } = this.props.route.params

    const { modalVisible } = this.state;

    return (
      <ScrollView style={styles.container}>
        <Modal
          animationType="slide"
          //transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.footer}>

                <Text style={{ color: 'black', fontSize: hp(3), fontFamily: 'Raleway-Bold', textAlign: 'center', marginBottom: hp(3) }}>Cher client vous devez être connecté pour valider la reservation.</Text>

                <View style={styles.connecter}>
                  <FontAwesome5 name={"user-check"} solid size={hp(7)} color="#11539F" />
                  <Text style={{ color: 'black', fontSize: hp(2), fontFamily: 'Raleway-regular', textAlign: 'center', marginTop: hp(1.5) }}>Si vous êtes déjà client connectez vous en cliquant sur le bouton ci-dessous</Text>
                  <TouchableOpacity style={styles.connecterTouchable} onPress={this._afficherVueConnexion}>
                    <Text style={styles.connecterText}>SE CONNECTER</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ color: 'black', fontSize: hp(3), fontFamily: 'Raleway-Bold', textAlign: 'center', marginBottom: hp(3) }}>OU</Text>

                <View style={[styles.connecter, { borderColor: '#CD3A38' }]}>
                  <FontAwesome5 name={"user-plus"} solid size={hp(7)} color="#CD3A38" />
                  <Text style={{ color: 'black', fontSize: hp(2), fontFamily: 'Raleway-regular', textAlign: 'center', marginTop: hp(1.5) }}>Si vous êtes nouveau client créer rapidement votre compte en cliquant sur le bouton ci-dessous</Text>
                  <TouchableOpacity style={[styles.connecterTouchable, { backgroundColor: '#CD3A38' }]} onPress={this._afficherVueInscription}>
                    <Text style={styles.connecterText}>S'INSCRIRE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.listContainer}>

          <View>
            <View style={styles.title}>
              <Text style={styles.titleText}>Entretien</Text>
              <Text style={styles.data}>{numeral(price + majoration).format('0.00')} €/h</Text>
            </View>
            <View style={styles.body}>
              {menage ? <Text style={styles.bodyText}><Ionicons name='arrow-forward-circle' size={20} color='#33A0D6' /> Ménage </Text> : null}
              {iron ? <Text style={styles.bodyText}><Ionicons name='arrow-forward-circle' size={20} color='#33A0D6' /> Repassage </Text> : null}
              {pet ? <Text style={styles.bodyText}><Ionicons name='arrow-forward-circle' size={20} color='#33A0D6' /> J'ai Des Animaux </Text> : null}
            </View>
          </View>

          <View>
            <View style={styles.title}>
              <Text style={styles.bodyText}>Après Crédit d'impôt</Text>
              <Text style={styles.data}>{numeral((price + majoration) / 2).format('0.00')} €/h</Text>
            </View>
            <View style={[styles.title, { borderTopWidth: 0 }]}>
              <Text style={styles.bodyText}>Date</Text>
              <Text style={styles.data}>{moment(day).format('LL')}</Text>
            </View>
            <View style={[styles.title, { borderTopWidth: 0 }]}>
              <Text style={styles.bodyText}>Horaire demandé</Text>
              <Text style={styles.data}>{moment(day + ' ' + hour).format('LT')}</Text>
            </View>
            <View style={[styles.title, { borderTopWidth: 0 }]}>
              <Text style={styles.bodyText}>Durée de la prestation</Text>
              <Text style={styles.data}>{duree}</Text>
            </View>
            <View style={[styles.title, { borderTopWidth: 0 }]}>
              <Text style={styles.bodyText}>Fréquence</Text>
              <Text style={styles.data}>{frequency}</Text>
            </View>
            <View style={[styles.body, { alignItems: 'center', borderBottomWidth: 2 }]}>
              <Text style={[styles.data, { fontSize: hp(3.2) }]}>{numeral((price + majoration) * valeur).format('0.00')} € / Prestation</Text>
            </View>
          </View>

          <View style={styles.footer0}>
            <TouchableOpacity style={styles.edit} onPress={isConnected ? this._submitData : () => this.setModalVisible(true)}>
              <Text style={styles.touchableText}>Réserver</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
    borderWidth: hp(0.8),
    borderColor: '#33A0D6',
    borderRadius: hp(3),
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    marginVertical: hp(2.5),
    marginHorizontal: wp(3),
    elevation: hp(1.5)
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
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: hp(0.3),
    borderBottomWidth: hp(0.3),
    borderColor: '#cacdd1',
    paddingBottom: hp(0.8),
    paddingTop: hp(1.5)
  },
  titleText: {
    fontSize: hp(3),
    color: '#33A0D6',
    fontFamily: 'Raleway-Bold',
  },
  data: {
    color: 'black',
    fontSize: hp(2.6),
    fontFamily: 'Raleway-Bold',
  },
  body: {
    paddingVertical: hp(2.2),
    paddingLeft: wp(2.5),
    borderColor: '#cacdd1',
  },
  bodyText: {
    fontSize: hp(2),
    color: '#33A0D6',
    fontFamily: 'Raleway-Regular',
    paddingBottom: hp(0.7),
  },
  edit: {
    backgroundColor: '#33A0D6',
    height: hp(6.7),
    width: wp(55),
    borderRadius: hp(2.4),
    elevation: hp(0.7),
    justifyContent: 'center'
  },
  footer0: {
    flexDirection: 'row',
    paddingTop: hp(2),
    justifyContent: 'center',
  },
  touchableText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: hp(3),
    fontFamily: 'Raleway-Bold',
  },
  connecter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hp(0.4),
    borderColor: '#11539F',
    borderRadius: hp(2.4),
    marginBottom: hp(3),
    paddingVertical: hp(3),
    paddingHorizontal: wp(4)
  },
  connecterTouchable: {
    backgroundColor: '#11539F',
    height: hp(6.5),
    width: wp(50),
    borderRadius: hp(2.4),
    elevation: hp(0.7),
    marginTop: hp(3),
    paddingHorizontal: wp(1),
    marginVertical: hp(1.5),
    marginHorizontal: wp(2),
    justifyContent: 'center'

  },
  connecterText: {
    textAlign: 'center',
    color: 'white',
    fontSize: hp(2),
    fontFamily: 'Raleway-Bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    marginVertical: hp(3),
    marginHorizontal: wp(4.5),
    backgroundColor: "white",
    borderRadius: hp(3),
    paddingVertical: wp(4.5),
    paddingHorizontal: hp(2),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})

export default VueRecap