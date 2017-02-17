var express = require('express'),
    bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	config = require('./server/config.js');
	
	//use for session later
	// expressSession = require('express-session');
	// mongoStore = require('connect-mongo')({session: expressSession});

var app = express();
	app.use(bodyParser.json()); 

mongoose.connect('mongodb://ds153719.mlab.com:53719/foodordering');
var db = mongoose.connection;

db.once('open', function(err){
	if(err){
        console.log("Error Opening the DB Connection: ", err);
        return;
    }
    else{
    	console.log("Connected to database");
    }
    // app.use(expressSession({
    //     secret: config.SECRET,
    //     cookie: {maxAge: 60 * 60 * 1000},
    //     store: new mongoStore({
    //         db: mongoose.connection.db,
    //         collection: 'sessions'
    //     })
    // }));
    app.listen(3000);
    console.log("App run on port 3000");
});
db.on('error', console.error.bind(console, 'Connection Error:'));

var router = express.Router();

var users = require('./server/controllers/users.js');
	
 //routes
router.route('/signup').post(users.signup);
// router.route('/login').post(users.login);
// router.route('/loggedIn').post(users.loggedIn);
// router.route('/logout').get(users.logout);

// function requirePhoneVerifycation(req, res, next){
//     if(req.session.phone_verified){
//         console.log("Verified");
//         next();
//     }
//     else{
//         console.log("Not Verified");
//         res.redirect('/verification')
//     }
// }

router.route('/test').post(function(req, res){
    return res.status(200).send({"connected": true});
});

app.get('/', function(req, res){
    res.send("hello");
})
