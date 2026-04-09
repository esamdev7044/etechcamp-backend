const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");

const { initializePassport, passport } = require("./config/passport");

const authRoutes = require("./auth/auth.routes");
const blogsRoutes = require("./blog/blog.routes");
const tutorialsRoutes = require("./tutorials/tutorial/tutorial.routes");
const modulesRoutes = require("./tutorials/module/module.routes");
const lessonsRoutes = require("./tutorials/lesson/lesson.routes");
const { errorHandler } = require("./common/middlewares/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const sessionMiddleware = session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/tutorials", tutorialsRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/lessons", lessonsRoutes);

app.use(errorHandler);

module.exports = app;
