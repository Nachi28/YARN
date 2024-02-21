if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const twilio = require('twilio');

// Initialize Twilio client with environment variables
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  password: String,
  age: String,
  userType: { type: String, enum: ['patient', 'doctor'] },
  emergencyContact: {
    name: String,
    email: String,
    phone: String,
  },
  journal: [{
    content: String,
    mood: String,
    timestamp: { type: Date, default: Date.now }
  }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  awards: [String],
  games: { memoryCards: [{ mode: String, moves: Number, time: Number, timestamp: { type: Date, default: Date.now } }], sudoku: [{ time: Number, difficulty: String, timestamp: { type: Date, default: Date.now } }], minimi: [{ score: Number, time: Number }] },
  // scores: [{
  //   score: Number,
  //   gameType: String,
  //   difficulty: String,
  //   timePerrun: Number,
  //   movesPerrun: Number,
  //   rangeOfMovement: [Number],
  //   timestamp: { type: Date, default: Date.now }
  // }],
  // Doctor-specific fields
  qualification: String,
  nmcRegistrationNo: String,
  yearOfRegistration: Number,
  medicalCouncil: String
});


const User = mongoose.model('User', userSchema);
const upcomingEventSchema = new mongoose.Schema({
  event: String,
  date: String,
  date_end: String
});
const UpcomingEvent = mongoose.model('upcoming', upcomingEventSchema);



const forumSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  comments: [{
    content: String,
    author: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: {
    type: Number,
    default: 0
  }

});

const Forum = mongoose.model('Forum', forumSchema);




// Passport initialization
const initializePassport = require('./passport-config');
initializePassport(passport, async (email) => {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}, async (id) => {
  return await User.findById(id);
});

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days in milliseconds
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define an async function to fetch upcoming events
async function fetchAndProcessUpcomingEvents() {
  try {
    const upcomingEvents = await UpcomingEvent.find({}).lean();
    // console.log("Upcoming Events:", upcomingEvents); // Log retrieved events

    // Convert date strings to Date objects
    upcomingEvents.forEach(event => {
      event.date = new Date(event.date);
      if (event.date_end) {
        event.date_end = new Date(event.date_end);
      }
    });

    // Get the current date
    const currentDate = new Date();

    // Filter out past events
    const upcomingEventsFiltered = upcomingEvents.filter(event => event.date >= currentDate);

    // Sort upcoming events by date in ascending order
    upcomingEventsFiltered.sort((a, b) => a.date - b.date);

    // Take the latest 3 upcoming events
    const latestUpcomingEvents = upcomingEventsFiltered.slice(0, 3);

    // console.log("Latest 3 upcoming events compared to current date:");
    console.log(latestUpcomingEvents);

    return latestUpcomingEvents;
  } catch (error) {
    console.error('Error fetching and processing upcoming events:', error);
    return []; // Return an empty array if there's an error
  }
}


// Home page
app.get('/', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user;
    if (user.userType === 'patient') {
      const latestUpcomingEvents = await fetchAndProcessUpcomingEvents();
      // console.log(latestUpcomingEvents);
      res.render('index.ejs', { user: user, upcomingEvents: latestUpcomingEvents, openaiKey: process.env.OPENAI });
    } else {
      res.redirect('/doctor-home');
    }
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).send('Error fetching upcoming events');
  }
});


// Login page
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));


const medicalCouncils = [
  "Andhra Pradesh Medical Council",
  "Arunachal Pradesh Medical Council",
  "Assam Medical Council",
  "Bihar Medical Council",
  "Chandigarh Medical Council",
  "Chhattisgarh Medical Council",
  "Delhi Medical Council",
  "Goa Medical Council",
  "Gujarat Medical Council",
  "Haryana Medical Council",
  "Himachal Pradesh Medical Council",
  "Jammu and Kashmir Medical Council",
  "Jharkhand Medical Council",
  "Karnataka Medical Council",
  "Kerala Medical Council",
  "Madhya Pradesh Medical Council",
  "Maharashtra Medical Council",
  "Manipur Medical Council",
  "Meghalaya Medical Council",
  "Mizoram Medical Council",
  "Nagaland Medical Council",
  "Odisha State Medical Council",
  "Puducherry Medical Council",
  "Punjab Medical Council",
  "Rajasthan Medical Council",
  "Sikkim Medical Council",
  "Tamil Nadu Medical Council",
  "Telangana State Medical Council",
  "Tripura Medical Council",
  "Uttar Pradesh Medical Council",
  "Uttarakhand Medical Council",
  "West Bengal Medical Council"
];

