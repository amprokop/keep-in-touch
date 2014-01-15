exports.updateKITFriendsList = function(req,res){
  User.findOne({id: req.user.id}, function(user){
  //shuffle friends
  //shuffled = req.friends.shuffle();
  for (var i = 0; i < shuffled.length; i++){
    user.friendsToKIT.push(shuffled[i])
  }
  user.save();
  })
};

exports.sendDailyTexts = function(){
  // friends_to_KIT looks like this: [ [ [4567,'alex prokop'],[43543,'dave thomas'] ] ,   [ ['438753', 'kevin moore'] ] ]      
  // we maintain two buckets--the first one are friends that haven't been reminded yet this time around, 
  // the second have been.
  // we shuffle the friend list before putting it in the first bucket.
  // when it's time to send a text, we simply pop off the last tuple in the first bucket.
  // we send the text to the name contained in that tuple, then push it to the second bucket.
  // when the first bucket is empty, shuffle the second bucket, then move it to the first bucket. 
  // the second bucket becomes an empty array.
  //TODO: shuffle whenever more friends are added to Keep in Touch with.
  User.find().exec(function(err,users){
  for (var i = 0; i < users.length; i++){
    var user = users[i];
    if (user.friends_to_KIT === []){ continue; }
    //TOFIGUREOUT: will user info be stored as a tuple?
    var phoneNumber = user.phoneNumber;
    var userName = user.firstName;
    var friend = user.friends_to_KIT[0].pop();
    var friendName = friend[1];
    sendReminderSMS(phoneNumber,userName, friendName);
    if (user.friends_to_KIT[0] === []){ 
      var shuffledFriendTuple = shuffle(friends_to_KIT[1]);
      user.friends_to_KIT[0] = shuffledFriendTuple;
      user.friends_to_KIT[1] = [];
    }
  }
  //Is this more efficient than saving each user individually?
  users.save();
  });
};



// function to shuffle the users' friend lists
var shuffle = function(array){
  for (var i = 0; i < array.length; i++){
    var rand = Math.floor(Math.random() * array.length);
    array[i] = [ array[rand] , array[rand] = array[i] ][0];
  }
  return array;
};

var sendReminderSMS = function(phoneNumber,recipientName,friendName){
  twilio.sendMessage({
    to: phoneNumber,
    from: '+14152555631',
    body: 'Hi ' + recipientName + ', this is a regularly scheduled reminder from your friends at Keep In Touch. Have you remembered to keep in touch with ' + friendName + ' lately?'
  }, function(err, responseData){
    if (!err){
      console.log(responseData.from);
      console.log(responseData.body);
    } else {
      console.log('twilio error', err);
    }
  });
};

