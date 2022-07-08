import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Item, Input, Button } from 'native-base';
import _ from 'lodash';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class DemandeModification extends React.Component {

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

  handleSearch = (text) => {
    const formattedQuery = text.toLowerCase()
    const orderData = _.filter(this.state.fullData, item => {
      if (moment(item.created_at).format('LLLL').toLowerCase().includes(formattedQuery) || this._formatStatus(item.statut_dem).toLowerCase().includes(formattedQuery) || this.format_id(item.id).toLowerCase().includes(formattedQuery) || this.format_code(item.id, item.date_res).toLowerCase().includes(formattedQuery) || item.objet.toLowerCase().includes(formattedQuery)) {
        return true
      }
      return false
    })
    this.setState({ orderData, query: text })
  }

  _getData = () => {

    NetInfo.fetch().then(state => {

      AsyncStorage.getItem('token').then(value => {
        if (state.isConnected) {

          fetch(this.url + '/api/client/Liste_demande_modif', {
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

  _getView = (view) => {
    AsyncStorage.getItem('token').then(value => {

      fetch(this.url + '/api/liste_elements', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + value
        },
      })
        .then(response => response.json())
        .then(data => {
          this.props.navigation.navigate(view, {
            orderData: this.props.route.params.orderData,
            view: this.props.route.name,
            dataList: data
          })
        })
        .catch((error) => {
          console.error('Error:', error);
        });
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
        <ActivityIndicator size={hp(8)} color='#08CC' />
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
    //return str;
    var newdate = date.split('-')
    var annee = newdate[0].substr(2, 2)
    var mois = newdate[1]
    return 'AYLRES' + annee + mois + str
  }

  format_id = (id) => {
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

    return 'AYLDEM' + str
  }

  _formatStatus = (status) => {

    var str = ""

    if (status === 1) {
      str = "Validée"
    } else if (status === 0) {
      str = "En attente"
    } else if (status === 2) {
      str = "Annulée"
    }
    else {
      str = 'Indéfini'
    }

    return str
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
              <Text style={styles.messageText}>Aucune demande de modification</Text>
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
                  scrollsToTop={true}
                  disableScrollViewPanResponder={false}
                  showsVerticalScrollIndicator={false}
                  data={orderData}
                  refreshing={isLoading}
                  onRefresh={this._getData}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={[styles.listContainer, { backgroundColor: item.statut_dem === 1 ? '#009B77' : item.statut_dem === 2 ? 'red' : '#33A0D6' }]}>
                      <View style={styles.dateContainer}>
                        <Text style={styles.data}>{moment(item.created_at).format('LLLL')}</Text>
                        <View style={styles.status}>
                          <Text style={[styles.statusText, { color: item.statut_dem === 1 ? '#009B77' : item.statut_dem === 2 ? 'red' : '#33A0D6' }]}>{this._formatStatus(item.statut_dem)}</Text>
                        </View>
                      </View>
                      <View style={styles.title}>
                        <Text style={styles.titleText}>{this.format_id(item.id)}</Text>
                        <Text style={styles.titleText}>{this.format_code(item.id, item.date_res)}</Text>
                      </View>
                      <View style={styles.body}>
                        <Text style={styles.objetText}>{item.lib_motif}</Text>
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
    height: hp(6.5),
    marginBottom: 1
  },
  input: {
    marginLeft: wp(1.5),
    fontFamily: 'Raleway-Bold'
  },
  item: {
    height: hp(5.5),
  },
  listContainer: {
    backgroundColor: '#33A0D6',
    flex: 1,
    borderRadius: hp(1.5),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
    elevation: 10,
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
  },
  titleText: {
    fontSize: hp(2),
    color: 'white',
    fontFamily: 'Raleway-Bold',
    paddingBottom: hp(1),
  },
  data: {
    color: 'white',
    fontSize: hp(2),
    fontFamily: 'Raleway-Bold'
  },
  objetText: {
    color: 'black',
    fontSize: hp(2.5),
    fontFamily: 'Raleway-Bold',
    paddingVertical: hp(1),
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
    justifyContent: 'space-between'
  },
  body: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: hp(1.5),
    paddingHorizontal: wp(1),
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
    color: '#33A0D6',
    fontSize: hp(2.2),
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

export default DemandeModification