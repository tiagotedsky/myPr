import React from "react";
import { StyleSheet, View, SafeAreaView, Picker } from "react-native";
import { Title, Caption, Button, Avatar } from "react-native-paper";

export const PullRequestPending = ({
  userInfo,
  pullRequestsList,
}) => {
  return (
    <View style={styles.container}>
        <SafeAreaView>
          <View style={styles.header}>
            {userInfo.photos.length > 0 && (
              <Avatar.Image source={{ uri: userInfo.photos[0].value }} />
            )}
            <Title>Hello, {userInfo.displayName}</Title>
          </View>
          <View style={styles.repositoriesList}>
            <Caption>You have {pullRequestsList.length} pull requests to review</Caption>
          </View>
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
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  repositoriesList: {
    marginVertical: 30
  }
});
