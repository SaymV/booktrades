Deps.autorun(function () {
    Meteor.subscribe("books", Session.get("subdomain"));
    Meteor.subscribe("subdomains");
});

var storeSchoolSubdomain = function () {
        var unverifiedSubdomain = window.location.host.split('.')[0];
        if ((Session.get("subdomain") === undefined || Session.get("subdomain") !== unverifiedSubdomain)
            && window.location.host.split('.').length === 2) { //change this to 3 in production (foo.booktrad.es has three pieces)
                Session.set("subdomain", unverifiedSubdomain);
        } else if (unverifiedSubdomain === "booktrad") {
            Session.set("subdomain", "booktrad");
        }
        
    },
    userIsLoggedIn = function () {
        return Meteor.user() !== null;
    },

    verifySubdomain = function (unverifiedSubdomain) {
        return Subdomains.find({subdomain: unverifiedSubdomain}).fetch().length > 0;
    },
    enableSchoolSearchAutocomplete = function () {
        var schools = Subdomains.find({}).fetch(),
            parsedSchools = [];
        for (var i=0; i < schools.length; i++) {
            parsedSchools.push({ value: schools[i].schoolName, id: schools[i].subdomain});
        }
        $('.school-search').autocomplete({
            source: parsedSchools,
            autoFocus: true,
            minLength: 2
        });

        $('.school-search').keypress(function (e) {
            if (e.which  === 13) {               
                $('.change-schools').click();
            }
        });
    },
    changeSubdomains = function (template) {
        if ( template.find("input").value !== "") {
            if ( Subdomains.findOne({schoolName: template.find("input").value}) !== undefined) {
                window.location.href = "http://" + Subdomains.findOne({schoolName: template.find("input").value}).subdomain + ".booktrad.es";
            } else if ( Subdomains.findOne({subdomain: template.find("input").value}) !== undefined ){
                window.location.href = "http://" + template.find("input").value + ".booktrad.es";
            }
        }
    },
    toggleContactOwnerDialog = function (value) {
        Session.set("showContactOwnerDialog", value)
    },
    toggleAboutModal = function () {
        if (Session.get("showAboutModal") === true) {
            Session.set("showAboutModal", false);
        } else {
            Session.set("showAboutModal", true);
        }
    },
    toggleSchoolList = function () {
        if (Session.get("showSchoolList") === true) {
            Session.set("showSchoolList", false);
        } else {
            Session.set("showSchoolList", true);
        }
        
    },
    toggleCreateDialog = function (value) {
        Session.set("showCreateDialog", value);
    };

storeSchoolSubdomain();

Handlebars.registerHelper("displayDate", function(date) {
    if (date === undefined) { 
        date = new Date();
    }
    var dateObject = new Date(date);
    return dateObject.toLocaleDateString() + " at " + dateObject.toLocaleTimeString();
});

Template.aboutModal.events({
    'click .cancel': function () {
        toggleAboutModal();
    }
});

Template.alertDiv.events({
    'click .close': function () {
        Session.set("showAlertDiv", false);
    }
});

Template.bookboard.thereAreBooks = function () {
    return Books.find({}).fetch().length > 0;
};

