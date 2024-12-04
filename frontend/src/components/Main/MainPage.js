import React, { useState, useEffect } from 'react';
import './Main.css';
import axios from 'axios';

const MainPage = ({ loggedInUser }) => {
    const [statusHeadline, setStatusHeadline] = useState('Default Headline');
    const [newStatusHeadline, setNewStatusHeadline] = useState('');
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState('');  
    const [newPostBody, setNewPostBody] = useState('');
    const [newPostImage, setNewPostImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [followedUsers, setFollowedUsers] = useState([]);
    const [newFollower, setNewFollower] = useState('');
    const [commentInputs, setCommentInputs] = useState({});
    const [message, setMessage] = useState('');
    const [editPostId, setEditPostId] = useState(null);
    const [editPostTitle, setEditPostTitle] = useState('');
    const [editPostBody, setEditPostBody] = useState('');
    const [editPreviewImage, setEditPreviewImage] = useState('');
    const [avatar, setAvatar] = useState(null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:3000/profile', { withCredentials: true });
                const { avatar } = response.data;
                setAvatar(avatar);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage('Failed to fetch profile data.');
            }
        };
    
        fetchProfile();
    }, []);
    
    // Fetch articles from backend
    useEffect(() => {
        const fetchArticles = async () => {
          try {
            const response = await axios.get('http://localhost:3000/following/articles', { withCredentials: true });
            const articles = response.data.articles || [];
            const followedUsers = response.data.followedUsers || [];
      
            // Fetch headlines for followed users
            const updatedFollowedUsers = await Promise.all(
              followedUsers.map(async (user) => {
                const headlineResponse = await axios.get(`http://localhost:3000/headline/${user.username}`, { withCredentials: true });
                return { ...user, headline: headlineResponse.data.headline || 'No headline available' };
              })
            );
      
            setPosts(articles);
            setFollowedUsers(updatedFollowedUsers);
          } catch (error) {
            console.error('Error fetching articles:', error);
          }
        };
      
        fetchArticles();
      }, []);
      

    // Handle creating a new article
    const handlePost = async () => {
        if (newPostTitle && newPostBody) {
          try {
            const formData = new FormData();
            formData.append('title', newPostTitle);
            formData.append('body', newPostBody);
            if (newPostImage) {
                formData.append('image', newPostImage);
            }

            const response = await axios.post('http://localhost:3000/article', formData, { 
                withCredentials: true, 
                headers: {
                    'Content-Type': 'multipart/form-data',
                }, 
            });
      
            setPosts(response.data.articles);
            setNewPostTitle('');
            setNewPostBody('');
            setNewPostImage('');
            setPreviewImage('');
          } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create the post. Please try again.');
          }
        } else {
          alert('Please fill in both the title and body of the post.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPostImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Handle updating an article
    const handleEditPost = async (articleId) => {
        const postToEdit = posts.find((post) => post.id === articleId);
        if (!postToEdit) return;

        try {
        const response = await axios.put(
            `http://localhost:3000/articles/${articleId}`,
            { text: postToEdit.text },
            { withCredentials: true }
        );

        setPosts((prevPosts) =>
            prevPosts.map((post) => (post.id === articleId ? response.data.articles[0] : post))
        );
        setEditPostId(null);
        } catch (error) {
        console.error('Error updating article:', error);
        }
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditPreviewImage(URL.createObjectURL(file));
        }
    };

    // Handle adding a comment
    const handleAddComment = async (articleId) => {
        const commentText = commentInputs[articleId];
        if (!commentText.trim()) {
            alert('Please enter comment text.');
            return;
        }
    
        try {
            const response = await axios.put(
                `http://localhost:3000/articles/${articleId}`,
                { text: commentText, commentId: -1 },        
                { withCredentials: true }
            );
    
            // Update the post's comments in the state
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === articleId
                        ? { ...post, comments: response.data.articles[0].comments } // Use updated comments from backend
                        : post
                )
            );
    
            // Clear the comment input
            setCommentInputs((prev) => ({ ...prev, [articleId]: '' }));
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add the comment. Please try again.');
        }
    };
    
    const handleAddFollower = async () => {
        if (newFollower) {
            try {
                const response = await axios.put(`http://localhost:3000/following/${newFollower}`, {}, { withCredentials: true });
                
                // Check and ensure response.data.following is an array
                const updatedFollowedUsers = Array.isArray(response.data.following) ? response.data.following : [];
                console.log('Updated followed users:', updatedFollowedUsers);
    
                // Fetch new user info and update the state
                const userResponse = await axios.get(`http://localhost:3000/profile/${newFollower}`, { withCredentials: true });
    
                setFollowedUsers([...updatedFollowedUsers, userResponse.data]);
                setPosts(response.data.articles); // Update posts with new follower's articles
                setNewFollower('');
            } catch (error) {
                console.error('Error adding follower:', error);
                alert('Failed to add follower. Please try again.');
            }
        } else {
            alert('Please enter a username to follow.');
        }
    };
    

    const handleUnfollow = async (username) => {
        try {
            const response = await axios.delete(`http://localhost:3000/following/${username}`, { withCredentials: true });
            setFollowedUsers(response.data.following);
            setPosts(response.data.articles);
        } catch (error) {
            console.error('Error unfollowing user:', error);
            alert('Failed to unfollow user. Please try again.');
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

    // Fetch headline on mount
    useEffect(() => {
        const fetchHeadline = async () => {
            try {
                const response = await axios.get('http://localhost:3000/headline', { withCredentials: true });
                const fetchedHeadline = response.data.headline || 'Default Headline';
                setStatusHeadline(fetchedHeadline);
            } catch (error) {
                console.error('Error fetching headline:', error);
                setMessage('Failed to fetch status headline. Using default headline.');
            }
        };

        fetchHeadline();
    }, []);

    const handleUpdateStatus = async () => {
        if (newStatusHeadline) {
            try {
                // Send the updated headline to the backend
                const response = await axios.put('http://localhost:3000/headline', 
                { headline: newStatusHeadline }, 
                { withCredentials: true });
                
                const updatedHeadline = response.data.headline;
                
                // Update the state with the new headline
                setStatusHeadline(updatedHeadline);
                setNewStatusHeadline('');
                setMessage('Status headline updated successfully!');
            } catch (error) {
                console.error('Error updating headline:', error);
                setMessage('Failed to update status headline. Please try again.');
            }
        } else {
            alert('Please enter a new status headline.');
        }
    };
    
    // Edit Post
    const handleEditButtonClick = (postId) => {
        const postToEdit = posts.find(post => post.id === postId);
        if (postToEdit) {
            setEditPostId(postId);
            setEditPostTitle(postToEdit.title);
            setEditPostBody(postToEdit.body);
        }
    };
    
    const handleSaveEdit = async () => {
        if (!editPostTitle.trim() || !editPostBody.trim()) {
            alert('Title and body cannot be empty.');
            return;
        }
    
        try {
            const response = await axios.put(
                `http://localhost:3000/articles/${editPostId}`,
                { title: editPostTitle, body: editPostBody },
                { withCredentials: true }
            );
    
            const updatedPost = response.data.articles[0];
            setPosts(prevPosts => prevPosts.map(post =>
                post.id === editPostId ? updatedPost : post
            ));
    
            // Reset edit mode
            setEditPostId(null);
            setEditPostTitle('');
            setEditPostBody('');
        } catch (error) {
            console.error('Error saving edited post:', error);
            alert('Failed to save the changes. Please try again.');
        }
    };
    
    const handleCancelEdit = () => {
        setEditPostId(null);
        setEditPostTitle('');
        setEditPostBody('');
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

     // Render loading state
     if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="main-page">
            <div className="user-info">
                <img
                    src={avatar ||'/profile.jpeg'} 
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
                        {followedUsers && followedUsers.map(user => (
                            <li key={user.username} className="sidebar-user">
                                <img src={user.avatar || '/profile.jpeg'} alt={user.username} className="sidebar-profile-img" />
                                <div className="sidebar-user-info">
                                    <strong className="sidebar-user-name">{user.username}</strong>
                                    <p className="sidebar-user-status">
                                        {user.headline}
                                    </p>
                                </div>
                                <button onClick={() => handleUnfollow(user.username)} className="sidebar-unfollow-button">Unfollow</button>
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
                                <div className="article-content">
                                    <div className="article-meta">
                                        <span className="article-author">
                                            {post.author}
                                        </span>
                                        <span className="article-timestamp">{new Date(post.date).toLocaleString()}</span>
                                    </div>
                                    {editPostId === post.id ? (
                                        <>
                                           <input
                                                type="text"
                                                value={editPostTitle}
                                                onChange={(e) => setEditPostTitle(e.target.value)}
                                                placeholder="Edit title"
                                                className="edit-post-title"
                                            />
                                            <textarea
                                                value={editPostBody}
                                                onChange={(e) => setEditPostBody(e.target.value)}
                                                placeholder="Edit body"
                                                className="edit-post-textarea"
                                            />
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleEditImageChange}  
                                                aria-label="Upload New Image"
                                            />
                                            {editPreviewImage && <img src={editPreviewImage} alt="Edit Preview" className="image-preview" />}
                                            <div className="edit-buttons">
                                                <button className="save-button" onClick={handleSaveEdit}>
                                                    Save
                                                </button>
                                                <button className="cancel-edit-button" onClick={handleCancelEdit}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h4>{post.title}</h4>
                                            <p>{post.body}</p>
                                            {post.image && <img src={post.image} alt="Post" />}
                                            <button className="edit-button" onClick={() => handleEditButtonClick(post.id)}>Edit</button>
                                        </>
                                    )}

                                    {/* Comments Section */}
                                    <div className="comments-section">
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.map((comment, index) => (
                                                <div key={`${post.id}-comment-${index}`} className="comment">
                                                    <div className="comment-content">
                                                        <strong>{comment.author}</strong>: {comment.text}
                                                    </div>
                                                    <div className="comment-timestamp">{new Date(comment.date).toLocaleString()}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-comments">No comments yet.</p>
                                        )}
                                        <div className="comment-input">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                            />
                                            <button
                                                className={`send-button ${commentInputs[post.id] ? 'active' : ''}`}
                                                onClick={() => handleAddComment(post.id)}
                                                disabled={!commentInputs[post.id]}
                                            >
                                                Send
                                            </button>
                                        </div>
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
