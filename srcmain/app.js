const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'path/to/uploaded/files');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${fileExtension}`);
  }
});

// Create multer upload instance
const upload = multer({ storage: storage });

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'capstone',
});

// Test the database connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// API endpoint for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  const values = [username, password];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error executing login query:', err);
      res.status(500).json({ error: 'Failed to login' });
    } else {
      if (results.length !== 1) {
        res.status(401).json({ error: 'Invalid username or password' });
      } else {
        const user = results[0];
        res.json({ message: 'Login successful', user });
      }
    }
  });
});

// API endpoint for user registration
app.post('/register', (req, res) => {
    const { username, name, email, password, sex } = req.body;
  
    // Check if username is already used
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    const checkValues = [username];
  
    connection.query(checkQuery, checkValues, (err, results) => {
      if (err) {
        console.error('Error executing check query:', err);
        res.status(500).json({ error: 'Failed to register' });
      } else {
        if (results.length > 0) {
          res.status(400).json({ error: 'Username already used' });
        } else {
          // Insert user data into the database
          const insertQuery =
            'INSERT INTO users (username, name, email, password, sex) VALUES (?,?,?,?,?)';
          const insertValues = [username, name, email, password, sex];
  
          connection.query(insertQuery, insertValues, (err, result) => {
            if (err) {
              console.error('Error executing insert query:', err);
              res.status(500).json({ error: 'Failed to register' });
            } else {
              if (result.affectedRows === 1) {
                res.json({ message: 'Registration successful' });
              } else {
                res.status(500).json({ error: 'Failed to register' });
              }
            }
          });
        }
      }
    });
  });

// API endpoint for retrieving user activities
app.get('/getactivitiesuser/:username', (req, res) => {
    const username = req.params.username;
  
    // Check if user has any activities
    const query =
      'SELECT ua.activities_id, a.name, a.logo, ua.description, ua.time ' +
      'FROM users_activities ua ' +
      'INNER JOIN activities a ON ua.activities_id = a.id ' +
      'WHERE ua.users_username = ?';
  
    connection.query(query, [username], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to retrieve activities' });
      } else {
        if (results.length === 0) {
          res.json({ message: 'No activities found', data: [] });
        } else {
          res.json({ message: 'Activities retrieved', data: results });
        }
      }
    });
  });

// API endpoint for retrieving a random motivation
app.get('/getmotivation', (req, res) => {
    // Retrieve a random motivation
    const query = 'SELECT * FROM motivations ORDER BY RAND() LIMIT 1';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to retrieve motivation' });
      } else {
        if (results.length === 0) {
          res.json({ message: 'No motivation found' });
        } else {
          const motivation = results[0];
          res.json({ message: 'Motivation retrieved', data: motivation });
        }
      }
    });
  });

// API endpoint for updating user details
app.post('/inputdetailuser', (req, res) => {
    const { username, body_height, body_weight, age } = req.body;
  
    // Check if all parameters are provided
    if (!username || !body_height || !body_weight || !age) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    // Update user details
    const query = 'UPDATE users SET body_height = ?, body_weight = ?, age = ? WHERE username = ?';
  
    connection.query(query, [body_height, body_weight, age, username], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to update user details' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'User details updated successfully' });
        } else {
          res.json({ message: 'User not found' });
        }
      }
    });
  });
  
// API endpoint for retrieving doctors
app.get('/getdoctors', (req, res) => {
    // Retrieve doctors with their specialist information
    const query = 'SELECT d.username, d.name, d.profile_photo, s.name as specialist, d.price FROM doctors d INNER JOIN specialists s ON d.specialists_id = s.specialists_id';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to retrieve doctors' });
      } else {
        res.json({ message: 'Doctors retrieved successfully', data: results });
      }
    });
  });

// API endpoint for creating a consultation
app.post('/makeconsul', (req, res) => {
    const { users_username, doctors_username } = req.body;
  
    // Check if both parameters are provided
    if (!users_username || !doctors_username) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    // Insert consultation
    const query = 'INSERT INTO consultations (users_username, doctors_username) VALUES (?,?)';
  
    connection.query(query, [users_username, doctors_username], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to create consultation' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'Consultation created successfully', consultationId: results.insertId });
        } else {
          res.json({ message: 'Failed to create consultation' });
        }
      }
    });
  });
  
// API endpoint for inserting a chat message
app.post('/insertchat', upload.single('photo'), (req, res) => {
    const { consultations_id, sender_username, text } = req.body;
    const photo = req.file ? req.file.path : null;
  
    // Check if required parameters are provided
    if (!consultations_id || !sender_username || !text) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    // Get the current timestamp
    const time = new Date();

    // Insert chat message
    const query = 'INSERT INTO consul_chats (sender_username, text, consultations_id, photo, time) VALUES (?,?,?,?,?)';
  
    connection.query(query, [sender_username, text, consultations_id, photo, time], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to insert chat message' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'Chat message inserted successfully' });
        } else {
          res.json({ message: 'Failed to insert chat message' });
        }
      }
    });
  });
  
// API endpoint for retrieving chat messages
app.get('/showchat', (req, res) => {
    const { consultations_id } = req.query;
  
    // Check if consultation ID is provided
    if (!consultations_id) {
      return res.status(400).json({ error: 'Missing consultation ID' });
    }
  
    // Retrieve chat messages and doctor information
    const chatQuery = 'SELECT cs.consultations_id, cs.sender_username, cs.text, cs.time, cs.photo, c.doctors_username FROM consul_chats cs INNER JOIN consultations c ON cs.consultations_id = c.consultations_id WHERE cs.consultations_id = ? ORDER BY cs.time ASC';
    const doctorQuery = 'SELECT username, name, profile_photo FROM doctors WHERE username = ?';
  
    connection.query(chatQuery, [consultations_id], (err, chatResults) => {
      if (err) {
        console.error('Error executing chat query:', err);
        res.status(500).json({ error: 'Failed to retrieve chat messages' });
      } else {
        connection.query(doctorQuery, [chatResults[0].doctors_username], (err, doctorResults) => {
          if (err) {
            console.error('Error executing doctor query:', err);
            res.status(500).json({ error: 'Failed to retrieve doctor information' });
          } else {
            const dataChat = chatResults.map(chat => {
              return {
                consultations_id: chat.consultations_id,
                sender_username: chat.sender_username,
                text: chat.text,
                time: chat.time,
                photo: chat.photo
              };
            });
  
            const dataDoctor = {
              username: doctorResults[0].username,
              name: doctorResults[0].name,
              photo: doctorResults[0].photo
            };
  
            res.json({ error: false, message: 'success', data: dataChat, doctor: dataDoctor });
          }
        });
      }
    });
  });
  
// API endpoint for uploading a file
app.post('/uploadtest', upload.single('file'), (req, res) => {
    const { users_username } = req.body;
    const file = req.file;
  
    // Check if both parameters are provided
    if (!users_username || !file) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    // Upload file to server and save the file link || copy path dari bucket
    const fileLink = `path/to/uploaded/files/${file.filename}`;
  
    // Insert file link into the database
    const query = 'INSERT INTO pos_certificates (users_username, file) VALUES (?, ?)';
  
    connection.query(query, [users_username, fileLink], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to upload file' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'File uploaded successfully' });
        } else {
          res.json({ message: 'Failed to upload file' });
        }
      }
    });
  });
  
// API endpoint for checking a POS certificate
app.get('/checkposcer', (req, res) => {
    const { users_username } = req.query;
  
    // Check if users_username is provided
    if (!users_username) {
      return res.status(400).json({ error: 'Missing username' });
    }
  
    // Query to retrieve the POS certificate
    const query = 'SELECT * FROM pos_certificates WHERE users_username = ?';
  
    connection.query(query, [users_username], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to retrieve POS certificate' });
      } else {
        if (results.length === 0) {
          res.json({ message: 'Empty POS certificate' });
        } else {
          res.json({ data: results });
        }
      }
    });
  });
  
// API endpoint for retrieving posts
app.get('/getpost', (req, res) => {
    const { users_username } = req.query;
  
    // Check if users_username is provided
    if (!users_username) {
      return res.status(400).json({ error: 'Missing username' });
    }
  
    // Query to retrieve posts with like status
    const query = 'SELECT p.posts_id, p.title, p.content, pl.users_username AS is_like FROM posts p LEFT JOIN posts_likes pl ON p.posts_id = pl.posts_id AND pl.users_username = ?';
  
    connection.query(query, [users_username], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to retrieve posts' });
      } else {
        res.json({ data: results });
      }
    });
  });
  
// API endpoint for liking a post
app.post('/likepost', (req, res) => {
    const { users_username, posts_id } = req.body;
  
    // Check if the required parameters are provided
    if (!users_username || !posts_id) {
      return res.json({ error: true, message: 'Missing required parameters' });
    }
  
    // Check if the posts_id exists in the posts table
    const checkQuery = 'SELECT * FROM posts WHERE posts_id = ?';
  
    connection.query(checkQuery, [posts_id], (checkErr, checkResults) => {
      if (checkErr) {
        console.log(checkErr);
        return res.json({ error: true, message: 'Error checking post existence' });
      }
  
      // If the post exists, insert the like
      if (checkResults.length > 0) {
        const insertQuery = 'INSERT INTO posts_likes (posts_id, users_username) VALUES (?, ?)';
  
        connection.query(insertQuery, [posts_id, users_username], (insertErr, insertResults) => {
          if (insertErr) {
            console.log(insertErr);
            return res.json({ error: true, message: 'Failed to like the post' });
          }
  
          return res.json({ error: false, message: 'Post liked successfully' });
        });
      } else {
        return res.json({ error: true, message: 'Invalid post ID' });
      }
    });
  });
  

// Endpoint: readpost
app.get('/readpost', (req, res) => {
    const { posts_id, users_username } = req.query;
  
    // Check if the required parameters are provided
    if (!posts_id || !users_username) {
      return res.json({ error: true, message: 'Missing parameters' });
    }
  
    // Query to fetch post details
    const query1 = 'SELECT p.title, p.date, p.photo_header, p.content, u.name FROM posts p INNER JOIN users u ON p.users_username = u.username WHERE p.posts_id = ?';
    
    // Query to check if the user has liked the post
    const query2 = 'SELECT * FROM posts_likes WHERE posts_id = ? AND users_username = ?';
  
    // Execute the first query to fetch post details
    connection.query(query1, [posts_id], (err, result1) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch post details' });
      }
  
      // Execute the second query to check if the user has liked the post
      connection.query(query2, [posts_id, users_username], (err, result2) => {
        if (err) {
          console.error(err);
          return res.json({ error: true, message: 'Failed to fetch like status' });
        }
  
        const data = result1[0];
        const isLike = result2.length > 0;
  
        res.json({ error: false, message: 'Success', data, isLike });
      });
    });
  });
  
// Endpoint: readcomment
app.get('/readcomment', (req, res) => {
    const { posts_id } = req.query;
  
    // Check if the required parameter is provided
    if (!posts_id) {
      return res.json({ error: true, message: 'Missing parameter' });
    }
  
    // Query to fetch comments for the specified post
    const query = 'SELECT u.name, u.profile_photo, cp.date, cp.content FROM comments_posts cp INNER JOIN users u ON cp.sender_username = u.username WHERE cp.posts_id = ?';
  
    // Execute the query to fetch comments
    connection.query(query, [posts_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch comments' });
      }
  
      res.json({ error: false, message: 'Success', data: result });
    });
  });
// example
// readpost?posts_id=123&users_username=danieltest
// readcomment?posts_id=1
    
// Endpoint: insertcomment
app.post('/insertcomment', (req, res) => {
    const { sender_username, posts_id, content } = req.body;
  
    // Check if the required parameters are provided
    if (!sender_username || !posts_id || !content) {
      return res.json({ error: true, message: 'Missing required parameters' });
    }
  
    // Check if the posts_id exists in the posts table
    const checkQuery = 'SELECT * FROM posts WHERE posts_id = ?';
  
    connection.query(checkQuery, [posts_id], (checkErr, checkResults) => {
      if (checkErr) {
        console.log(checkErr);
        return res.json({ error: true, message: 'Error checking post existence' });
      }
  
      // If the post exists, insert the comment
      if (checkResults.length > 0) {
        const insertQuery = 'INSERT INTO comments_posts (posts_id, sender_username, content) VALUES (?, ?, ?)';
  
        connection.query(insertQuery, [posts_id, sender_username, content], (insertErr, insertResults) => {
          if (insertErr) {
            console.log(insertErr);
            return res.json({ error: true, message: 'Failed to insert the comment' });
          }
  
          return res.json({ error: false, message: 'Comment inserted successfully' });
        });
      } else {
        return res.json({ error: true, message: 'Invalid post ID' });
      }
    });
  });
  
// for generate unique posts_id
function generateUniqueID(maxValue) {
    const randomID = Math.floor(Math.random() * maxValue); // Generate a random number within the maximum value range
    return randomID;
  }
// Endpoint: createpost
app.post('/createpost', (req, res) => {
    const { users_username, title, photo_header, content, tag } = req.body;
  
    // Check if the required parameters are provided
    if (!users_username || !title || !photo_header || !content || !tag) {
      return res.json({ error: true, message: 'Missing required parameters' });
    }
  
    // Generate a unique posts_id
    const maxPostsID = 999999999; // Maximum value for posts_id column
    const posts_id = generateUniqueID(maxPostsID);
  
    // Insert the post into the posts table
    const insertQuery = 'INSERT INTO posts (posts_id, users_username, title, photo_header, content) VALUES (?, ?, ?, ?, ?)';
  
    connection.query(insertQuery, [posts_id, users_username, title, photo_header, content], (insertErr, insertResults) => {
      if (insertErr) {
        console.log(insertErr);
        return res.json({ error: true, message: 'Failed to create the post' });
      }
  
      // Split the tag parameter into an array of tags
      const tags = tag.split(',');
  
      // Insert the tags into the tag_posts table
      const tagInsertQuery = 'INSERT INTO tag_posts (posts_id, tag) VALUES (?, ?)';
  
      tags.forEach((tag) => {
        connection.query(tagInsertQuery, [posts_id, tag], (tagInsertErr, tagInsertResults) => {
          if (tagInsertErr) {
            console.log(tagInsertErr);
            return res.json({ error: true, message: 'Failed to insert tags' });
          }
        });
      });
  
      return res.json({ error: false, message: 'Post created successfully' });
    });
  });
  
  
// Endpoint: uploadprofilepic
app.post('/uploadprofilepic', upload.single('profile_photo'), (req, res) => {
    const { username } = req.body;
  
    // Check if the username and profile_photo parameters are provided
    if (!username || !req.file) {
      return res.json({ error: true, message: 'Missing parameters' });
    }
  
    const profilePhotoPath = req.file.path;
  
    // Upload the profile photo to the server and retrieve the uploaded file URL
    // You can use your preferred method/library for handling file uploads
  
    // Check if the profile photo upload was successful and get the uploaded file URL
    const uploadedProfilePhotoURL = 'uploaded_profile_photo_url';
  
    // Update the user's profile photo in the database
    const query = 'UPDATE users SET profile_photo = ? WHERE username = ?';
  
    connection.query(query, [uploadedProfilePhotoURL, username], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to update profile photo' });
      }
  
      res.json({ error: false, message: 'Profile photo uploaded successfully' });
    });
  });
  
// Endpoint: updateaccount
app.post('/updateaccount', (req, res) => {
    const { username, name } = req.body;
  
    // Check if the username and name parameters are provided
    if (!username || !name) {
      return res.json({ error: true, message: 'Missing parameters' });
    }
  
    // Update the user's name in the database
    const query = 'UPDATE users SET name = ? WHERE username = ?';
  
    connection.query(query, [name, username], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to update account' });
      }
  
      res.json({ error: false, message: 'Account updated successfully' });
    });
  });
  
// Endpoint: getconsultation
app.get('/getconsultation', (req, res) => {
    const { username } = req.query;
  
    // Check if the username parameter is provided
    if (!username) {
      return res.json({ error: true, message: 'Missing parameter' });
    }
  
    // Retrieve the date_consul from the database
    const query = 'SELECT date_consul FROM users WHERE username = ?';
  
    connection.query(query, [username], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch consultation date' });
      }
  
      // Check if the query returned a result
      if (result.length === 0) {
        return res.json({ error: true, message: 'Consultation date not found' });
      }
  
      const date_consul = result[0].date_consul;
  
      // Return the consultation date in the API response
      res.json({ error: false, message: 'Success', date_consul });
    });
  });
  
// Endpoint: logindoctor
app.post('/logindoctor', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username and password parameters are provided
    if (!username || !password) {
      return res.json({ error: true, message: 'Missing parameters' });
    }
  
    // Query to check if the doctor's username and password match
    const query =
      'SELECT * FROM doctors WHERE username = ? AND password = ?';
  
    connection.query(query, [username, password], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to login' });
      }
  
      // Check the number of rows returned by the query
      if (result.length !== 1) {
        return res.json({ error: true, message: 'Failed to login' });
      }
  
      const doctor = result[0];
  
      // Return the doctor's information in the API response
      res.json({ error: false, message: 'Login successful', doctor });
    });
  });
  
// Endpoint: getspecialist
app.get('/getspecialist', (req, res) => {
    // Query to retrieve all specialists
    const query = 'SELECT * FROM specialists';
  
    connection.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch specialists' });
      }
  
      res.json({ error: false, message: 'Success', data: result });
    });
  });
  
// Endpoint: registerdoctor
app.post('/registerdoctor', (req, res) => {
    const { username, name, email, password, sex, specialists_id } = req.body;
  
    // Check if the username is already taken
    const checkQuery = 'SELECT * FROM doctors WHERE username = ?';
  
    connection.query(checkQuery, [username], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to register doctor' });
      }
  
      // If the username is already taken, return an error message
      if (result.length > 0) {
        return res.json({ error: true, message: 'Username is already taken' });
      }
  
      // Insert the new doctor into the database
      const insertQuery =
        'INSERT INTO doctors (username, name, email, password, sex, specialists_id) VALUES (?, ?, ?, ?, ?, ?)';
  
      connection.query(
        insertQuery,
        [username, name, email, password, sex, specialists_id],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.json({ error: true, message: 'Failed to register doctor' });
          }
  
          res.json({ error: false, message: 'Doctor registered successfully' });
        }
      );
    });
  });
  
// Endpoint: getdoctorconsultations
app.get('/getdoctorconsultations', (req, res) => {
    const { username } = req.query;
  
    // Check if the username parameter is provided
    if (!username) {
      return res.json({ error: true, message: 'Missing parameter' });
    }
  
    // Query to retrieve consultations for the specified doctor
    const query =
      'SELECT u.name, u.profile_photo, c.consultations_id, c.date FROM consultations c INNER JOIN users u ON c.users_username = u.username WHERE c.doctors_username = ?';
  
    connection.query(query, [username], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch doctor consultations' });
      }
  
      res.json({ error: false, message: 'Success', data: result });
    });
  });
  
// Endpoint: getdoctorconsul
app.get('/getdoctorconsul', (req, res) => {
    const { consultations_id } = req.query;
  
    // Check if the consultations_id parameter is provided and not empty
    if (!consultations_id || consultations_id.trim() === '') {
      return res.json({ error: true, message: 'Invalid consultations_id' });
    }
  
    // Query to retrieve the consultation and related information
    const query = `
      SELECT cs.consultations_id, cs.sender_username, cs.text, cs.time, cs.photo, c.users_username
      FROM consul_chats cs
      INNER JOIN consultations c ON cs.consultations_id = c.consultations_id
      WHERE cs.consultations_id = ?
      ORDER BY cs.time ASC
    `;
  
    connection.query(query, [consultations_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch consultation details' });
      }
  
      // Extract the users_username from the result
      const usersUsername = result.length > 0 ? result[0].users_username : '';
  
      // Query to retrieve the user's information
      const userQuery = 'SELECT username, name, profile_photo FROM users WHERE username = ?';
  
      connection.query(userQuery, [usersUsername], (err, userResult) => {
        if (err) {
          console.error(err);
          return res.json({ error: true, message: 'Failed to fetch user details' });
        }
  
        // Combine the consultation and user information
        const data = {
          consultation: result,
          user: userResult[0],
        };
  
        res.json({ error: false, message: 'Success', data });
      });
    });
  });
  
// Endpoint: getallactivities
app.get('/getallactivities', (req, res) => {
    // Query to retrieve all activities
    const query = 'SELECT * FROM activities';
  
    connection.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to fetch activities' });
      }
  
      res.json({ error: false, message: 'Success', data: result });
    });
  });
  
// Endpoint: getusersactivities
app.get('/getusersactivities', (req, res) => {
    const { users_username } = req.query;
  
    // Check if the required parameter is provided
    if (!users_username) {
      return res.json({ error: true, message: 'Missing users_username parameter' });
    }
  
    // Execute the SQL query
    const query = 'SELECT * FROM users_activities da INNER JOIN activities a ON da.activities_id = a.id WHERE da.users_username = ?';
  
    connection.query(query, [users_username], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ error: true, message: 'Failed to fetch user activities' });
      }
  
      // Check if any activities were found
      if (results.length === 0) {
        return res.json({ error: false, message: 'No activities found for the user', data: [] });
      }
  
      // Return the activities data
      return res.json({ error: false, message: 'Success', data: results });
    });
  });
  
  
// Endpoint: insertupdateactivities
app.post('/insertupdateactivities', (req, res) => {
    const { users_username, description, activities_id } = req.body;
  
    let query;
    let queryParams;
  
    // Get the current timestamp
    const time = new Date();

    // Check if activities_id is provided
    if (activities_id) {
      // Update existing activity
      query = 'UPDATE users_activities SET description = ?, time = ? WHERE activities_id = ?';
      queryParams = [description, time, activities_id];
    } else {
      // Insert new activity
      query = 'INSERT INTO users_activities (activities_id, users_username, description, time) VALUES (?, ?, ?)';
      queryParams = [users_username, description, time, activities_id];
    }
  
    connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to insert/update activity' });
      }
  
      res.json({ error: false, message: 'Activity inserted/updated successfully' });
    });
  });
  
// Endpoint: setconsuldate
app.post('/setconsuldate', (req, res) => {
    const { username, date_consul } = req.body;
  
    // Check if username and date_consul are provided
    if (!username || !date_consul) {
      return res.json({ error: true, message: 'Missing parameters' });
    }
  
    // Query to update the date_consul for the user
    const query = 'UPDATE users SET date_consul = ? WHERE username = ?';
  
    connection.query(query, [date_consul, username], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ error: true, message: 'Failed to update consultation date' });
      }
  
      res.json({ error: false, message: 'Consultation date set successfully' });
    });
  });

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
