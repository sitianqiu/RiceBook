import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from './MainPage';
import { getPosts, getUsers } from '../../services/mainService';

jest.mock('../../services/mainService');
global.URL.createObjectURL = jest.fn(() => 'mocked-image-url');

describe('MainPage Component', () => {
    const loggedInUser = { id: 1, username: 'User1', company: { catchPhrase: 'Hello World!' } };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock the data returned from getPosts and getUsers
        getPosts.mockResolvedValue([
            { id: 1, userId: 1, title: 'User Post 1', body: 'Content of User Post one', timestamp: new Date().toString() },
            { id: 2, userId: 2, title: 'Follower Post 1', body: 'Content of Follower Post one', timestamp: new Date().toString() },
            { id: 3, userId: 3, title: 'Follower Post 2', body: 'Content of Follower Post two', timestamp: new Date().toString() }
        ]);
        getUsers.mockResolvedValue([
            { id: 1, name: 'User1', company: { catchPhrase: 'Hello World!' } },
            { id: 2, name: 'Follower1', company: { catchPhrase: 'Follower Company 1' } },
            { id: 3, name: 'Follower2', company: { catchPhrase: 'Follower Company 2' } }
        ]);
    });

    test('should fetch all articles for the current logged-in user and their followers', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        await waitFor(() => {
            expect(getPosts).toHaveBeenCalled();
            expect(getUsers).toHaveBeenCalled();
        });

        expect(screen.getByText('User Post 1')).toBeInTheDocument();
        expect(screen.getByText('Follower Post 1')).toBeInTheDocument();
        expect(screen.getByText('Follower Post 2')).toBeInTheDocument();
    });

    test('should add articles when adding a follower', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        fireEvent.change(screen.getByPlaceholderText('Add a follower'), { target: { value: 'New Follower' } });
        fireEvent.click(screen.getByRole('button', { name: /add follower/i }));

        await waitFor(() => {
            expect(screen.getByText('Follower Company 1')).toBeInTheDocument();
        });
    });

    test('should remove articles when unfollowing a user', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        expect(screen.getAllByText('Unfollow').length).toBeGreaterThan(0);

        const unfollowButton = screen.getAllByText('Unfollow')[0];
        fireEvent.click(unfollowButton);

        await waitFor(() => expect(screen.queryByText('Follower Post 1')).not.toBeInTheDocument());
    });

    test('should filter posts based on search term', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });
    
        // Set the search term to filter posts with the term "User"
        fireEvent.change(screen.getByPlaceholderText('Search articles...'), { target: { value: 'User' } });
    
        // Wait for filtering to take effect and assert the filtered results
        await waitFor(() => {
            expect(screen.getByText('User Post 1')).toBeInTheDocument();
            expect(screen.queryByText('Follower Post 1')).not.toBeInTheDocument();
            expect(screen.queryByText('Follower Post 2')).not.toBeInTheDocument();
        });
    
        // Now change the search term to filter posts with "Follower"
        fireEvent.change(screen.getByPlaceholderText('Search articles...'), { target: { value: 'Follower' } });
    
        // Check that only posts with "Follower" in title, body, or username are displayed
        await waitFor(() => {
            expect(screen.getByText('Follower Post 1')).toBeInTheDocument();
            expect(screen.getByText('Follower Post 2')).toBeInTheDocument();
            expect(screen.queryByText('User Post 1')).not.toBeInTheDocument();
        });
    });

    test('should update status headline', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        fireEvent.change(screen.getByPlaceholderText('Enter new status headline'), { target: { value: 'New Headline' } });
        fireEvent.click(screen.getByText('Update Status Headline'));

        await waitFor(() => {
            expect(screen.getByText('Status Headline: New Headline')).toBeInTheDocument();
        });
    });

    test('should create a new post with title and body', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        fireEvent.change(screen.getByPlaceholderText('Enter the title of your article'), { target: { value: 'New Post Title' } });
        fireEvent.change(screen.getByPlaceholderText('Write the body of your article...'), { target: { value: 'New Post Body' } });
        fireEvent.click(screen.getByText('Post'));

        await waitFor(() => {
            expect(screen.getByText('New Post Title')).toBeInTheDocument();
            expect(screen.getByText('New Post Body')).toBeInTheDocument();
        });
    });   
    
    test('should clear new post fields when cancel is clicked', async () => {
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        fireEvent.change(screen.getByPlaceholderText('Enter the title of your article'), { target: { value: 'Temporary Title' } });
        fireEvent.change(screen.getByPlaceholderText('Write the body of your article...'), { target: { value: 'Temporary Body' } });
        fireEvent.click(screen.getByText('Cancel'));

        expect(screen.getByPlaceholderText('Enter the title of your article')).toHaveValue('');
        expect(screen.getByPlaceholderText('Write the body of your article...')).toHaveValue('');
    });

    // Test if `isNewUser` is true (loggedInUser has no posts)
    test('should set posts to empty if loggedInUser has no posts', async () => {
        getPosts.mockResolvedValue([
            { id: 2, userId: 2, title: 'Follower Post 1', body: 'Content of Follower Post 1' },
            { id: 3, userId: 3, title: 'Follower Post 2', body: 'Content of Follower Post 2' }
        ]);

        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        expect(screen.queryByText('User Post 1')).not.toBeInTheDocument();
        expect(screen.getByText('Follower Post 1')).toBeInTheDocument();
        expect(screen.getByText('Follower Post 2')).toBeInTheDocument();
    });

    // Test empty response for `getPosts`
    test('should handle empty posts response gracefully', async () => {
        getPosts.mockResolvedValue([]);
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        await waitFor(() => {
            expect(screen.queryByText('User Post 1')).not.toBeInTheDocument();
        });
    });

    // Test empty response for `getUsers`
    test('should handle empty users response gracefully', async () => {
        getUsers.mockResolvedValue([]);
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });

        await waitFor(() => {
            expect(screen.queryByText('Follower1')).not.toBeInTheDocument();
        });
    });

    test('should not add a follower if newFollower input is empty', async () => {
        render(<MainPage loggedInUser={loggedInUser} />);

        fireEvent.change(screen.getByPlaceholderText('Add a follower'), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /add follower/i }));
        
        await waitFor(() => {
            expect(screen.queryByText('My Company is the best!')).not.toBeInTheDocument();
        });
    });

    test('should remove the last followed user correctly', async () => {
        getPosts.mockResolvedValue([]);
        getUsers.mockResolvedValue([
            { id: 1, name: 'User1', company: { catchPhrase: 'Hello World!' } },
            { id: 2, name: 'Follower1', company: { catchPhrase: 'Follower Company 1' } }
        ]);

        render(<MainPage loggedInUser={loggedInUser} />);

        await waitFor(() => {
            expect(screen.getAllByText('Unfollow').length).toBeGreaterThan(0);
        });

        // Click the "Unfollow" button for the only follower in the list
        const unfollowButton = screen.getAllByText('Unfollow')[0];
        fireEvent.click(unfollowButton);

        await waitFor(() => {
            expect(screen.queryByText('Follower1')).not.toBeInTheDocument();
        });
    });

    
    test('should not create a post if title or body is missing', async () => {
        window.alert = jest.fn();
        render(<MainPage loggedInUser={loggedInUser} />);
    
        fireEvent.change(screen.getByPlaceholderText('Enter the title of your article'), { target: { value: 'Incomplete Post' } });
        fireEvent.click(screen.getByText('Post'));
    
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in both the title and body of the post.');
        });
    
        window.alert.mockClear();
    
        fireEvent.change(screen.getByPlaceholderText('Enter the title of your article'), { target: { value: '' } });
        fireEvent.change(screen.getByPlaceholderText('Write the body of your article...'), { target: { value: 'Body Only' } });
        fireEvent.click(screen.getByText('Post'));
    
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in both the title and body of the post.');
        });

        window.alert.mockRestore();
    });
    
    
    test('should not update status headline if input is empty', async () => {
        render(<MainPage loggedInUser={loggedInUser} />);
        
        // Ensure newStatusHeadline input is empty
        fireEvent.change(screen.getByPlaceholderText('Enter new status headline'), { target: { value: '' } });
        fireEvent.click(screen.getByText('Update Status Headline'));
    
        // Expect an alert
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please enter a new status headline.');
        });
    });

    test('should assign followingUsers correctly based on loggedInUser ID', async () => {
        const mockUsersResponse = [
            { id: 1, name: 'User1', company: { catchPhrase: 'CatchPhrase 1' } },
            { id: 2, name: 'User2', company: { catchPhrase: 'CatchPhrase 2' } },
            { id: 9, name: 'User9', company: { catchPhrase: 'CatchPhrase 9' } },
            { id: 10, name: 'User10', company: { catchPhrase: 'CatchPhrase 10' } },
        ];
    
        getUsers.mockResolvedValue(mockUsersResponse);
        getPosts.mockResolvedValue([]); // Empty posts to focus on user following logic
    
        const renderWithUserId = async (userId) => {
            const loggedInUser = { id: userId, username: `User${userId}`, company: { catchPhrase: 'Hello World!' } };
            await act(async () => {
                render(<MainPage loggedInUser={loggedInUser} />);
            });
        };
    
        // Test case for loggedInUser.id === 9
        await renderWithUserId(9);
        await waitFor(() => {
            expect(screen.getAllByText('User10').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User1').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User2').length).toBeGreaterThan(0);
        });
    
        // Test case for loggedInUser.id === 10
        await renderWithUserId(10);
        await waitFor(() => {
            expect(screen.getAllByText('User1').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User2').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User9').length).toBeGreaterThan(0);
        });
    
        // Test case for loggedInUser.id === 8
        await renderWithUserId(8);
        await waitFor(() => {
            expect(screen.getAllByText('User9').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User10').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User1').length).toBeGreaterThan(0);
        });
    
        // Test case for other user IDs (e.g., loggedInUser.id === 1)
        await renderWithUserId(1);
        await waitFor(() => {
            expect(screen.getAllByText('User2').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User9').length).toBeGreaterThan(0);
            expect(screen.getAllByText('User10').length).toBeGreaterThan(0);
        });
    });    

    test('should add new follower and display their posts on the main page', async () => {
        getUsers.mockResolvedValue([
            { id: 1, username: 'User1', name: 'User One', company: { catchPhrase: 'Hello World!' } },
            { id: 2, username: 'FollowerUser', name: 'Follower User', company: { catchPhrase: 'Follower Catchphrase' }, profileImage: null }
        ]);
        
        getPosts.mockResolvedValueOnce([
            { id: 1, userId: 1, title: 'User Post 1', body: 'Content of User Post 1', timestamp: new Date().toString() }
        ]);
    
        // Initial render with only User1's post
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });
    
        expect(screen.getByText('User Post 1')).toBeInTheDocument();
        expect(screen.queryByText('FollowerUser Post')).not.toBeInTheDocument();
    
        // Mock getPosts again to include FollowerUser's posts after they are added as a follower
        getPosts.mockResolvedValue([
            { id: 1, userId: 1, title: 'User Post 1', body: 'Content of User Post 1', timestamp: new Date().toString() },
            { id: 2, userId: 2, title: 'FollowerUser Post', body: 'Content of FollowerUser Post', timestamp: new Date().toString() }
        ]);
    
        // Simulate adding the follower 'FollowerUser'
        fireEvent.change(screen.getByPlaceholderText('Add a follower'), { target: { value: 'FollowerUser' } });
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /add follower/i }));
        });
    
        // Verify the follower appears in the sidebar
        const sidebarUsers = screen.getAllByText('Follower User', { exact: false });
        expect(sidebarUsers.length).toBeGreaterThan(0);
    
        // Verify FollowerUser's post appears in the articles section
        await waitFor(() => {
            expect(screen.getByText('FollowerUser Post')).toBeInTheDocument();
        });
    });    
    
    test('should show an alert if the follower does not exist', async () => {
        getUsers.mockResolvedValue([{ id: 1, username: 'User1', name: 'User One' }]);
    
        // Render the MainPage component
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });
    
        // Attempt to add a non-existent follower
        fireEvent.change(screen.getByPlaceholderText('Add a follower'), { target: { value: 'NonExistentUser' } });
        window.alert = jest.fn(); // Mock the alert function
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /add follower/i }));
        });

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('User "NonExistentUser" does not exist.');
        });
    });    

    test('should add a comment to a post and display it', async () => {
        // Render the MainPage component with the logged-in user
        const { container } = render(<MainPage loggedInUser={loggedInUser} />);
    
        // Wait for the comment input field to be in the document
        await waitFor(() => {
            const commentInput = container.querySelector('input[placeholder="Add a comment..."]');
            expect(commentInput).toBeInTheDocument();
        });
    
        const commentInput = container.querySelectorAll('input[placeholder="Add a comment..."]')[0];
        const sendButton = container.querySelectorAll('button.send-button')[0];
    
        fireEvent.change(commentInput, { target: { value: 'This is a test comment' } });
    
        fireEvent.click(sendButton);
    
        await waitFor(() => {
            expect(container.textContent).toContain('This is a test comment');
        });
    }); 

    test('should update and persist status headline in localStorage', async () => {
        localStorage.clear();
    
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });
    
        expect(screen.getByText('Status Headline: Hello World!')).toBeInTheDocument();
    
        const newHeadline = 'Persistent Headline';
        fireEvent.change(screen.getByPlaceholderText('Enter new status headline'), { target: { value: newHeadline } });
        fireEvent.click(screen.getByText('Update Status Headline'));
    
        await waitFor(() => {
            expect(screen.getAllByText(`Status Headline: ${newHeadline}`)[0]).toBeInTheDocument();
        });
    
        expect(localStorage.getItem('statusHeadline')).toBe(newHeadline);
    
        await act(async () => {
            render(<MainPage loggedInUser={loggedInUser} />);
        });
    
        await waitFor(() => {
            expect(screen.getAllByText(`Status Headline: ${newHeadline}`)[0]).toBeInTheDocument();
        });
    });    
});