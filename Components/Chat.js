import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


export function Chat() {

    // console.log(navigation.route.params)
   auth()
  .signInWithEmailAndPassword('saddamneyssuh@gmail.com', '4k0ssy3mm4')
  .then(() => {
    console.log('User account created & signed in!');
  })
  .catch(error => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('That email address is already in use!');
    }

    if (error.code === 'auth/invalid-email') {
      console.log('That email address is invalid!');
    }

    console.error(error);
  });

  /* auth()
  .createUserWithEmailAndPassword('Ayline@gmail.com', '4k0ssy3mm4')
  .then(() => {
    console.log('User account created & signed in!');
    const update = {
        displayName: 'Alias',
        photoURL: 'https://my-cdn.com/assets/user/123.png',
      };
      
      auth().currentUser.updateProfile(update);
  })
  .catch(error => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('That email address is already in use!');
    }

    if (error.code === 'auth/invalid-email') {
      console.log('That email address is invalid!');
    }

    console.error(error);
  }); */

  const [messages, setMessages] = useState([]);

  /* useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
  }, []) */
  
  useLayoutEffect

  useLayoutEffect(() => {
     const unsubscribe = firestore().collection('chats').orderBy('createdAt', 'desc').onSnapshot(snapshot=>setMessages(

          snapshot.docs.map(doc=>({
            _id: doc.data()._id,
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate(),
            user: doc.data().user,
          }))

        ))

        return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    const {
        _id,
        text,
        createdAt,
        user,
      } = messages[0]
      firestore().collection('chats').add({
        _id,
        text,
        createdAt,
        user
      })
  }, [])

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      onSend={messages => onSend(messages)}
      user={{
        _id: auth().currentUser.email,
        name: auth().currentUser.displayName,
        avatar: auth().currentUser.photoURL
      }}
    />
  )
}