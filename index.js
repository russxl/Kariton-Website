const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const session = require('express-session');
const bcrypt = require('bcryptjs'); // Import bcrypt for passwo;rd hashing
const mongoose = require('mongoose')

// Set up session middleware



<<<<<<< HEAD
require('dotenv').config(); // Add this line at the top

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });


=======
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://russ:Mpe38rRSRP36zWW@cluster0.oswowdu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/JunkShopDB', {
  useNewUrlParser: true
})  
>>>>>>> 1e0a9a9303bbf4d80812c45d1200a44ac29f7ce4


const userSchema = {
  email: {
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Enter valid Email",
    },
  },
  password: {
    required: true,
    type: String,
  },
  userID:String,
  fullname: String,
  phone: Number,
  dateOfReg: String,
  token: String,
  customerType:String,
  dateOfBirth: String,
  barangay:String,
  points:String
};

const junkShopSchema = {
  email:String,
  password: {
    required: true,
    type: String,
  },
  confirmPassword: {
    required: true,
    type: String,
  },
  jShopName: String,
  address:String,
  ownerName: String,
  isApproved: Boolean,
  dateOfReg: String,
  phone:String,
  isRejected: Boolean,
  approvalDate:String,
  jShopImg:String,
  description:String,
  jShopLocation: String,
  validID:String,
  token:String,
  products:{},
  permit:String,
  customerType:String,
};

const barangaySchema = {
  email:String,
  password: {
    required: true,
    type: String,
  },
  confirmPassword: {
    required: true,
    type: String,
  },
  bName: String,
  capName: String,
  phone:String,
  isApproved: Boolean,
  dateOfReg: String,
  isRejected: Boolean,
  bImg:String,
  description:String,
  permit:String,
  validID:String,
  approvalDate:String,
  bLocation: String,
  approval:String,
  token:String,
  products:{},
  customerType:String,
  approvedMessage:{},
  pendingMessage:{},
  declinedMessage:{},
  bSchedule: {},
  moneyRewards:{},
  goodsRewards:{},
  redeemIsActive:Boolean
  
};

const logSchema = {
  logs: String,
  time: String,
  userName:String,
  date: String,
  type: String,
  name:String
};

const adminCred = {
  uName: String,
  password: String,
  isLogged: Boolean,
  email:String,
  otp:String
};

const bookingSchema = {
  setScheduledDate: String,
  time:String,
  uID: String,
  jID:String,
  jShop:String,
  location: String,
  phone:String,
  weight:String,
  scrapType:String,
  img: String,
  description: String,
  status: String,
  name:String,
  
};
const collectionScheduleSchema = {
  dayOfWeek:String,
  startTime:String,
  scrapType:String,
  barangayID:String
}
const redeemScheduleSchema = {
  date:String,
  startTime:String,
  description:String,
  barangayID:String,
  endTime:String

}

const rewardSchema = {
  nameOfGood:String,
  pointsEquivalent:String,
  barangayID:String
}

const scrapMaterialPoints ={
  scrapType:String,
  pointsEquivalent:String,
  barangayID:String,
  junkID:String
}
const collectedScrap = {
  userID:String,
  junkID:String,
  barangayID:String,
  scrapType:String,
  weight:String,
}
const adminScraps = {
  scrapType:String,
  pointsEquivalent:String,
}

const Collected = mongoose.model("Collected",collectedScrap);
const User = mongoose.model('User', userSchema);
const JunkShop = mongoose.model('JunkShop', junkShopSchema);
const Logs = mongoose.model('Logs', logSchema);
const Admin = mongoose.model('Admin', adminCred);
const Book = mongoose.model("Booking", bookingSchema);
const Barangay = mongoose.model('Barangay',barangaySchema);
const Collection = mongoose.model('Collection',collectionScheduleSchema);
const RedeemSched = mongoose.model('RedeemSced',redeemScheduleSchema);
const Reward = mongoose.model("Reward",rewardSchema);
const AdminScrap = mongoose.model("AdminScrap",adminScraps);
const Scrap = mongoose.model("Scrap",scrapMaterialPoints);