Template.bookboard.books = function () {
    var books, searchQuery, searchRegex;

    if(Session.get("searchQuery") !== undefined) {
        searchQuery = $(".search-query").val() === undefined ? "" : $(".search-query").val();
        searchRegex = new RegExp("\\\\*" + searchQuery + "\\\\*", "i");
        books = Books.find({
                    $or: [ { "title": { $regex: searchRegex }}, 
                           { "author": { $regex: searchRegex }}, 
                           { "studentclass": { $regex: searchRegex }},
                           { "professor": { $regex: searchRegex }},
                           { "isbn": { $regex: searchRegex}}  ]
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

Template.book.canRemove = function () {
    return this.owner === Meteor.userId();
};

Template.book.events({
    'click .remove': function () {
        Meteor.call("removeBook", this);
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

Template.schoolList.rendered = function () {
    $(".search-query").removeAttr("autofocus");
    $(".school-search").focus();
};

Template.schoolList.events({
    'click .cancel': function () {
        toggleSchoolList();
    },
    'focus .school-search': function () {
        enableSchoolSearchAutocomplete();
    },
    'click .btn': function (event, template) {
        changeSubdomains(template);
    }
});

Template.contactOwnerDialog.book = function () {
    return Session.get("bookToContact");
};

Template.contactOwnerDialog.rendered = function () {
    $(".search-query").removeAttr("autofocus");
    $(".message").focus();
};

Template.contactOwnerDialog.events({
    'click .send': function (event, template) {
        var message = template.find(".message").value;
        Meteor.call('sendMessage', Session.get("bookToContact").owner, message, Template.contactOwnerDialog.book());
        toggleContactOwnerDialog(false);
        Session.set("showAlertDiv", true);
    },

    'click .cancel': function () {
        toggleContactOwnerDialog(false);
    }
});

Template.defaultSchoolSelection.rendered = function () {
    $(".loading").addClass("hidden");
};

Template.defaultSchoolSelection.events({
    'focus .school-search': function () {
        enableSchoolSearchAutocomplete();
    },
    'click .btn': function (event, template) {
        changeSubdomains(template);
    }
});

Template.page.contentLoaded = function () {
    return Subdomains.find({}).fetch().length > 0;
}

Template.page.showBookBoard = function () {
    return Session.get("subdomain") !== undefined   
            && verifySubdomain(Session.get("subdomain"));
};

Template.page.showContactOwnerDialog = function () { 
    return Session.get("showContactOwnerDialog");
};

Template.page.showAboutModal = function() {
    return Session.get("showAboutModal");
};

Template.page.showSchoolList = function () {
    return Session.get("showSchoolList");
};

Template.page.showAlertDiv = function () {
    return Session.get("showAlertDiv");
};

Template.page.showCreateDialog = function () {
    return Session.get("showCreateDialog");
};

Template.sideBar.rendered = function () {
    $(".loading").addClass("hidden");
     $('.search-query').keyup(function () {
        if ($(this).val().length > 0) {
            Session.set("searchQuery", $(this).val());
        } else {
            Session.set("searchQuery", undefined);
        }
    });
    $('.search-query').keypress(function (e) {

        if (e.which  === 13) {               
            return false;
        }
    });
};

Template.navbar.showPostButton = function () {
    return Session.get("subdomain") !== undefined   
            && verifySubdomain(Session.get("subdomain"));
};

Template.navbar.subdomain = function () {
    return Session.get("subdomain");
};

Template.navbar.schoolName = function () {
    return Subdomains.find({subdomain: Session.get("subdomain") }).fetch()[0].schoolName;
};

Template.navbar.events({
    'click .change-schools': function () {
        toggleSchoolList();
    },
    'click .about': function () {
        toggleAboutModal();
    }
});

Template.createDialog.events({
    'click .save': function (event, template) {
        var title = template.find(".title").value,
            description = template.find(".description").value,
            author = template.find(".author").value,
            isbn = template.find(".isbn").value,
            studentclass = template.find(".class").value,
            professor = template.find(".professor").value;

            isbn = isbn.replace(/\D/g, '');
        if (title.length && (isbn.length === 13 || isbn.length === 10)) {
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
                "It needs a title and an isbn, or why bother?");
        }
    },

    'blur .isbn': function (event, template) {
        var unverifiedISBN = template.find(".isbn").value;
        unverifiedISBN = unverifiedISBN.replace(/\D/g, '');
        if (unverifiedISBN.length !== 13 && unverifiedISBN.length !== 10 ) {
            if(template.find(".warning") === null) {
                 $(".isbn").before("<b class=\"warning\">This is not a valid ISBN.</b>")
            }
        } else {
            $(".warning").remove();
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
        if (!userIsLoggedIn()) { // must be logged in to post books
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