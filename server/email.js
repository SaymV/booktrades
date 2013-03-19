//This file contains all server email functionality. (contacting book owners, et. al.)
var userEmail = function (user) {
  if (user.emails && user.emails.length) {
    return user.emails[0].address;
  }
  return null;
};
var sendMessage = function (fromId, toId, msg, book) {
  var from = Meteor.users.findOne(fromId),
      to = Meteor.users.findOne(toId),
      fromEmail = userEmail(from),
      toEmail = userEmail(to);
  Email.send({
    from: "hit-reply@booktrad.es",
    to: toEmail,
    replyTo: fromEmail || undefined,
    subject: "BookTrades: "+ fromEmail +" wants your book!",
    text: "You posted your book, " + book.title + ", on BookTrades.\n\n " + 
          "Hit reply to message back. \n\n" +
          "They said:" + msg +
          "\n\n" + 
          "The BookTrades Team.\n"+
          "http://BookTrad.es\n"
  });
}

  Meteor.methods({
  'sendMessage': function (toId, msg, book) {
    if (Meteor.isServer) {
      sendMessage(this.userId, toId, msg, book);
    }
  }
});