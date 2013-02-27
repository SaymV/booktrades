Meteor.startup(function () {
    // code to run on server at startup
    if (Books.find().count() === 0) {
      var books = [ { title: "Applied Combinatorics",
                   author: "Alan Tucker",
                   professor: "Dr. Mosteig",
                   studentclass: "Discrete Methods",
                   school: "lmu",
                   isbn: 9780470458389 },
                   { title: "NOT APPLIED Combinatorics",
                   author: "Alan Tucker",
                   professor: "Dr. Mosteig",
                   studentclass: "Discrete Methods",
                   school: "lmu",
                   isbn: 1234567980 }];
      for (var i = 0; i < books.length; i++)
        Books.insert({title: books[i].title, author: books[i].author, edition: books[i].edition, isbn: books[i].isbn, professor: books[i].professor, studentclass: books[i].studentclass, school: books[i].school, date: new Date()});
    }
  });

//Books Permissions
Books.allow({
    insert: function (userId, book) {
        return false
    },
    update: function (userId, books, fields, modifier) {
        return _.all(books, function (book) {
            if (userId !== book.owner) {
                return false;
            } // wasn't the book owner}

            var allowed = ["title", "author", "isbn", "description", "studentclass", "professor", "school"];
            if (_.difference(fields, allowed).length) {
                return false;
            } // tried to write forbidden field

            return true;
        });
    },

    remove: function (userId, books) {
        return !_.any(books, function (book) {
            // deny if not the owner
            return book.owner !== userId;
        });
    }
});

Meteor.methods({
    // options should include: title, description, author, isbn
    createBook: function (options) {
        options = options || {};
        options.isbn.replace(/\D/g, '');
        if (!(typeof options.title === "string" && options.title.length && typeof options.description === "string" && options.description.length && typeof options.author === "string" && options.author.length >= 0 && typeof options.isbn === "string" && (options.isbn.length === 10 || options.isbn === 13)) && typeof options.school === "string") throw new Meteor.Error(400, "Required parameter missing");
        if (options.title.length > 100) throw new Meteor.Error(413, "Title too long");
        if (options.description.length > 1000) throw new Meteor.Error(413, "Description too long");
        if (!this.userId) throw new Meteor.Error(403, "You must be logged in");

        return Books.insert({
            owner: this.userId,
            author: options.author,
            isbn: options.isbn,
            title: options.title,
            description: options.description,
            studentclass: options.studentclass,
            professor: options.professor,
            school: options.school,
            date: options.date
        });
    }
});

Meteor.publish("books", function (subdomain) {
  return Books.find({"school" : subdomain}, {sort: {date: -1, name: 1}})
});