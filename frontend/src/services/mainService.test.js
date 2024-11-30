import { getPosts, getUsers } from './mainService';

describe('mainService', () => {
    beforeEach(() => {
        global.fetch = jest.fn(); // Mock fetch globally
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear any previous mock data
    });

    describe('getPosts', () => {
        it('should return posts data when fetch is successful', async () => {
            const mockPosts = [
                { id: 1, title: 'Post 1', body: 'Content of Post 1' },
                { id: 2, title: 'Post 2', body: 'Content of Post 2' }
            ];

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockPosts,
            });

            const result = await getPosts();
            expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts');
            expect(result).toEqual(mockPosts);
        });

        it('should return an empty array when fetch fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
            });

            const result = await getPosts();
            expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts');
            expect(result).toEqual([]);
        });

        it('should return an empty array when there is a network error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await getPosts();
            expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts');
            expect(result).toEqual([]);
        });
    });

    describe('getUsers', () => {
        it('should return users data when fetch is successful', async () => {
            const mockUsers = [
                { id: 1, name: 'User 1', username: 'user1' },
                { id: 2, name: 'User 2', username: 'user2' }
            ];

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUsers,
            });

            const result = await getUsers();
            expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
            expect(result).toEqual(mockUsers);
        });

        it('should return an empty array when fetch fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
            });

            const result = await getUsers();
            expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
            expect(result).toEqual([]);
        });

        it('should return an empty array when there is a network error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await getUsers();
            expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
            expect(result).toEqual([]);
        });
    });
});
