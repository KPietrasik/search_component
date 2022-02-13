import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme from "enzyme";


Enzyme.configure({ adapter: new Adapter() });

it('renders App without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
