
import { useState } from "react";

function BlogPostForm() {

    // State variables for each form field
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    // Handle form submission
    const handleSubmit = async (event) => {
    event.preventDefault();

    const postData = {
        title: title,
        body: body,
        creator_name: "Tim",
        creator_user_id: "tim42"
    };

    try {
        const response = await fetch("http://localhost:3000/api/blogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create post.");
        }

        alert("Blog post created successfully!");

        setTitle("");
        setBody("");

    } catch (error) {
        console.error("Error creating post:", error);
        alert("Could not create blog post.");
    }
};

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm">
                <h2>Create a Blog Post</h2>

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label">
                            Title
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Body
                        </label>

                        <textarea
                            className="form-control"
                            rows="6"
                            value={body}
                            onChange={(event) =>
                                setBody(event.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Create Post
                    </button>

                </form>
            </div>
        </div>
    );
}

export default BlogPostForm;
