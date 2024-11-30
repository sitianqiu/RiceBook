import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';

describe('ProfilePage Component', () => {
    const loggedInUser = {
        username: 'User1',
        email: 'user1@example.com',
        phone: '1234567890',
        address: { zipcode: '12345', street: 'Main Street' },
        profilePicture: '/profile.jpeg'
    };

    test("should display the logged-in user's profile username", () => {
        render(
            <MemoryRouter>
                <ProfilePage loggedInUser={loggedInUser} updateUser={() => {}} />
            </MemoryRouter>
        );

        expect(screen.getByText(`${loggedInUser.username}'s Profile`)).toBeInTheDocument();
    });
});
