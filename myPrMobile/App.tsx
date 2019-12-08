import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Picker
} from 'react-native';
import { Linking } from 'expo';
import * as WebBrowser from 'expo-web-browser';
import { Button, Title, Avatar, Caption } from 'react-native-paper';

const App = () => {
  const [userInfo, setUserInfo] = useState({});
  const [repositoriesList, setRepositoriesList] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  const requestUserInformation = async id => {
    console.log('requestUserInformation');
    try {
      const response = await fetch(
        `http://192.168.1.69:3004/getUserInfo/${id}`
      );
      const responseJson = await response.json();

      setUserInfo(responseJson);
    } catch (error) {
      console.log(error);
    }
  };

  const requestUserRepositoryList = async id => {
    console.log('requestUserInformation');

    try {
      const response = await fetch(
        `http://192.168.1.69:3004/listUserRepos/${id}`
      );
      const responseJson = await response.json();
      setSelectedRepoId(responseJson[0].id);
      setRepositoriesList(responseJson);
    } catch (error) {
      console.log(error);
    }
  };

  const selectRepository = async (repoId, owner , userId) => {
    console.log('selectRepository');

    const body = JSON.stringify({
      repoId,
      userId,
      owner,
    });

    console.log('body ', body);
    try {
      const response = await fetch('http://192.168.1.69:3004/saveUserRepo', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body,
      });
      const responseJson = await response.json();
      
      console.log('responseJson ', responseJson);

    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = async event => {
    const { queryParams } = Linking.parse(event.url);

    await requestUserInformation(queryParams.id);
    await requestUserRepositoryList(queryParams.id);

    WebBrowser.dismissBrowser();
  };

  const addLinkingListener = () => {
    Linking.addEventListener('url', handleRedirect);
  };
  const removeLinkingListener = () => {
    Linking.removeEventListener('url', handleRedirect);
  };

  const handleOAuthLogin = async event => {
    const redirectUrl = await Linking.getInitialURL();
    const authUrl = `https://192.168.1.69:3003/login/github`;

    console.log('redirectUrl ----> ', redirectUrl);

    addLinkingListener();

    try {
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (err) {
      console.log('ERROR:', err);
    }
    removeLinkingListener();
  };

  console.log('repositoriesList: ', repositoriesList);

  return (
    <View style={styles.container}>
      {userInfo.id ? (
        <SafeAreaView>
          <View style={styles.logged}>
            <View style={styles.header}>
              {userInfo.photos.length > 0 && (
                <Avatar.Image source={{ uri: userInfo.photos[0].value }} />
                )}
              <Title>Hello, {userInfo.displayName}</Title>
              <Caption>Select the repository you want to be notified of</Caption>
            </View>
            <View style={styles.repositoriesList}>
              <Picker
                selectedValue={selectedRepoId}
                onValueChange={itemId => {
                  console.log('itemId ', itemId);
                  setSelectedRepoId(itemId);
                }}
              >
                {repositoriesList.map(repository => (
                  <Picker.Item label={repository.name} value={repository.id} />
                ))}
              </Picker>
            </View>
            <Button 
              mode='contained' 
              icon='arrow-right-bold-circle'
              onPress={() => {
                const { owner, id } = repositoriesList.find(repo => repo.id === selectedRepoId);
                selectRepository(id, owner, userInfo.id);
              }}
            >
              Finish
            </Button>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView>
          <Title>Welcome</Title>
          <Caption>Please login with your github account</Caption>
          <Button mode='outlined' onPress={handleOAuthLogin}>
            Login with GitHub
          </Button>

        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 20
  },
  logged: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',  
  }, 
  repositoriesList: {
    marginVertical: 30,
  }
});

export default App;
