require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {verify} = require('jsonwebtoken');
const {hash, compare} = require('bcryptjs')
const {
    //tokens
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
} = require('/tokens.js');
const {DB} = require('testDB.js');
const {isAuth} = require('./isAuth.js');


server.use(cookieParser());

server.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

// Needed to be able to read body data
server.use(express.json()); // to support JSON-encoded bodies
server.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

// 1. Register
server.post('/register', async (req,res) => {
  const {email, pw, role} = req.body;

  try{
    const user = DB.find(user => user.email === email);
    if (user) throw new Error('User already registered'); //check if exist

    const hashPW = await hash(pw, 10); //hash password
    const hashRole = await hash(role, 10);

    DB.push({
      id :DB.length,
      email,
      pw : hashPW,
      role:hashRole

    });
    res.send({ message: 'User Created'});
    console.log(DB);
  } catch (err){
    res.send({
      error : `${err.message}`
    });
  }
});

// 2. Login
server.post('/login', async(req,res) => {
  const {email, pw} = req.body;

  try{
    //find user
    const user = DB.find(user => user.email === email);
    if (!user) throw new Error('User does not exist');
    //compare pass, send error if not
    const validpw = await compare (pw, user.password);
    if (!validpw) throw new Error('Incorrect Password');

    //create tokens
    const accesstoken = createAccessToken(user.id);
    const refreshtoken = createRefreshToken(user.id);

    //store refresh token in db
    user.refreshtoken = refreshtoken;

    //send token; refreshtoken as cookie, accesstoken as regular response
    sendRefreshToken(res, refreshtoken);
    sendAccessToken(req, res, accesstoken);

  }catch(err){
    res.send({
      error: `${err.message}`
    });
  }
});

// 3. Logout
server.post('/logout', (req,res) => {
  res.clearCookie('refreshtoken', {path: '/refresh_token'});
  //remove refreshtoken from db
  return res.send({
    message:'Logged out'
  });
});

//routing
server.post('/', async (req,res) => { //route
  try{
    const userID = isAuth(req);
    if (userID !== null){
      res.send({
        data:"You're not authorized"
      });
    }else{
      //route them
    }

  }catch(err){
    res.send({
      error: `${err.message}`,
    });
  }
});

//new accesstoken with a refresh token

server.post('refresh_token', (req,res) => {
  const token = req.cookies.refreshtoken;
  //no token
  if (!token) return res.send({ accesstoken: ''});

  //if we have token
  let payload = null;
  try{
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  }catch(err){
    return res.send({accesstoken:''});
  }

  //valid token
  const user = DB.find(user => user.id === payload.userID);
  if (!user) return res.send({accesstoken:''});
  //user exist, check refreshtoken
  if (user.refreshtoken !==token) return res.send({accesstoken :''});

  const accesstoken = createAccessToken(user.id);
  const refreshtoken= createRefreshToken(user.id);

  user.refreshtoken = refreshtoken;

  sendRefreshToken(res,refreshtoken);
  return res.send ({accesstoken});
});

server.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}!`),
);
