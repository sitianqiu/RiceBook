import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('redirects to landing page when accessing main page without logging in', () => {
  render(<App />); // Remove the BrowserRouter wrapper here

  const welcomeElement = screen.getByText(/Welcome Back!/i);
  expect(welcomeElement).toBeInTheDocument();
});
