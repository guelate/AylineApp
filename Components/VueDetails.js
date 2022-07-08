import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import numeral from 'numeral';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

class VueDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

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

  render() {

    const { date, hour, freq, amount, duree, price, name, surname, needs, discount, markup } = this.props.route.params

    return (
      <ScrollView style={styles.container}>
        <View style={styles.listContainer}>

          <View>
            <View style={styles.title}>
              <Text style={styles.titleText}>INTERVENANTE</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.bodyText}>Nom & prénom: <Text style={styles.data}>{name} {surname}</Text></Text>
              <Text style={styles.bodyText}>Qualification: <Text style={styles.data}>{needs}</Text></Text>
            </View>
          </View>

          <View>
            <View style={styles.title}>
              <Text style={styles.titleText}>INTERVENTION</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.bodyText}>Date: <Text style={styles.data}>{moment(date).format('LL')}</Text></Text>
              <Text style={styles.bodyText}>Fréquence: <Text style={styles.data}>{freq}</Text></Text>
              <Text style={styles.bodyText}>Heure: <Text style={styles.data}>{moment(date + ' ' + hour).format('LT')}</Text></Text>
            </View>
          </View>

          <View>
            <View style={styles.title}>
              <Text style={styles.titleText}>TARIF</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.bodyText}>Coût horaire: <Text style={styles.data}>{numeral(amount).format('0.00')} €</Text></Text>
              <Text style={styles.bodyText}>Durée: <Text style={styles.data}>{duree}</Text></Text>
              <Text style={styles.bodyText}>Coût de la prestation: <Text style={styles.data}>{numeral(price).format('0.00')} €</Text></Text>
            </View>
          </View>

          <View>
            <View style={styles.title}>
              <Text style={styles.titleText}>AUTRE</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.bodyText}>Remise: <Text style={styles.data}>{numeral(discount).format('0.00')} €</Text></Text>
              <Text style={styles.bodyText}>Majoration: <Text style={styles.data}>{numeral(markup).format('0.00')} €</Text></Text>
            </View>
          </View>

        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    backgroundColor: '#F7F7F7',
    borderColor: '#08CC',
    borderRadius: hp(1.5),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    marginVertical: hp(2.5),
    marginHorizontal: wp(3.5),
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
    fontSize: hp(3),
    color: '#08CC',
    fontFamily: 'Raleway-Bold'
  },
  data: {
    color: 'black',
    fontSize: hp(2.5),
    fontWeight: 'normal',
    fontFamily: 'Raleway-Regular'
  },
  dateContainer: {
    borderBottomWidth: 1,
    borderColor: '#08CC',
  },
  body: {
    paddingVertical: hp(2.5),
    borderColor: '#08CC',
  },
  bodyText: {
    fontSize: hp(2.5),
    color: '#08CC',
    fontFamily: 'Raleway-Bold',
    marginBottom: hp(0.5),
    paddingBottom: hp(1)
  },
})

export default VueDetails