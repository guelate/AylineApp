import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, BackHandler, Alert } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from "@react-native-community/netinfo";

class PaymentMethods extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      orderData: undefined,
      query: '',
      isConnected: true
    };
    this.url = 'https://ayline-services.fr';
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

  componentDidUpdate(prevProps, prevState) {

    if (prevState.orderData !== undefined && prevState.orderData === this.state.orderData) {
      this._getData()
    }
  }

  _getData = () => {

    NetInfo.fetch().then(state => {

      AsyncStorage.getItem('token').then(value => {
        if (state.isConnected) {

          fetch(this.url + '/api/info_mode_paiement_cli', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + value
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log(data.carte_bancaire)
              this.setState({
                orderData: data.carte_bancaire,
                fullData: data.carte_bancaire,
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
      })
    })
  }

  _launchAlert = (cardId) => {

    console.log(cardId)

    Alert.alert(
      "Voulez vous vraiment supprimer ce moyen de paiement ?",
      "Cette action est irréversible !", [
      { text: "Fermer" },
      { text: "Oui Supprimer !", onPress: () => this._deleteCard(cardId) }
    ], { cancelable: true }
    );
  }

  _displayLoading() {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size={50} color='#08CC' />
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

  _deleteCard = (cardId) => {

    //console.log(orderData.id)
    AsyncStorage.getItem('token').then(value => {
      if (value !== null) {

        fetch(this.url + '/api/client/delete_mode_paiement', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + value
          },
          body: JSON.stringify({

            id: cardId,
            type: 'card',

          })
        })
          .then(response => response.json())
          .then(data => {
            console.log(data)

            if (data !== 1) {
              Alert.alert(
                null,
                "La carte a bien été supprimée !",
                [
                  { text: "OK" }
                ],
                { cancelable: true }
              );
              this._getData()
            }
            else {
              Alert.alert(
                null,
                "Suppression impossible, vous devez avoir au moins un moyen de paiement.",
                [
                  { text: "OK" }
                ],
                { cancelable: true }
              );
              //this._getData()
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }

    })
  }

  render() {

    const { orderData, isLoading, isConnected } = this.state

    //console.log(this.props.route.params.prenom)

    if (orderData !== undefined && orderData.length === 0) {
      return (
        <View style={styles.container}>
          <View style={styles.message}>
            <Text style={styles.messageText}>Aucun moyens de paiement enregistré</Text>
          </View>
        </View>
      )
    }
    else {
      return (

        <View style={styles.container}>

          {isConnected ? isLoading ?
            this._displayLoading() : (
              <FlatList
                scrollsToTop={true}
                disableScrollViewPanResponder={false}
                showsVerticalScrollIndicator={false}
                data={orderData}
                refreshing={isLoading}
                onRefresh={this._getData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.listContainer}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.data}>Carte Bancaire</Text>
                      <View style={{ flexDirection: 'row' }}>
                        <Image style={styles.brandImage} source={item.card.brand === 'visa' ? require('../assets/visa-3.png') : item.card.brand === 'mastercard' ? require('../assets/mastercard.png') : null} />
                      </View>
                    </View>
                    <View style={styles.title}>
                      <Text style={styles.titleText}>...{item.card.last4}</Text>
                      <Text style={styles.titleText}>{item.card.exp_month}/{item.card.exp_year}</Text>
                    </View>

                    <TouchableOpacity style={[styles.cancel, { flexDirection: 'row' }]} onPress={() => this._launchAlert(item.id)}>
                      <MaterialCommunityIcons name="credit-card-remove" size={hp(3.5)} color="white" style={{ marginTop: hp(0.2) }} />
                      <Text style={styles.touchableText}> Supprimer la carte</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : this._notConnected()}
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(2),
    backgroundColor: 'white'
  },
  header: {
    backgroundColor: 'white',
    borderRadius: wp(2),
    marginTop: hp(1.5),
    borderWidth: 3,
    borderBottomColor: '#33A0D6',
    borderBottomWidth: 3,
    borderColor: '#33A0D6',
    elevation: 10,
    height: hp(8.5),
    marginBottom: 1
  },
  input: {
    marginLeft: wp(1.5),
    fontFamily: 'Raleway-Bold'
  },
  item: {
    height: hp(7.5),
  },
  brandImage: {
    height: hp(4.5),
    width: wp(13),
    resizeMode: 'contain',
  },
  listContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: hp(1.5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
    elevation: 20,
    marginHorizontal: wp(2),
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
    borderColor: '#08CC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#cacdd1',
  },
  titleText: {
    fontSize: hp(2.5),
    color: 'black',
    fontFamily: 'Raleway-Bold',
    paddingTop: hp(1),
    paddingBottom: hp(1)
  },
  data: {
    color: 'black',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
    justifyContent: 'space-between'
  },
  status: {
    backgroundColor: 'white',
    height: hp(3.5),
    width: wp(20),
    borderRadius: hp(1.3),
    justifyContent: 'center',
  },
  statusText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'black',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold',
    paddingRight: wp(1.5)
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: hp(1)
  },
  cancel: {
    backgroundColor: 'red',
    height: hp(4.2),
    borderRadius: hp(1.2),
    justifyContent: 'center',
    paddingHorizontal: wp(1.5),
    marginTop: hp(1)
  },
  touchableText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold'
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
});

export default PaymentMethods