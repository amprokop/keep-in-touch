exports.submitPhone = function(req,res){ 
  var userNumber = req.user.phoneNumber;
  var userName = req.user.userName;
  //generate verification code (TODO: this isn't always five digits)
  var verificationCode = Math.floor(Math.random() * 10000);
  User.findOne({_id : req.user.id}, function(user){
    user.verificationNumber = verificationCode;
    user.save();
  });
  sendVerificationSMS(userNumber,userName,verificationCode);
};

exports.verifyPhone = function(req,res){
  var submittedCode = req.submittedCode;
  User.findOne({_id : req.user.id}, function(user){
    if (user.verificationNumber === submittedCode){
      user.verified = true;
      user.save();
      res.redirect('/');
    } else {
      //do something if the user gets it wrong
    }
  });
};


var sendVerificationSMS = function(phoneNumber,code){
  twilio.sendMessage({
    to: phoneNumber,
    from: '+14152555631',
    body: 'This is a verification code from Keep in Touch. To verify your account, please enter the number ' + code + ' into the form provided on the website. If you have not visited Keep In Touch, please ignore this message. This is an automated text message and replies will not be received.'
  }, function(err, responseData){
    if (!err){
      console.log(responseData.from);
      console.log(responseData.body);
    } else {
      console.log('twilio error', err);
    }
  });
};
