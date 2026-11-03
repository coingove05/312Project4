import { useState } from "react";

function SignIn() {
    const [user_id, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/api/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user_id, password })
            });

            const data = await response.json();

            console.log("Sign-in response:", data);

            setMessage(data.message);

        } catch (error) {
            console.error("Sign-in error:", error);
            setMessage("Unable to connect to server.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-sm p-4" style={{ maxWidth: "420px", width: "100%" }}>

                <h1 className="text-center mb-2">Story Blog</h1>
                <p className="text-center text-muted mb-4">
                    Sign in to your account
                </p>

                {message && <div className="alert alert-info">{message}</div>}

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label">User ID</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user_id}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Sign In
                    </button>

                </form>

            </div>
        </div>
    );
}

export default SignIn;