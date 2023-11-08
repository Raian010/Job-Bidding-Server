const express = require("express");
const cors = require("cors");
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// app.use(cookieParser());


// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plereka.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware personally


// const verifyToken = async(req,res,next) => {
//   const token = req.cookies?.token;
//   console.log('the token is', token);
//   if(!token){
//     return res.status(401).send({message:'unauthorized'})
//   }
//   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded) => {
//     if(err){
//       return res.status(401).send({message:'unauthorized'})
//     }
//     console.log('token',decoded);
//     req.user = decoded;
//     next();
//   })
// }

async function run() {
  try {
    // await client.connect();

    const jobsCollection = client.db("jobs").collection("collection");
    const bidCollection = client.db("jobs").collection("bidCollection");

    // auth related api
  //  app.post('/jwt',async(req,res) => {
  //   const user = req.body;
  //   console.log('Loggin user',user);
  //   const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
  //   res.cookie('token',token,{
  //     httpOnly:true,
  //     secure:true,sameSite: 'none'
  //   }).send({success:true})
  //  })

  //  app.post('/loggedout', async(req,res) => {
  //   const user = req.body;
  //   console.log('logging out',user);
  //   res.clearCookie('token',{maxAge: 0}).send({success:true})
  //  })


    // Bid api
    app.post("/bids", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await bidCollection.insertOne(user);
      res.send(result);
    });

    app.get("/bids", async (req, res) => {
      const result = await bidCollection.find().toArray();
      res.send(result);
    });

    app.get("/bids/:email", async (req, res) => {
      const email = req.params.email;
     const query = {email : email}
      const cursor = bidCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
   




    app.get("/bids", async (req, res) => {
      let query = {};
      if (req.query?.buyer) {
        query = { buyer: req.query.buyer };
      }
      const cursor = bidCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      console.log(updatedBooking, filter);
      console.log(updatedBooking);
      const updatedDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      const result = await bidCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidCollection.deleteOne(query);
      res.send(result);
    });

    // Jobs api
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await jobsCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });

    app.get("/jobs", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJobs = req.body;
      const updatedDoc = {
        $set: {
          job: updatedJobs.job,
          deadline: updatedJobs.deadline,
          category: updatedJobs.category,
          maximum: updatedJobs.maximum,
          minimum: updatedJobs.minimum,
          description: updatedJobs.description,
        },
      };
      const result = await jobsCollection.updateOne(query, updatedDoc, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`server is listening at,${port}`);
});
