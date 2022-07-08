import React, { useState, useCallback, useEffect } from 'react';
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import 'dayjs/locale/fr'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from "@react-native-community/netinfo";
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export function Messagerie(props) {

  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const route = useRoute();


  const url = 'https://ayline-services.fr'

  console.log(isFocused)

  _getData = () => {

    NetInfo.fetch().then(state => {

      if (state.isConnected) {

        AsyncStorage.getItem('token').then(value => {

          fetch(url + '/api/user', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + value
            },
          })
            .then(response => response.json())
            .then(userData => {
              console.log('data:', userData)

              fetch(url + '/api/client/conversation', {
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

                  setIsConnected(state.isConnected)
                  setIsLoading(false)


                  let msgData = data.liste_message;
                  let message = []

                  if (msgData !== undefined) {

                    for (let i = 0; i < msgData.length; i++) {

                      message[i] = {

                        _id: i,
                        text: data.liste_message[i].message,
                        createdAt: data.liste_message[i].date_msg,
                        user: {
                          _id: data.liste_message[i].envoyeur_id === userData.id ? 'client' : 'services',
                          name: data.liste_message[i].envoyeur_id === userData.id ? userData.nom : 'Ayline Services',
                          avatar: require('../assets/chatLogo.png'),

                        },

                      }

                    }

                  }

                  console.log(message)

                  setMessages(message.reverse())

                })
                .catch((error) => {

                  console.error('Error:', error);

                });

            })
            .catch((error) => {
              console.error('Error:', error);
            });
        })
      }
      else {
        // ToastAndroid.show("Il semble que vous n'êtes pas connecté à Internet, nous ne trouvons aucun réseau", ToastAndroid.LONG);
        setIsConnected(false)
      }
    });
  }

  useEffect(() => {

    let ismonted = true

    NetInfo.fetch().then(state => {

      if (state.isConnected) {

        const timer = setInterval(() => {

          AsyncStorage.getItem('token').then(value => {

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

                console.log('nbr:', data)
                if (ismonted) {
                  setIsLoading(false)

                  if (data > 0) {
                    _getData()
                  }
                }


              })
              .catch((error) => {

                console.error('Error:', error);

              });
            }

          })

        }, 5000);

      }
      else {
        if (ismonted) {
          setIsConnected(false)
        }

      }

    });

    if (ismonted) {
      _getData()
    }

    return () => { isMounted = false };

  }, [])

  function _notConnected() {

    return (
      <View style={[styles.message, { paddingHorizontal: wp(2) }]}>
        <MaterialCommunityIcons name="wifi-off" size={hp(15)} color="#33A0D6" />
        <Text style={[styles.messageText, { color: 'black', fontSize: hp(2.5), marginTop: hp(5) }]}>Il semble que vous n'êtes pas connecté à Internet Nous ne trouvons aucun réseau</Text>
        <TouchableOpacity style={styles.retry} onPress={() => _getData()}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function _displayLoading() {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size={hp(6)} color='#08CC' />
      </View>
    )
  }

  const onSend = useCallback((messages = []) => {

    console.log('msg:', messages[0].text)
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))


    AsyncStorage.getItem('token').then(value => {

      fetch(url + "/api/client/client_send_message", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + value
        },
        body: JSON.stringify({

          message: messages[0].text,

        })
      }).then(response => response.json())
        .then(data => {
          console.log(data)

        })
        .catch((error) => {

          console.error('Error:', error);

        });
    })

  }, [])

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#33A0D6',
            width: wp(80)
          },
          left: {
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#33A0D6',
            width: wp(80)
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          },
          left: {
            color: '#33A0D6'
          }
        }}
      />
    )
  }

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons name="send-circle" style={{ marginBottom: hp(0.7), marginRight: wp(2) }} size={hp(3)} color="#33A0D6" />
        </View>
      </Send>
    )
  }

  const renderLoading = () => {
    return (
      <View style={styles.loading_container}>
        <ActivityIndicator size={hp(6)} color='#08CC' />
      </View>
    )
  }

  const scrollToBottomComponent = () => {
    return (
      <FontAwesome5 name={"angle-double-down"} solid size={hp(2)} color='#33A0D6' />
    )
  }


  return (
    <View style={styles.container}>

      {isConnected ? isLoading ?
        _displayLoading() : (<GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          showAvatarForEveryMessage
          scrollToBottom
          scrollToBottomComponent={scrollToBottomComponent}
          placeholder='Tapez votre message ici'
          renderAvatarOnTop
          locale='fr'
          user={{
            _id: 'client',
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          // renderLoading={renderLoading} 
          scrollToBottomStyle={{
            backgroundColor: '#fff'
          }

          }
        />) : _notConnected()}
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white'
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
  loading_container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },

});
