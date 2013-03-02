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
    subject: "BookTrades: "+ fromEmail +" wants to buy your book!",
    text: "Hello "+ toEmail +"!\n\n" + 
          "You posted your book, " + book.title + ", on BookTrades.\n\n " + 
          "You can either reply to this email or use the contact info they provided. \n\n" +
          "They said: \n\n Hey, I saw your book on BookTrades and I want to buy it! \n\n " +
          "Here's my contact info: " + msg +
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