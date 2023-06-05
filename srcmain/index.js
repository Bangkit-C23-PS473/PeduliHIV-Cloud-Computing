require('dotenv/config');
const {verify} = require('jsonwebtoken');
const express = require('express');
const {
    //tokens
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
} = require('/tokens.js');

// const data;

const mysql = require('mysql');
const connection = mysql.createConnection({
        host: process.env.HOST_DATABASE,
        user: process.env.USERNAME_DATABASE,
        password: process.env.PASSWORD_DATABASE,
        database: process.env.NAME_DATABASE
    })
const server = express();

server.get('/', (req, res) => {
    res.send('Home Page!');
});

//loginuser
server.get('/loginuser', (req,res) => {
    const {username, password} = req.body;
    //SELECT * FROM users WHERE username = ? AND password = ?
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    connection.query(query, (err, results) => {
        if(err) {
            console.log('Gagal Login');
        }else{
            // for (const row of results) {
                // console.log(row);
            // }
            const accesstoken = createAccessToken(user.id);
            const refreshtoken = createRefreshToken(user.id);
            user.refreshtoken = refreshtoken;
        
            sendRefreshToken(res, refreshtoken);
            sendAccessToken(req, res, accesstoken);

            // res.send({ results });
        }
    });
});

//registeruser
server.get('/registeruser', (req,res) => {
    const {username, name, email, pw, sex} = req.body;

    const query = `SELECT * FROM users WHERE username = ?` ;

    connection.query(query, (err, results) => {
        if(err) {
            console.log('Gagal daftar');
        }else{
            // create sql query
            const sql = `INSERT INTO users (username, name, email, pw, sex) VALUES (?,?,?,?,?)`;

            // prep query
            const stmt = connection.prepare(sql);

            //bind values
            stmt.bind([
                
            ]);
        }
    });
}); //not done

//getactivitiesuser
server.post('/getactivitiesuser', async(req,res) => {
    const {users_username} = req.body;
    const query = `SELECT ua.activities_id, a.name, a.logo, ua.description, ua.time FROM users_activities ua INNER JOIN activities a ON ua.activities_id = a.activities_id WHERE ua.users_username = ?`;

    connection.query(query, (err, results) => {
        if(err) {
            res.send({ message : 'empty'});

        }else{
            res.send({ results});
            // console.log(results);
        }
    });
});

//getmotivation
server.post('/getmotivation', async(req,res) => {
    // const {} = req.body;
    const query = `SELECT * FROM motivations ORDER BY RAND() LIMIT 1`;

    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:'Gagal'});

        }else{
            res.send({results});
        }

    });
    //-----------------------------------------------------
});

//inputdetailuser
server.post('/inputdetailuser', async(req,res) => {
    const {body_height, body_weight, age} = req.body;
    const query = `UPDATE users SET body_height = ?, body_weight = >, age = ? WHERE username ?`;

    connection.query(query, (err, results) => {
        if(err) {

        }else{
            res.send({ message: 'User Created'});
            console.log(results);
        }
    });
    //-----------------------------------------------------
    try{     

    }catch (err){
        res.send({
            error: `${err.message}`
        });
    }
});//try check query

//getdoctors
server.post('/getdoctors', async(req,res) => {
    // const {} = req.body;
    const query = 'SELECT d.username, d.name, d.profile_photo, s.name as specialist, d.price FROM doctors d INNER JOIN specialist s ON d.specialists_id = s.specialists_id';

    connection.query(query, (err, results) => {
        if(err) {
            res.send({message : 'Gagal'});
        }else{
            res.send(results);
            // console.log(results);
        }
    });
});

//makeconsul
server.post('/makeconsul', async(req,res) => {
    const {users_username, doctors_username} = req.body;
    const query = `INSERT INTO consultations (users_username, doctors_username) VALUES (?,?)`;

    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:'Gagal'})
        }else{
            res.send(results);
            // console.log(results);
        }
    });
    //-----------------------------------------------------
    try{     

    }catch (err){
        res.send({
            error: `${err.message}`
        });
    }
}); //pake try

