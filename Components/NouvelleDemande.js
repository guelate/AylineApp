import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Container, Header, Item, Input, Button } from 'native-base';
import _ from 'lodash';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class NouvelleDemande extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      orderData: undefined,
      fullData: [],
      query: '',
      isConnected: true
    };
    this.url = 'https://ayline-services.fr'
    this.isConnected = true
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

  _getData = () => {

    NetInfo.fetch().then(state => {

      AsyncStorage.getItem('token').then(value => {
        if (state.isConnected) {

          fetch(this.url + '/api/client/nouvelle_commande', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + value
            },
          })
            .then(response => response.json())
            .then(data => {
              let listData = [];
              let annulData = [];
              let modifData = [];
              for (let i = 0; i < data.commande.length; i++) {
                annulData[i] = { demande_annul: data.demande_annul[i] }
                modifData[i] = { demande_modif: data.demande_modif[i] }
                listData.push({ ...data.commande[i], ...annulData[i], ...modifData[i] })
              }
              console.log(listData)
              this.setState({
                orderData: listData,
                fullData: listData,
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
      if (moment((item.date_res)).format('LL').toLowerCase().includes(formattedQuery) || this._formatStatus(item.statut_res).toLowerCase().includes(formattedQuery) || numeral((item.montant + item.majoration) * item.valeur).format('0.00').toLowerCase().includes(formattedQuery) || this.format_code(item.id_res, item.date_res).toLowerCase().includes(formattedQuery) || item.libelle.toLowerCase().includes(formattedQuery) || item.nbre_heure.toLowerCase().includes(formattedQuery)) {
        return true
      }
      return false
    })
    this.setState({ orderData, query: text })
  }

  _getView = (view, id, date, hour, frequency, duree) => {
    this.props.navigation.navigate(view, {
      view: this.props.route.name,
      link: '/api/client/nouvelle_commande',
      id: id,
      date: date,
      hour: hour,
      frequency: frequency,
      duree: duree
    })
  }


  _vueAnnulation = () => {
    this.props.navigation.navigate('ANNULATION', {
      orderData: this.props.route.params.orderData,
      view: this.props.route.name
    })
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
      <View style={[styles.message, { paddingHorizontal: wp(4) }]}>
        <MaterialCommunityIcons name="wifi-off" size={hp(15)} color="#33A0D6" />
        <Text style={[styles.messageText, { color: 'black', fontSize: hp(2.5), marginTop: hp(5) }]}>Il semble que vous n'êtes pas connecté à Internet Nous ne trouvons aucun réseau</Text>
        <TouchableOpacity style={styles.retry} onPress={() => this._getData()}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    )
  }

  format_code = (id, date) => {
    var str = ""
    if (id >= 0 && id < 10) {
      str = "000" + id
    } else if (id >= 10 && id < 100) {
      str = "00" + id
    } else if (id >= 100 && id < 1000) {
      str = "0" + id
    } else {
      str += id
    }
    var newdate = date.split('-')
    var annee = newdate[0].substr(2, 2)
    var mois = newdate[1]
    return 'AYLRES' + annee + mois + str
  }

  _formatStatus = (status) => {

    var str = ""

    if (status === 1) {
      str = "En cours"
    } else if (status === 0) {
      str = "En attente"
    } else if (status === 2) {
      str = "Annulée"
    } else if (status === 3) {
      str = "Effectuée"
    } else {
      str = 'Indéfini'
    }

    return str
  }

  render() {

    const { orderData, isLoading, isConnected } = this.state
    //console.log(orderData)

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
              <Text style={styles.messageText}>Aucune nouvelle demande</Text>
            </View>
          </Container>
        </View>
      )

    }
    else {
      return (

        <View style={styles.container}>

          {isConnected ? <Container>
            <Header searchBar rounded style={styles.header}>
              <Item style={styles.item}>
                <Icon name="search" size={hp(4)} color='#33A0D6' />
                <Input placeholder="Rechercher" onChangeText={this.handleSearch} style={styles.input} />
              </Item>
            </Header>

            {isLoading ?
              this._displayLoading() : (
                <FlatList
                  data={orderData}
                  refreshing={isLoading}
                  onRefresh={this._getData}
                  keyExtractor={(item) => item.id_res.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.listContainer}>
                      <View style={styles.title}>
                        <Text style={styles.titleText}>{this.format_code(item.id_res, item.date_res)}</Text>
                      </View>
                      <View style={styles.dateContainer}>
                        <Text style={styles.titleText}>Debut de prestation: <Text style={styles.data}>{moment((item.date_res)).format('LL')}
                        </Text>
                        </Text>
                      </View>
                      <View style={styles.body}>
                        <Text style={styles.bodyText}>Fréquence: <Text style={styles.data}>{item.libelle}</Text></Text>
                        <Text style={styles.bodyText}>Durée: <Text style={styles.data}>{item.nbre_heure}</Text></Text>
                        <Text style={styles.bodyText}>Coût: <Text style={styles.data}>{numeral((item.montant + item.majoration) * item.valeur).format('0.00')} € / Prestation</Text></Text>
                        <Text style={styles.bodyText}>Statut: <Text style={styles.data}>{this._formatStatus(item.statut_res)}</Text></Text>
                      </View>
                      <View style={styles.body}>
                        <Text style={styles.bodyText}>Service: <Text style={styles.data}>Ménage/Repassage</Text></Text>
                      </View>
                      <View style={[styles.footer, { flexDirection: item.demande_annul === 0 && item.demande_modif === 0 ? 'row' : 'column', }]}>
                        {item.demande_annul === 0 ? <TouchableOpacity style={[styles.cancel, { marginTop: item.demande_annul === 0 ? hp(2.5) : 0 }]} onPress={() => this._getView('ANNULATION', item.id_res, item.date_res)}>
                          <Text style={styles.touchableText}>Annulations</Text>
                        </TouchableOpacity> : <View style={{ borderBottomWidth: 1, borderColor: '#33A0D6' }}><Text style={{ color: 'red', fontSize: hp(2.5), marginVertical: hp(1.5), fontFamily: 'Raleway-Regular' }}>Demande d'annulation en cours</Text></View>}
                        {item.demande_modif === 0 ? <TouchableOpacity style={[styles.edit, { marginTop: item.demande_modif === 0 ? hp(2.5) : 0 }]} onPress={() => this._getView('MODIFICATION', item.id_res, item.date_res, item.horaire, item.libelle, item.nbre_heure)}>
                          <Text style={styles.touchableText}>Modification</Text>
                        </TouchableOpacity> : <View style={{ marginTop: item.demande_annul === 0 ? hp(1.5) : 0, borderTopWidth: item.demande_annul === 0 ? 1 : 0, borderBottomWidth: 1, borderColor: '#33A0D6' }}><Text style={{ color: 'red', fontSize: hp(2.5), marginVertical: hp(1.5), fontFamily: 'Raleway-Regular' }}>Demande de modification en cours</Text></View>}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    marginHorizontal: wp(1),
    borderRadius: hp(1.5),
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
    fontFamily: 'Raleway-Bold'
  },
  item: {
    height: hp(5.5),
  },
  listContainer: {
    backgroundColor: 'white',
    borderWidth: hp(0.5),
    borderColor: '#08CC',
    borderRadius: hp(1.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    marginHorizontal: wp(3),
    marginVertical: hp(2),
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
    borderBottomWidth: 1,
    borderColor: '#08CC',
  },
  titleText: {
    fontSize: hp(2.5),
    color: '#08CC',
    fontFamily: 'Raleway-Bold',
    marginBottom: hp(0.5),
    marginTop: hp(0.5),
  },
  data: {
    color: 'black',
    fontSize: hp(2.7),
    fontWeight: 'normal',
    fontFamily: 'Raleway-Regular'
  },
  dateContainer: {
    borderBottomWidth: 1,
    borderColor: '#08CC',
  },
  body: {
    paddingVertical: hp(2.5),
    borderBottomWidth: 1,
    borderColor: '#08CC',
  },
  bodyText: {
    fontSize: hp(2.7),
    color: '#08CC',
    fontFamily: 'Raleway-Bold',
    marginBottom: hp(0.5),
    paddingBottom: hp(0.5)
  },
  footer: {
    flexDirection: 'row',
    paddingBottom: hp(2.5),
  },
  cancel: {
    backgroundColor: 'red',
    marginRight: wp(4),
    height: hp(6),
    paddingHorizontal: wp(2),
    borderRadius: 8,
    justifyContent: 'center'
  },
  edit: {
    backgroundColor: '#08CC',
    height: hp(6),
    borderRadius: 8,
    paddingHorizontal: wp(2),
    justifyContent: 'center'
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

export default NouvelleDemande