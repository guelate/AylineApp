import AsyncStorage from '@react-native-community/async-storage'

AsyncStorage.getItem('token').then(value => {

  /* fetch('https://ayline-services.fr/api/admin/key_test', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      "Authorization": "Bearer " + value
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
    })
    .catch((error) => {
      console.error('Error:', error);
    }); */

   
})


var stripe = Stripe(
    'pk_test_TYooMQauvdEDq54NiTphI7jx',
  ); // Publishable test API key obtained from the Stripe dashboard
  
  // Create an instance of Elements.
  var elements = stripe.elements();
  var style = {
      base: {
          fontSize: "16px",
          "::placeholder": {
              color: "#aab7c4"
          }
      },
      invalid: {
          color: "#fa755a",
          iconColor: "#fa755a"
      }
  };

  var elementClasses = {
      focus: 'focus',
      empty: 'empty',
      invalid: 'invalid',
  };

  var cardNumber = elements.create('cardNumber', { style: style, classes: elementClasses, showIcon: true });
  var cardExpiry = elements.create('cardExpiry', { style: style, classes: elementClasses, });
  var cardCvc = elements.create('cardCvc', { style: style, classes: elementClasses, });

  cardNumber.mount('#cardNumber-element');
  cardExpiry.mount('#cardExpiry-element');
  cardCvc.mount('#cardCvc-element');

  cardNumber.addEventListener('change', ({ error }) => {
      const displayError = document.getElementById('card-errors');
      if (error) {
          displayError.textContent = error.message;
      } else {
          displayError.textContent = '';
      }
  });
  cardExpiry.addEventListener('change', ({ error }) => {
      const displayError = document.getElementById('card-errors');
      if (error) {
          displayError.textContent = error.message;
      } else {
          displayError.textContent = '';
      }
  });
  cardCvc.addEventListener('change', ({ error }) => {
      const displayError = document.getElementById('card-errors');
      if (error) {
          displayError.textContent = error.message;
      } else {
          displayError.textContent = '';
      }
  });