//insertchat
server.post('/insertchat', async(req,res) => {
    const {consultations_id, sender_username, text, photo} = req.body;
    //photo optional
    const query = `INSERT INTO consul_chats (sender_username, ext, consultations_id, photo) VALUES (?,?,?,?)`;

    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:'Gagal'})
        }else{
            res.send(results);
        }
    });
    //-----------------------------------------------------
    try{     

    }catch (err){
        res.send({
            error: `${err.message}`
        });
    }
});//merge try

//showchat
server.post('/showchat', async(req,res) => {
    const {consultations_id} = req.body;
    try{     
        // const check = DB.find(user => user.email === email);
        if(consultations_id !== null){
            const query = `SELECT cs.consultations_id, cs.sender_username, cs.text, cs.time, cs.photo, c.doctors_username FROM consul_chats cs INNER JOIN consultations c ON cs.consultations_id = c.consultations_id WHERE consultations_id = ? ORDER BY time ASC`;

            connection.query(query, (errchat, resultchat) => {
                if(errchat) {
                    res.send({message:'Gagal'});
                }else{
                    connection.query(`SELECT username, name, photo FROM doctors WHERE username = ?`, (err, resultdoctor) => {
                        if(err){
                            res.send({message:'Gagal'});
                        }else{
                        res.send({ 
                            'error' : false,
                            'message': 'success',
                            'data' : [resultchat],
                            'doctor' : {resultdoctor}
                            });  
                        }      
                    });
                }
            });   
        }
    }catch (err){
        res.send({
            error: `${err.message}`
        });
    }
});

// uploadtest
server.post('/uploadtest', async(req,res) => {
    const {users_username} = req.body; //foto
    try{     

    }catch (err){
        res.send({
            error: `${err.message}`
        });
    }
    const query = `INSERT INTO pos_certificates (users_username, file) VALUES (?,?)`;

    connection.query(query, (err, results) => {
        if(err) {

        }else{
            res.send({ message: 'User Created'});
            console.log(results);
        }
    });
    //-----------------------------------------------------
    
}); //not done, blm ngerti foto

//checkposcer
server.post('/checkposcer', async(req,res) => {
    const {users_username} = req.body;
    try{
        if (users_username !== null){
            const query = `SELECT * FROM pos_certificates WHERE users_username = ?`;

        connection.query(query, (err, results) => {
            if(err) {

            }else{
                res.send(results);
            }
        });
        }     
    }catch (err){
        res.send({
            message: 'Gagal'
        });
    } 
});

//getpost, ML 
server.post('/getpost', async(req,res) => {
    const {users_username} = req.body;
    try{
        if(users_username !== null){
            const query = `SELECT p.posts_id, p.title, p.content, pl.users_username as is_like FROM posts p LEFT JOIN posts_likes pl ON p.posts_id pl.posts_id AND pl.users_username = ?`;

            connection.query(query, (err, results) => {
                if(err) {
                    res.send({message:'Gagal'});                
                }else{
                    results.push({message:'Sukses'});
                    res.send(results);
                    // console.log('Sukses');
                }
            });
        }
    }catch(err){
        res.send({message:'Gagal'});
    }
});

//likepost
server.post('/likepost', async(req,res) => {
    const {users_username, posts_id} = req.body;
    if((users_username!==null) && (posts_id!==null)){
        const query = `INSERT INTO posts_likes (posts_id, users_username) VALUES (?,?)`;
        
        connection.query(query, (err, results) => {
            if(err) {
                res.send({message:'Gagal'});
            }else{
                res.send(results);
                console.log('Berhasil');
            }
        });
    }else{
        res.send({message:'Gagal'});

    }
});

//readpost
server.post('/readpost', async(req, res) => {
    const {posts_id, users_username} = req.body;
    if((users_username!==null) && (posts_id!==null)){
        const query = `SELECT p.title, p.date, p.photo_header, p.content, u.name FROM posts p INNER JOIN users u ON p.username_users = u.username WHERE p.posts_id = ?`;
        connection.query(query, (err, results) => {
            if(err) {
                res.send({message:'Gagal'});
            }else{
                connection.query(`SELECT * FROM posts p LEFT JOIN posts_likes pl ON p.posts_id = ol.posts_id WHERE pl.users_username = ?`, (err2,res2) => {
                    if(err2){
                        res.send({
                            "error":false,
                            "message":"Success",
                            "data":[dataq1],
                            "isLike":true
                        });

                    }else{
                        res.send({
                            "error":false,
                            "message":"Success",
                            "data":[dataq1],
                            "isLike":false
                        });

                    }
                })
            }
        });
    }else{
        res.send({message:'Gagal'});
    }
})

