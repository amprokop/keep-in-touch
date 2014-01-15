var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var graph = require('fbgraph');
var Agenda = require('agenda');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// configuration
var PORT_SET = 8080;
var app = express();
var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/keep-in-touch';
var port = process.env.PORT || PORT_SET;
var db = require('./config/db.js');
var keys = require('./config/keys.js');
// var routes = require('./routes/routes.js');
var verification = require('./server/verification.js');
var messaging = require('./server/messaging.js');
var auth = require('./server/auth.js');
var twilio = require('twilio')(keys.TWILIO_ACCOUNT_SID, keys.TWILIO_AUTH_TOKEN);


//App config
app.configure(function(){
  app.use(express.static(__dirname + "/browser"));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.favicon());
  app.set('port', process.env.PORT || PORT_SET);
});

//DB config
var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/keep-in-touch';
mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error while attempting to connect to mongodb--is mongod running?'));
db.once('open', function(){ console.log('Connected to MongoDB'); })


// Mongoose setup
mongoose.connect(mongoUri);
var dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'there was an error when connecting to mongodb'));
domain = process.env.MONGOHQ_URL ? 'http://sink-in.herokuapp.com/' : 'http://localhost:' + PORT_SET + '/'; // 5050?

// Configure server
// app.set('port', process.env.PORT || 3000);
// app.use(express.favicon());
// app.use(express.bodyParser());

// Mount statics
// app.use(express.static(path.join(__dirname, '/browser')));

// Passport-Facebook configuration


passport.use(new FacebookStrategy({
    clientID: 507035952745575,
    clientSecret: '3689a99cc8241f4304e5c20707f7be13',
    callbackURL: domain + 'auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    var token = accessToken;
    // console.log("\n WTF IS DONE:  \n \n", done);
    var allFriends;

    graph
      .setAccessToken(token)
      .get("me/friends", function(err, res){
        allFriends = res.data;
      });

    var user = new db.User({
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      phone: '',
      friends: []
    });

    user.save(function(err){
      if (err) return handleError(err);
      else {
        var query = db.User.findOne({lastname: "Yang"});
        query.exec(function(err, person){
          if (err) return handleError(err);
          // ? // else console.log("PERSON: ", person);
        });
      }
    });

    return done(undefined, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// new page post-authenticated show friends page

// app.get('/friends', CB(resq,res){})

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/phone',
                                      failureRedirect: '/login' }));

// alex old code below

// Route index.html
app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, './browser/partials/signin.html'));
});

app.get('/phone', function(req, res){
  res.sendfile(path.join(__dirname, './browser/partials/phone.html'));
});

app.post('/submit', function(req, res){
  res.sendfile(path.join(__dirname, './browser/partials/friends.html'));
});

app.get('/friends', function(req, res){
  res.sendfile(path.join(__dirname, './browser/partials/friends.html'));
});


app.post('/friends_to_KIT', function(req,res){

  //shuffle friends
  // shuffled = req.friends.shuffle();

  User.findOne({id: userID}, function(user){
    user.friendsToKit = shuffled;
    user.save;
  })

});

// //speculative request for friends list.
// graph
//   .setAccessToken(req.session.access_token)
//   .get("/me/friends", function(err, data) {
//       console.log(data);
//       // var randomized = shuffle(data)

//Submit number for verification
app.post('/submit_number', verification.submitPhone);
//Confirm number
app.post('/verify_number', verification.verifyNumber);
//Update KIT Friends list in the database
app.post('/update_friends', messaging.updateKITFriendsList);

//set job to run.
var agenda = new Agenda({db: { address: process.env.MONGOHQ_URL || 'mongodb://localhost/keep-in-touch'}});
agenda.define('sendDailyTexts', function(job, done) {
  messaging.sendDailyTexts();
  console.log('Daily texts sent!')
  done();
});

agenda.start();

app.listen(port);
console.log('This ya boy EXPRESS.JS we listening on ' + port + '!');
