
import { useState } from "react";

import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import BlogPostForm from "./components/BlogPostForm";
import PostList from "./components/PostList";

function App() {
    const [page, setPage] = useState("home");

    return (
        <div>

            <div className="text-center mt-3">

                <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setPage("home")}
                >
                    Home
                </button>

                <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setPage("signin")}
                >
                    Sign In
                </button>

                <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setPage("signup")}
                >
                    Sign Up
                </button>

                <button
                    className="btn btn-outline-primary"
                    onClick={() => setPage("createpost")}
                >
                    Create Post
                </button>

            </div>

            {page === "home" && <PostList />}

            {page === "signin" && <SignIn />}

            {page === "signup" && <SignUp />}

            {page === "createpost" && <BlogPostForm />}

        </div>
    );
}

export default App;
