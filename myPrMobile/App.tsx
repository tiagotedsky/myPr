import React, { useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";

interface AuthResult {
  type?: string;
}

const handleRedirect = async event => {
  console.log('Event ', event);
  WebBrowser.dismissBrowser();
};

const addLinkingListener = () => {
  Linking.addEventListener("url", handleRedirect);
};
const removeLinkingListener = () => {
  Linking.removeEventListener("url", handleRedirect);
};

const App = () => {
  const [authResult, setAuthResults] = useState<AuthResult>({});

  const handleOAuthLogin = async event => {
    const redirectUrl = await Linking.getInitialURL();
    const authUrl = `https://192.168.1.69:3003/login/github`;

    console.log("redirectUrl ----> ", redirectUrl);

    addLinkingListener();

    try {
      const authResult = await WebBrowser.openBrowserAsync(
        authUrl,
      );
      console.log("authResult", authResult);
      await setAuthResults(authResult);
    } catch (err) {
      console.log("ERROR:", err);
    }
    removeLinkingListener();
  };

  const handleRequest = async () => {
    try {
      const response = await fetch("http://192.168.1.69:3004/getUserName");
      const responseJson = await response.json();
      console.log(responseJson);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {authResult.type && authResult.type === "success" ? (
        <>
          <Text>Hello there, user</Text>
          <Button title="Get some info" onPress={handleRequest} />
        </>
      ) : (
        <>
          <Text>Login</Text>
          <Button title="Get some info" onPress={handleRequest} />
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
