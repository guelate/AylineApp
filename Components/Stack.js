import 'react-native-gesture-handler';
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, Pressable, TouchableOpacity, ToastAndroid, ScrollView, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VuePrincipale from './VuePrincipale';
import VueConnexion from './VueConnexion';
import VueEspaceClient from "./VueEspaceClient";
import VueEspaceClient0 from './VueEspaceClient0';
import AffichageReservations from './AffichageReservations';
import NouvelleDemande from './NouvelleDemande';
import VueModification from './VueModification';
import VueAnnulation from './VueAnnulation';
import VueReservation from './VueReservation'
import { HeaderBackButton } from '@react-navigation/stack';
import Commande from './Commande';
import DemandeAnnulation from './DemandeAnnulation';
import DemandeModification from './DemandeModification';
import AsyncStorage from '@react-native-community/async-storage';
import StartScreen from './StartScreen';
import VuePrestationsPassees from './VuePrestationsPassees';
import VuePrestationsFutures from './VuePrestationsFutures';
import VuePrestationsAnnulees from './VuePrestationsAnnulees';
import VueDetails from './VueDetails';
import VueRecap from './VueRecap';
import FieldExample from './StripeTest';
import VueInscription from './VueInscription';
import modiForm from './modiForm';
import prestForm from './prestForm';
import AnnulForm from './AnnulForm';
import PaymentMethods from './PaymentMethods';
import Contact from './Contact';
import VueAttestationsFiscales from './VueAttestationsFiscales';
import VueServices from './VueServices';
import VueDeco from './VueDeco';
import VueInfoClient from './VueInfoClient';
import PastInvoiceView from './PastInvoiceView';
import VueFuturesFactures from './VueFuturesFactures';
import DemandeDeDevis from './DemandeDeDevis';
import App from './Stripe';
// import Messagerie from './Messagerie';  
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import t from 'tcomb-form-native';
import moment from 'moment';
import 'moment/locale/fr';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Chat } from './Chat';
import { Messagerie } from './Messagerie';
import { VueAttestationPAJE } from './VueAttestationPAJE';
import NetInfo from "@react-native-community/netinfo";

