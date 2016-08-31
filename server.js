var mysql = require('mysql'); 
var express = require('express'); 
var app = express(); 
app.use(express.static(__dirname));
var http = require('http').Server(app); 
var io = require('socket.io')(http); 

var db_details = require('./DBDetails')
var dbd_host = db_details.host_get(); 
var dbd_user = db_details.user_get(); 
var dbd_passw = db_details.password_get(); 
var dbd_db = db_details.db_get();


app.get('/', function(req,res) {
    console.log("recieved request"); 
    res.sendFile(__dirname + '/frontend.html'); 
});  


io.on('connection', function(socket) {
    console.log("connected"); 
    socket.on('search word', function(sw) {
        if (sw != "") {
            console.log("search for word -> search press"); 

            // connect to database
            var conn = mysql.createConnection({
                host : dbd_host,
                user : dbd_user,
                password : dbd_passw,
                database : dbd_db
            }); 
            // check connection
            conn.connect(function(err) {
                if (err) {
                    console.log("connection error");
                    console.log(err);
                }
            });

            // run sql query 
            var sql = "SELECT definition FROM entries WHERE word = '" + sw + "'"; 
            conn.query(sql, function(err, result) {
                conn.end();
                if (err) {
                    console.log("query error"); 
                } else {
                    console.log("size " + result.length); 
                    console.log(); 
                    var resultLength = 0; 
                    if ( result.length > 3 ) {
                        resultLength = 3; 
                    } else {
                        resultLength = result.length; 
                    }
                    var i=0; 
                    var defs = []; 
                    for (i=0; i<resultLength; i++) {
                        defs.push(result[i].definition); 
                        console.log(result[i].definition); 
                        console.log(); 
                    }
                    console.log("defs --> "); 
                    console.log(defs); 
                    if (defs.length > 0 ) {
                        io.emit('search feedback', defs); 
                    } else {
                        io.emit('no search feedback'); 
                    }
                }
            });
        } else {
            console.log("NO word to search for"); 
        }
    });
});


http.listen(8080, function() {
    console.log("listening on port 8080"); 
});

