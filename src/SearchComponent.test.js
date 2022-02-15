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
  total_count: 1,
  incomplete_results: false,
  items: [
    {
      login: "ala",
      id: 166012,
    },
  ],
};
const MOCKED_REPOS = {
  total_count: 1,
  incomplete_results: false,
  items: [
    {
      id: 22458259,
      name: "Alamofire",
      full_name: "Alamofire/Alamofire",
    },
  ],
};

function expectedUserQuery(text) { return API_USERS + text + " in:login" }
function expectedRepoQuery(text) { return API_REPO + text + " in:full_name" }

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
        .onGet(expectedUserQuery(searchText))
        .reply(200, MOCKED_USERS)
        .onGet(expectedRepoQuery(searchText))
        .reply(200, MOCKED_REPOS);

      // when
      const wrapper = mount(<SearchComponent />);
      wrapper
        .find("input.inputField")
        .simulate("change", { target: { value: searchText } });

      // then
      expect(mock.history.get[0].url).toEqual(expectedUserQuery(searchText));
      expect(mock.history.get[1].url).toEqual(expectedRepoQuery(searchText));

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
      .onGet(expectedUserQuery(searchText))
      .reply(200, MOCKED_USERS)
      .onGet(expectedRepoQuery(searchText))
      .reply(200, MOCKED_REPOS);

    // when
    const wrapper = mount(<SearchComponent />);
    wrapper
      .find("input.inputField")
      .simulate("change", { target: { value: searchText } });

    // then
    expect(mock.history.get[0].url).toEqual(expectedUserQuery(searchText));
    expect(mock.history.get[1].url).toEqual(expectedRepoQuery(searchText));

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
        .onGet(expectedUserQuery(searchText))
        .reply(400, MOCKED_USERS)
        .onGet(expectedRepoQuery(searchText))
        .reply(400, MOCKED_REPOS);

      // when
      const wrapper = mount(<SearchComponent />);
      wrapper
        .find("input.inputField")
        .simulate("change", { target: { value: searchText } });

      // then
      expect(mock.history.get[0].url).toEqual(expectedUserQuery(searchText));
      expect(mock.history.get[1].url).toEqual(expectedRepoQuery(searchText));

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
