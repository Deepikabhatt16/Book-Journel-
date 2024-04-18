import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';
import { fileURLToPath } from "url";
import { dirname } from "path";
import { render } from "ejs";
const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Book Tracker",
  password: "database16",
  port: 5432,
});
db.connect();


const app = express();
const port = 7000;
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));
let items = [];


app.post("/add",async(req,res)=>{
  res.render(__dirname + "/dynamic/modify.ejs");

})
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM read_book ORDER BY id ASC");

    items = result.rows;


    const response = await axios.get(`https://openlibrary.org/search.json?`);
    res.render(__dirname + "/dynamic/homepage.ejs", { listitem:items});


  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render(__dirname + "/dynamic/homepage.ejs", {
      error: error.message,
    });
  }
});


app.post("/submit", async (req, res) => {
  const item = req.body.tittle;
  const overview=req.body.overview;
  const date=req.body.date;
  const rate=req.body.rating;
  const summary=req.body.summary;
  const response = await axios.get(`https://openlibrary.org/search.json?q=` + [item]);
  const author=response.data.docs[0].author_name[0];
  const photo=response.data.docs[0].isbn[0];


  
  try { 
    await db.query("INSERT INTO read_book (book_name , author_name, isbn,overview,posted_on,rate,summary) VALUES ($1,$2,$3,$4,$5,$6,$7)", [item,author,photo,overview,date,rate,summary]);

    res.redirect("/");
  } catch (err) {
    console.log(err);
    console.log(response.data.docs[0].isbn[0]);
    console.log(response.data.docs[0].author_name[0]);

  }
});



app.post("/summary",async(req,res)=>{
  const part=req.body.list;

  try { 
    const result=await db.query("SELECT * FROM read_book  WHERE id=$1", [part]);
    items=result.rows;

    res.render(__dirname + "/dynamic/summary.ejs" ,{ listitem:items});
    
  } catch (err) {
    console.log(err);
    console.log(response.data.docs[0].isbn[0]);
    console.log(response.data.docs[0].author_name[0]);

  }
})
app.post("/best",async(req,res)=>{
  
  try { 
    const result=await db.query("SELECT * FROM read_book ORDER BY rate DESC");
  
   items=result.rows;
   res.render(__dirname + "/dynamic/homepage.ejs" ,{ listitem:items});
  } catch (err) {
    console.log(err.message);

  }})
  app.post("/newest",async(req,res)=>{
  
    try { 
      const result=await db.query("SELECT * FROM read_book ORDER BY posted_on DESC");
    
     items=result.rows;
     res.render(__dirname + "/dynamic/homepage.ejs" ,{ listitem:items});
    } catch (err) {
      console.log(err.message);
  
    }})
app.post("/tittle",async(req,res)=>{
  
  try { 
    const result=await db.query("SELECT * FROM read_book ORDER BY book_name ASC");
  
   items=result.rows;
   res.render(__dirname + "/dynamic/homepage.ejs" ,{ listitem:items});
  } catch (err) {
    console.log(err.message);

  }})

app.post("/edit", async(req, res) => {
  const summary =req.body.updatesummary;
  const id =req.body.updateid;
  const rate =req.body.updaterate;

  const overview =req.body.updateoverview;
  const date =req.body.updatedate;
  try{
 await db.query("UPDATE read_book SET summary=($1),overview=($2),posted_on=($3),rate=($4)  WHERE id=$5",[summary,overview,date,rate,id]);
res.redirect("/");
} catch (err) {
  console.log(err.message);
}
});

app.post("/delete", async (req, res) => {
  const remove = req.body.delete;
  try {
    await db.query("DELETE FROM read_Book WHERE id = $1", [remove]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});



app.listen(port, () => {
  console.log("serving on port = " + port);
  console.log("kyu ni chlra bhyii");
});