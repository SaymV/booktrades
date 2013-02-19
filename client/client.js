var storeSchoolSubdomain = function () {
    if (Session.get("subdomain") === undefined || Session.get("subdomain") !== window.location.host.split('.')[0]) {
        if (window.location.host.split('.').length === 2) { //change this to 3 in production (foo.booktrad.es has three pieces)
            Session.set("subdomain", window.location.host.split('.')[0]);
        }
    }
};

storeSchoolSubdomain();

Meteor.autorun(function () {
    Meteor.subscribe("books", Session.get("subdomain"));
});

Template.bookboard.books = function () {
    var books;
    if(Session.get("searchQuery") !== undefined) { //this session variable is undefined as of the last commit.
        var searchQuery = $(".search-query").val() === undefined ? "" : $(".search-query").val(),
            searchRegex = new RegExp("\\\\*" + searchQuery + "\\\\*", "i");
        console.log(searchQuery);
        console.log(searchRegex);
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
    console.log(books);
    return books;
};

Template.book.canRemove = function () {
    return this.owner === Meteor.userId();
};

Template.book.events({
    'click .remove': function () {
        Books.remove(this._id, this);
        return false;
    }
});

Template.navbar.showPostButton = function () {
    return Session.get("subdomain") !== undefined;
};

Template.navbar.rendered = function () {
    $('.search-query').keyup(function () {
        console.log(Session.get("searchActivated"));
        if ($(this).val().length > 0) {
            Session.set("searchActivated", true);
            Session.set("searchQuery", $(this).val());
        } else {
            Session.set("searchActivated", false);
            Session.set("searchQuery", undefined);
        }
    });
};

Template.navbar.subdomain = function () {
    return Session.get("subdomain");
};

///////////////////////////////////////////////////////////////////////////////
// Create Book dialog

var openCreateDialog = function () {
    Session.set("showCreateDialog", true);
    console.log("I've been here before a few times.");
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
            Session.set("showCreateDialog", false);
        } else {
            Session.set("createError",
                "It needs a title and a description, or why bother?");
        }
    },

    'click .cancel': function () {
        Session.set("showCreateDialog", false);
    }
});

Template.createDialog.error = function () {
    return Session.get("createError");
};

Template.postButton.events({
    'click button': function (event, template) {
        if (!Meteor.userId()) { // must be logged in to create events
            alert("You must make an account to post your Books!");
            return;
        }
        openCreateDialog();
    }
});

//Accounts Configuration for email only
Accounts.ui.config({
    passwordSignupFields: 'EMAIL_ONLY'
});