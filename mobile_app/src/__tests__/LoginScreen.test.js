import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

describe('LoginScreen', () => {
  it('renders the brand title correctly', () => {
    const store = mockStore({ auth: { user: null } });
    const { getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    expect(getByText('தமிழ்')).toBeTruthy();
    expect(getByText("MEN'S WEAR")).toBeTruthy();
  });

  it('renders sign in and register buttons', () => {
    const store = mockStore({ auth: { user: null } });
    const { getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    expect(getByText('SIGN IN')).toBeTruthy();
    expect(getByText('REGISTER')).toBeTruthy();
  });
});
