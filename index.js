const express = require('express');
const fs = require('fs').promises;
const app = express();
app.use(express.json());
app.use(express.static('pubic'));
const booksFilePath = './data/books.json';

async function readBooks(){
    try {
        const data = await fs.readFile(booksFilePath, 'utf-8');
        return JSON.parse(data);
    } catch(error) {
        console.error('Error reading books: ',error);
        return [];
    }
}
async function writeBooks(books){
    try {
        await fs.writeFile(booksFilePath, JSON.stringify(books,null,2), 'utf-8');
    } catch(error){
        console.error('Error writing books: ',error);
    }
}
app.get('/books',async (req, res) =>{
    const books = await readBooks();
    res.json(books);
});
app.post('/books',async (req, res) => {
    const { title, author} = req.body;
    const books = await readBooks();
    const newId = books.reduce((maxId, book) => Math.max(maxId, book.id),0) + 1;
    const newBook = {id : newId, title, author };
    books.push(newBook);
    await writeBooks(books);
    res.status(201).json(newBook);
});
app.put('/books/:id',async (req, res) => {
    const {title, author} = req.body;
    const {id} = req.params;
    const books = await readBooks();
    const book = books.find(book => book.id === parseInt(id, 10));
    if(!book){
        return res.status(404).json({error: "Book not found"});
    }
    book.title = title || book.title;
    book.author = author || book.author;

    await writeBooks(books);
    res.json(books[bookIndex]);
});
app.delete('/books/:id',async (req, res) =>{
    const {id} = req.params;
    const books = await readBooks();
    const initialLength = books.length;
    const remainingBooks = books.filter(book => book.id !== parseInt(id,10));

    if (remainingBooks.length === initialLength) {
        return res.status(404).json({error: "Book not found"});
    }
    await writeBooks(remainingBooks);
    res.json({ message : 'Book successfully deleted'});
})
const PORT = 3030;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});