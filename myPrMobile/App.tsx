import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";

interface AuthResult {
  type?: string;
}

const App = () => {
  const [authResult, setAuthResults] = useState<AuthResult>({});
  const [userInfo, setUserInfo] = useState({});

  const requestUserInformation = async id => {
    console.log("id ", id);

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

  const handleRedirect = async event => {
    const { queryParams } = Linking.parse(event.url);

    await requestUserInformation(queryParams.id);

    WebBrowser.dismissBrowser();
  };

  const addLinkingListener = () => {
    Linking.addEventListener("url", handleRedirect);
  };
  const removeLinkingListener = () => {
    Linking.removeEventListener("url", handleRedirect);
  };

  const handleOAuthLogin = async event => {
    const redirectUrl = await Linking.getInitialURL();
    const authUrl = `https://192.168.1.69:3003/login/github`;

    console.log("redirectUrl ----> ", redirectUrl);

    addLinkingListener();

    try {
      const authResult = await WebBrowser.openBrowserAsync(authUrl);
      console.log("authResult --->", authResult);
      await setAuthResults(authResult);
    } catch (err) {
      console.log("ERROR:", err);
    }
    removeLinkingListener();
  };

  return (
    <View style={styles.container}>
      {userInfo.id ? (
        <>
          {userInfo.photos.length > 0 && (
            <Image
              style={{ width: 50, height: 50 }}
              source={{uri: userInfo.photos[0].value}}
            />
          )}
          <Text>Hello there, {userInfo.displayName}</Text>
        </>
      ) : (
        <>
          <Text>Login</Text>
          <Button title="Login with GitHub" onPress={handleOAuthLogin} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default App;