//readcomment
server.post('/readcomment', async(req,res) => {
    const {posts_id} = req.body;
    try{
        if (posts_id !==null){
            const query = `SELECT u.name, u.profile_photo, cp.date, cp.content FROM comments_posts cp INNER JOIN users u ON cp.users_username = u.username WHERE cp.posts_id = ?`;

            connection.query(query, (err, results) => {
                if(err) {
                    res.send({message:"Gagal"});                
                }else{
                    results.push({message:'Sukses'});
                    res.send(results);
                }
            });
        }
    }catch(err){
        res.send({message:"Gagal"});
    }
});

//insertcomment
server.post('/insertcomment', async(req,res) => {
    const {sender_username, posts_id, content} = req.body;
    try{
        if ((sender_username!==null)&&(posts_id !==null)&&(content!==null)){
            const query = `INSERT INTO (posts_id, sender_username, content) comments_posts VALUES (?,?,?)`;
            connection.query(query, (err, results) => {
                if(err) {
                    res.send({message:"Gagal"});                
                }else{
                    res.send({message:'Sukses'});
                }
            });
        }
    }catch(err){
        res.send({message:"Gagal"});
    }
});

//createpost
server.post('/createpost', async(req,res) => {
    const {users_username, posts_id, title, photo_header, content, tag} = req.body;
    try{
        if ((users_username!==null)&&(posts_id!==null)&&(title!==null)&&(photo_header!==null)&&(content!==null)&&(tag!==null)){
            const query = `INSERT INTO posts (posts_id, users_username, title, photo_header, content) VALUES (?,?,?,?,?)`;
            connection.query(query, (err, results) => {
                if(err) {
                    res.send({message:"Gagal"});                
                }else{
                    //ambil id, tag, convert param
                    //loop array dan query selama looping
                    //loop
                    connection.query(`INSERT INTO tag_posts (id_posts,tag) VALUES (?,?)`, (err2, result2) => {
                        if(err2){
                            res.send({message:"Gagal"});
                        }else{
                            res.send(result2);
                        }
                    })
                }
            });
        }
    }catch(err){
        res.send({message:"Gagal"});
    }
});

//uploadprofilepic

/////--------------------------------lupa throw error buat catch

//updateaccount
server.post('/updateaccount', async(req,res) => {
    const {username,name} = req.body;
    try{
        if ((username!==null)&&(name!==null)){
            const query = `UPDATE users SET name = ? WHERE username = ?`;
            connection.query(query, (err, results) => {
                if(err) {
                    res.send({message:"Gagal"});                
                }else{
                    res.send(results);                    
                }
            });
        }else{ throw new Error("Gagal")}
    }catch(err){
        res.send({error: `${err.message}`});
    }
});

//getconsultation
server.post('/getconsultation', async(req,res) => {
    // const {} = req.body;
    const query = `SELECT date_consul FROM users WHERE username = ?`;

    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:"Gagal"});
        }else{
            res.send(results);
        }
    });
});

//logindoctor
server.post('/logindoctor', async(req,res) => {
    const {username, password} = req.body;

    try{
        if((username!==null)&&(password!==null)){
            const query = 'SELECT * FROM doctors d INNER JOIN s WHERE username = ? AND password = ?';
            connection.query(query, (err, results) => {
                if(err) {
                    throw new Error('Query gagal');      
                }else{
                    // if
                    res.send(results);
                }
            });
        }else{throw new Error('Gagal')}
    }catch{
        res.send({
            error: `${err.message}`
        });
    }
});

//getspecialist
server.post('/getspecialist', async(req,res) => {
    // const {} = req.body;
    const query = 'SELECT * FROM specialists';

    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:"Querry Gagal"});
        }else{
            res.send(results);
            // console.log(results);
        }
    });
});

