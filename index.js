const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');



const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://ads:YGWygUxHRZAxd1NT@cluster0.zchxmu8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/JunkShopDB', {
    useNewUrlParser: true
});


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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'karitonscraps.ph@gmail.com',
    pass: 'fegx cchl nsyk zwaq'
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

// Send the reset password page
app.get('/reset-password', (req, res) => {
  res.render('reset-password.ejs');
});

// Reset password route
app.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email: username });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    admin.password = newPassword; // Update the password
    await admin.save();

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ message: "Internal Server Error" });
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


app.get("/dashboard", async (req, res) => {
  try {
    // Fetch all barangays that are approved
    const barangays = await Barangay.find({ isApproved: true });
    
    // Remove users without a userID field
    await User.deleteMany({
      'userID': { '$exists': false }
    });
    
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

    // Render the index.ejs and pass the collected data, transactions per day, and total number of transactions
    res.render('index.ejs', { collectedData, transactionsPerDay, totalTransactions, log });

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
app.get('/home',(req,res)=>{
    res.render('home.ejs')
    })

app.get("/feature",(req,res)=>{
    res.render('feature.ejs')
})
app.get("/service",(req,res)=>{
    res.render('service.ejs')
})

app.get("/login", async(req,res)=>{
    try {
 
        const admin =await Admin.findOne({uName:"admin"});
        if(admin.isLogged===true){
            res.redirect('/dashboard')
        }else{
            res.render('authentication-login.ejs',{admin})
        }
    } catch (error) {
        console.log(error);
    }
  

})
app.get('/learn', (req,res)=>{
    res.render('team.ejs')
})

app.post('/logout', async (req, res) => {
  const admin = await Admin.findOne({uName:'admin'});
  admin.isLogged = false; // Update isLogged status
  await admin.save();
  
  const log = 'Admin Logged out.';
  const newContent = new Logs({
      logs: log,
      userName:'Admin',
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      type:"Logins"
  });

  await newContent.save(); // Save login log
res.redirect('/login')
  });


  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
        const admin = await Admin.findOne({ uName: username });
        if (admin && admin.password === password) {
            admin.isLogged = true; // Update isLogged status
  
            await admin.save(); // Save the updated admin
  
            const log = 'Admin Logged in.';
            const newContent = new Logs({
                logs: log,
                userName:"Admin",
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                type:"Logins"
            });
  
            await newContent.save(); // Save login log
  
            res.redirect('/login');
        } 
        
        else {
            res.redirect('/login')
     
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
  });

app.get("/dashboard/users",async(req,res)=>{
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
app.get("/dashboard/junkshops", async(req,res)=>{

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


app.post('/dashboard/pending', async (req, res) => {
  try {
      const { applicantId, approved } = req.body;
      const time = new Date().toLocaleTimeString();
      const date = new Date().toLocaleDateString();

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
          id:applicantId
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

app.get('/dashboard/account', async (req, res) => {
    try {
      const admins = await Admin.find();
      res.render('account.ejs', { admins: admins });
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
  });



app.get("/dashboard/pending",async(req,res)=>{

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


app.get("/dashboard/logs", async (req, res) => {
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

app.get('/:_id/junkshop-view', async (req, res) => {
    const _id = req.params._id;
    const junkshop = await JunkShop.findOne({ _id });
    res.render('junkshop-view.ejs', { junkshop });
  });
  app.get('/:_id/pickup-view', async (req, res) => {
    const _id = req.params._id;
    const pickup = await Book.findOne({ _id });
    res.render('pickup-view.ejs', { junkshop:pickup });
  });

  app.get('/:_id/barangay-view', async (req, res) => {
    const _id = req.params._id;
    const junkshop = await Barangay.findOne({ _id:_id });
    res.render('barangay-view.ejs', { junkshop });
  });


app.get('/dashboard/sessionlogs', async (req, res) => {
    try {
      const sessionLogs = await Logs.find({type:"Logins"}).sort({ createdAt: -1 });
      res.render('sessionlogs', { sessionLogs });
    } catch (err) {
      console.error(err);
      res.status(500).render('error');
    }
  });
  app.get('/dashboard/barangay', async (req, res) => {

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
app.get('/dashboard/manage', async (req, res) => {
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
      // Ensure scrapId is provided for deletion
      if (!scrapId) {
        return res.status(400).send('scrapId is required for deletion');
      }

      // Check if the scrap exists
      const scrap = await AdminScrap.findById(scrapId);
      if (!scrap) {
        return res.status(404).send('Scrap not found');
      }

      // Delete the scrap
      await AdminScrap.findByIdAndDelete(scrapId);
      return res.status(200).send('Scrap deleted successfully');

    } else {
      // Ensure scrapType and price are provided for creation/updating
      if (!scrapType || !price) {
        return res.status(400).send('scrapType and price are required for adding/updating scrap');
      }
      // Check if the scrap exists for updating
      const admin = await AdminScrap.findOne({ scrapType: scrapType });
      if (admin) {
        
        
        // Update existing scrap
        admin.scrapType = scrapType;
        admin.pointsEquivalent = price;
        const savedScrap =  await admin.save();
        return res.status(201).json({ scrapId: savedScrap._id, message: 'Scrap created successfully' });
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
app.get('/dashboard/pickup',async (req,res)=>{
  try {
    const sched =  await Book.find();
    res.render('pickup.ejs',{
      requests:sched
    });

  } catch (error) {
    console.log(error);
    
  }
 
});
app.post("/updateJunkshopStatus", async (req, res) => {
  try {
    const { status, id } = req.body;  // Extract status and id from request body

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
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      id: id,
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


app.post('/dashboard/pickup', async (req, res) => {
  try {
      const { requestId, status } = req.body;

      
    //  console.log('Applicant ID:', applicantId);
     // console.log('Approval status:', approved);
      var time =   new Date().toLocaleTimeString();
      var date =  new Date().toLocaleDateString();
     
      // Update the applicant status in the database
      const updatedApplicant = await Book.findByIdAndUpdate(requestId, { status: status }, { new: true });
      
      if(updatedApplicant && status==="approved"){
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
         time:new Date().toLocaleTimeString(),
         date:new Date().toLocaleDateString(),
         id:requestId,
         type:"Pick-up Schedule"
        });


       
        await  newContent.save();
        res.redirect('/dashboard/pickup');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: "Internal server error" });
  }
});
app.post('/dashboard/barangayapproval', async (req, res) => {
  try {
      const { applicantId, approved } = req.body;
      log
    //  console.log('Applicant ID:', applicantId);
     // console.log('Approval status:', approved);
      var time =   new Date().toLocaleTimeString();
      var date =  new Date().toLocaleDateString();
     
      // Update the applicant status in the database
      const updatedApplicant = await Barangay.findByIdAndUpdate(applicantId, { isApproved: approved }, { new: true });
      if(updatedApplicant && approved===true){
          log = 'The applicant '+applicantId+' has been approved.'
          await Barangay.findByIdAndUpdate(applicantId, { approvalDate: date + " at " + time })
      }
      if(updatedApplicant && approved===false){
          log = 'The applicant '+applicantId+' has been declined.'
          await Barangay.findByIdAndUpdate(applicantId, {declineDate:  date + " at " + time })
      }
      if (!updatedApplicant) {
          return res.status(404).json({ error: "Applicant not found" });
      }
      const newContent = new Logs( {
         logs:log,
         time:new Date().toLocaleTimeString(),
         date:new Date().toLocaleDateString(),
         id:applicantId,
         type:"Approval"
        });


       
        await  newContent.save();
        res.redirect('/dashboard/barangayapproval');
        
      
          
      
      // Send response back to the client

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

app.listen(3001, async function() {
  console.log("Server started on port 3001");

});