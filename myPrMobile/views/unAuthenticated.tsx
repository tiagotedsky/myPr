import React from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { Title, Caption, Button} from "react-native-paper";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";

// Global variables? 
const REMOTE_URL = '192.168.1.80';

export const UnAuthenticated = ({ setUserId }) => {
  
  const handleRedirect = async event => {
    const { queryParams: { id } } = Linking.parse(event.url);

    setUserId(id);
    WebBrowser.dismissBrowser();
  };

  const addLinkingListener = () => {
    Linking.addEventListener("url", handleRedirect);
  };

  const removeLinkingListener = () => {
    Linking.removeEventListener("url", handleRedirect);
  };

  const handleOAuthLogin = async () => {
    const redirectUrl = await Linking.getInitialURL();
    const authUrl = `https://${REMOTE_URL}:3003/login/github`;

    console.log("redirectUrl ----> ", redirectUrl);

    addLinkingListener();

    try {
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (err) {
      console.log("ERROR:", err);
    }
    removeLinkingListener();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Title>Welcome</Title>
        <Caption>Please login with your github account</Caption>
        <Button mode="outlined" onPress={() => handleOAuthLogin()}>
          Login with GitHub
        </Button>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 20
  }
});