// Register page
app.get('/register', checkNotAuthenticated, (req, res) => {
  try {
    // Some code here
    const userrr = req.flash('user');
    res.render('register.ejs', { userrr, medicalCouncils });  // Pass an object with the key 'err'

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      req.flash('user', existingUser)
      return res.redirect('/register');
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.name,
        email: req.body.email,
        phone: req.body.userPhone,
        password: hashedPassword,
        age: req.body.age,
        userType: req.body.userType,
        emergencyContact: {
          name: req.body.emergencyName,
          email: req.body.emergencyEmail,
          phone: req.body.emergencyPhone,
        },
        qualification: req.body.qualification, // Add this line to include qualification
        nmcRegistrationNo: req.body.nmcRegistrationNo, // Add this line to include NMC registration number
        yearOfRegistration: req.body.yearOfRegistration, // Add this line to include year of registration
        medicalCouncil: req.body.medicalCouncil // Add this line to include medical council
      });
      await user.save();
      req.login(user, (err) => {
        if (err) {
          console.error("Error during login after registration:", err);
          return res.redirect('/login');
        }
        req.flash('success', 'Registration successful. You have been logged in.');
        return res.redirect('/');
      });
    }

  } catch (error) {
    console.error("Error during registration:", error);
    return res.redirect('/register');
  }
});



// Logout route
app.delete('/logout', (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

app.post('/memoryCard-game-over', checkAuthenticated, async (req, res) => {
  try {
    const currentUser = await req.user;
    console.log("Received game over data:", req.body);
    const { mode, moves, time } = req.body; // Extract data from the request body
    console.log(req.body);
    // Assuming currentUser has a 'games.memoryCards' array field
    currentUser.games.memoryCards.push({
      mode,
      moves,
      time
    });

    // Save the updated user document
    await currentUser.save();

    res.status(200).json({ success: true, message: 'Score updated successfully' });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


app.post('/sudoku-game-over', checkAuthenticated, async (req, res) => {
  try {
    const currentUser = await req.user;
    console.log("Received game over data:", req.body);
    const time = req.body.timer; // Extract data from the request body
    console.log(req.body);
    // Assuming currentUser has a 'games.memoryCards' array field
    currentUser.games.sudoku.push({ time, difficulty: "none" });

    // Save the updated user document
    await currentUser.save();

    res.status(200).json({ success: true, message: 'Score updated successfully' });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/doctor-home', checkAuthenticated, async (req, res) => {
  try {
    const doctor = await req.user;

    // Fetch all patient details in connectionRequests
    const connectionRequests = await Promise.all(
      doctor.connectionRequests.map(async (request) => {
        const patient = await User.findById(request._id);
        return { patient }; // Include _id for later use in the template
      })
    );

    const connections = await Promise.all(
      doctor.connections.map(async (request) => {
        const patient = await User.findById(request._id);
        return { patient }; // Include _id for later use in the template
      })
    );

    res.render('doctor-home.ejs', { user: doctor, connectionRequests, connections });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.render('doctor-home.ejs', { error: 'Internal Server Error' });
  }
});





app.get('/journal', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user;
    res.render('journal.ejs', { user: user });
  } catch (error) {
    console.error('Error fetching user for journal:', error);
    // Handle the error appropriately, for example, redirecting to an error page
    res.status(500).send('Internal Server Error');
  }
});

app.post('/journal', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user; // Assuming the user is authenticated

    // Extract content and mood from the form input
    const { content, mood } = req.body;

    // Add the journal entry to the user's journal array
    user.journal.push({ content, mood });

    // Save the updated user with the new journal entry to MongoDB
    await user.save();

    // Redirect the user to the edit profile page or any other relevant page
    req.flash('success', 'Journal entry added successfully.');
    res.redirect('/journal'); // Redirect back to the journal page
  } catch (error) {
    req.flash('error', 'An error occurred while adding the journal entry.');
    res.redirect('/journal'); // Redirect back to the journal page in case of an error
  }
});
app.post('/journal-delete', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user; // Assuming the user is authenticated

    // Extract the ID of the journal entry to be deleted from the request body
    const entryId = req.body.entryId;
    // console.log(entryId.trim());
    // console.log(user.journal[0]._id.toString())

    // Find the index of the journal entry with the given ID in the user's journal array
    const entryIndex = user.journal.findIndex(entry => entry._id.toString() === entryId.trim());
    console.log('Entry index:', entryIndex);


    // Check if the journal entry exists
    if (entryIndex === -1) {
      // If not found, set flash message for error and redirect
      console.log('Journal entry not found');
      req.flash('error', 'Journal entry not found');
      return res.redirect('/journal');
    }

    // Remove the journal entry from the user's journal array
    user.journal.splice(entryIndex, 1);

    // Save the updated user (with the journal entry removed) to MongoDB
    await user.save();

    // Set flash message for success and redirect
    console.log('Journal entry deleted successfully');
    req.flash('success', 'Journal entry deleted successfully');
    res.redirect('/journal');
  } catch (error) {
    // Set flash message for error and redirect
    console.error('Error deleting journal entry:', error);
    req.flash('error', 'An error occurred while deleting the journal entry');
    res.redirect('/journal');
  }
});



