const { error } = require("console");
const express = require("express");
const pool = require("./db");
const cors = require("cors")

const story_blog = express();

story_blog.use(cors({
    origin: "http://localhost:5173"
}))


const PORT = 3000;

story_blog.set("view engine", "ejs");
story_blog.use(express.static("public"));
story_blog.use(express.urlencoded({extended: true}));

story_blog.use(express.json());

const multer = require("multer");
const path = require("path");
const { buffer } = require("stream/consumers");

const storage = multer.diskStorage({
    destination:"public/uploads/",
    filename: (req, file  , cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer ({storage: storage});


const posts = [];


story_blog.get("/posts/:id/edit",(req,res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(post => post.id === id);
    if (!post) {
        return res.status(404).send("No post to edit")
    }

    res.render("edit", {post});

});

story_blog.post("/posts/:id/edit",(req,res) => {

    const id = parseInt(req.params.id);
    const post = posts.find(post => post.id === id);

    if (!post) {
        return res.status(404).send("No post to edit")
    }

    post.title = req.body.title;
    post.creator = req.body.creator;
    post.story = req.body.story;

    res.redirect("/");
});

story_blog.get("/posts/:id/delete",(req,res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(post => post.id === id);
    if (!post) {
        return res.status(404).send("No post to delete")
    }

    res.render("delete", {post});

});


story_blog.post("/posts/:id/delete",(req,res) => {
    const id = parseInt(req.params.id);
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
        return res.status(404).send("No post to delete")
    }

    posts.splice(postIndex, 1);

    res.redirect("/");
});

pool.query("SELECT NOW()")
    .then(result => {
        console.log("db connected", result.rows[0]);
    })
    .catch(error =>{
        console.error("connection failed", error.message);
    });

story_blog.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blogs ORDER BY date_created DESC"
        );

        res.render("index", {
            posts: result.rows
        });
    }catch (error) {
        console.error("error loading db", error);
        res.status(500).send("could not load posts");
    }
});

story_blog.post("/posts", async (req, res) => {
    const { title, body, creator_user_id } = req.body;

    try {
        const userResult = await pool.query(
            "SELECT user_id, name FROM users WHERE user_id = $1",
            [creator_user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).send("User not found");
        }

        const user = userResult.rows[0];

        await pool.query(
            `INSERT INTO blogs
                (creator_name, creator_user_id, title, body)
             VALUES ($1, $2, $3, $4)`,
            [user.name, user.user_id, title, body]
        );
        
        res.redirect("/");
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).send(error.message);
    }
});

story_blog.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blogs ORDER BY date_created DESC"
        );

        res.render("index", {
            posts: result.rows
        });
    } catch (error) {
        console.error("Error loading blogs:", error);
        res.status(500).send("Could not load blog posts");
    }
});




story_blog.get("/signin", (req, res) => {
    res.render("signin", {error: null});
});

story_blog.post("/signin", async (req, res) => {
    const { user_id, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT user_id, name, password FROM users WHERE user_id = $1",
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(401).send("Invalid user ID or password.");
        }

        const user = result.rows[0];

        if (password !== user.password) {
            return res.status(401).send("Invalid user ID or password.");
        }

        res.redirect("/");
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).send("Could not sign in.");
    }
});

story_blog.get("/signup", (req, res) => {
    res.render("signup", {error: null});
});

story_blog.post("/signup", async (req, res) => {
    const { user_id, name, password } = req.body;

    try {
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE user_id = $1",
            [user_id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).send("That user ID is already taken.");
        }

        await pool.query(
            `INSERT INTO users (user_id, name, password)
             VALUES ($1, $2, $3)`,
            [user_id, name, password]
        );

        res.redirect("/signin");
    } catch (error) {
        console.error("Sign-up error:", error);
        res.status(500).send("Could not create account.");
    }
});

story_blog.get("/", (req,res) => {
    res.render("index", {posts});
});

story_blog.get("/posts",(req,res) => {
    res.render("posts", {posts});
});

story_blog.get("/create",(req,res) => {
    res.render("create");
});

//assignment 4

story_blog.post("/api/signin", async (req, res) => {
    const {user_id, password } = req.body;

    try{
        const result = await pool.query(
            "SELECT user_id, name, password FROM users WHERE user_id = $1",
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                sucsess: false, 
                message: "Invalid user or password"
            });
        }

        const user = result.rows[0]

        if(password !== user.password) {
            return res.status(401).json({
                success: false,
                message: "invalid user or password"
            });
        }

        res.json({
            success: true,
            message: "sign in succsessful",
            user: {
                user_id: user.user_id,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).json({
            success: false,
            message: "failed to sign in"
        })
    }
});

story_blog.post("/api/signup", async (req,res) => {
    console.log("Signup request received:", req.body);
    console.log("Pool exists:", !!pool);
    console.log("Query function exists:", typeof pool.query);

    const {user_id, password, name} = req.body;
    try{
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE user_id = $1",
            [user_id]
        );

        if (existingUser.rows.length > 0) {
            return res .status(400).json({
                success: false,
                message: "User ID already taken"
            });
        }

        await pool.query(
            `INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)`,
            [user_id, password, name]
        );

        res.status(201).json({
            success: true,
            message: "Account created"
        });
    } catch (error) {
        console.log("sign-up error", error);

        res.status(500).json({
            success:false, 
            message: "could not create account"
        });
    }
});


story_blog.get("/blogs", async (req,res) => {
    try{
        const result = await pool.query(
            "SELECT * FROM blogs ORDER BY date_created DESC"
        );

        res.json(result.rows);

    } catch (error) {
        console.error("error grabbing blogs", error);
        res.status(500).json({
            error: "failed to grab blogs"
        });
    }
});

story_blog.delete("/blogs/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM blogs WHERE blog_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found."
            });
        }

        res.json({
            success: true,
            message: "Blog post deleted successfully."
        });

    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            message: "Could not delete post."
        });
    }
});

story_blog.post("/api/blogs", async (req, res) => {
    const { title, body, creator_name, creator_user_id } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO blogs
            (title, body, creator_name, creator_user_id, date_created)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *`,
            [title, body, creator_name, creator_user_id]
        );

        res.status(201).json({
            success: true,
            post: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
            success: false,
            message: "Could not create blog post."
        });
    }
});


story_blog.get("/api/health", (req, res) => {
    res.json({
        message: "Backend connected succsess"
    })
})


story_blog.listen(PORT, () => {
    console.log('Running link: http://localhost:',{PORT});
});

