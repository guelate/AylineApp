var stripe = Stripe(
    'pk_test_TYooMQauvdEDq54NiTphI7jx',
  ); // Publishable test API key obtained from the Stripe dashboard
  
  // Create an instance of Elements.
  var elements = stripe.elements();
  
  // Custom styling can be passed to options when creating an Element.
  // The below values are for demo purpose use your required style values.
  var style = {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  };
  
  // Create an instance of the card Element.
  // Card Number Input Element
  var cardNumber = elements.create('cardNumber', {style: style, showIcon: true});
  // Card Expiry Input Element
  var cardExpiry = elements.create('cardExpiry', {style: style});
  // Card CVV Input Element
  var cardCvc = elements.create('cardCvc', {style: style});
  
  // Add an instance of the card Element into the `card-element` <div>.
  // mount function will mount the stripe elements in the divs with following ids.
  cardNumber.mount('#card-element1');
  cardExpiry.mount('#card-element2');
  cardCvc.mount('#card-element3');
  
  // Handle real-time validation errors from the card Elements.
  cardNumber.on('change', function (event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
  
  cardExpiry.on('change', function (event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
  
  cardCvc.on('change', function (event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
  
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var displayError = document.getElementById('card-errors');
    var nameRegx = /^[a-zA-Z\s]*$/;
    //regex to allow only alphabet value in the card name input
    if (
      nameRegx.test(document.getElementById('CardHolerName').value) &&
      document.getElementById('CardHolerName').value.length > 0
    ) {
      window.postMessage('loading');
  
      /*Stripe Element's method to create payment method. In the official API docs, there is a way to create a payment method with API. That should not be followed in the live app.*/
  
      stripe.createPaymentMethod({
          type: 'card',
          card: cardNumber,
          billing_details: {
            name: document.getElementById('CardHolerName').value,
          },
        })
        .then((d) => {
          console.log(d);
          var displayError = document.getElementById('card-errors');
          if (d.error) {
            displayError.textContent = d.error.message;
            window.postMessage('error');
          } else {
            //On Success, we are sending the payment method id to app
            window.postMessage(`${d.paymentMethod.id}`);
          }
        })
        .catch((e) => {
          console.log(e);
          window.postMessage('error');
          var displayError = document.getElementById('card-errors');
          displayError.textContent = 'Some error occurred. Try again';
        });
    } else {
      displayError.textContent = 'Please enter the valid name';
    }
  });