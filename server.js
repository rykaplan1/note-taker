const express = require('express');
const uniqid = require('uniqid');
const path = require('path');
const fs = require('fs');
const dbPath = './db/db.json'

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('public'));

//Built-in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Middleware
const readNotes = (req, res, next) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Notes retrieved.');
      res.locals.notes = JSON.parse(data);
      next();
    }
  });
}

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// API Routes
app.get('/api/notes', readNotes, (req, res) => {
  res.json(res.locals.notes);
});

app.post('/api/notes', readNotes, (req, res) => {
  const notes = res.locals.notes;
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uniqid()
    };

    notes.push(newNote);

    const noteDataString = JSON.stringify(notes);

    fs.writeFile(dbPath, noteDataString, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Note has been added to JSON file.');
      }
    });

    const response = {
      status: 'success',
      body: newNote
    }

    console.log(response);
    res.status(201).json(response);

  } else {
    res.status(500).json("Error in posting note.");
  }
});

app.delete('/api/notes/:id', readNotes, (req, res) => {
  const notes = res.locals.notes;

  const newNoteData = notes.filter(note => note.id !== req.params.id);

  if (newNoteData.length > 0) {
    const noteDataString = JSON.stringify(newNoteData);

    fs.writeFile(dbPath, noteDataString, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Note has been deleted from JSON file.');
      }
    });

    res.status(204).send();
  } else {
    res.status(500).json("Error in deleting note.");
  }
});

// Port Listener
app.listen(PORT, () => {
  console.log(`Note Taker listening at http://localhost:${PORT}`);
})


