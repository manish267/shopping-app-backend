const express=require("express");
const app=express();
const mongoose = require('mongoose');
const Product=require('./models/product');
const seedDB = require("./seed");
const cors=require("cors");
require('dotenv').config();
var cookieParser = require('cookie-parser')

mongoose.connect('mongodb://localhost:27017/shopping-app', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false,useCreateIndex:true}).then(()=>{
    console.log("DB Connected");
}).catch(err=>{
    console.log(err)
})

app.use(cors());
// seedDB();

app.use(cookieParser())

app.use(express.json());

// Routes

const productRoutes=require("./routes/productRoutes")
const authRoutes=require("./routes/authRoutes")

app.get('/hello',(req,res)=>{
    res.status(200).send("Hello from server")
})

app.use(authRoutes)
app.use(productRoutes)

app.listen(3003,()=>{
    console.log("Server started at port 3003");
})