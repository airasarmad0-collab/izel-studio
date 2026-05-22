const mongoose = require("mongoose");
require("dotenv").config();

const createIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection("products");

    // Create indexes
    console.log("Creating indexes...");
    
    // Index 1: Simple volume index
    await productsCollection.createIndex({ volume: 1 });
    console.log("✓ Created index on volume field");
    
    // Index 2: Compound index for volume and createdAt
    await productsCollection.createIndex({ volume: 1, createdAt: -1 });
    console.log("✓ Created compound index on volume + createdAt");
    
    // Verify indexes
    const indexes = await productsCollection.indexes();
    console.log("\nAll indexes on products collection:");
    indexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)}`);
    });
    
    console.log("\n✅ Indexes created successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("Error creating indexes:", error);
    process.exit(1);
  }
};

createIndexes();