import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import LandingPage from './LandingPage';
import { getUsers } from '../../services/mainService';

jest.mock('../../services/mainService', () => ({
    getUsers: jest.fn(() => Promise.resolve([
      { id: 1, username: 'Bret', address: { street: 'Kulas Light' } },
    ])),
}));

// Mock navigate function for react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Authentication Validation', () => {
  let mockSetIsLoggedIn;
  let mockSetLoggedInUser;
  let mockUsers;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetIsLoggedIn = jest.fn();
    mockSetLoggedInUser = jest.fn();
    mockUsers = [
      { id: 1, username: 'Bret', address: { street: 'Kulas Light' } },
    ];
    getUsers.mockResolvedValue(mockUsers);
    window.alert = jest.fn();
  });

  const renderLandingPage = async () => {
    await act(async () => {
      render(
        <Router>
          <LandingPage
            logoutMessage=""
            setIsLoggedIn={mockSetIsLoggedIn}
            setLoggedInUser={mockSetLoggedInUser}
          />
        </Router>
      );
    });
  };

  test('should login JsonPlaceHolder user', async () => {
    await renderLandingPage();

    await waitFor(() => expect(getUsers).toHaveBeenCalled());

    // Populate login form with valid credentials
    fireEvent.change(screen.getByPlaceholderText('Enter account name'), { target: { value: 'Bret' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'Kulas Light' } });

    // Click the login button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // Assertions
    await waitFor(() => {
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(mockSetLoggedInUser).toHaveBeenCalledWith(mockUsers[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/main');
    });
  });

  test('should register a new user', async () => {
    await renderLandingPage();

    // Fill in registration form fields
    fireEvent.change(screen.getByPlaceholderText('Enter new account name'), { target: { value: 'newUser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email address'), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter phone number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Enter zip code'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Enter new password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'password123' } });

    // Submit registration form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Check that registration message is shown
    expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();

    // Simulate adding the new user to mockUsers for login
    mockUsers.push({
      id: 11,
      username: 'newUser',
      address: { street: 'password123' },
    });
    getUsers.mockResolvedValue(mockUsers); // Update the mock return value to include new user
  });

  test('should log in a previously registered user', async () => {
    // Manually add the new user for this test to make it independent
    mockUsers.push({
      id: 11,
      username: 'newUser',
      address: { street: 'password123' },
    });
    getUsers.mockResolvedValue(mockUsers); // Ensure getUsers has the updated user list

    await renderLandingPage();
    await waitFor(() => expect(getUsers).toHaveBeenCalled());

    // Populate fields with valid credentials for newUser
    fireEvent.change(screen.getByPlaceholderText('Enter account name'), { target: { value: 'newUser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'password123' } });

    // Click login
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // Check that login state is set
    await waitFor(() => {
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(mockSetLoggedInUser).toHaveBeenCalledWith(mockUsers[1]);
      expect(mockNavigate).toHaveBeenCalledWith('/main');
    });
  });

  test('should not log in an invalid user', async () => {
    await renderLandingPage();

    await waitFor(() => expect(getUsers).toHaveBeenCalled());

    // Populate fields with invalid credentials
    fireEvent.change(screen.getByPlaceholderText('Enter account name'), { target: { value: 'invalidUser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'wrongPassword' } });

    // Click login
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    expect(window.alert).toHaveBeenCalledWith('Account name does not exist. Please check your account name.');
    expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
    expect(mockSetLoggedInUser).not.toHaveBeenCalled();
  });

  test('should not log in a user with incorrect password', async () => {
    await renderLandingPage();

    await waitFor(() => expect(getUsers).toHaveBeenCalled());

    // Fill in the login form with the correct username but wrong password
    fireEvent.change(screen.getByPlaceholderText('Enter account name'), { target: { value: 'Bret' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'wrongPassword' } });

    // Click login
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    // Check that alert is called with the incorrect password message
    expect(window.alert).toHaveBeenCalledWith('Incorrect password. Please try again.');

    // Assert that login state is not set
    expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
    expect(mockSetLoggedInUser).not.toHaveBeenCalled();
  });
});
