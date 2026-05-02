import React from 'react';
import { render } from '@testing-library/react-native';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

describe('LoyaltyScreen', () => {
  it('renders the membership tiers correctly', () => {
    const store = mockStore({ 
      auth: { user: { name: 'Test User', loyaltyPoints: 500 } },
      theme: { isDark: true }
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <LoyaltyScreen />
      </Provider>
    );

    expect(getByText('ROYAL GENTLEMAN')).toBeTruthy();
    expect(getByText('Style Icon')).toBeTruthy();
  });

  it('displays the current points of the user', () => {
    const store = mockStore({ 
      auth: { user: { name: 'Test User', loyaltyPoints: 500 } },
      theme: { isDark: true }
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <LoyaltyScreen />
      </Provider>
    );

    expect(getByText('500')).toBeTruthy();
  });
});
