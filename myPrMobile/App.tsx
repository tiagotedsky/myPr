import React, { useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Linking } from 'expo';
import * as WebBrowser from 'expo-web-browser';

interface AuthResult {
  type?: string,
};

const handleRedirect = async event => {
  WebBrowser.dismissBrowser();
};

const addLinkingListener = () => {
  Linking.addEventListener('url', handleRedirect)
};
const removeLinkingListener = () => {
  Linking.removeEventListener('url', handleRedirect)
}

const App = () => {

  const [authResult, setAuthResults] = useState<AuthResult>({});
  
  const handleOAuthLogin = async (event) => {
    const redirectUrl = await Linking.getInitialURL();

    console.log('redirectUrl ----> ', redirectUrl);

    const authUrl = `https://192.168.1.69:3003/login/github`;
    console.log('authUrl ', authUrl);
    addLinkingListener();
  
    try {
      const authResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl)
        console.log('authResult', authResult);
        await setAuthResults(authResult)
       } catch (err) {
         console.log('ERROR:', err)
       }
    removeLinkingListener()
   }  

  return (
    <View style={styles.container}>
      {authResult.type && authResult.type === 'success' ? 
        (<Text>Hello there, user</Text>) 
        :
        (<>
          <Text>Hello world</Text>
          <Button title="Login with GitHub" onPress={handleOAuthLogin}/>
        </>)
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;