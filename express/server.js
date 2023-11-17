const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB')
.then(() => console.log('Mongoose Connected'))
.catch((err) => {console.error(err); });
const express = require('express'),
bodyParser = require('body-parser'),
morgan = require('morgan');
uuid = require('uuid');
fs = require('fs');
path = require('path');
const app = express();
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})
app.use(morgan('combined', {stream:accessLogStream}));


app.get('/', async (req, res) => {
  res.send('Welcome to my Cinema database');
  req.responseText += '<small>Requested at: ' + 
  req.requestTime + '</small>';
});



//MOVIES LIST WORKS
app.get('/movies/', async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//TITLE SEARCH WORKS
app.get('/movies/title/:title', async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
  .then((title) => {
    res.json(title);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//RELEASE YEAR WORkS
app.get('/movies/releaseyear/:releaseyear', async (req, res) => {
  await Movies.find({ ReleaseYear: req.params.releaseyear })
  .then((releaseyear) => {
    res.json(releaseyear);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//RATED FOR FIND APPROPRIATE AUDIENCE WORKS 
app.get('/movies/rated/:rated', async (req, res) => {
  await Movies.find({ Rated: req.params.rated })
  .then((rated) => {
    res.json(rated);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Quality of FILMS WORKS
app.get('/movies/rating/:rating', async (req, res) => {
  await Movies.find({ Rating: req.params.rating })
  .then((rating) => {
    res.json(rating);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
 
//GENRE SEARCH FOR MOVIE
app.get('/movies/genre/:genreName', async (req, res) => {
 await Movies.find({'Genre.Name': req.params.genreName})
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});


///DIRECTOR SEARCH WORKS
app.get("/movies/director/:name", (req, res) => {
  Movies.find({'Director.Name': req.params.name })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//API DOCUMENTATION WORKS
app.get('/movies/about_api/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
})


// USERS ARE DISPLAYED WORKS
app.get('/users', async (req, res) => {
  Users.find().then(users => res.json(users));
});

// Get a user by username WORKS
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Add a user - WQRKS
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            Favorite: req.body.Favorite
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});



/// USER CAN UPDATE FOLLOWING - WORKS
// USER NAME
//EMAIL
//BIRTHDAY 
//FAVORITE MOVIE
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
      Favorite: req.body.Favorite
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Add a movie to a user's list of favorites - WORKS
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { Favorite: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});


// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});




  let logwebpage = (req, res, next) => {
    console.log(req.url);
    next();
  };

  let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
  };

  app.use(logwebpage);
  app.use(requestTime);


   // listen for requests
    app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

