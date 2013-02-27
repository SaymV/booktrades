var storeSchoolSubdomain = function () {
        if (Session.get("subdomain") === undefined || Session.get("subdomain") !== window.location.host.split('.')[0]) {
            if (window.location.host.split('.').length === 2) { //change this to 3 in production (foo.booktrad.es has three pieces)
                Session.set("subdomain", window.location.host.split('.')[0]);
            }
        }
    },
    userIsLoggedIn = function () {
        return Meteor.user() !== null;
    },

    verifySubdomain = function () {

    };

storeSchoolSubdomain();

Meteor.autorun(function () {
    Meteor.subscribe("books", Session.get("subdomain"));
});

Handlebars.registerHelper("displayDate", function(date) {
    var dateObject = new Date(date);
    return dateObject.toLocaleDateString() + " at " + dateObject.toLocaleTimeString();
});

Template.bookboard.books = function () {
    var books;
    if(Session.get("searchQuery") !== undefined) {
        var searchQuery = $(".search-query").val() === undefined ? "" : $(".search-query").val(),
            searchRegex = new RegExp("\\\\*" + searchQuery + "\\\\*", "i");
        books = Books.find({
                    $or: [ { "title": { $regex: searchRegex }}, { "author": { $regex: searchRegex }}, { "studentclass": { $regex: searchRegex }},{ "professor": { $regex: searchRegex }}  ]
                }, {
                    sort: {
                        date: -1,
                        name: 1
                }
            });
    } else {
        books = Books.find({}, {
                sort: {
                    date: -1,
                    name: 1
            }
        });
    }
    return books;
};

Template.page.showContactOwnerDialog = function () { 
    return Session.get("showContactOwnerDialog");
};

var toggleContactOwnerDialog = function (value) {
    Session.set("showContactOwnerDialog", value)
};

Template.contactOwnerDialog.book = function () {
    return Session.get("bookToContact");
};

Template.contactOwnerDialog.events({
    'click .send': function (event, template) {
        var message = template.find(".message").value;
        Meteor.call('sendMessage', Session.get("bookToContact").owner, message);
        toggleContactOwnerDialog(false);
    },

    'click .cancel': function () {
        toggleContactOwnerDialog(false);
    }
});

Template.book.canRemove = function () {
    return this.owner === Meteor.userId();
};

Template.book.events({
    'click .remove': function () {
        Books.remove(this._id, this);
        return false;
    },
    'click .contact': function () {
      if (!userIsLoggedIn()) { 
           alert("You must make an account to contact this book owner!");
          return; 
      }
      toggleContactOwnerDialog(true);
      Session.set("bookToContact", this);
    },
    'mouseenter .book': function () {
        $("." + this._id).toggleClass("active-book");
    },
    'mouseleave .book': function () {
         $("." + this._id).toggleClass("active-book");
    }

});

Template.navbar.showPostButton = function () {
    return Session.get("subdomain") !== undefined;
};

Template.navbar.rendered = function () {
    $('.search-query').keyup(function () {
        if ($(this).val().length > 0) {
            Session.set("searchQuery", $(this).val());
        } else {
            Session.set("searchQuery", undefined);
        }
    });
};

Template.navbar.subdomain = function () {
    return Session.get("subdomain");
};

///////////////////////////////////////////////////////////////////////////////
// Create Book dialog

var toggleCreateDialog = function (value) {
    Session.set("showCreateDialog", value);
};


Template.page.showCreateDialog = function () {
    return Session.get("showCreateDialog");
};

Template.createDialog.events({
    'click .save': function (event, template) {
        var title = template.find(".title").value,
            description = template.find(".description").value,
            author = template.find(".author").value,
            isbn = template.find(".isbn").value,
            studentclass = template.find(".class").value,
            professor = template.find(".professor").value;


        if (title.length && description.length) {
            Meteor.call('createBook', {
                title: title,
                description: description,
                author: author,
                isbn: isbn,
                professor: professor,
                studentclass: studentclass,
                school: Session.get("subdomain"),
                date: new Date()
            }, function (error, book) {
                if (!error) {
                    Session.set("selected", book);
                }
            });
             toggleCreateDialog(false);
        } else {
            Session.set("createError",
                "It needs a title and a description, or why bother?");
        }
    },

    'click .cancel': function () {
        toggleCreateDialog(false);
    }
});

Template.createDialog.error = function () {
    return Session.get("createError");
};

Template.postButton.events({
    'click button': function (event, template) {
        if (!userIsLoggedIn()) { // must be logged in to create events
            alert("You must make an account to post your Books!");
            return;
        }
        toggleCreateDialog(true);
    }
});

//Accounts Configuration for email only
Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY'
});