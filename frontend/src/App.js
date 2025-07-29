import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

export default function App() {
    const [view, setView] = useState('login');
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            setView('dashboard');
        } else {
            setView('login');
        }
    }, [token]);

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setView('login');
    };

    const renderView = () => {
        switch (view) {
            case 'register':
                return <Register setView={setView} />;
            case 'dashboard':
                return <Dashboard token={token} handleLogout={handleLogout} />;
            case 'login':
            default:
                return <Login onLoginSuccess={handleLoginSuccess} setView={setView} />;
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <div className="container py-4 py-md-5">
                {renderView()}
            </div>
        </div>
    );
}

function Login({ onLoginSuccess, setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            onLoginSuccess(res.data.token);
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="card p-4 p-md-5 shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
            <h2 className="text-center fw-bold mb-4">Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                    Login
                </button>
            </form>
            <p className="text-center mt-4">
                Don't have an account?{' '}
                <button onClick={() => setView('register')} className="btn btn-link p-0">
                    Register here
                </button>
            </p>
        </div>
    );
}

function Register({ setView }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post(`${API_URL}/auth/register`, { name, email, password });
            setSuccess('Registration successful! Please login.');
            setTimeout(() => setView('login'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="card p-4 p-md-5 shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
            <h2 className="text-center fw-bold mb-4">Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                    Register
                </button>
            </form>
            <p className="text-center mt-4">
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="btn btn-link p-0">
                    Login here
                </button>
            </p>
        </div>
    );
}


function Dashboard({ token, handleLogout }) {
    const [posts, setPosts] = useState([]);
    const [editingPost, setEditingPost] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            const authHeader = { headers: { 'x-auth-token': token } };
            const res = await axios.get(`${API_URL}/posts`, authHeader);
            setPosts(res.data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchPosts();
        }
    }, [token, fetchPosts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const authHeader = { headers: { 'x-auth-token': token } };
                await axios.delete(`${API_URL}/posts/${id}`, authHeader);
                fetchPosts();
            } catch (error) {
                console.error('Failed to delete post', error);
            }
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setShowForm(true);
    };

    const handleCreateNew = () => {
        setEditingPost(null);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingPost(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchPosts();
    };

    return (
        <div>
            <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm">
                <h1 className="h3 mb-0">My Blog Posts</h1>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </header>

            {!showForm && (
                <button onClick={handleCreateNew} className="btn btn-success mb-4 shadow-sm">
                    + Create New Post
                </button>
            )}

            {showForm && (
                <PostForm
                    token={token}
                    post={editingPost}
                    onSuccess={handleFormSuccess}
                    onClose={handleFormClose}
                />
            )}

            <div className="row">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post._id} className="col-md-6 col-lg-4 mb-4">
                            <PostCard post={post} onEdit={handleEdit} onDelete={handleDelete} />
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <p className="text-muted text-center mt-5">You haven't created any posts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PostCard({ post, onEdit, onDelete }) {
    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
                <h3 className="card-title h5">{post.title}</h3>
                <p className="card-text text-muted mb-3" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                <div className="mb-3">
                    {post.tags && post.tags.map(tag => (
                        <span key={tag} className="badge bg-secondary me-1 mb-1">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="mt-auto pt-3 border-top d-flex justify-content-end">
                    <button onClick={() => onEdit(post)} className="btn btn-outline-primary btn-sm me-2">Edit</button>
                    <button onClick={() => onDelete(post._id)} className="btn btn-outline-danger btn-sm">Delete</button>
                </div>
            </div>
        </div>
    );
}

function PostForm({ token, post, onSuccess, onClose }) {
    const [title, setTitle] = useState(post ? post.title : '');
    const [content, setContent] = useState(post ? post.content : '');
    const [tags, setTags] = useState(post && post.tags ? post.tags.join(', ') : '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const postData = { title, content, tags };
        const authHeader = { headers: { 'x-auth-token': token } };

        try {
            if (post) {
                await axios.put(`${API_URL}/posts/${post._id}`, postData, authHeader);
            } else {
                await axios.post(`${API_URL}/posts`, postData, authHeader);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="card card-body p-4 shadow-sm mb-4">
            <h2 className="h4 mb-4">{post ? 'Edit Post' : 'Create New Post'}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="form-control"
                        rows="6"
                        required
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="d-flex justify-content-end">
                    <button type="button" onClick={onClose} className="btn btn-secondary me-2">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {post ? 'Update Post' : 'Create Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
