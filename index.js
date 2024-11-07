const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const session = require('express-session');
const bcrypt = require('bcryptjs'); // Import bcrypt for passwo;rd hashing
const mongoose = require('mongoose')
const helmet = require('helmet');
// Set up session middleware



require('dotenv').config(); // Add this line at the top

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });




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
  date: String,
  type: String,
  name:String,
  id:String,
  barangayName:String,
  scrapType:String,
  points:String,
  weight:String,
  userID:String
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
  barangayID:String,
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
  eligibleWeight:String
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


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
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



// Set X-Frame-Options header
app.use(helmet.frameguard({ action: 'sameorigin' }));

// Set X-Content-Type-Options header
app.use(helmet.noSniff());

// Set Referrer-Policy header
app.use(
  helmet.referrerPolicy({
    policy: 'no-referrer', // or 'strict-origin-when-cross-origin' or any suitable policy
  })
);

app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(), payment=(self)' // Customize as needed
  );
  next();
});


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
  try {
    console.log( req.params._id);

    

  // Fetch all barangays that are approved
  const barangays = await Barangay.find({ isApproved: true });
  const residents = await User.find();
  const junkshops =  await JunkShop.find({ isApproved: true });
  const collectionLogs = await Logs.find({ type:"Successful Pick-Up" });

// Function to create the collectDataArray based on collection logs
function createCollectDataArray(logs) {
const collectDataMap = new Map();

logs.forEach(log => {
const { barangayName, scrapType, date, weight } = log;

// Initialize barangay in the map if it doesn't exist
if (!collectDataMap.has(barangayName)) {
  collectDataMap.set(barangayName, {});
}

// Initialize scrapType for the barangay if it doesn't exist
if (!collectDataMap.get(barangayName)[scrapType]) {
  collectDataMap.get(barangayName)[scrapType] = {};
}

// Add weight to the specific date for that scrap type
if (!collectDataMap.get(barangayName)[scrapType][date]) {
  collectDataMap.get(barangayName)[scrapType][date] = 0;
}
collectDataMap.get(barangayName)[scrapType][date] += Number(weight);
});

// Convert the map to the desired array structure
const collectDataArray = Array.from(collectDataMap, ([barangayName, scrapData]) => ({
barangayName,
scrapData,
}));

return collectDataArray;
}

// Use the function to create the structured array
const collectDataArray = createCollectDataArray(collectionLogs);



  // Calculate totals
  const totalBarangays = barangays.length;
  const totalResidents = residents.length;
  const totalJunkshops = junkshops.length;

  // Array to hold the collected data for each barangay
  let collectedData = [];

  // Loop through each barangay and find the collected entries for each one
  for (let barangay of junkshops) {
    const collected = await Collected.find({ junkID: barangay._id });
    console.log(collected);
    
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
    collectDataArray,
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
      const admin = await Admin.findOne({ _id: req.session.adminId });
      if (admin){
        return res.redirect('/dashboard');
      } else{
        return res.redirect('/junkshop/'+req.session.adminId);
      }

    }
    console.log(   await JunkShop.find());
    
    // If no session, check if admin exists in the database

    const admin = await Admin.findOne({ uName: "admin" });
    if (!admin) {
      // If no admin exists, render setup page
      return res.render('set-admin.ejs');
    }

    // If admin exists but not logged in, render login page
    res.render('authentication-login.ejs');
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
    const junkshop = await JunkShop.findOne({ email: username})
    if (admin){
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
    } else if (junkshop){
  
      
      const isMatch = await bcrypt.compare(password, junkshop.password);
      console.log(isMatch);
      console.log(junkshop);
      if (!isMatch) {
        return res.status(400).send("Please check your username or password is incorrect.");
      }
      const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
      const [date, time] = currentDate.split(', ');
      // If the admin is found, compare the entered password with the stored hashed password
     
      if (isMatch) {
        // Set session for the logged-in admin
        req.session.adminId = junkshop._id; // Store admin ID in session
        req.session.isLogged = true;     // Set login status
    
        res.redirect('/dashboard'); // Redirect to the admin dashboard or home page
      } else {
        // If the password is incorrect, redirect back to login
        res.redirect('/login');
      }
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
    console.log(approved);
    
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
  app.get("/:_id/logs",checkAdminSession, async (req, res) => {
    try {
      const junkshop =  await JunkShop.findOne({_id: req.params._id})
      const transactions = await Logs.find({id:req.params._id});
      res.render('logss.ejs', {
        transactions: transactions, junkshop
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
  app.get('/junkshop-pickup-view/:id/',checkAdminSession, async (req, res) => {
    const id = req.params.id;
    const pickup = await Book.findOne({ _id:id });
  console.log(pickup);
  
    const junkshop = await JunkShop.findOne({_id:pickup.jID})
    
    res.render('pickup_barangay_view.ejs', { pickup:pickup , junkshop});
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
   
   
      res.render('barangay-1.ejs', {
        junk:cont
      });
    
    } catch (err) {
      // Handle any potential errors
      console.error(err);
      // You may want to send an error response to the client here
    }


  
  });

  app.get('/:_id/barangay',checkAdminSession, async (req, res) => {

    try {
      const cont = await Barangay.find({isApproved:true});
      const junkshop = await JunkShop.findOne({_id:req.params._id});
      
      console.log(req.params._id);
      
   
      res.render('barangay-list.ejs', {
        junk:cont , junkshop:junkshop
      });
    
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
  app.get('/junkshop/:_id', async (req, res) => {
    try {
        console.log( req.params._id);

        

      // Fetch all barangays that are approved
      const barangays = await Barangay.find({ isApproved: true });
      const residents = await User.find();
      const junkshops =  await JunkShop.find({ isApproved: true });
      const junkshop = await JunkShop.findOne({_id:req.params._id})
      const collectionLogs = await Logs.find({ type:"Collect" });

// Function to create the collectDataArray based on collection logs
function createCollectDataArray(logs) {
  const collectDataMap = new Map();

  logs.forEach(log => {
    const { barangayName, scrapType, date, weight } = log;

    // Initialize barangay in the map if it doesn't exist
    if (!collectDataMap.has(barangayName)) {
      collectDataMap.set(barangayName, {});
    }

    // Initialize scrapType for the barangay if it doesn't exist
    if (!collectDataMap.get(barangayName)[scrapType]) {
      collectDataMap.get(barangayName)[scrapType] = {};
    }

    // Add weight to the specific date for that scrap type
    if (!collectDataMap.get(barangayName)[scrapType][date]) {
      collectDataMap.get(barangayName)[scrapType][date] = 0;
    }
    collectDataMap.get(barangayName)[scrapType][date] += Number(weight);
  });

  // Convert the map to the desired array structure
  const collectDataArray = Array.from(collectDataMap, ([barangayName, scrapData]) => ({
    barangayName,
    scrapData,
  }));

  return collectDataArray;
}

// Use the function to create the structured array
const collectDataArray = createCollectDataArray(collectionLogs);
console.log(collectDataArray);


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
      res.render('junkshop-dash.ejs', { 
        collectedData, 
        transactionsPerDay, 
        totalTransactions, 
        log, junkshop,
        collectDataArray,
       total
      });
  
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).send('Internal Server Error');
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
  try {const sched = await Book.find({
    barangayID:null,
    jID: { $ne: null },
    uID:null
  });


    res.render('pickup.ejs',{
      requests:sched
    });

  } catch (error) {
    console.log(error);
    
  }
 
});
app.get('/:_id/pickup',checkAdminSession,async (req,res)=>{
  try {
    const junkshop = await JunkShop.findOne({_id:req.params._id});
    const sched = await Book.find({
   
    jID: req.params._id,

  });
    res.render('pickup_barangay.ejs',{
      requests:sched,junkshop:junkshop
    });

  } catch (error) {
    console.log(error);
    
  }
 
});

app.post("/updateBarangayStatus", checkAdminSession, async (req, res) => {
  try {
    const { id, barangayID,jID, name, jShop, phone, location, scrapType, weight, status } = req.body;
    const options = { timeZone: 'Asia/Manila', hour12: true, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
    const [date, time] = currentDate.split(', ');

    // Find the booking by id and update the status
    const updatedJunkshop = await Book.findByIdAndUpdate(
      id,                         // The ID to search for
      { status: status },         // Set the status from request
      { new: true }               // Return the updated document
    );

    if (!updatedJunkshop) {
      return res.status(404).send({ message: "Junkshop not found" });
    }
   
    
    // Find collected scrap for Barangay and Junkshop
    let collectedScrapBarangay = await Collected.findOne({ barangayID: barangayID, scrapType: scrapType });
    let collectedScrapJunkshop = await Collected.findOne({ junkID: jID, scrapType: scrapType });
    console.log(collectedScrapJunkshop);
    
    const weightValue = parseFloat(weight);

    // Update or create collected scrap for Barangay
    if (collectedScrapBarangay) {
      collectedScrapBarangay.eligibleWeight = (parseFloat(collectedScrapBarangay.eligibleWeight) - weightValue).toString();
      await collectedScrapBarangay.save();
    } else {
      collectedScrapBarangay = new Collected({
        barangayID: barangayID,
        scrapType: scrapType,
        weight: weight,
        eligibleWeight: (-weightValue).toString()
      });
      await collectedScrapBarangay.save();
    }

    // Update or create collected scrap for Junkshop
    if (collectedScrapJunkshop) {
      collectedScrapJunkshop.weight = (parseFloat(collectedScrapJunkshop.weight) + weightValue).toString();
      collectedScrapJunkshop.eligibleWeight = (parseFloat(collectedScrapJunkshop.eligibleWeight) + weightValue).toString();
      console.log(collectedScrapJunkshop.weight);
      
      await collectedScrapJunkshop.save();
    } else {
      collectedScrapJunkshop = new Collected({
        junkID: jID,
        scrapType: scrapType,
        weight: weightValue.toString(),
        eligibleWeight: weightValue.toString()
      });
      await collectedScrapJunkshop.save();
    }

    // Create a log message for the Logs schema
    const logMessage = `Junkshop status updated to ${status} for junkshop with ID: ${id}`;
    const junkshop = await JunkShop.findOne({_id:jID});
    // Add the new log entry

    
    const newLog = new Logs({
      logs: logMessage,
      time: time,
      date: date,
      id: id,
      weight: weight,
      scrapType:scrapType,
      barangayName:junkshop.jShopName,
      userName: "Junkshop",
      type: "Successful Pick-Up"
    });

    // Save the log entry
    await newLog.save();
    console.log(await Logs.find({type:"Successful Pick-Up"}));
    
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


app.post("/updateJunkshopStatus", checkAdminSession, async (req, res) => {
  try {
    const { id, name, jShop, phone, location, scrapType, weight, status } = req.body;

    // Get current date and time
    const options = {
      timeZone: 'Asia/Manila',
      hour12: true,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
    const [date, time] = currentDate.split(', ');

    // Find the junkshop by its name
    const junk = await JunkShop.findOne({ jShopName: jShop });
    if (!junk) {
      return res.status(404).send({ message: "Junkshop not found" });
    }

    // Find collected scrap for the junkshop
    let collectedScrapJunkshop = await Collected.findOne({ junkID: junk._id, scrapType: scrapType });
    const weightValue = parseFloat(weight);

    // Update the booking status
    const updatedJunkshop = await Book.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedJunkshop) {
      return res.status(404).send({ message: "Booking not found" });
    }

    // Update or create collected scrap
    if (collectedScrapJunkshop) {
      collectedScrapJunkshop.eligibleWeight = (parseFloat(collectedScrapJunkshop.eligibleWeight) - weightValue).toString();
      await collectedScrapJunkshop.save();
    } else {
      collectedScrapJunkshop = new Collected({
        junkID: junk._id,
        scrapType: scrapType,
        weight: weightValue.toString(),
        eligibleWeight: weightValue.toString()
      });
      await collectedScrapJunkshop.save();
    }

    // Log the update
    const logMessage = `Junkshop status updated to ${status} for junkshop with ID: ${id}`;
    const newLog = new Logs({
      logs: logMessage,
      time: time,
      date: date,
      id: id,
      userName: "Junkshop",
      type: "Junkshop Status Update"
    });
    await newLog.save();

    res.status(200).send({
      status_code: 200,
      message: "Junkshop status updated successfully",
      junkshop: updatedJunkshop
    });

  } catch (error) {
    console.error("Error updating junkshop status:", error);
    res.status(500).send({
      status_code: 500,
      message: "Internal server error"
    });
  }
});

app.post('/send-notif', async (req, res) => {
  const options = {
    timeZone: 'Asia/Manila',
    hour12: true,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  const currentDate = new Intl.DateTimeFormat('en-PH', options).format(new Date());
  const [date, time] = currentDate.split(', ');

  try {
    const { scraps, usertype } = req.body; // Destructure scraps and usertype from the request body

    if (usertype === "Junkshop") {
      // Junkshop logic
      

      const userLogs = await Logs.find();
      console.log(userLogs + "ooooo");

      for (let scrap of scraps) {
        // Find the junk shop by its name (assuming barangay name matches junk shop name)
        const junkshop = await JunkShop.findOne({ jShopName: scrap.barangay.toString() + " " });

        console.log(junkshop._id);

        if (junkshop) {
          // Create a new Logs entry for each scrap
          const newContent = new Logs({
            logs: `Your scrap ${scrap.scrapType} is eligible for pick up. Schedule Now!`,
            time: time,
            date: date,
            id: junkshop._id,
            type: "Schedule Collection",
            userName: "Junkshop"
          });

          // Save the new log entry
          await newContent.save();
        } else {
          console.error(`Junkshop with name ${scrap.barangay} not found.`);
        }
      }

    } else if (usertype === "Barangay") {
      // Barangay logic
      
      for (let scrap of scraps) {
        // Find the barangay by name
        const barangay = await Barangay.findOne({ bName: scrap.barangay.toString() });

        if (barangay) {
          // Create a new Logs entry for each scrap
          const newContent = new Logs({
            logs: `Your scrap ${scrap.scrapType} is eligible for pick up by the junkshop. You can now book a schedule!`,
            time: time,
            date: date,
            id: barangay._id,
            type: "Barangay Notification",
            userName: "Barangay"
          });

          // Save the new log entry
          await newContent.save();
        } else {
          console.error(`Barangay with name ${scrap.barangay} not found.`);
        }
      }
    } else {
      console.error("Invalid usertype provided.");
      return res.status(400).send('Invalid usertype provided.');
    }

    // Send a response after processing the data
    res.status(200).send('Data received successfully');

  } catch (error) { 
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing the request');
  }
});




app.post('/dashboard/pickup',checkAdminSession, async (req, res) => {
  try {
      const { requestId, status,jID } = req.body;

      console.log(req.body);
      
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
    console.log(applicantId);
    
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

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  try {
    console.log(`Server started on port ${PORT}`);
    // Any async initializations can be added here
  } catch (error) {
    console.error("Error starting server:", error);
  }
});
