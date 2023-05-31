require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {verify} = require('jsonwebtoken');
const {hash, compare} = require('bcryptjs')
const {
    //tokens
} = require('/tokens.js');
const {DB} = require('testDB.js');
const {isAuth} = require('./isAuth.js');

// 1. Register
// 2. Login
// 3. Logout

server.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}!`),
);
