import React, { useState } from "react";
import "./SearchComponent.css";

import axios from "axios";

export const API_USERS = "https://api.github.com/search/users?q=";
export const API_REPO = "https://api.github.com/search/repositories?q=";
const MAX_RECORDS = 50;

function prepareUserQuery(text) { return API_USERS + text+" in:login" }
function prepareRepoQuery(text) { return API_REPO + text+" in:full_name" }

const SearchComponent = () => {
  const [usersAndRepos, setUsersAndRepos] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const compareUerAndRepo = (a, b) => {
    const tmpA = a.value.toLowerCase();
    const tmpB = b.value.toLowerCase();
    if (tmpA === tmpB) return 0;
    if (tmpA > tmpB) return 1;
    if (tmpA < tmpB) return -1;
  };
  const prepareData = (responseUsers, responseRepo) => {
    const users = responseUsers.data.items.map((gitHubUser) => {
      return {
        id: gitHubUser.id,
        value: gitHubUser.login,
        type: "user",
      };
    });
    const repos = responseRepo.data.items.map((gitHubRepos) => {
      return {
        id: gitHubRepos.id,
        value: gitHubRepos.full_name,
        type: "repositories",
      };
    });
    const concatData = users.concat(repos);
    const sortConcatData = concatData.sort(compareUerAndRepo);
    const sortConcatDataLength = sortConcatData.length;
    if (sortConcatDataLength > MAX_RECORDS) {
      sortConcatData.splice(MAX_RECORDS, sortConcatDataLength);
    }
    setUsersAndRepos(sortConcatData);
    setLoading(false);
  };
  const fetchData = (text) => {
    const requestUsers = axios.get(prepareUserQuery(text));
    const requestRepo = axios.get(prepareRepoQuery(text));

    axios
      .all([requestUsers, requestRepo])
      .then(
        axios.spread((...responses) => {

          const responseUsers = responses[0];
          const responseRepo = responses[1];

          prepareData(responseUsers, responseRepo);
        })
      )
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };
  const onChangeInputHandler = (text) => {
    if (text.length >= 3) {
      setLoading(true);
      setError(false);
      fetchData(text);
    }
    setText(text);
  };
  const onBlurInputHandler = (text) => {
    setText(text);
    setUsersAndRepos([]);
  };
  return (
    <div className="container">
      <div className="formField">
        <label htmlFor="input search" className="formLabel">
          Search
          <input
            className="inputField"
            type="text"
            onChange={(e) => onChangeInputHandler(e.target.value)}
            value={text}
            onBlur={() => {
              setTimeout(() => {
                setUsersAndRepos([]);
              }, 100);
            }}
          />
        </label>
      </div>
      <div className="listContainer">
        {loading ? <div className="effects">LOADING...</div> : null}
        {error ? (
          <div className="effects">Sorry, something goes wrong. Try again.</div>
        ) : null}
        <ul className="ulField">
          {usersAndRepos &&
            usersAndRepos.map((suggestion) => (
              <li
                onClick={() => onBlurInputHandler(suggestion.value)}
                className="list"
                key={suggestion.id}
              >
                {suggestion.value}
                <div className="typeRecord">{suggestion.type}</div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchComponent;