app.get('/memory-games', checkAuthenticated, (req, res) => {
  res.render('memory-games.ejs');
});

app.post('/memory-games', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user; // Assuming the user is authenticated

    // Extract the selected game from the form input
    const selectedGame = req.body.gametype;

    // Log the selected game or perform any other necessary action
    console.log('Selected game:', selectedGame);

    // Redirect the user to the relevant page
    res.render('memory-games-all.ejs', { user: user, selectedGame: selectedGame });
  } catch (error) {
    console.error('Error processing memory game request:', error);
    req.flash('error', 'An error occurred while processing the memory game request.');
    res.redirect('/memory-games'); // Redirect to the memory games page in case of an error
  }
});






// Route to render the forum page
app.get('/forum', checkAuthenticated, async (req, res) => {
  try {
    // Assuming user is authenticated, retrieve the user from req.user
    const user = await req.user;

    // Fetch forum data from the database
    const forums = await Forum.find({}).populate('createdBy').exec();

    // Render the forum page and pass the forum data and user data to the EJS template
    res.render('forum.ejs', { user: user, forums: forums });
  } catch (error) {
    console.error('Error fetching forum data:', error);
    // Handle the error appropriately, for example, redirecting to an error page
    res.status(500).send('Internal Server Error');
  }
});


// POST request to create a new forum post
app.post('/forum', checkAuthenticated, async (req, res) => {
  try {
    // Extract data from the request body
    const { heading, description, tags } = req.body;
    const user = await req.user; // Assuming the user is authenticated

    // Create a new forum post instance
    const newPost = new Forum({
      heading: heading,
      description: description,
      createdBy: user._id, // Assuming req.user contains the current user's information
      tags: tags.split(','), // Split tags string into an array
    });

    // Save the new forum post to the database
    await newPost.save();

    // Redirect the user to the forum page or any other relevant page
    req.flash('success', 'Forum post created successfully.');
    res.redirect('/forum');
  } catch (error) {
    console.error('Error creating forum post:', error);
    req.flash('error', 'An error occurred while creating the forum post.');
    res.redirect('/forum'); // Redirect back to the forum page in case of an error
  }
});


app.post('/sendSOS', checkAuthenticated, async (req, res) => {
  try {
    // Get the authenticated user's information
    const user = await req.user;

    // Extract the emergency contact phone number from the user's information
    const emergencyContactPhone = user.emergencyContact.phone;

    // Extract user's name and contact number
    const patientName = user.username;
    const patientContact = user.phone;

    // Send SMS using Twilio
    await client.messages.create({
      body: `THIS IS AN SOS MESSAGE BY YARN, from ${patientName}. Please contact immediately at ${patientContact}.`,
      from: '+15169812980', // Your Twilio phone number
      to: emergencyContactPhone
    });

    console.log('SOS sent successfully.');
    // Set success flash message
    req.flash('success', 'SOS request sent successfully.');
    // Redirect to the home page or any other relevant page

    res.redirect('/');
  } catch (error) {
    console.error('Error sending SOS:', error);
    // Set error flash message
    req.flash('error', 'Failed to send SOS.');

    // Redirect to the home page or any other relevant page
    res.redirect('/');
  }
});




