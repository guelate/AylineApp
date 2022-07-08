import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl, BackHandler } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Container, Header, Item, Input, Button } from 'native-base';
import _ from 'lodash';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";

class VuePrestationsFutures extends React.PureComponent {

  _isMounted = false;

  constructor(props) {
    super(props)
    this.state = {
      orderData: undefined,
      promoData: undefined,
      fullData: [],
      isLoading: true,
      query: '',
      focused: true,
      isConnected: true
    }
    this.url = 'https://ayline-services.fr'
  }

  enableBackButton = () => {
    this.props.navigation.goBack()
    return true;
  }

  UNSAFE_componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.enableBackButton)
  }

  componentWillUnmount() {

    this._isMounted = false
    BackHandler.removeEventListener('hardwareBackPress', this.enableBackButton)

    this.setState = (state,callback)=>{
      return;
  };

  }

  componentDidMount() {
    this._isMounted = true

    if (this._isMounted) {
      this._getData()
    }

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

          fetch(this.url + '/api/client/Liste_pres_futur', {
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

  _displayTest() {
    console.log('gang')
  }

  handleSearch = (text) => {
    const formattedQuery = text.toLowerCase()
    const orderData = _.filter(this.state.fullData, item => {
      if (moment(item.date_prestation + ' ' + item.horaire).format('llll').includes(formattedQuery) || (item.nom_pres + ' ' + item.prenom_pres).toLowerCase().includes(formattedQuery) || item.nbre_heure.toLowerCase().includes(formattedQuery) || numeral((item.montant + item.majoration) * item.valeur).format('0.00').includes(formattedQuery) || this._formatStatus(item.statut_pres, item.motif_annulation).toLowerCase().includes(formattedQuery) || numeral(this._formatDiscount(item.id_promo, ((item.montant + item.majoration) * item.valeur))).format('0.00').toLowerCase().includes(formattedQuery)) {
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

  _formatStatus = (status, annulation) => {
    var str = ""

    if (annulation !== null) {
      str = 'Annulation en cours'
    }
    else {

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

  _displayDetails = (date, hour, freq, amount, duree, price, name, surname, needs, index, markup) => {

    let reduction = 0
    let type = 0
    let discount = 0

    let data = this.state.promoData[index]
    //console.log(data)
    for (let j = 0; j < data.length; j++) {
      if (data.length > 0) {
        reduction = data[j]['reduction']
        type = data[j]['type']

        if (type > 1) {
          discount += reduction
        }
        else {
          discount += (((price - reduction) * reduction) / 100)
        }
        //console.log(data.length)
      }
    }

    if (needs === 'Ménage;Repassage') {
      needs = 'Ménage/Repassage'
    }

    this.props.navigation.navigate("DÉTAILS PRESTATION", {
      date: date,
      hour: hour,
      freq: freq,
      amount: amount,
      duree: duree,
      price: price,
      name: name,
      surname: surname,
      needs: needs,
      markup: markup,
      discount: discount
    })
  }

  _displayModiForm = (id, idDuree, idHour, duree, hour, date) => {
    this.props.navigation.navigate('MODIFIER LA PRESTATION', {
      id: id,
      dureeId: idDuree,
      hourId: idHour,
      duree: duree,
      hour: hour,
      date: date,
      reload: this.state.reload
    })
  }

  _displayAnnulForm = (id) => {
    this.props.navigation.navigate('ANNULER LA PRESTATION', { id: id })
  }

  render() {
    const { isFocused } = this.props;

    const { orderData, isLoading, promoData, isConnected } = this.state
    let listData = []
    let allPromoData = []

    if (orderData !== undefined && promoData !== undefined) {

      for (let i = 0; i < promoData.length; i++) {
        allPromoData.push(...promoData[i])
        listData.push({ ...orderData[i], ...allPromoData[i] })
      }

    }

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
              <Text style={styles.messageText}>Aucune prestation en cours</Text>
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
                  scrollsToTop={true}
                  disableScrollViewPanResponder={false}
                  showsVerticalScrollIndicator={false}
                  data={orderData}
                  extraData={isFocused}
                  refreshing={isLoading}
                  onRefresh={this._getData}
                  keyExtractor={(item, index) => item.prestation_id.toString()}
                  renderItem={({ item, index }) => (
                    <View>
                      <View style={[styles.listContainer, { backgroundColor: item.motif_annulation !== null ? '#E89020' : item.statut_pres === 1 ? '#11539F' : '#33A0D6' }]}>
                        <View style={styles.dateContainer}>
                          <Text style={styles.date}> {moment(item.date_prestation + ' ' + item.horaire).format('LLLL')}</Text>
                          <View style={styles.badgeContainer}>

                            {this._discount(item.id_promo) > 0 ? <View style={[styles.status, { backgroundColor: '#4CAF50', marginRight: wp(1) }]}>
                              {this._discount(item.id_promo) > 1 ? <Text style={[styles.statusText, { color: 'white', fontSize: hp(2), fontFamily: 'Raleway-Bold', fontWeight: 'normal' }]}>{this._discount(item.id_promo)} Remises</Text> : <Text style={[styles.statusText, { color: 'white', fontSize: hp(2), fontFamily: 'Raleway-Bold' }]}>{this._discount(item.id_promo)} Remise</Text>}
                            </View> : null}

                            <View style={item.motif_annulation !== null ? styles.status0 : styles.status}>
                              <Text style={[styles.statusText, { color: item.motif_annulation !== null ? 'red' : item.statut_pres === 1 ? '#11539F' : '#33A0D6', fontSize: item.motif_annulation !== null ? hp(2) : hp(2) }]}>{this._formatStatus(item.statut_pres, item.motif_annulation)}</Text>
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
                        {item.motif_annulation !== null ? null : <View style={styles.footer}>
                          <TouchableOpacity style={styles.details} onPress={() => this._displayDetails(item.date_prestation, item.horaire, item.libelle, (item.montant + item.majoration), item.nbre_heure, ((item.montant + item.majoration) * item.valeur), item.nom_pres, item.prenom_pres, item.specialite, item.id_promo, item.majoration)}>
                            <Text style={styles.ediText}><Icon name="eye" size={hp(4)} color="black" style={styles.ediText} /> Détails</Text>
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={styles.edit} onPress={() => this._displayModiForm(item.prestation_id, item.creneau_horaire_id, item.disponibilite_id, item.nbre_heure, item.horaire, item.date_prestation)}>
                              <Text style={styles.ediText}><Icon name="edit" size={hp(4)} color="black" style={styles.ediText} /> Modifier</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancel} onPress={() => this._displayAnnulForm(item.prestation_id)}>
                              <Text style={styles.touchableText}><Ionicons name="close-circle-outline" size={hp(4)} color="white" style={styles.touchableText} /> Annuler</Text>
                            </TouchableOpacity>
                          </View>
                        </View>}
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
    backgroundColor: '#33A0D6',
    borderRadius: 10,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
    marginHorizontal: wp(1.5),
    elevation: 10
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
  data: {
    color: '#777777',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold'
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
    color: '#33A0D6',
    fontSize: hp(1.7),
    fontFamily: 'Raleway-Bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: hp(1)
  },
  cancel: {
    backgroundColor: 'red',
    height: hp(3.7),
    borderRadius: hp(1.2),
    justifyContent: 'center',
    paddingHorizontal: wp(1.5),
    marginLeft: hp(1.5)
  },
  edit: {
    backgroundColor: 'white',
    height: hp(3.7),
    borderRadius: hp(1.2),
    justifyContent: 'center',
    paddingHorizontal: wp(1.5),
    marginLeft: hp(1.5)
  },
  details: {
    backgroundColor: 'white',
    height: hp(3.7),
    borderRadius: hp(1.2),
    justifyContent: 'center',
    paddingHorizontal: wp(1.5),
  },
  touchableText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: hp(1.5),
    fontFamily: 'Raleway-Bold'
  },
  ediText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'black',
    fontSize: hp(1.5),
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

// export default VuePrestationsFutures

export default function (props) {
  const isFocused = useIsFocused();

  return <VuePrestationsFutures {...props} isFocused={isFocused} />;
}