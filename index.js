const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plereka.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const jobsCollection = client.db("jobs").collection("collection")

    app.get("/jobs/:id", async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    app.post("/jobs", async(req,res) => {
      const user = req.body;
      console.log(user);
      const result = await jobsCollection.insertOne(user);
      console.log(result);
      res.send(result);
    })

    app.get("/jobs",async(req,res) => {
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email
        }
      };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })

    app.delete("/jobs/:id", async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })

    // app.put("/jobs/:id", async(req,res) => {
    //   const id = req.params.id;
    //   const query = {_id : new ObjectId(id)};
    //   const options = {upsert:true};
    //   const updatedJobs = req.body;
    //   const updatedDoc = {
    //     $set: {

    //     }
    //   }
    // })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res) => {
    res.send("Hello World")
})

app.listen(port, () => {
    console.log(`server is listening at,${port}`);
})