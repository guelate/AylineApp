import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { email, web } from 'react-native-communications';
import t from 'tcomb-form-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from "@react-native-community/netinfo";

class VueAttestationsFiscales extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      year: { "year": "y0" },
      id: this.props.route.params.id,
      newYear: true
    }
    this.today = new Date();
    this.year = this.today.getFullYear() + 1
    this.form = React.createRef()
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

  onChange = (year) => {
    this.setState({ year });
  }

  displayYear = () => {
    let annee = []
    let compte = 0
    let json
    for (let i = 2020; i <= this.year; i++) {

      annee['y' + compte] = '' + i
      compte++

    }
    json = Object.assign({}, annee);
    return json
  }

  afficherAttestation = () => {
    let compte = 0
    for (let i = 2020; i <= this.year; i++) {

      if (this.state.year.year === 'y' + compte) {

        return (
          <TouchableOpacity style={styles.file} onPress={() => { web('https://ayline-services.fr/attestation_fiscale/' + this.state.id + '/' + i) }}>
            <MaterialCommunityIcons name="file-download" size={hp(4.5)} color="#33A0D6" />
            <Text style={styles.fileText}> Attestation Fiscale: {i}</Text>
          </TouchableOpacity>
        )
      }
      compte++
    }
  }

  render() {

    const { year, id, newYear } = this.state

    const Form = t.form.Form;

    const y = t.enums(this.displayYear())

    const fileYear = t.struct({
      year: t.maybe(y)
    });

    var ERROR_COLOR = "#a94442";
    var BORDER_COLOR = "#cccccc";
    var DISABLED_BACKGROUND_COLOR = "#eeeeee";
    var FONT_SIZE = 17;

    const formStyles = {
      ...Form.stylesheet,
      ccontrolLabel: {
        normal: {
          color: '#08CC',
          fontSize: hp(2.5),
          marginBottom: hp(1),
          fontWeight: 'bold'
        },
        error: {
          color: "#a94442",
          fontSize: hp(2.5),
          marginBottom: hp(1),
          fontWeight: "600"
        }
      },
      textbox: {
        normal: {
          color: "#000000",
          fontSize: hp(2.5),
          textAlign: 'center',
          textAlignVertical: 'top',
          height: hp(15),
          width: wp(80),
          paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: "#08CC",
          borderWidth: hp(0.4),
          marginTop: hp(1.5),
          backgroundColor: 'white',
          alignSelf: 'center',
          fontFamily: 'Raleway-Regular'
        },
        error: {
          color: "#000000",
          fontSize: hp(2.5),
          textAlignVertical: 'top',
          height: hp(15),
          width: wp(80),
          paddingVertical: Platform.OS === "ios" ? 7 : hp(2),
          paddingHorizontal: wp(3),
          borderRadius: hp(2.5),
          borderColor: "#a94442",
          borderWidth: hp(0.4),
          marginTop: hp(1.5),
          backgroundColor: 'white',
          alignSelf: 'center',
          fontFamily: 'Raleway-Regular'
        }
      },
      pickerContainer: {
        normal: {
          height: 20,
          marginTop: 5,
        },
        error: {
          height: 20,
          marginTop: 5,
        },
        open: {
          // Alter styles when select container is open
        }
      },
      select: {
        normal: Platform.select({
          android: {
            paddingLeft: 7,
            color: 'white',
          },
          ios: {}
        }),
        // the style applied when a validation error occours
        error: Platform.select({
          android: {
            paddingLeft: 7,
            color: ERROR_COLOR
          },
          ios: {}
        })
      },
      pickerTouchable: {
        normal: {
          height: 20,
          flexDirection: "row",
          alignItems: "center",
        },
        error: {
          height: 20,
          flexDirection: "row",
          alignItems: "center"
        },
        active: {
          borderBottomWidth: 1,
          borderColor: BORDER_COLOR
        },
        notEditable: {
          height: 20,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: DISABLED_BACKGROUND_COLOR
        }
      },
      pickerValue: {
        normal: {
          fontSize: FONT_SIZE,
          paddingLeft: 7,
          fontWeight: 'bold'
        },
        error: {
          fontSize: FONT_SIZE,
          paddingLeft: 7
        }
      },
    }

    const options = {
      auto: 'placeholders',
      fields: {
        year: {
          nullOption: { value: '', text: "Année" },
        },
      },
      stylesheet: formStyles,
    }

    console.log(this.displayYear())

    return (
      <View style={styles.container}>

        <View style={styles.selectContainer}>
          <Form
            ref={this.form}
            type={fileYear}
            value={this.state.year}
            onChange={() => this.onChange(this.form.current.getValue())}
            options={options}
          />
        </View>
        {this.afficherAttestation()}
      </View>
    )
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: wp(4)
  },
  file: {
    flexDirection: 'row',
    marginTop: hp(1.5),
    backgroundColor: 'white',
    borderWidth: hp(0.4),
    borderColor: '#33A0D6',
    borderRadius: hp(1.5),
    elevation: hp(1.5),
    marginBottom: hp(4),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(0.5)
  },
  fileText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: hp(2.5),
    color: '#33A0D6',
    fontFamily: 'Raleway-Bold',
    marginLeft: wp(2)
  },
  contactTouchable: {
    flexDirection: 'row',
    backgroundColor: '#33A0D6',
    height: hp(7),
    borderWidth: hp(0.2),
    borderColor: 'white',
    borderRadius: hp(1.5),
    elevation: hp(0.5),
    marginVertical: hp(1.5),
    marginHorizontal: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(0.5)
  },
  selectContainer: {
    backgroundColor: '#33A0D6',
    // borderWidth: hp(0.3),
    // borderColor: '#33A0D6',
    borderRadius: 8,
    width: wp(40),
    justifyContent: 'center',
    paddingHorizontal: wp(2.5),
    elevation: 5,
    marginTop: hp(1.5),
    alignSelf: 'center'
  },
})

export default VueAttestationsFiscales