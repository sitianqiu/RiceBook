import React, { useState, useEffect } from 'react';
import './Main.css';
import { getPosts, getUsers } from '../../services/mainService';

const MainPage = ({ loggedInUser }) => {
    const storedHeadline = localStorage.getItem('statusHeadline');
    const [statusHeadline, setStatusHeadline] = useState(storedHeadline || loggedInUser.company.catchPhrase);
    const [newStatusHeadline, setNewStatusHeadline] = useState('');
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState('');  
    const [newPostBody, setNewPostBody] = useState('');
    const [newPostImage, setNewPostImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [followedUsers, setFollowedUsers] = useState([]);
    const [newFollower, setNewFollower] = useState('');
    const [commentInputs, setCommentInputs] = useState({});

    useEffect(() => {
        const fetchPostsAndUsers = async () => {
            const postsResponse = await getPosts(); 
            const usersResponse = await getUsers();
            const profileImg = '/profile.jpeg'; 
            const postImg = '/cat.jpeg';
        
            const sortedPosts = postsResponse.sort((a, b) => new Date(b.timestamp || new Date()) - new Date(a.timestamp || new Date()));
            const isNewUser = !sortedPosts.some(post => post.userId === loggedInUser.id);
    
            if (isNewUser) {
                setPosts([]); 
            } else {
                const userPosts = sortedPosts.filter(post => post.userId === loggedInUser.id);
    
                const postsWithImagesAndUsers = userPosts.slice(0, 3).map(post => {
                    const user = usersResponse.find(user => user.id === post.userId);
                    return {
                        ...post,
                        image: postImg,
                        user: user || loggedInUser,
                        timestamp: post.timestamp || new Date().toLocaleString(),
                        comments: post.comments || []
                    };
                });
                const remainingPosts = userPosts.slice(3, 10).map(post => ({
                    ...post,
                    user: usersResponse.find(user => user.id === post.userId) || loggedInUser, 
                    timestamp: post.timestamp || new Date().toLocaleString(), 
                    comments: post.comments || []
                }));
    
                setPosts([...postsWithImagesAndUsers, ...remainingPosts]);
            }
    
            let followingUsers = [];
            if (loggedInUser.id === 9) {
                followingUsers = [
                    usersResponse.find(user => user.id === 10),
                    usersResponse.find(user => user.id === 1),
                    usersResponse.find(user => user.id === 2),
                ];
            } else if (loggedInUser.id === 10) {
                followingUsers = usersResponse.slice(0, 3); 
            } else if (loggedInUser.id === 8) {
                followingUsers = [
                    usersResponse.find(user => user.id === 9),
                    usersResponse.find(user => user.id === 10),
                    usersResponse.find(user => user.id === 1),
                ];
            } else {
                followingUsers = usersResponse.slice(loggedInUser.id, loggedInUser.id + 3);
            }

            const userIdsToFetchPosts = [loggedInUser.id, ...followingUsers.map(user => user.id)];
            const relevantPosts = postsResponse
                .filter(post => userIdsToFetchPosts.includes(post.userId))
                .map(post => ({
                    ...post,
                    user: usersResponse.find(user => user.id === post.userId) || loggedInUser,
                    image: postImg,
                    timestamp: post.timestamp || new Date().toLocaleString(), 
                    comments: post.comments || []
                }));

            setPosts(relevantPosts);
    
            const followedWithImages = followingUsers.map(user => ({
                ...user,
                profileImage: profileImg,
            }));
    
            setFollowedUsers(followedWithImages); 
        };
    
        fetchPostsAndUsers();
    }, [loggedInUser]);
        
    const handleAddFollower = async () => {
        if (newFollower) {
            try {
                const usersResponse = await getUsers(); 
                const postsResponse = await getPosts();
                const existingUser = usersResponse.find(user => user.username === newFollower);
    
                if (existingUser) {
                    const newFollowerObject = {
                        ...existingUser,
                        profileImage: existingUser.profileImage || '/profile.jpeg',
                    };
    
                    setFollowedUsers([...followedUsers, newFollowerObject]);
    
                    const followerPosts = postsResponse
                        .filter(post => post.userId === existingUser.id)
                        .map(post => ({
                            ...post,
                            user: existingUser,
                            image: '/cat.jpeg',
                            timestamp: post.timestamp || new Date().toLocaleString(),
                            comments: post.comments || []
                        }));
                    setPosts([...posts, ...followerPosts]);
    
                    setNewFollower('');
                } else {
                    alert(`User "${newFollower}" does not exist.`);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
    };
    

    const handleUnfollow = (userId) => {
        setFollowedUsers(followedUsers.filter(user => user.id !== userId));
        setPosts(posts.filter(post => post.userId !== userId));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPostImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handlePost = () => {
        if (newPostTitle && newPostBody) {
            const newArticle = {
                id: posts.length + 1,
                title: newPostTitle, 
                body: newPostBody,
                userId: loggedInUser?.id,
                image: previewImage,
                timestamp: new Date().toLocaleString(),
                comments: [],
            };
            setPosts([newArticle, ...posts]);
            setNewPostTitle('');  
            setNewPostBody(''); 
            setNewPostImage(''); 
            setPreviewImage(''); 
        } else {
            alert('Please fill in both the title and body of the post.');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.body.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (post.user && post.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );    

    const handleCancel = () => {
        setNewPostTitle(''); 
        setNewPostBody(''); 
        setNewPostImage('');  
        setPreviewImage('');
    };

    const handleUpdateStatus = () => {
        if (newStatusHeadline) {
            setStatusHeadline(newStatusHeadline);
            localStorage.setItem('statusHeadline', newStatusHeadline);
            setNewStatusHeadline('');
        } else {
            alert('Please enter a new status headline.');
        }
    };

    const handleCommentChange = (postId, value) => {
        setCommentInputs(prev => ({ ...prev, [postId]: value }));
    };
    
    const handleCommentSubmit = (postId) => {
        const comment = commentInputs[postId];
        if (comment) {
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: [...(post.comments || []), { author: loggedInUser.username, text: comment }],
                        }
                        : post
                )
            );
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        }
    };
    
    return (
        <div className="main-page">
            <div className="user-info">
                <img
                    src={'/profile.jpeg'} 
                    alt="Profile"
                    className="profile-picture"
                />
                <div className="user-details">
                    <h2>Welcome, {loggedInUser.username}</h2>
                    <div className="status-container">
                        <p className="status-headline">Status Headline: {statusHeadline}</p>
                        <div className="status-update">
                            <div className="status-input-container">
                                <input
                                    type="text"
                                    placeholder="Enter new status headline"
                                    value={newStatusHeadline}
                                    onChange={(e) => setNewStatusHeadline(e.target.value)} 
                                    className="status-input"
                                />
                            </div>
                            <div className="status-button-container">
                                <button className="status-button" onClick={handleUpdateStatus}>
                                    Update Status Headline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-area">
                <div className="sidebar">
                    <h3>Followed Users</h3>
                    <ul>
                        {followedUsers.map(user => (
                            <li key={`${user.id}-${user.username}`} className="sidebar-user"> {/* Use both id and username for a unique key */}
                                <img src={user.profileImage || '/profile.jpeg'} alt={user.name} className="sidebar-profile-img" />
                                <div className="sidebar-user-info">
                                    <strong className="sidebar-user-name">{user.name}</strong>
                                    <p className="sidebar-user-status">
                                        {user.company?.catchPhrase || 'No catch phrase available'}
                                    </p>
                                </div>
                                <button onClick={() => handleUnfollow(user.id)} className="sidebar-unfollow-button">Unfollow</button>
                            </li>
                        ))}
                    </ul>

                    <input
                        type="text"
                        placeholder="Add a follower"
                        value={newFollower}
                        onChange={(e) => setNewFollower(e.target.value)}
                    />
                    <button
                        onClick={handleAddFollower}
                        className={newFollower ? "add-follower-button active" : "add-follower-button"}
                    >
                        Add Follower
                    </button>
                </div>

                <div className="articles-section">
                    <div className="new-post-container">
                        <h3>Write a New Post</h3>
                        <input
                            type="text"
                            className="new-post-title"
                            placeholder="Enter the title of your article"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                        />
                        <textarea
                            className="new-post-textarea"
                            placeholder="Write the body of your article..."
                            value={newPostBody}
                            onChange={(e) => setNewPostBody(e.target.value)}
                        />
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}  
                            aria-label="Upload New Image"
                        />
                        {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
                        <div className="new-post-buttons">
                            <button className="post-button" onClick={handlePost}>Post</button>
                            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>

                    <h3>Articles</h3>
                    <input 
                        type="text" 
                        className="search-box"
                        placeholder="Search articles..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />

                    <div className="articles-feed">
                        {filteredPosts.map(post => (
                            <div key={post.id} className="article"> 
                                {post.image && <img src={post.image} alt="Post" />}
                                <div className="article-content">
                                    <div className="article-meta">
                                        <span className="article-author">
                                            {post.user ? post.user.name : loggedInUser.name}
                                        </span>
                                        <span className="article-timestamp">{post.timestamp}</span>
                                    </div>
                                    <h4>{post.title}</h4>
                                    <p>{post.body}</p>

                                    {/* Comments Section */}
                                    <div className="comments-section">
                                        {post.comments && post.comments.map((comment, index) => (
                                            <div key={`${post.id}-comment-${index}`} className="comment"> 
                                                <strong>{comment.author}</strong>: {comment.text}
                                            </div>
                                        ))}
                                        <div className="comment-input">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                            />
                                            <button
                                                className={`send-button ${commentInputs[post.id] ? 'active' : ''}`}
                                                onClick={() => handleCommentSubmit(post.id)}
                                                disabled={!commentInputs[post.id]}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Button */}
                                    <div className="article-buttons">
                                        <button className="edit-button">Edit</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