let log = ''
const admin = [{
    email:'karitonscraps.ph@gmail.com',
}]
const junk = [{
    jShopName: 'Jastine Jshop',
    ownerName: "Jasdgdsago",
    isApproved:null

}]

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static("public"));
const nodemailer = require('nodemailer');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = (email, otp) => {
  const mailOptions = {
    from: 'karitonscraps.ph@gmail.com',
    to: 'karitonscraps.ph@gmail.com',
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
const checkAdminSession = (req, res, next) => {
  console.log(req.session.isLogged);
  
  if (req.session.isLogged == true) {
      return next(); // Admin is logged in, proceed to the next middleware/route
  } else {
      res.redirect('/404'); // Redirect to login if not authenticated
  }
};

// Send the reset password page
app.get('/reset-password', (req, res) => {
  res.render('reset-password.ejs');
});

app.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email: username });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword ,10);

    admin.password = hashedPassword; // Update the password with hashed version
    await admin.save();

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/logout", (req, res) => {
  console.log('click');
 
  
  // If session exists, destroy it
  if (req.session) {
    
    req.session.destroy((err) => {
      if (err) {
        // Handle error while destroying session
        console.log('hello');
        
        console.error("Error while logging out:", err);
        res.status(500).send('Failed to log out.');
      } else {
        // Redirect to login page or homepage after successful logout
        res.redirect('/login');
        console.log('hihi');
        
      }
    });
  } else {
    // If session does not exist, just redirect to login
    res.redirect('/login');
    console.log('hillo');
  }
});


