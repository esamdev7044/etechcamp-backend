const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");

const { initializePassport, passport } = require("./config/passport");

const authRoutes = require("./auth/auth.routes");
const profileRutes = require("./profile/profile.routes");
const blogRoutes = require("./blog/blog.routes");
const tutorialRoutes = require("./tutorials/tutorial/tutorial.routes");
const moduleRoutes = require("./tutorials/module/module.routes");
const lessonRoutes = require("./tutorials/lesson/lesson.routes");
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/tutorials", tutorialRoutes);
app.use("/api/v1", moduleRoutes);
app.use("/api/v1", lessonRoutes);

app.use(errorHandler);

module.exports = app;
