const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const serviceRoutes = require('./routes/service');
const passport = require('./config/passport');
const errorMiddleware = require('./middlewares/error');
const automationRoutes = require('./routes/automation');
const automationNodeRoutes = require('./routes/automationNode');

const app = express();

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/automation/:automationId/nodes', automationNodeRoutes);

app.use(errorMiddleware);

module.exports = app;
