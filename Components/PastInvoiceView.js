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
import { email, web } from 'react-native-communications';

class PastInvoiceView extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      orderData: [],
      fullData: [],
      isLoading: true,
      query: '',
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
    BackHandler.removeEventListener('hardwareBackPress', this.enableBackButton)
    this.setState = (state,callback)=>{
      return;
  };
  }

  componentDidMount() {
    this._getData()
  }


  componentDidMount() {
    this._getData()
  }

  _getData = () => {

    NetInfo.fetch().then(state => {

      AsyncStorage.getItem('token').then(value => {

        if (state.isConnected) {

          fetch(this.url + '/api/client/Liste_fact_passee', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + value
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log(data)
              this.setState({
                orderData: data,
                fullData: data,
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
      if (moment(item.date_prestation + ' ' + item.horaire).format('llll').includes(formattedQuery) || (item.nom_pres + ' ' + item.prenom_pres).toLowerCase().includes(formattedQuery) || item.nbre_heure.toLowerCase().includes(formattedQuery) || numeral((item.montant + item.majoration) * item.valeur).format('0.00').includes(formattedQuery) || this._formatStatus(item.statut_facture).toLowerCase().includes(formattedQuery) || item.code_facture.toLowerCase().includes(formattedQuery) || item.libelle_frequence.toLowerCase().includes(formattedQuery)) {
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
      str = "Impayée"
    } else if (status === 1) {
      str = "Payée"
    }
    else {
      str = 'Indéfini'
    }

    return str
  }


  render() {

    const { orderData, isLoading, isConnected } = this.state

    console.log()

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
              <Text style={styles.messageText}>Aucunes Factures</Text>
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
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.listContainer}>
                      <View style={styles.dateContainer}>
                        <Text style={styles.date}>{moment(item.date_prestation + ' ' + item.horaire).format('LLLL')}</Text>

                        <View style={styles.badgeContainer}>
                          <View style={[styles.status, { backgroundColor: item.statut_facture === 1 ? 'green' : 'red' }]}>
                            <Text style={styles.statusText}>{this._formatStatus(item.statut_facture)}</Text>
                          </View>
                        </View>

                      </View>

                      <View style={styles.title}>
                        <Text style={styles.titleText}>{item.code_facture}</Text>
                        <Text style={styles.titleText}>Ménage/Repassage</Text>
                      </View>

                      <View style={styles.body}>
                        <View style={styles.info}>

                          <Text style={styles.bodyText}>{item.nom_pres} {item.prenom_pres}</Text>
                          <Text style={styles.bodyText}>{item.libelle_frequence}</Text>
                          <Text style={styles.bodyText}>{item.nbre_heure}</Text>
                          <Text style={styles.bodyText}>{numeral((item.montant + item.majoration) * item.valeur).format('0.00')}€</Text>

                        </View>
                      </View>

                      <TouchableOpacity style={[styles.cancel, { flexDirection: 'row' }]} onPress={() => { web('https://ayline-services.fr/client_facture/' + item.prestation_id) }}>
                        <MaterialCommunityIcons name="file-download" size={hp(3.5)} color="white" style={{ marginTop: hp(0.2) }} />
                        <Text style={styles.touchableText}> Télécharger la facture</Text>
                      </TouchableOpacity>
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
    fontSize: hp(2.5),
  },
  item: {
    height: hp(5.5),
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#33A0D6',
    borderRadius: hp(1.5),
    width: wp(95),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
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
    fontSize: hp(1.5),
    color: 'black',
    fontFamily: 'Raleway-Bold',
    paddingTop: hp(1),
  },
  date: {
    color: '#33A0D6',
    fontSize: hp(2),
    fontFamily: 'Raleway-Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    // marginBottom: hp(1.5),
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
    // borderColor: '#33A0D6',
    // borderWidth: 2,
    paddingVertical: hp(1),

  },
  bodyText: {
    fontSize: hp(1.5),
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
    borderWidth: 2,
    borderColor: '#33A0D6',
    color: 'black',
    flexWrap: 'wrap',
  },
  status: {
    backgroundColor: 'red',
    // height: hp(3),
    borderRadius: hp(1),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(0.5),
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
    color: 'white',
    fontSize: hp(1.7),
    fontFamily: 'Lato-Bold',
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
  cancel: {
    backgroundColor: '#33A0D6',
    height: hp(4.2),
    borderRadius: hp(1.2),
    justifyContent: 'center',
    paddingHorizontal: wp(1.5),
    // marginTop: hp(1)
  },
  touchableText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: hp(1.7),
    fontFamily: 'Raleway-Bold'
  },
});

export default PastInvoiceView