export function MyStack() {

  const [messages, setMessages] = useState(0);
  // const [userData, setUserData] = useState({});

  const url = 'https://ayline-services.fr';

  useEffect(() => {

    let ismonted = true

    NetInfo.fetch().then(state => {

      if (state.isConnected) {

        const timer = setInterval(() => {

      AsyncStorage.getItem('token').then(value => {

        // console.log(value)

        if (value !== null) {

          fetch(url + '/api/new_message', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + value
          },
        })
          .then(response => response.json())
          .then(data => {

            console.log('nbr0:', data)

            if (ismonted) {
              setMessages(data)
            }

          })
          .catch((error) => {

            console.error('Error:', error);

          });
        }
        
      })

    }, 5000);

  }

    });

    return () => { isMounted = false };

  }, [])

  function PrestationTabs() {

    const prestationTab = createMaterialTopTabNavigator();

    return (
      <prestationTab.Navigator
        tabBarOptions={{
          showIcon: true,
          activeTintColor: "white",
          inactiveTintColor: "#CCFFFF",
          pressColor: "white",
          pressOpacity: 0.5,
          showLabel: true,
          indicatorStyle: {
            backgroundColor: 'white'
          },
          //tabStyle: { marginTop: 80},
          style: {
            backgroundColor: '#33A0D6',
            //elevation: 10
            //marginTop: 20
          },
          labelStyle: {
            fontSize: hp(1.5),
            fontFamily: 'Raleway-Bold'
          },
          iconStyle: {
            width: 30,
            height: 30,
            borderColor: 'white'
          }
        }}>
        <prestationTab.Screen name="à venir" component={VuePrestationsFutures} options={{
          tabBarIcon: () => {
            return <Icon name="check" size={30} color="white" />
          }
        }} />
        <prestationTab.Screen name="Passées" component={VuePrestationsPassees} options={{
          tabBarIcon: () => {
            return <Icon name="history" size={30} color="white" />
          }
        }} />
        <prestationTab.Screen name="Annulées" component={VuePrestationsAnnulees} options={{
          tabBarIcon: () => {
            return <Icon name="remove" size={30} color="white" />
          }
        }} />
        <prestationTab.Screen name="Ajouter" component={prestForm} options={{
          tabBarIcon: () => {
            return <Icon name="plus" size={30} color="white" />
          }
        }} />
      </prestationTab.Navigator>
    );

  }

  function AylineBottomTabs({ route, navigation }) {

    const BottomTab = createBottomTabNavigator();

    return (
      <BottomTab.Navigator
        // lazy={false}
        tabBarOptions={{
          activeTintColor: '#33A0D6',
          inactiveTintColor: 'black',
          style: {
            height: hp(8.5),
            paddingTop: hp(1),
            paddingBottom: hp(1)
          },
          labelStyle: {
            marginTop: hp(0.5),
          }
          /* tabStyle: { 
            height: hp(1), 
            borderWidth: hp(0.3), 
            borderColor: 'blue'} */
        }}>
        <BottomTab.Screen name="Reserver" component={VueServices} initialParams={{ isConnected: true }} options={{
          tabBarIcon: ({ focused }) => {
            return (
              focused ?
                <Entypo name="bell" size={hp(4)} color="#33A0D6" />
                : <Entypo name="bell" size={hp(4)} color="black" />
            )
          }
        }} />
        <BottomTab.Screen name="Messages" component={Messagerie} options={{
          tabBarIcon: ({ focused }) => {
            return (
              focused ? messages > 0 ? <View>
                <View style={{
                  backgroundColor: '#33A0D6',
                  height: hp(1.5),
                  width: wp(3.5),
                  borderRadius: hp(15),
                  aligntitems: 'center',
                  justifyContent: 'center',
                  marginLeft: wp(5),
                  paddingBottom: hp(0.6),
                  paddingHorizontal: wp(0.2)
                }}>
                  <Text style={{ color: 'white', alignSelf: 'center', fontSize: hp(1), fontFamily: 'Raleway-Bold' }}> {messages} </Text></View>
                <MaterialCommunityIcons name="message-text" size={hp(4)} color="#33A0D6" />
              </View> : <MaterialCommunityIcons name="message-text" size={hp(4)} color="#33A0D6" /> :
                messages > 0 ? <View>
                  <View style={{
                    backgroundColor: '#33A0D6',
                    height: hp(1.5),
                    width: wp(3.5),
                    borderRadius: hp(15),
                    aligntitems: 'center',
                    justifyContent: 'center',
                    marginLeft: wp(5),
                    paddingBottom: hp(0.6),
                    paddingHorizontal: wp(0.2)
                  }}><Text style={{ color: 'white', alignSelf: 'center', fontSize: hp(1), fontFamily: 'Raleway-Bold' }}> {messages} </Text></View>
                  <MaterialCommunityIcons name="message-text" size={hp(4)} color="black" />
                </View> : <MaterialCommunityIcons name="message-text" size={hp(4)} color="black" />
            )
          }
        }} />
        <BottomTab.Screen name="Prestations" component={PrestationTabs} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <FontAwesome5 name={"calendar-day"} solid size={hp(3.5)} color="#33A0D6" /> : <FontAwesome5 name={"calendar-day"} solid size={hp(3.5)} color="black" />
          }
        }} />
        <BottomTab.Screen name="Menu" component={VueEspaceClient} initialParams={{
          value: route.params,
          isLogged: true
        }} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <MaterialCommunityIcons name="menu" size={hp(4)} color="#33A0D6" /> : <MaterialCommunityIcons name="menu" size={hp(4)} color="black" />
          }
        }} />
      </BottomTab.Navigator>
    );
  }

  function AylineBottomTabs0({ route, navigation }) {

    const BottomTab = createBottomTabNavigator();

    return (
      <BottomTab.Navigator tabBarOptions={{
        activeTintColor: '#33A0D6',
        inactiveTintColor: 'black',
        style: {
          height: hp(8.5),
          paddingTop: hp(1),
          paddingBottom: hp(1)
        },
        labelStyle: {
          marginTop: hp(0.5),
        }
        /* tabStyle: { 
          height: hp(1), 
          borderWidth: hp(0.3), 
          borderColor: 'blue'} */
      }} lazy={false}>
        <BottomTab.Screen name="Reserver" component={VueServices} initialParams={{
          value: route.params.value,
          isConnected: false,
          isLogged: false
        }} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <Entypo name="bell" size={hp(4)} color="#33A0D6" /> : <Entypo name="bell" size={hp(4)} color="black" />
          }
        }} />
        <BottomTab.Screen name="Messages" component={VueDeco} initialParams={{
          value: route.params.value,
          isLogged: false
        }} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <MaterialCommunityIcons name="message-text" size={hp(4)} color="#33A0D6" /> : <MaterialCommunityIcons name="message-text" size={hp(4)} color="black" />
          }
        }} />
        <BottomTab.Screen name="Prestations" component={VueDeco} initialParams={{
          value: route.params.value,
          isLogged: false
        }} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <FontAwesome5 name={"calendar-day"} solid size={hp(3.5)} color="#33A0D6" /> : <FontAwesome5 name={"calendar-day"} solid size={hp(3.5)} color="black" />
          }
        }} />
        <BottomTab.Screen name="Menu" component={VueDeco} initialParams={{
          value: route.params.value,
          isLogged: false
        }} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <MaterialCommunityIcons name="menu" size={hp(4)} color="#33A0D6" /> : <MaterialCommunityIcons name="menu" size={hp(4)} color="black" />
          }
        }} />
      </BottomTab.Navigator>
    );
  }

  function DocumentTabs({ route, navigation }) {

    const prestationTab = createMaterialTopTabNavigator();

    return (
      <prestationTab.Navigator
        tabBarOptions={{
          showIcon: true,
          activeTintColor: "white",
          inactiveTintColor: "#CCFFFF",
          pressColor: "white",
          pressOpacity: 0.5,
          showLabel: true,
          indicatorStyle: {
            backgroundColor: 'white'
          },
          //tabStyle: { marginTop: 80},
          style: {
            backgroundColor: '#33A0D6',
            //elevation: 10
            //marginTop: 20
          },
          labelStyle: {
            fontSize: hp(1.5),
            fontFamily: 'Raleway-Bold'
          },
          iconStyle: {
            width: 30,
            height: 30,
            borderColor: 'white'
          }
        }}>
        <prestationTab.Screen name="Demande Devis" component={DemandeDeDevis} options={{
          tabBarIcon: () => {
            return <FontAwesome5 name="file-invoice-dollar" size={30} color="white" />
          }
        }} />
        <prestationTab.Screen name="Attest. Fiscales" component={VueAttestationsFiscales} initialParams={{ id: route.params.id }} options={{
          tabBarIcon: () => {
            return <FontAwesome5 name={"file-alt"} solid size={30} color="white" />
          }
        }} />
        <prestationTab.Screen name="Attest. PAJE" component={VueAttestationPAJE} options={{
          tabBarIcon: () => {
            return <MaterialCommunityIcons name="clipboard-file" size={30} color="white" />
          }
        }} />
      </prestationTab.Navigator>
    );
  }

  function FacturesTabs({ route, navigation }) {

    const prestationTab = createMaterialTopTabNavigator();

    return (
      <prestationTab.Navigator
        tabBarOptions={{
          showIcon: true,
          activeTintColor: "#33A0D6",
          inactiveTintColor: "black",
          pressColor: "#33A0D6",
          pressOpacity: 0.5,
          showLabel: true,
          indicatorStyle: {
            backgroundColor: '#33A0D6'
          },
          //tabStyle: { marginTop: 80},
          style: {
            backgroundColor: 'white',
            //elevation: 10
            //marginTop: 20
          },
          labelStyle: {
            fontSize: hp(1.5),
            fontFamily: 'Raleway-Bold'
          },
          iconStyle: {
            width: 30,
            height: 30,
            borderColor: 'white'
          }
        }}>
        <prestationTab.Screen name="Factures Précédentes" component={PastInvoiceView} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <MaterialCommunityIcons name="file-clock" size={30} color="#33A0D6" /> : <MaterialCommunityIcons name="file-clock-outline" size={30} color="black" />
          }
        }} />
        <prestationTab.Screen name="Factures à venir" component={VueFuturesFactures} options={{
          tabBarIcon: ({ focused }) => {
            return focused ? <MaterialCommunityIcons name="file-check" size={30} color="#33A0D6" /> : <MaterialCommunityIcons name="file-check-outline" size={30} color="black" />
          }
        }} />
      </prestationTab.Navigator>
    );
  }

  function AylineStack() {

    const Stack = createStackNavigator();

    return (
      <Stack.Navigator initialRouteName={"Start"} >
        <Stack.Screen name="Start" component={StartScreen}
          options={{ headerShown: false }} />
        <Stack.Screen name="Acceuil" component={VuePrincipale}
          options={{ headerShown: false }} />
        <Stack.Screen name="CONNEXION" component={VueConnexion}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name="RESERVATION" component={VueReservation}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
          <Stack.Screen name="DEMANDE DE DEVIS" component={DemandeDeDevis}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name="ESPACE CLIENT" component={VueEspaceClient}
          options={{
            headerTintColor: '#33A0D6',
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerShown: false,
            headerStyle: {
              backgroundColor: 'white',
            },
          }} />
        <Stack.Screen name="CLIENT" component={VueEspaceClient0}
          options={{
            headerTintColor: '#33A0D6',
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerShown: false,
            headerStyle: {
              backgroundColor: 'white',
            },
          }} />
        <Stack.Screen name='MES RESERVATIONS' component={AffichageReservations}
          options={({ route, navigation }) => ({
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              //height: hp(10)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            },
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate("RESERVATION", { isConnected: true })}>
                <FontAwesome5 name={"calendar-plus"} solid size={hp(4)} color="white" />
              </TouchableOpacity>
            ),
            headerRightContainerStyle: {
              marginRight: wp(6)
            },
          })} />
        <Stack.Screen name='NOUVELLES COMMANDES' component={NouvelleDemande}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='MODIFICATION' component={VueModification}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='ANNULATION' component={VueAnnulation}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='COMMANDES EN COURS' component={Commande}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name="DEMANDE D'ANNULATION" component={DemandeAnnulation}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name="DEMANDE DE MODIFICATION" component={DemandeModification}
          options={{
            headerTitleAlign: 'center',
            headerTintColor: 'white',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='DÉTAILS PRESTATION' component={VueDetails}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='MODIFIER LA PRESTATION' component={modiForm}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='ANNULER LA PRESTATION' component={AnnulForm}
          options={{
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='RECAPITULATIF' component={VueRecap}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='INSCRIPTION' component={VueInscription}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='MES INFORMATIONS' component={VueInfoClient}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='MOYEN DE PAIEMENT' component={FieldExample}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='NOUS CONTACTER' component={Contact}
          options={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name='MES MOYENS DE PAIEMENT' component={PaymentMethods}
          options={({ route, navigation }) => ({
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            },
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('MOYEN DE PAIEMENT', {
                nom: route.params.nom,
                prenom: route.params.prenom,
                id: route.params.id,
                email: route.params.email,
                view: 'PaymentMethods'
              })}>
                <MaterialCommunityIcons name="credit-card-plus" size={hp(5)} color="black" style={{ marginTop: hp(0.2) }} />
              </TouchableOpacity>
            ),
            headerRightContainerStyle: {
              marginRight: wp(3)
            },
          })} />
        <Stack.Screen name="MES PRESTATIONS" component={PrestationTabs}
          options={{
            headerTitleAlign: 'center',
            headerTintColor: 'white',
            // headerShown: false,
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
              elevation: 0
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name="MES DOCUMENTS" component={DocumentTabs}
          options={{
            headerTitleAlign: 'center',
            headerTintColor: 'white',
            // headerShown: false,
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
              elevation: 0
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
        <Stack.Screen name="Ayline" component={AylineBottomTabs}
          options={{
            headerTintColor: 'white',
            headerShown: false,
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
              elevation: 0
            },
          }} />
        <Stack.Screen name="Ayline0" component={AylineBottomTabs0}
          options={{
            headerTintColor: 'white',
            headerShown: false,
            headerStyle: {
              backgroundColor: '#33A0D6',
              // height: hp(9),
              elevation: 0
            },
          }} />
        <Stack.Screen name='FACTURES' component={FacturesTabs}
          options={{
            headerTitleAlign: 'center',
            // headerShown: false,
            headerStyle: {
              backgroundColor: 'white',
              // height: hp(9)
            },
            headerTitleStyle: {
              fontFamily: 'Raleway-Bold',
              fontSize: hp(2)
            }
          }} />
      </Stack.Navigator>
    )
  }

  return (
    <NavigationContainer> 
      {AylineStack()}
    </NavigationContainer>
  )

}