//registerdoctor
server.post('/registerdoctor', async(req,res) => {
    const {username, nama, email, password, gender, specialists_id} = req.body;
    const query = 'SELECT * FROM specialists';
    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:"Username telah dipakai"});
        }else{
            connection.query('INSERT INTO doctors (username, name, email, password, sex, specialists_id) VALUES (?,?,?,?,?,?)', (err2,result2) =>{
                if(err2){
                    res.send({message:'Querry Gagal'});
                }else{
                    res.send({message:"Register Berhasil!!!"});
                }
            });
        }
    });
});

//getdoctorconsultations
server.post('/getdoctorconsultations', async(req,res) => {
    const {username, nama, email, password, gender, specialists_id} = req.body;
    const query = 'SELECT * FROM specialists';
    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:"Username telah dipakai"});
        }else{
            connection.query('INSERT INTO doctors (username, name, email, password, sex, specialists_id) VALUES (?,?,?,?,?,?)', (err2,result2) => {
                if(err2){
                    res.send({message:'Querry Gagal'});
                }else{
                    res.send({message:"Register Berhasil!!!"});
                }
            });
        }
    });
});

//getdoctorconsul
server.post('/getdoctorconsul', async(req,res) => {
    const {consultations_id} = req.body;
    try{
        if(consultations_id!==null){
            const query = 'SELECT cs.consultations_id, cs.sender_username, cs.text, cs.time, cs.photo, c.users_username FROM consul_chats cs INNER JOIN consultations c ON cs.consultations_id = c.consultations_id WHERE consultations_id = ? ORDER BY time ASC';
            connection.query(query, (err, results) => {
                if(err) {
                    res.send({message:"Query Gagal"});
                }else{
                    results;
                    connection.query('SELECT username, name, profile_photo FROM users WHERE username =  ?', (err2,result2) => {
                        if(err2){
                            res.send({message:'Querry Gagal'});
                        }else{
                            //ambil id result, gabung dg result2
                            res.send(
                                //merged result, blm kebayang
                            );
                        }
                    });
                }
            });
        }else{throw new Error("ID tidak boleh kosong")}
    } catch{

    }
});

//getallactivities
server.post('/getallactivities', async(req,res) => {
    // const {} = req.body;
    const query = 'SELECT * FROM activities';
    connection.query(query, (err, results) => {
        if(err) {
            res.send({message:"Gagal"});
        }else{
            res.send(results);
            // console.log(results);
        }
    });
});

//getusersactivites
server.post('/getusersactivites', async(req,res) => {
    const {users_username} = req.body;
    if(users_username!==null){
        const query = 'SELECT * FROM daily_activities da INNER JOIN activities a on da.activities_id = a.activities_id WHERE users_username?';
        connection.query(query, (err, results) => {
            if(results!==null){
                if(err) {
                    res.send({message:"Gagal"});
                }else{
                    res.send(results);
                    // console.log(results);
                }
            }
        });
    }
});

//insertupdateactivities
server.post('/insertupdateactivities', async(req,res) => {
    const{users_username, description, time, activities_id} = req.body;
    if((users_username!==null)&&(description!==null)&&(time!==null)){
        if(activities_id!==null){
            const query = 'UPDATE users_activities SET description = ?, time = ? WHERE activies_id = ?';
        }else{
            const query = 'INSERT INTO users_activities (users_username, description, time) VALUES (?,?,?)';
        }
        connection.query(query, (err,results) => {
            if(err){
                res.send({message:"Query Gagal"});
            }else{
                res.send({message:"Query Berhasil"});
            }

        });
    }
});

//setconsuldate
server.post('/setconsuldate', async(req,res) => {
    const{username, date_consul} = req.body;
    if((username!==null)&&(date_consul!==null)){
        const query = 'PDATE users SET date_consul = ? WHERE username = ?';
        connection.query(query, (err,results) => {
            if(err){
                res.send({message:"Query Gagal"});
            }else{
                res.send({message:"Query Berhasil"});
            }
        });
    }
});


server.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});