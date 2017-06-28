var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

var app = express();

var port = process.env.PORT || 3000;
//var User = require('./models/User');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

var users = [];

app.post('/authenticate', function(req, res) {
	var user;
	for (var i = 0; i < users.length; i++) {
		if(users[i].email==req.body.email && users[i].password==req.body.password){
			user=users[i];
		}
	}

    if (user) {
       res.json({
            type: true,
            data: user,
            token: user.token
        });
    } else {
        res.json({
            type: false,
            data: "Incorrect email/password"
        });    
    }
});

app.post('/signin', function(req, res) {
	var user;
	for (var i = 0; i < users.length; i++) {
		if(users[i].email==req.body.email){
			user=users[i];
		}
	}

    if (user) {
        res.json({
            type: false,
            data: "User already exists!"
        });
    } else {
        var userModel={email: req.body.email,
        	password: req.body.password,
        	token: ''
        };
        userModel.token = jwt.sign(userModel, process.env.JWT_SECRET || 'secreto');
        users.push(userModel);
        res.json({
            type: true,
            data: userModel,
            token: userModel.token
        });
    }
});

app.get('/me', ensureAuthorized, function(req, res) {
    var user;
    for (var i = 0; i < users.length; i++) {
        console.log("token bd: "+users[i].token+" --> token app: "+req.token);
        if(users[i].token === req.token){
            user=users[i];
        }
    }
    res.json({type: true,
        data: user
    });
});

function ensureAuthorized(req, res, next) {
	var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

process.on('uncaughtException', function(err) {
	console.log(err);
});

// Start Server
app.listen(port, function () {
	console.log( "Express server listening on port " + port);
});