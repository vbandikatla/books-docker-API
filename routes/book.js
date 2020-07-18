const mongoose = require('mongoose');
const { clearKey } = require("../services/cache");
const Book = mongoose.model("Book");

module.exports = app => {
    app.get("/api/books", async (req, res) => {
        if (req.query.author) {
            res.send(await Book.find({ author: req.query.author })).cache();
        } else {
            res.send(await Book.find().cache({ time: 10 }));
        }
    });

    app.post("/api/books", async (req, res) => {
        const { title, content, author } = req.body;

        const book = new Book({
            title,
            content,
            author
        });

        try {
            await book.save();
            clearKey(Book.collection.collectionName);
            res.send(book);
        } catch (err) {
            res.send(400, err);
        }
    });
};