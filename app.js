//jshint esversion:6

// if(process.env.NODE_ENV !== "production") {
//   require("dotenv").config()
// }

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session");

mongoose.set("debug", true);
mongoose.set("strictQuery", false);

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const loginpage = "User can Login for pasting there blogs.";

const app = express();


//for making dynamic temple.
app.set('view engine', 'ejs');



initializePassport (
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = [];

//this is more make easy to take get and push request.
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
  secret: 'anything',
  resave: false,
  saveUninitialized:false        
}))
app.use(passport.initialize())
app.use(passport.session())

//connecting blogDB with localhost 27017/here we use IPV4 local at 127.0.0.1
mongoose.connect("mongodb://127.0.0.1:27017/bolgDB", {useNewUrlParser: true});

//that make structure of database.
const postSchema = {
  title: String,
  content: String
};

//use to create the mogo model.

const Post = mongoose.model("posts", postSchema);
// var posts = [];
//server to user



app.post("/login",passport.authenticate("local",{
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}))

app.get("/",function(req,res) {
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      }); 
  });
    //  res.render("home" , {homeStartingContent,posts});
});

app.get("/login",function(req,res) {
  res.render("login",{loginpage});
})

app.get("/compose",function(req,res) {
  //chaning the object name.
  res.render("compose");
})

app.post("/register", async(req,res)=> {
  try {
    const hashpassword = await bcrypt.hash(req.body.password,10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashpassword
    })
    console.log(users);
    res.redirect("/login")
  }catch {
    res.redirect("/register")
  }
})

app.post("/compose",function(req,res) {
  const post = new Post ({
    title : req.body.postTital,
    content: req.body.postbody
  });
   post.save(function(err){
    if (!err){
      res.redirect("/");
    }
  });
  //post.save();
  //  posts.push(post);
  //res.redirect("/");
})

// app.get("/posts/:postName",function(req,res) {
//   //console.log(req.params.postName);
//   const requestTitle = _.lowerCase(req.params.postName);

//   posts.forEach(function(post) {
//     const storeTitle = _.lowerCase(post.title);
//     if(storeTitle === requestTitle) {
//       res.render("post",{
//         title : post.title,
//         content :post.content
//       });
//     }
//   })
// })

app.get("/posts/:postId", function(req, res){

  const requestedPostId = req.params.postId;
  
    Post.findOne({_id: requestedPostId}, function(err, post){
      res.render("post", {
        title: post.title,
        content: post.content
      });
    });
  
  });


app.get("/about",function(req,res) {
    res.render("about",{aboutContent});
})

app.get("/contact",function(req,res) {
  //chaning the object name.
  res.render("contact",{ct : contactContent});
})

app.get("/register",(req,res)=> {
  res.render("register");
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});



// for bitcry  -- we need to install --- npm i bcrypt
// for passport system in node js -- npm i passport passport-local express-session express-flash