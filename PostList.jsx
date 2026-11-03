
import { useState, useEffect } from "react";

function PostList({ onEdit, onDelete }) {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch posts from the backend
    useEffect(() => {
        fetch("http://localhost:3000/blogs")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }
                return response.json();
            })
            .then(data => {
                console.log("Posts received:", data);
                setPosts(data);
            })
            .catch(error => {
                console.error("Error fetching posts:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this blog post?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/blogs/${id}`, {
                method: "DELETE"
            });

            const responseText = await response.text();

            console.log("Server response:", responseText);

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Backend returned HTML instead of JSON. Check your DELETE route.");
}

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete post.");
            }

            // Remove the deleted post from the homepage
            setPosts(posts => posts.filter(post => post.blog_id !== id));

        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Could not delete blog post.");
        }
    };

    if (loading) {
        return <p className="text-center">Loading posts...</p>;
    }

    return (
        <div className="container mt-5">

            <h2 className="mb-4">All Blog Posts</h2>

            {posts.length === 0 ? (
                <p>No blog posts found.</p>
            ) : (

                posts.map(post => (
                    <div className="card mb-4 shadow-sm" key={post.blog_id}>

                        <div className="card-body">

                            <h3 className="card-title">
                                {post.title}
                            </h3>

                            <p className="text-muted">
                                By {post.creator_name}
                            </p>

                            <p className="card-text">
                                {post.body}
                            </p>

                            <p className="text-muted">
                                Created: {new Date(post.date_created).toLocaleDateString()}
                            </p>

                            <button
                                className="btn btn-primary me-2"
                                onClick={() => onEdit?.(post)}
                            >
                                Edit
                            </button>

                            <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(post.blog_id)}
                            >
                                Delete
                            </button>

                        </div>
                    </div>
                ))

            )}

        </div>
    );
}

export default PostList;
