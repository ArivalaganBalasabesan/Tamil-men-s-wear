import React from 'react';
import { render } from '@testing-library/react-native';
import OutfitBuilderScreen from '../screens/OutfitBuilderScreen';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

describe('OutfitBuilderScreen', () => {
  it('renders the mix and match title correctly', () => {
    const store = mockStore({ auth: { user: { id: '1' } } });
    const { getByText } = render(
      <Provider store={store}>
        <OutfitBuilderScreen />
      </Provider>
    );

    expect(getByText('MIX & MATCH')).toBeTruthy();
    expect(getByText('ADD OUTFIT TO CART')).toBeTruthy();
  });
});
