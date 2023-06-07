const { sign } = require('jsonwebtoken');

function generateUniqueID(maxValue) {
  const randomID = Math.floor(Math.random() * maxValue); // Generate a random number within the maximum value range
  return randomID;
}
const maxID = 999999999;

// Create tokens
// ----------------------------------
const createAccessToken = userId => {
  const accesstoken_id = generateUniqueID(maxID);
  return sign({ userId }, accesstoken_id, {
    expiresIn: '15m',
  });
};

const createRefreshToken = userId => {
  const accesstoken_id = generateUniqueID(maxID)
  return sign({ userId }, accesstoken_id, {
    expiresIn: '7d',
  });
};

// Send tokens
// ----------------------------------
const sendAccessToken = (req, res, accesstoken) => {
  res.send({
    accesstoken,
    email: req.body.email,
  });
};

const sendRefreshToken = (res, token) => {
  res.cookie('refreshtoken', token, {
    httpOnly: true,
    path: '/refresh_token',
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
};