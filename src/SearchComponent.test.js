import React from "react";
import ReactDOM from "react-dom";
import { waitFor } from "@testing-library/react";

import SearchComponent, { API_USERS, API_REPO } from "./SearchComponent";

import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme, { mount } from "enzyme";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

Enzyme.configure({ adapter: new Adapter() });

const MOCKED_USERS = {
  total_count: 95088,
  incomplete_results: false,
  items: [
    {
      login: "ala",
      id: 166012,
      node_id: "MDQ6VXNlcjE2NjAxMg==",
      avatar_url: "https://avatars.githubusercontent.com/u/166012?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/ala",
      html_url: "https://github.com/ala",
      followers_url: "https://api.github.com/users/ala/followers",
      following_url: "https://api.github.com/users/ala/following{/other_user}",
      gists_url: "https://api.github.com/users/ala/gists{/gist_id}",
      starred_url: "https://api.github.com/users/ala/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/ala/subscriptions",
      organizations_url: "https://api.github.com/users/ala/orgs",
      repos_url: "https://api.github.com/users/ala/repos",
      events_url: "https://api.github.com/users/ala/events{/privacy}",
      received_events_url: "https://api.github.com/users/ala/received_events",
      type: "User",
      site_admin: false,
      score: 1.0,
    },
  ],
};
const MOCKED_REPOS = {
  total_count: 61372,
  incomplete_results: false,
  items: [
    {
      id: 22458259,
      node_id: "MDEwOlJlcG9zaXRvcnkyMjQ1ODI1OQ==",
      name: "Alamofire",
      full_name: "Alamofire/Alamofire",
      private: false,
      owner: {
        login: "Alamofire",
        id: 7774181,
        node_id: "MDEyOk9yZ2FuaXphdGlvbjc3NzQxODE=",
        avatar_url: "https://avatars.githubusercontent.com/u/7774181?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/Alamofire",
        html_url: "https://github.com/Alamofire",
        followers_url: "https://api.github.com/users/Alamofire/followers",
        following_url:
          "https://api.github.com/users/Alamofire/following{/other_user}",
        gists_url: "https://api.github.com/users/Alamofire/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/Alamofire/starred{/owner}{/repo}",
        subscriptions_url:
          "https://api.github.com/users/Alamofire/subscriptions",
        organizations_url: "https://api.github.com/users/Alamofire/orgs",
        repos_url: "https://api.github.com/users/Alamofire/repos",
        events_url: "https://api.github.com/users/Alamofire/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/Alamofire/received_events",
        type: "Organization",
        site_admin: false,
      },
    },
  ],
};

it("renders SearchComponent without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<SearchComponent />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("renders input className.inputField", () => {
  const wrapper = mount(<SearchComponent />);
  const count = wrapper.find("input.inputField").length;
  expect(count).toBe(1);
});

it("renders div className.listContainer", () => {
  const wrapper = mount(<SearchComponent />);
  const count = wrapper.find("div.listContainer").length;
  expect(count).toBe(1);
});

describe("fetchUsersAndRepos", () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe("when API call is successful", () => {
    it("should show users list", async () => {
      // given
      const searchText = "ala";
      mock
        .onGet(API_USERS + searchText)
        .reply(200, MOCKED_USERS)
        .onGet(API_REPO + searchText)
        .reply(200, MOCKED_REPOS);

      // when
      const wrapper = mount(<SearchComponent />);
      wrapper
        .find("input.inputField")
        .simulate("change", { target: { value: searchText } });

      // then
      expect(mock.history.get[0].url).toEqual(API_USERS + searchText);
      expect(mock.history.get[1].url).toEqual(API_REPO + searchText);

      await waitFor(() => {
        wrapper.update();
        const errorDivElement = wrapper.find("div.effects");
        expect(errorDivElement.length).toEqual(0);

        const liElements = wrapper.find("li.list");
        expect(liElements.length).toEqual(2);
      });
    });
  });

  it("should show loading indicator", async () => {
    // given
    const searchText = "ala";
    mock
      .onGet(API_USERS + searchText)
      .reply(200, MOCKED_USERS)
      .onGet(API_REPO + searchText)
      .reply(200, MOCKED_REPOS);

    // when
    const wrapper = mount(<SearchComponent />);
    wrapper
      .find("input.inputField")
      .simulate("change", { target: { value: searchText } });

    // then
    expect(mock.history.get[0].url).toEqual(API_USERS + searchText);
    expect(mock.history.get[1].url).toEqual(API_REPO + searchText);
    const loadingDivElement = wrapper.find("div.effects").first();

    expect(loadingDivElement.text()).toEqual(
      "LOADING..."
    );
});

  describe("when API call fails", () => {
    it("should show error message", async () => {
      // given
      const searchText = "ala";
      mock
        .onGet(API_USERS + searchText)
        .reply(400)
        .onGet(API_REPO + searchText)
        .reply(400);

      // when
      const wrapper = mount(<SearchComponent />);
      wrapper
        .find("input.inputField")
        .simulate("change", { target: { value: searchText } });

      // then
      expect(mock.history.get[0].url).toEqual(API_USERS + searchText);
      expect(mock.history.get[1].url).toEqual(API_REPO + searchText);
      await waitFor(() => {
        wrapper.update();
        const errorDivElement = wrapper.find("div.effects").first();

        expect(errorDivElement.text()).toEqual(
          "Sorry, something goes wrong. Try again."
        );
      });
    });
  });
});
