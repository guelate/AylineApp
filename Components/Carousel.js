import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Carousel, { Pagination } from 'react-native-x2-carousel';

class VueCarousel extends React.Component {


    render() {

        const DATA = [
            { 
                text: '#1',
                source: require('../assets/APK_3.jpg')
            },
            { 
                text: 'COMMENT ÇA MARCHE',
                source: require('../assets/APK.png')
            },
            { 
                text: '#3',
                source: require('../assets/favicon.png')
             },
          ];

          const renderItem = data => (
            <View key={data.text} style={styles.item}>
              <Text>{data.text}</Text>
              <Image style={styles.frontImage} source={data.source}/>
            </View>
          );

        return(

            <View style={styles.container}>
        <Carousel
            pagination={Pagination}
            renderItem={renderItem}
            data={DATA}
        />
        </View>

        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    item: {
      width: 500,
      height: 500,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
    },
    frontImage: {
        height: 425,
        width: 380,
        flex: 1,
        resizeMode: 'contain',
    }
  });

export default VueCarousel