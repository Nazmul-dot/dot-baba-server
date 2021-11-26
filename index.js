require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 7000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.iohnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("travel");
    const productCollection = database.collection("services");
    const orderCollection = database.collection("order");
    // all data get
    app.get("/services", async (req, res) => {
      const cursor = productCollection.find({});
      const services = await cursor.toArray();
      //   console.log(services);
      res.json(services);
    });
    //get single data
    app.get("/singleService/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productCollection.findOne(query);
      res.json(service);
    });
    //add post
    app.post("/addservice", async (req, res) => {
      console.log(req.body);
      const doc = req.body;
      const result = await productCollection.insertOne(doc);
      res.json(result);
    });
    //add order
    app.post("/addOrder", async (req, res) => {
      const doc = req.body;
      const result = await orderCollection.insertOne(doc);
      res.json(result);
    });
    //get order by persons
    app.get("/allorder", async (req, res) => {
      const email = req.query.email;

      let orders;
      if (email) {
        const cursor = orderCollection.find({ email: email });
        orders = await cursor.toArray();
        //   console.log(services);
      } else {
        const cursor = orderCollection.find({});
        orders = await cursor.toArray();
      }
      res.json(orders);
    });
    //delete order
    app.delete("/deleteorder/:id", async (req, res) => {
      console.log(req.params.id);
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    //update status
    app.put("/updatestate/:id", async (req, res) => {
      console.log(req.params.id, req.body.state);
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          state: req.body.state,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello travel gurooo!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
