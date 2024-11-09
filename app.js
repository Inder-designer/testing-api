// app.js or server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { swaggerDocs, swaggerUi } = require('./swagger/swaggerConfig');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorMiddleware = require("./middlewares/error");
const cookieSession = require('cookie-session');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json({ limit: '50mb' }));

// CORS Configuration
app.use(cors({
    origin: (process.env.NODE_ENV === "production")
        ? [process.env.FRONTEND_URL, process.env.API_URL] // Add your frontend and API URLs for production
        : "http://localhost:5173",
    // origin: (origin, callback) => {
    //   // Allow requests from any origin
    //   callback(null, origin || "*");
    // },
    credentials: true,  // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
})); 

app.use(
    cookieSession({
        name: "session",
        keys: ["Petworld"],
        maxAge: 24 * 60 * 60 * 1000 * 25, // 25 days
        secure: process.env.NODE_ENV === "production", // Set true in production for HTTPS only
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Set SameSite=None for production
    })
);

// Express session setup (optional if not using express-session)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Only accessible by the server
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax", // Set SameSite=None for production
        maxAge: 24 * 60 * 60 * 1000 * 25, // Set session to expire after 25 days
    },
}));

// Middleware for cookies and URL encoding
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware (make sure this is at the end)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const apiDocsUrl = `${currentUrl}api-docs`;
    console.log(apiDocsUrl, "url");
    const htmlResponse = `<div style="padding:10px 20px;">
                            <h2>Hello, Welcome to EAT-API</h2>
                            <p>Click Here for Swagger Docs</p>
                            <a style="background-color: #0bb7ff;color: white;padding: 7px 15px;border-radius: 5px;text-decoration: none;"  href="${apiDocsUrl}">
                              API Docs
                            </a>
                          <div>`;
    res.send(htmlResponse);
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger running on http://localhost:${PORT}/api-docs`);
});
