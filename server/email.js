//This file contains all server email functionality. (contacting book owners, et. al.)
var userEmail = function (user) {
  if (user.emails && user.emails.length) {
    return user.emails[0].address;
  }
  return null;
};
var sendMessage = function (fromId, toId, msg) {
  var from = Meteor.users.findOne(fromId),
      to = Meteor.users.findOne(toId),
      fromEmail = userEmail(from),
      toEmail = userEmail(to);
  Email.send({
    from: "no-reply@booktrad.es",
    to: toEmail,
    replyTo: fromEmail || undefined,
    subject: "BookTrades: "+ fromEmail +" sent you this email !",
    text: "Hello "+ toEmail +",\n\n"+msg+
    "Test Email, Please Ignore!\n\n"+
    "The BookTrades Team.\n"+
    Meteor.absoluteUrl()+"\n"
  });
}

  Meteor.methods({
  'sendMessage': function (toId, msg) {
    if (Meteor.isServer) {
      sendMessage(this.userId, toId, msg);
    }
  }
});