import React, { useState, useEffect } from "react";
import { UnAuthenticated } from './views/unAuthenticated';
import { Authenticated } from './views/authenticated';
import { PullRequestPending } from "./views/pullRequestPending";

const REMOTE_URL = '192.168.1.80';

const App = () => {
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [repositoriesList, setRepositoriesList] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [pullRequestsList, setPullRequestsList] = useState([]);

  const requestUserInformation = async id => {
    console.log("requestUserInformation");
    try {
      const response = await fetch(
        `http://${REMOTE_URL}:3004/getUserInfo/${id}`
      );
      const responseJson = await response.json();

      setUserInfo(responseJson);
    } catch (error) {
      console.log(error);
    }
  };

  const requestUserRepositoryList = async id => {
    console.log("requestUserInformation");

    try {
      const response = await fetch(
        `http://${REMOTE_URL}:3004/listUserRepos/${id}`
      );
      const responseJson = await response.json();
      setSelectedRepoId(responseJson[0].id);
      setRepositoriesList(responseJson);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserData = async (id) => {
    await requestUserInformation(userId);
    await requestUserRepositoryList(userId);
  }

  useEffect(() => {
    console.log('userId just changed', userId);

    if (userId !== null) {
      getUserData(userId);
    }

  }, [userId]);

  console.log("userId: ", userId);

  if (userId === null ) {
    return <UnAuthenticated setUserId={setUserId} />
  }

  if (userId !== null && pullRequestsList.length > 0) {
    return <PullRequestPending userInfo={userInfo} pullRequestsList={pullRequestsList} />;
  }

  return (
    <Authenticated 
      userInfo={userInfo}
      repositoriesList={repositoriesList}
      selectedRepoId={selectedRepoId}
      setSelectedRepoId={setSelectedRepoId}
      setPullRequestsList={setPullRequestsList}
    />
  )
};

export default App;
