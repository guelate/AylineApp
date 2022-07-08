import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Container, Header, Item, Input, Button } from 'native-base';
import _ from 'lodash';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class VuePrestationsAnnulees extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      orderData: undefined,
      fullData: [],
      isLoading: true,
      query: '',
      isConnected: true
    }
    this.url = 'https://ayline-services.fr'
  }


  componentDidMount() {
    this._getData()
  }

  _getData = () => {

    NetInfo.fetch().then(state => {

      AsyncStorage.getItem('token').then(value => {

        if (state.isConnected) {

          fetch(this.url + '/api/client/Liste_pres_annuler', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + value
            },
          })
            .then(response => response.json())
            .then(data => {


              let presData = data.prestation;
              if (presData !== undefined) {

                for (let i = 0; i < presData.length; i++) {

                  presData[i].id_promo = i

                }
              }
              this.setState({
                orderData: presData,
                promoData: data.liste_promo,
                fullData: presData,
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

  handleSearch = (text) => {
    const formattedQuery = text.toLowerCase()
    const orderData = _.filter(this.state.fullData, item => {
      if (moment(item.date_prestation + ' ' + item.horaire).format('llll').includes(formattedQuery) || (item.nom_pres + ' ' + item.prenom_pres).toLowerCase().includes(formattedQuery) || item.nbre_heure.toLowerCase().includes(formattedQuery) || numeral((item.montant + item.majoration) * item.valeur).format('0.00').includes(formattedQuery) || this._formatStatus(item.statut_pres).toLowerCase().includes(formattedQuery) || numeral(this._formatDiscount(item.id_promo, ((item.montant + item.majoration) * item.valeur))).format('0.00').toLowerCase().includes(formattedQuery)) {
        return true
      }
      return false
    })
    this.setState({ orderData, query: text })
  }

  _displayLoading() {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size='large' color='#08CC' />
      </View>
    )
  }

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

  _formatStatus = (status) => {
    var str = ""
    if (status === 0) {
      str = "En cours"
    } else if (status === 1) {
      str = "Planifiée"
    } else if (status === 2) {
      str = "Annulée"
    } else if (status === 3) {
      str = "Effectuée"
    } else {
      str = 'Indéfini'
    }

    return str
  }

  _formatDiscount = (index, price) => {

    let reduction = 0
    let type = 0
    let newprice = price

    let data = this.state.promoData[index]
    //console.log(data)
    for (let j = 0; j < data.length; j++) {
      if (data.length > 0) {
        reduction = data[j]['reduction']
        type = data[j]['type']

        if (type > 1) {
          newprice -= reduction
        }
        else {
          newprice -= ((newprice * reduction) / 100)
        }
        //console.log(data.length)
      }
    }

    return newprice
  }

  _discount = (index) => {
    let data = this.state.promoData[index]
    //console.log(data.length)

    return data.length
  }

  render() {

    const { orderData, isLoading, isConnected } = this.state

    if (orderData !== undefined && orderData.length === 0) {
      return (
        <View style={styles.container}>
          <Container style={styles.searchContainer}>
            <Header searchBar rounded style={styles.header}>
              <Item style={styles.item}>
                <Icon name="search" size={hp(4)} color='#33A0D6' />
                <Input placeholder="Rechercher" onChangeText={this.handleSearch} style={styles.input} />
              </Item>
            </Header>
            <View style={styles.message}>
              <Text style={styles.messageText}>Aucune prestation annulée</Text>
            </View>
          </Container>
        </View>
      )

    }
    else {
      return (

        <View style={styles.container}>
          {isConnected ? <Container style={styles.searchContainer}>
            <Header searchBar rounded style={styles.header}>
              <Item style={styles.item}>
                <Icon name="search" size={hp(4)} color='#33A0D6' />
                <Input placeholder="Rechercher" onChangeText={this.handleSearch} style={styles.input} />
              </Item>
            </Header>

            {isLoading ?
              this._displayLoading() : (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={orderData}
                  refreshing={isLoading}
                  onRefresh={this._getData}
                  keyExtractor={(item) => item.id_res.toString()}
                  renderItem={({ item }) => (
                    <View style={[styles.listContainer, { backgroundColor: '#F44336' }]}>
                      <View style={styles.dateContainer}>
                        <Text style={styles.date}> {moment(item.date_prestation + ' ' + item.horaire).format('LLLL')}</Text>
                        <View style={styles.badgeContainer}>

                          {this._discount(item.id_promo) > 0 ? <View style={[styles.status, { backgroundColor: '#4CAF50', marginRight: wp(1) }]}>
                            {this._discount(item.id_promo) > 1 ? <Text style={[styles.statusText, { color: 'white', fontSize: hp(2), fontFamily: 'Raleway-Bold', fontWeight: 'normal' }]}>{this._discount(item.id_promo)} Remises</Text> : <Text style={[styles.statusText, { color: 'white', fontSize: hp(2), fontFamily: 'Raleway-Bold' }]}>{this._discount(item.id_promo)} Remise</Text>}
                          </View> : null}

                          <View style={styles.status}>
                            <Text style={styles.statusText}>{this._formatStatus(item.statut_pres)}</Text>
                          </View>

                        </View>
                      </View>
                      <View style={styles.body}>
                        <View style={styles.info}>
                          <Text style={styles.bodyText}>{item.nom_pres} {item.prenom_pres}</Text>
                          <Text style={styles.bodyText}>{item.nbre_heure}</Text>

                          <Text style={[styles.bodyText, { textDecorationLine: this._discount(item.id_promo) === 0 ? 'none' : 'line-through', color: this._discount(item.id_promo) === 0 ? 'black' : 'red' }]}>{numeral((item.montant + item.majoration) * item.valeur).format('0.00')} €</Text>
                          {this._discount(item.id_promo) ? <Text style={[styles.bodyText, { color: '#40a056' }]}>{numeral(this._formatDiscount(item.id_promo, ((item.montant + item.majoration) * item.valeur))).format('0.00')} €</Text> : null}
                        </View>
                      </View>
                    </View>
                  )}
                />
              )}
          </Container> : this._notConnected()}
        </View>

      )
    }
  }
}

//32b551
//#F44336

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(1),
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
    height: hp(6.5),
  },
  input: {
    marginLeft: wp(1.5),
    fontFamily: 'Raleway-Bold',
    fontSize: hp(2.5)
  },
  item: {
    height: hp(5.5),
  },
  listContainer: {
    borderRadius: hp(1.5),
    width: wp(95),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
    marginHorizontal: wp(1.5),
    elevation: 10,
    alignSelf: 'center'
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
  },
  titleText: {
    fontSize: hp(2.2),
    color: 'white',
    fontFamily: 'Raleway-Bold',
    paddingBottom: hp(1),
  },
  date: {
    color: 'white',
    fontSize: hp(1.7),
    fontFamily: 'Raleway-Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
    justifyContent: 'space-between'
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: hp(1.5),
    borderColor: 'white',
  },
  bodyText: {
    fontSize: hp(2),
    color: 'black',
    padding: hp(1),
    paddingVertical: hp(1),
    fontFamily: 'Raleway-Bold',
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    borderRadius: hp(1),
    color: 'black',
    flexWrap: 'wrap'
  },
  status: {
    backgroundColor: 'white',
    height: hp(3),
    borderRadius: hp(1),
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(1)
  },
  status0: {
    backgroundColor: 'white',
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
    height: hp(3),
    alignItems: 'center',
    borderRadius: hp(1),
    justifyContent: 'center',
  },
  statusText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#F44336',
    fontSize: hp(1.7),
    fontFamily: 'Raleway-Bold',
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

export default VuePrestationsAnnulees