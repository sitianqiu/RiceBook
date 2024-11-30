import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar Logout Functionality', () => {
  let mockSetIsLoggedIn;
  let mockSetLogoutMessage;

  beforeEach(() => {
    mockSetIsLoggedIn = jest.fn();
    mockSetLogoutMessage = jest.fn();
  });

  test('should call logout functions and navigate to home on logout', () => {
    render(
      <BrowserRouter>
        <Navbar 
          isLoggedIn={true} 
          setIsLoggedIn={mockSetIsLoggedIn} 
          setLogoutMessage={mockSetLogoutMessage} 
          displayName="Test User" 
        />
      </BrowserRouter>
    );

    // Find the logout button and click it
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Assertions
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
    expect(mockSetLogoutMessage).toHaveBeenCalledWith('You have successfully logged out.');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
