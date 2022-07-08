const API_TOKEN = 'ec36f033b28e0c89836366ad1ff1b28e';
const url = 'https://ayline-services.fr/';

export function getDataFromApi () {
    const url = 'https://ayline-services.fr/api/connexion'
    return fetch(url)
      .then((response) => response.json())
      .catch((error) => console.error(error))
  }

  export function getUserData(token) {
    fetch(url + '/api/user', {
        method: 'GET',
      headers:{
        Accept: 'application/json', 
        'Content-Type': 'application/json',
        "Authorization":"Bearer " + token
      },
    })
    .then(response => response.json())
    .catch((error) => {
    console.error('Error:', error);});
    }

    _getData = (view, link) => {

      AsyncStorage.getItem('token').then(value =>
          {

              fetch(this.url + link, {
                  method: 'GET',
                  headers:{
                  Accept: 'application/json', 
                  'Content-Type': 'application/json',
                  "Authorization":"Bearer " + value
                },
              })
              .then(response => response.json())
              .then(data => 
              {
                  console.log(data)
                  this.setState({orderData: data}, () => {
                  this.props.navigation.navigate(view, {orderData: this.state.orderData,
                  isLoading: false})
                  })
              })
              .catch((error) => {
              console.error('Error:', error);});
          })
  }