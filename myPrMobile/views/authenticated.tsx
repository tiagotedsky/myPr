import React from "react";
import { StyleSheet, View, SafeAreaView, Picker } from "react-native";
import { Title, Caption, Button, Avatar } from "react-native-paper";

// Global variables?
const REMOTE_URL = "192.168.1.80";

export const Authenticated = ({
  userInfo,
  repositoriesList,
  selectedRepoId,
  setSelectedRepoId,
  setPullRequestsList,
}) => {

  const selectRepository = async (repoId, repoOwner, repoName, userId) => {
    console.log("selectRepository");

    const body = JSON.stringify({
      repoId,
      userId,
      repoOwner,
      repoName
    });

    console.log("body ", body);
    try {
      const response = await fetch(`http://${REMOTE_URL}:3004/saveUserRepo`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body
      });
      const responseJson = await response.json();

      console.log("responseJson ", responseJson);

      setPullRequestsList(responseJson);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.logged}>
          <View style={styles.header}>
            {userInfo.photos && userInfo.photos.length > 0 && (
              <Avatar.Image source={{ uri: userInfo.photos[0].value }} />
            )}
            <Title>Hello, {userInfo.displayName}</Title>
            <Caption>Select the repository you want to be notified of</Caption>
          </View>
          <View style={styles.repositoriesList}>
            <Picker
              selectedValue={selectedRepoId}
              onValueChange={itemId => {
                console.log("itemId ", itemId);
                setSelectedRepoId(itemId);
              }}
            >
              {repositoriesList.map(repository => (
                <Picker.Item label={repository.name} value={repository.id} />
              ))}
            </Picker>
          </View>
          <Button
            mode="contained"
            icon="arrow-right-bold-circle"
            onPress={() => {
              const { owner, id, name } = repositoriesList.find(
                repo => repo.id === selectedRepoId
              );
              selectRepository(id, owner, name, userInfo.id);
            }}
          >
            Finish
          </Button>
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
  logged: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%"
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
