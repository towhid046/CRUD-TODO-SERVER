const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// middlewarea --
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.q1nysvk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const todosDatabase = client.db("todosDB").collection("todos");

    app.get("/todos", async (req, res) => {
      const cursor = todosDatabase.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todosDatabase.findOne(query);
      res.send(result);
    });

    app.post("/todos", async (req, res) => {
      const todo = req.body;
      const result = await todosDatabase.insertOne(todo);
      res.send(result);
    });

    app.put("/update-todo/:id", async (req, res) => {
      const id = req.params.id;
      const todo = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTodo = {
        $set: { title: todo.title },
      };
      const result = await todosDatabase.updateOne(filter, updateTodo, options);
      res.send(result);
    });

    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todosDatabase.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Todo server is running on PORT: ${port}`);
});
