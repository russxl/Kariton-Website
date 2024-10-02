import mongoose from "mongoose";



export const users = [
  {
    email: 'Mon',
    password: "Secret",
    fName: "Mon",
    lName: "Napa",
   
  },
  {
    email: 'russ',
    password: "Secret",
    fName: "russ",
    lName: "obatay",
   
  },
 
];

export const junkshops = [
  {
    jShopName: 'Jshop',
    ownerName: 'Mon',
    isApproved: false,
  
    isRejected:false
  },
  {
    jShopName: 'Kshop',
    ownerName: 'Mon',
    isApproved: true,
  
    isRejected:false
  },
 
];

export const logs = [
  {
    
    log: "user logged in",
    
  },
 
];

export const admin =[
  {
    uName:'admin',
    password:'secret'
  }
]
