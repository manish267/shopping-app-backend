const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../middleware");
const Product=require('./../models/product')

router.post("/register", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    // Validation

    if (!email || !password || !passwordVerify) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all the required credentials" });
    }

    if (password.length < 4) {
      return res.status(400).json({
        errorMessage: "Please enter password of at least 4 characters",
      });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password at verifyPassword",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ errorMessage: "User with this email already registered" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // save the new user account to the database

    const newUser = new User({
      email,
      passwordHash,
    });
    const savedUser = await newUser.save();

    // log the user in

    const token = jwt.sign(
      {
        user: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.status(200).json({ savedUser, token });
  } catch (e) {
    console.log(e);
    res.status(500).send("Register Error");
  }
});

// login the existing user

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all the required credentials" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ errorMessage: "Wrong email and password" });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!passwordCorrect) {
      return res.status(400).json({ errorMessage: "Wrong Password" });
    }

    // sign the token

    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
    });

    console.log(token, existingUser);

    res.send("User loggedIn(sent u a user token)");
  } catch (err) {
    console.log(err);
    res.status(500).send("Login Error");
  }
});

// Logged out Handler

router.get("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: "none",
  });

  res.status(200).send("Logged out successfully");
});

// Loggedin Middleware

router.get("/loggedIn", (req, res) => {
  console.log("Request Received");
  try {
    const token = req.cookies.token;
    if (!token) return res.status(200).json(false);

    const id = jwt.verify(token, process.env.JWT_SECRET);
    res.send(true);
  } catch (err) {
    console.log(err);
    res.status(200).json(false);
  }
});

// User cart End Points

// to get th current user cart
router.get("/user/cart", isLoggedIn, async (req, res) => {
  try {
    const userid = req.user;

    const user = await User.findById(userid).populate("cart");

    res.status(200).json(user.cart);
  } catch (e) {
    console.log(e.message);
    res.status(400).json();
  }
});

// to add the item in a cart

router.post('/user/cart/add',isLoggedIn,async (req,res)=>{
  try{
    const {productId}=req.body;
    const product=await Product.findById(productId);

    // getting user id
    const userid=req.user;

    const user=await User.findById(userid);
    user.cart.push(product)

    user.save();

    res.status(200).json("Added To Cart Successfully");

  }
  catch(e){
    console.log(e.message);
    res.staus(400).json();
  }

})

router.post('/user/cart/remove',isLoggedIn,async(req,res)=>{
  try{

    const {productid}=req.body;
    const userid=req.user;
    
    const user=await User.findByIdAndUpdate(userid,{$pull:{cart:productid}});
    res.status(200).json("Removed Successfully")
  }catch(e){
    console.log(e);
    res.staus(400).send("Cannot remove from cart")
  }


})

module.exports = router;