// Verify OTP route
app.post('/verify-otp', async (req, res) => {
  const { username, otp } = req.body;

  try {
    const admin = await Admin.findOne({ email: username });

    
    if (!admin || admin.otp !== otp) {  // Corrected to check `token` instead of `otp`
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is correct, clear it and allow password reset
    admin.token = null; // Clear OTP after verification
    await admin.save();

    res.json({ message: "OTP verified. Redirecting to reset password" });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Forgot password route to generate OTP
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    admin.otp = otp; // Save OTP in admin's document
    await admin.save();

    // Send the OTP via email
    sendOTPEmail(admin.email, otp); // Send email to admin's email

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/dashboard", checkAdminSession, async (req, res) => {

  console.log(req.session.isLogged);
  
  try {
    // Fetch all barangays that are approved
    const barangays = await Barangay.find({ isApproved: true });
    const residents = await User.find();
    const junkshops =  await JunkShop.find({ isApproved: true });

    // Calculate totals
    const totalBarangays = barangays.length;
    const totalResidents = residents.length;
    const totalJunkshops = junkshops.length;

    // Array to hold the collected data for each barangay
    let collectedData = [];

    // Loop through each barangay and find the collected entries for each one
    for (let barangay of barangays) {
      const collected = await Collected.find({ barangayID: barangay._id });

      // Push the barangay and its collected data to the array
      collectedData.push({
        barangay: barangay,
        collected: collected,
      });
    }

    // Fetch logs
    const log = await Logs.find();

    // Group logs by the string "date" and count transactions per day
    const logsPerDay = await Logs.aggregate([
      {
        $group: {
          _id: "$date", // Group by the 'date' string field directly
          count: { $sum: 1 } // Count how many logs exist per date
        }
      },
      { $sort: { "_id": 1 } } // Sort by the date string (from oldest to newest)
    ]);

    // Create an array with the length of transactions per day
    const transactionsPerDay = logsPerDay.map(log => ({
      date: log._id,
      count: log.count
    }));

    // Calculate the total number of transactions
    const totalTransactions = transactionsPerDay.reduce((acc, log) => acc + log.count, 0);
    const total = totalBarangays + totalResidents + totalJunkshops;
    console.log(total);
    
    // Render the index.ejs and pass the collected data, totals, transactions per day, and total number of transactions
    res.render('index.ejs', { 
      collectedData, 
      transactionsPerDay, 
      totalTransactions, 
      log, 
     total
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/',async (req,res)=>{
  try {
    const junkshop = await JunkShop.find({isApproved:true});
    const barangays = await Barangay.find({isApproved:true});
    let collectedData = [];

    // Loop through each barangay and find the collected entries for each one
    for (let barangay of barangays) {
      const sched =  await Collection.find({barangayID:barangay._id})

      // Push the barangay and its collected data to the array
      collectedData.push({
        barangay: barangay,
        sched: sched,
      });
    }

   
  
    res.render('home.ejs', { collectedData,junkshop});
  } catch (error) {
    
  }

   
    })
app.get('/contact',(req,res)=>{
    res.render('contact.ejs')
    })


app.get("/about",(req,res)=>{
    res.render('about.ejs')
})


app.get("/feature",(req,res)=>{
    res.render('feature.ejs')
})
app.get("/service",(req,res)=>{
    res.render('service.ejs')
})

app.get("/login", async (req, res) => {
  try {
    // Check if session exists and if the user is logged in
    if (req.session && req.session.adminId) {
      // If session exists, redirect to dashboard
      return res.redirect('/dashboard');
    }

    // If no session, check if admin exists in the database
    const admin = await Admin.findOne({ uName: "admin" });

    if (!admin) {
      // If no admin exists, render setup page
      return res.render('set-admin.ejs');
    }

    // If admin exists but not logged in, render login page
    res.render('authentication-login.ejs', { admin });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/learn', (req,res)=>{
    res.render('team.ejs')
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username);

  try {
    // Find the admin by username
    const admin = await Admin.findOne({ uName: username });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!admin||!isMatch) {
      return res.status(400).send("Please check your username or password is incorrect.");
    }
    const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
    const [date, time] = currentDate.split(', ');
    // If the admin is found, compare the entered password with the stored hashed password
   
    if (isMatch) {
      // Set session for the logged-in admin
      req.session.adminId = admin._id; // Store admin ID in session
      req.session.isLogged = true;     // Set login status
  
      // Update isLogged status in the database
      admin.isLogged = true;
      await admin.save(); // Save the updated admin
  
      // Create a log for the login event

  
      res.redirect('/dashboard'); // Redirect to the admin dashboard or home page
    } else {
      // If the password is incorrect, redirect back to login
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  
});


// Route to set up a new admin
app.post("/setup-admin", async (req, res) => {
    const { username, password,email } = req.body;
  console.log(password);
  
    // Validate input
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    // Check if the admin already exists
    try {
        const existingAdmin = await Admin.findOne({ uName: username });
        if (existingAdmin) {
            return res.status(400).send('Admin already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const newAdmin = new Admin({
            uName: username,
            password: hashedPassword,
            email:email,
            isLogged: false // Default value
        });

        await newAdmin.save(); // Save the new admin

       console.log('success');
       
        res.redirect('/login')
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});





app.get("/dashboard/users",checkAdminSession,async(req,res)=>{
try {
    const admin = await Admin.findOne({uName:'admin'})
   const user =  await User.find();
   const string = user.toString()
    if(admin.isLogged===true){
       res.render('users.ejs',{user})
    }
    else{
        res.redirect('/404')
    }
} catch (error) {
    console.log(error);
}
    
})
app.get("/dashboard/junkshops",checkAdminSession, async(req,res)=>{

    try {
        const cont = await JunkShop.find();
        const admin =  await Admin.findOne({uName:'admin'});
        if(admin.isLogged === true){
        res.render('junkshops.ejs', {
          junk:cont
        });
     }
        else{
            res.redirect('/404')
        }
      } catch (err) {
        // Handle any potential errors
        console.error(err);
        // You may want to send an error response to the client here
      }
  

    
})
app.get("/buttons",(req,res)=>{
    res.render('ui-buttons.ejs')
})


app.post('/dashboard/pending',checkAdminSession ,async (req, res) => {
  try {
      const { applicantId, approved } = req.body;
      const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
      const [date, time] = currentDate.split(', ');

      // Update the applicant status in the database
      const updatedApplicant = await JunkShop.findByIdAndUpdate(applicantId, { isApproved: approved }, { new: true });
      
      if (!updatedApplicant) {
          return res.status(404).json({ error: "Applicant not found" });
      }

      let logMessage = '';
      const updateFields = approved
          ? { approvalDate: `${date} at ${time}` }
          : { declineDate: `${date} at ${time}` };

      logMessage = approved
          ? `The applicant ${applicantId} has been approved.`
          : `The applicant ${applicantId} has been declined.`;

      // Update the approval/decline date in the database
      await JunkShop.findByIdAndUpdate(applicantId, updateFields);

      // Create a log entry
      const newLog = new Logs({
          logs: logMessage,
          time: time,
          date: date,
          type:"Approval",
          id:applicantId,
          userName:"Junkshop"
      });

      // Save the log
      await newLog.save();

      // After saving, reload/redirect the page to refresh the status
      res.redirect('/dashboard/pending');

  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: "Internal server error" });
  }
});

/*app.post('/dashboard/sendmessage', (req, res) => {
    const { name, email, subject, message } = req.body;
    const contact = new Contact({
        name: name,
        email: email,
        subject: subject,
        message: message
    });

    contact.save()
        .then((contact) => {
            console.log('Document saved:', contact);
            res.redirect('/dashboard/sendmessage');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Error submitting form' });
        });
});
*/


app.post('/dashboard/account/add-admin', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const admin = new Admin({ name, email, password });
      await admin.save();
      res.redirect('/account');
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
  });


  
/*app.get('/dashboard/sendmessage', async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 }); // Changed variable name to contacts
      console.log('Contacts fetched:', contacts);
      res.render('sendmessage.ejs', { contacts: contacts }); // Corrected variable name to contacts
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
});
*/

app.get('/dashboard/account', checkAdminSession,async (req, res) => {
    try {
      const admins = await Admin.find();
      res.render('account.ejs', { admins: admins });
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
  });



app.get("/dashboard/pending",checkAdminSession,async(req,res)=>{

    try {
        const cont = await JunkShop.find();
        const admin = await Admin.findOne({uName:'admin'});
        if(admin.isLogged===true){
        res.render('approval.ejs', {
          junk:cont
        });
     //   console.log(cont);
    }else{
        res.redirect('/404')
    }
      } catch (err) {
        // Handle any potential errors
        console.error(err);
        // You may want to send an error response to the client here
      }
  
})


app.get("/dashboard/logs",checkAdminSession, async (req, res) => {
    try {
      const transactions = await Logs.find();
      res.render('logs.ejs', {
        transactions: transactions
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
  });

app.get('/:_id/junkshop-view',checkAdminSession, async (req, res) => {
    const _id = req.params._id;
    const junkshop = await JunkShop.findOne({ _id });
    res.render('junkshop-view.ejs', { junkshop });
  });
  app.get('/:_id/pickup-view',checkAdminSession, async (req, res) => {
    const _id = req.params._id;
    const pickup = await Book.findOne({ _id });
    res.render('pickup-view.ejs', { junkshop:pickup });
  });

  app.get('/:_id/barangay-view', checkAdminSession,async (req, res) => {
    console.log('hi');
    
    const _id = req.params._id;
    const junkshop = await Barangay.findOne({ _id:_id });
    res.render('barangay-view.ejs', { junkshop });
  });


app.get('/dashboard/sessionlogs',checkAdminSession, async (req, res) => {
    try {
      const sessionLogs = await Logs.find({type:"Logins"}).sort({ createdAt: -1 });
      res.render('sessionlogs', { sessionLogs });
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
  });
  app.get('/dashboard/barangay',checkAdminSession, async (req, res) => {

    try {
      const cont = await Barangay.find({isApproved:true});
      const admin =  await Admin.findOne({uName:'admin'});
      if(admin.isLogged === true){
      res.render('barangay-1.ejs', {
        junk:cont
      });
    }
      else{
          res.redirect('/404')
      }
    } catch (err) {
      // Handle any potential errors
      console.error(err);
      // You may want to send an error response to the client here
    }


  
  });

  app.get('/barangay/', async (req, res) => {
  
    res.render('barangay-dash.ejs'); // Corrected variable name to contacts
  
  });
  app.get('/barangay/users', async (req, res) => {
  
    try {
      const admin = await Admin.findOne({uName:'admin'})
     const user =  await User.find();
     const string = user.toString()
      if(admin.isLogged===true){
         res.render('user1.ejs',{user})
      }
      else{
          res.redirect('/404')
      }
  } catch (error) {
      console.log(error);
  }
  });
  app.get('/barangay/rewards', async (req, res) => {
  
    res.render('rewards.ejs'); // Corrected variable name to contacts
  
  });
  app.post('/barangay/rewards', async (req, res) => {

    
  })
  app.get('/barangay/collection', async (req, res) => {
  
    res.render('collection.ejs'); // Corrected variable name to contacts
  
  });
  app.get('/junkshop/', async (req, res) => {
  
    res.render('junkshop-dash.ejs'); // Corrected variable name to contacts
  
  });
  app.get('/junkshop/barangay', async (req, res) => {
    try {
      const cont = await JunkShop.find();
      const admin =  await Admin.findOne({uName:'admin'});
      if(admin.isLogged === true){
      res.render('barangay-list.ejs', {
        junk:cont
      });
}
      else{
          res.redirect('/404')
      }
    } catch (err) {
      // Handle any potential errors
      console.error(err);
      // You may want to send an error response to the client here
    }


  
  });
app.get('/dashboard/manage',checkAdminSession, async (req, res) => {
  try {
    // Assuming you are using a database model called Scrap to fetch all scraps
    const scraps = await AdminScrap.find(); // Fetch all scraps from the database
 
    // Pass the scraps data to the EJS template
    res.render('manage-scraps.ejs', { scraps: scraps });
  } catch (error) {
    console.error('Error fetching scraps:', error);
    res.status(500).send('Error fetching scraps');
  }
});

app.post('/junkshop/scraps', async (req, res) => {
  try {
    const { scrapType, price, type, scrapId } = req.body;
  
    if (type === 'delete') {
      if (!scrapId) {
        return res.status(400).send('scrapId is required for deletion');
      }

      const scrap = await AdminScrap.findById(scrapId);
      if (!scrap) {
        return res.status(404).send('Scrap not found');
      }

      await AdminScrap.findByIdAndDelete(scrapId);
      return res.status(200).send('Scrap deleted successfully');
    } else {
    
    
    
      const admin = await AdminScrap.findOne({ scrapType: scrapType });
     
      
      if (admin) {
        // Update existing scrap
        if (!scrapType || !price) {
    
        
          return res.status(400).send('scrapType and price are required for adding/updating scrap');
        }
        
        admin.scrapType = scrapType;
        admin.pointsEquivalent = price;
        const updatedScrap = await admin.save();
        return res.status(200).json({ scrapId: updatedScrap._id, message: 'Scrap updated successfully' });
      } else {
        // Create new scrap
        const newScrap = new AdminScrap({
          scrapType: scrapType,
          pointsEquivalent: price
        });

        const savedScrap = await newScrap.save();
        return res.status(201).json({ scrapId: savedScrap._id, message: 'Scrap created successfully' });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('An error occurred while processing the request.');
  }
});



  app.get('/junkshop/account', async (req, res) => {
  
    res.render('junkshop-dash.ejs'); // Corrected variable name to contacts
  
  });
  app.get("/dashboard/barangayapproval",async(req,res)=>{

    try {
        const cont = await Barangay.find();
        const admin = await Admin.findOne({uName:'admin'});
        
        if(admin.isLogged===true){
        res.render('approval-1.ejs', {
          junk:cont
        });
    }else{
        res.redirect('/404')
    }
      } catch (err) {
        // Handle any potential errors
        console.error(err);
        // You may want to send an error response to the client here
      }
  
})
app.get('/dashboard/pickup',checkAdminSession,async (req,res)=>{
  try {
    const sched =  await Book.find();
    res.render('pickup.ejs',{
      requests:sched
    });

  } catch (error) {
    console.log(error);
    
  }
 
});
app.post("/updateJunkshopStatus",checkAdminSession, async (req, res) => {
  try {
    const { status, id } = req.body;  // Extract status and id from request body
    const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
    const [date, time] = currentDate.split(', ');
    // Find the booking by id and update the status
    const updatedJunkshop = await Book.findByIdAndUpdate(
      id,                         // The ID to search for
      { status: status },          // Set the status from request
      { new: true }                // Return the updated document
    );

    if (!updatedJunkshop) {
      return res.status(404).send({ message: "Junkshop not found" });
    }

    // Create a log message for the Logs schema
    const logMessage = `Junkshop status updated to ${status} for junkshop with ID: ${id}`;

    // Add the new log entry
    const newLog = new Logs({
      logs: logMessage,
      time:time,
      date:date,
      id: id,
      userName:"Junkshop",
      type: "Junkshop Status Update" // You can add a 'type' field if you want to categorize logs
    });

    // Save the log entry
    await newLog.save();

    // Send success response
    res.status(200).send({
      status_code: 200,
      message: "Junkshop status updated successfully",
      junkshop: updatedJunkshop
    });

  } catch (error) {
    console.error("Error updating junkshop status:", error);

    // Send error response
    res.status(500).send({
      status_code: 500,
      message: "Internal server error"
    });
  }
});


app.post('/dashboard/pickup',checkAdminSession, async (req, res) => {
  try {
      const { requestId, status,jID } = req.body;

      
    //  console.log('Applicant ID:', applicantId);
    
     
      // Update the applicant status in the database
      const updatedApplicant = await Book.findByIdAndUpdate(requestId, { status: status }, { new: true });
      const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
      const [date, time] = currentDate.split(', ');
      
      if(updatedApplicant && status==="approved"){
          log = 'The  pick up request of   '+requestId+' has been approved.'
          await Book.findByIdAndUpdate(requestId, { requestId: date + " at " + time })
      }
      if(updatedApplicant && status==="Done"){
        log = 'The  pick up request of   '+requestId+' has been approved.'
        await Book.findByIdAndUpdate(requestId, { requestId: date + " at " + time })
    }
      if(updatedApplicant && status==="declined"){
          log = 'The pick up request of  '+requestId+' has been declined.'
          await Book.findByIdAndUpdate(requestId, {requestId:  date + " at " + time })
      }
      if (!updatedApplicant) {
          return res.status(404).json({ error: "Applicant not found" });
      }
      const newContent = new Logs( {
         logs:log,
         time:time,
         date:date,
         id:jID,
         type:"Pick-up Schedule",
         userName:"Junkshop"
        });


       
        await  newContent.save();
        res.redirect('/dashboard/pickup');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: "Internal server error" });
  }
});
app.post('/dashboard/barangayapproval', checkAdminSession, async (req, res) => {
  try {
    const { applicantId, approved } = req.body;

    // Get current date and time in PHT
    const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
    const [date, time] = currentDate.split(', ');

    // Update the applicant status in the database
    const updatedApplicant = await Barangay.findByIdAndUpdate(applicantId, { isApproved: approved }, { new: true });
    
    let log;
    if (updatedApplicant && approved === true) {
      log = `The applicant ${applicantId} has been approved.`;
      await Barangay.findByIdAndUpdate(applicantId, { approvalDate: date + " at " + time });
    }
    if (updatedApplicant && approved === false) {
      log = `The applicant ${applicantId} has been declined.`;
      await Barangay.findByIdAndUpdate(applicantId, { declineDate: date + " at " + time });
    }
    
    if (!updatedApplicant) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    // Log the action
    const newContent = new Logs({
      logs: log,
      time: time,
      date: date,
      id: applicantId,
      type: "Approval",
      userName: "Barangay"
    });

    await newContent.save();
    res.redirect('/dashboard/barangayapproval');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/learn/trashtalk',(req,res)=>{
    res.render('trashtalk.ejs')
});
app.get('/learn/cebenefits',(req,res)=>{
    res.render('ce1.ejs')
});
app.get('/learn/circulare',(req,res)=>{
    res.render('ce2.ejs')
});
app.get('/contact',(req,res)=>{
    res.render('contact.ejs')
})
app.use((req, res, next) => {
  res.status(404).render('404.ejs', (err, html) => {
    if (err) {
      console.error("Error rendering 404 page:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.send(html);
  });
});

<<<<<<< HEAD
const PORT = process.env.PORT;

app.listen(PORT, async () => {
  try {
    console.log(`Server started on port ${PORT}`);
    // Any async initializations can be added here
  } catch (error) {
    console.error("Error starting server:", error);
  }
=======
app.listen(3001, async function() {
  console.log("Server started on port 3001");
>>>>>>> 1e0a9a9303bbf4d80812c45d1200a44ac29f7ce4
});