app.post('/comment', checkAuthenticated, async (req, res) => {
  try {
    // Extract data from the request body
    const { forumId, comment } = req.body;
    const user = await req.user; // Assuming the user is authenticated

    // Find the forum post by its ID
    const forumPost = await Forum.findById(forumId);

    if (!forumPost) {
      // If the forum post is not found, return an error response
      return res.status(404).send('Forum post not found');
    }

    // Create a new comment object
    const newComment = {
      content: comment,
      author: user.username, // Assuming req.user contains the current user's information
    };

    // Push the new comment to the comments array of the forum post
    forumPost.comments.push(newComment);

    // Save the updated forum post with the new comment
    await forumPost.save();

    // Redirect the user to the forum page or any other relevant page
    req.flash('success', 'Comment added successfully.');
    res.redirect('/forum');
  } catch (error) {
    console.error('Error adding comment:', error);
    req.flash('error', 'An error occurred while adding the comment.');
    res.redirect('/forum'); // Redirect back to the forum page in case of an error
  }
});




app.get('/physical-activity', checkAuthenticated, (req, res) => {
  res.render('home-physicalgame.ejs');
});

app.get('/todo', checkAuthenticated, (req, res) => {
  res.render('todo.ejs');
});


app.get('/edit-profile', (req, res) => {
  // Render the edit profile page, you can create a new EJS file for this
  req.user.then(user => {
    res.render('edit-profile.ejs', { user: user }); // Replace 'edit-profile' with the actual name of your EJS file  })
  });

});


app.post('/edit-profile', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user; // Assuming the user is authenticated

    // Update user details based on the form input
    user.username = req.body.name;
    user.age = req.body.age;
    user.email = req.body.email;
    user.emergencyContact.name = req.body.emergencyName;
    user.emergencyContact.email = req.body.emergencyEmail;
    user.emergencyContact.phone = req.body.emergencyPhone;
    // Save the updated user to MongoDB
    await user.save();

    // Redirect the user to the profile page or any other relevant page
    req.flash('success', 'Profile updated successfully.');
    res.redirect('/edit-profile'); // Replace 'profile' with the actual route for viewing the profile
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'An error occurred while updating the profile.');
    res.redirect('/edit-profile'); // Redirect back to the edit profile page in case of an error
  }
});


