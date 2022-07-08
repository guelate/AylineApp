import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Button, Text, View} from 'react-native';
import stripe from 'tipsi-stripe';
import AsyncStorage from '@react-native-community/async-storage';

/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow strict-local
*/

let url = 'https://ayline-services.fr'

const demoCardFormParameters = {
    // Only iOS support this options
    smsAutofillDisabled: true,
    requiredBillingAddressFields: 'full',
    prefilledInformation: {
      billingAddress: {
        name: 'Gunilla Haugeh',
        line1: 'Canary Place',
        line2: '3',
        city: 'Macon',
        state: 'Georgia',
        country: 'FR',
        postalCode: '31217',
        email: 'ghaugeh0@printfriendly.com',
      },
    },
  }

  const bankAccountParams = {
    // mandatory
    accountNumber: '000123456789',
    countryCode: 'us',
    currency: 'usd',
    // optional
    routingNumber: '110000000', // 9 digits
    accountHolderName: 'Test holder name',
    accountHolderType: 'company', // "company" or "individual"
  }

  
/* function componentDidMount() {
    

  AsyncStorage.getItem('token').then(value => {
    if (value !== null) {

  fetch(url + '/api/admin/add_customer', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": "Bearer " + value
    },
    body: JSON.stringify({
      nom: user_id,
      prenom: intitule,
      email: lien_notif,
    })

  })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
})

} */

const App = () => {
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState(null)

    stripe.setOptions({
        publishableKey: 'pk_test_q7dEl2aNXDSH2Ay5UVVJ5Ji9',
    })

    const handleCardPayPress = async () => {

        try {
            setLoading(true)
            const token = await stripe.paymentRequestWithCardForm(demoCardFormParameters)
            // const token = await stripe.createTokenWithBankAccount(bankAccountParams)
            console.log('Token from Card ', token)
            setToken(token)
            setLoading(false)
        } 
        catch (error) {
            console.log(' handleCardPayPress Error ', error)
            setLoading(false)
        }
    }

    return (
        
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>
                    Card Form Example
                </Text>
                <Text style={styles.instruction}>
                    Click button to show Card Form dialog.
                </Text>
                <Button
                    title="Enter your card and pay"
                    onPress={() => handleCardPayPress()}
                 />
                <View style={styles.token}>
                    {token &&
                    <Text style={styles.instruction}>
                        Token: {token.id}
                    </Text>
                    }
                </View>
        </SafeAreaView>
       
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instruction: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    token: {
        height: 20,
    },
});

export default App;