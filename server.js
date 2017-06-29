var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

var app = express();

var port = process.env.PORT || 3000;
//var User = require('./models/User');

app.use(express.static("./public"));

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

app.get("/", function(req, res) {
    res.sendFile("./public/index.html");
});

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
        if(users[i].token === req.token){
            user=users[i];
        }
    }
    res.json({
        type: true,
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

app.get('/obtainRecRest', ensureAuthorized, function(req, res){
    //TODO: llamada a la base de datos para obtener restaurantes recomendados

    //ejemplo de json que se envia a las applicacion
    var recRest=[{
        nombre: "La Tablita del Tártaro",
        categoria: "Parrilladas",
        calificacion: 4,
        img: "http://www.latablitadeltartaro.com/wp-content/uploads/2016/07/tablita_del_tartaro.png"
    },{
        nombre: "La Tablita del Tártaro",
        categoria: "Parrilladas",
        calificacion: 4,
        img: "http://www.latablitadeltartaro.com/wp-content/uploads/2016/07/tablita_del_tartaro.png"
    }];

    res.json({
        data: recRest
    });
});

app.get('/obtainRecDish', ensureAuthorized, function(req, res){
    //TODO: llamada a la base de datos para obtener platos recomendados

    //ejemplo de json que se envia a las applicacion
    var recDish=[{
        nombre: "hamburguesa doble",
        categoria: "Fast Food",
        calificacion: 3,
        img: "http://www.elcorral.com/wp-content/uploads/2017/03/Corralazos-Destacado-pagina-WEB.png",
        descripcion: "contiene tantos ingrdientes etc..."
    }];

    res.json({
        data: recDish
    });
});

process.on('uncaughtException', function(err) {
	console.log(err);
});

// Start Server
app.listen(port, function () {
	console.log( "Express server listening on port " + port);
});