app.delete('/delete-account', checkAuthenticated, async (req, res) => {
  try {
    // Access the currently authenticated user
    const currentUser = await req.user;

    // Perform the deletion logic, for example using Mongoose
    await User.deleteOne({ _id: currentUser._id });

    // Log the user out after deleting the account
    req.logout((err) => {

      if (err) {
        return res.status(500).json({ success: false, message: 'Error logging out' });
      }
      res.json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
// Route for handling the profile update (POST request)


app.get('/statistics', checkAuthenticated, (req, res) => {
  req.user.then(user => {
    // console.log(user);
    res.render('statistics.ejs', { user: user });
  })

});


app.post('/statistics', checkAuthenticated, async (req, res) => {
  try {
    const patientData = req.body;
    const doctor = await req.user;
    console.log("Received patient data for statistics:", patientData);

    // Determine if the user is a doctor
    const isDoctor = doctor.userType === 'doctor';

    // Combine patientData and additionalData into a single object
    const responseData = { user: patientData, isDoctor };

    // Render the 'statistics.ejs' view with the response data
    res.render('statistics.ejs', responseData);
  } catch (error) {
    console.error('Error processing patient data for statistics:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Add routes for accepting and declining connection requests
app.post('/accept-connection-request', checkAuthenticated, async (req, res) => {
  try {
    const doctor = await req.user;
    const patientId = req.body.patientId;

    // Check if the patientId exists in connectionRequests
    const index = doctor.connectionRequests.indexOf(patientId);
    if (index === -1) {
      console.error('Connection request not found.');
      return res.status(400).send('Bad Request');
    }

    // Remove the patientId from connectionRequests and add it to connections
    doctor.connectionRequests.splice(index, 1);
    doctor.connections.push(patientId);

    // Save changes
    await doctor.save();

    // Push the doctor's ObjectID to patient's connections array
    const patient = await User.findById(patientId);
    patient.connections.push(doctor._id);
    await patient.save();


    res.redirect('/doctor-home'); // Redirect to the doctor's home page
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/decline-connection-request', checkAuthenticated, async (req, res) => {
  try {
    const doctor = await req.user;
    const patientId = req.body.patientId;

    // Find and remove the connection request
    doctor.connectionRequests.pull(patientId); // Directly pass the patientId as it's an ObjectId

    // Save changes
    await doctor.save();

    res.redirect('/doctor-home'); // Redirect to the doctor's home page
  } catch (error) {
    console.error('Error declining connection request:', error);
    res.status(500).send('Internal Server Error');
  }
});



async function getDoctorList(user) {
  // Assuming user.connections contains doctor IDs
  const doctorIds = user.connections || [];

  // Fetch doctors' details using the IDs
  const doctors = await Promise.all(doctorIds.map(async (request) => {
    const doctor = await User.findById(request._id);
    return { doctor }; // Include _id for later use in the template
  }));

  return doctors;
}


// Add a new route for the "Add Doctor" page
// Use the function in both routes
app.get('/add-doctor', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user;
    const doctors = await getDoctorList(user);

    if (doctors.length > 0) {
      res.render('add-doctor.ejs', { user, doctors });
    } else {
      res.render('add-doctor.ejs', { user, doctors: [] });
    }
  } catch (error) {
    console.error('Error rendering add-doctor page:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



// Handle doctor addition form submission
app.post('/add-doctor', checkAuthenticated, async (req, res) => {
  try {
    const patient = await req.user; // Retrieve the user from the database
    // console.log(patient);
    // console.log("Aaaaaaaaa");

    const { doctorName, doctorEmail } = req.body;

    // Check if the doctor with the specified name and email exists
    const doctor = await User.findOne({ username: doctorName, email: doctorEmail, userType: 'doctor' });

    // Get the updated list of doctors
    const doctors = await getDoctorList(patient);
    console.log(doctors)

    if (!doctor) {
      return res.render('add-doctor.ejs', { success: false, error: 'Invalid doctor name or email', user: patient, doctors: doctors });
    }

    // Check if the doctor is already in the patient's connections
    if (patient.connections.includes(doctor._id.toString())) {
      console.log("Doctor is already in connections");
      return res.render('add-doctor.ejs', { success: false, error: 'Doctor is already in your connections', user: patient, doctors: doctors });
    }

    // Check if the connection request has already been sent by the doctor
    if (doctor.connectionRequests.includes(patient._id.toString())) {
      // console.log("baby");
      return res.render('add-doctor.ejs', { success: false, error: 'Request already sent', user: patient, doctors: doctors });
    }

    // Store the connection request only on the doctor's side
    doctor.connectionRequests.push(patient._id.toString());
    await doctor.save();


    res.render('add-doctor.ejs', { success: true, message: 'Request successfully sent', user: patient, doctors: doctors });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.render('add-doctor.ejs', { success: false, message: 'Internal Server Error', user: req.user, error: error.message, doctors: doctors });
  }
});


app.delete('/remove-foreign-user', checkAuthenticated, async (req, res) => {
  try {
    const currentUser = await req.user; // Assuming req.user contains the current doctor's information

    // Extract foreignId from the request body
    const foreignId = req.body.foreignId;

    // Check if the foreignId is valid (you might want to add more validation)
    if (!foreignId) {
      return res.status(400).json({ success: false, message: 'Invalid foreignId' });
    }

    // Remove the foreignId from the user's connections
    currentUser.connections = currentUser.connections.filter(connection => connection.toString() !== foreignId);
    await currentUser.save();

    // Remove the user from the foreignId's connections
    const foreignUser = await User.findById(foreignId);
    if (foreignUser) {
      foreignUser.connections = foreignUser.connections.filter(connection => connection.toString() !== currentUser._id.toString());
      await foreignUser.save();
    }

    res.status(200).json({ success: true, message: 'Patient removed successfully' });
  } catch (error) {
    console.error('Error removing patient:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});




// Middleware to check if user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}




function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}





















app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
