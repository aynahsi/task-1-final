const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://kritika:task1@cluster0.hs25rro.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define a schema for Products
const productSchema = new mongoose.Schema({
  subcategory: String,
  title: String,
  price: Number,
  popularity: Number,
});

// Create a model from the schema
const Product = mongoose.model("Product", productSchema);

app.use(cors());

app.get("/api/products", async (req, res) => {
  try {
    // Fetch data from the external API
    const response = await axios.get(
      "https://s3.amazonaws.com/open-to-cors/assignment.json"
    );
    let products = Object.values(response.data.products);

    // Sort products by descending popularity
    products = products.sort((a, b) => b.popularity - a.popularity);

    // Optionally, store in MongoDB
    products.forEach((product) => {
      Product.updateOne(
        { title: product.title },
        product,
        { upsert: true },
        (err) => {
          if (err) console.log(err);
        }
      );
    });

    res.json(products);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
