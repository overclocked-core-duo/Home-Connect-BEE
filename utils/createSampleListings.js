const mongoose = require('mongoose');
const User = require('../models/mongodb/User');
const Property = require('../models/mongodb/Property');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/homeconnect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

async function createSampleListings() {
  try {
    // Find all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('No users found. Please create at least one user first');
      process.exit(1);
    }

    // Delete existing properties to avoid duplicates
    await Property.deleteMany({});
    
    // Sample property data
    const properties = [
      {
        title: "Modern Apartment in Andheri",
        description: "A beautiful modern apartment with all amenities located in a prime area of Andheri. Open-concept living area with floor-to-ceiling windows providing ample natural light. Features include a modern kitchen with granite countertops, stainless steel appliances, and custom cabinetry. Master bedroom includes an ensuite bathroom with rainfall shower.",
        type: "flat",
        offerType: "sale",
        price: 5000000, // 50 lakh
        location: "Andheri, Mumbai, India - 400053",
        bedrooms: 3,
        bathrooms: 2,
        area: 750,
        status: "ready to move",
        furnishingStatus: "semi-furnished",
        image: "house-img-1.jpg",
        owner: users[0]._id
      },
      {
        title: "Luxury Villa in Bandra",
        description: "Luxurious villa with garden and swimming pool in the heart of Bandra. This exclusive property features high ceilings, premium finishes, and a thoughtfully designed floor plan. The outdoor area includes a meticulously landscaped garden, infinity pool, and covered patio perfect for entertaining. Security includes 24/7 surveillance and gated entrance.",
        type: "house",
        offerType: "sale",
        price: 25000000, // 2.5 crore
        location: "Bandra, Mumbai, India - 400050",
        bedrooms: 4,
        bathrooms: 4,
        area: 2500,
        status: "ready to move",
        furnishingStatus: "furnished",
        image: "house-img-2.jpg",
        owner: users[0]._id
      },
      {
        title: "2BHK Apartment in Powai",
        description: "Cozy 2BHK apartment with lake view in Powai. Located in a well-maintained building with elevator access and dedicated parking. The apartment offers a functional layout with separate dining area and a balcony overlooking Powai Lake. Building amenities include a fitness center and children's play area.",
        type: "flat",
        offerType: "rent",
        price: 35000, // 35k per month
        location: "Powai, Mumbai, India - 400076",
        bedrooms: 2,
        bathrooms: 2,
        area: 850,
        status: "ready to move",
        furnishingStatus: "semi-furnished",
        image: "house-img-3.jpg",
        owner: users[0]._id
      },
      {
        title: "Commercial Space in BKC",
        description: "Premium office space in Bandra Kurla Complex. Ideal for startups and established businesses alike. Features include modern office infrastructure, high-speed internet connectivity, dedicated meeting rooms, and reception area. Located in a prestigious business district with excellent connectivity to major transport hubs.",
        type: "shop",
        offerType: "rent",
        price: 85000, // 85k per month
        location: "BKC, Mumbai, India - 400051",
        bedrooms: 0,
        bathrooms: 2,
        area: 1200,
        status: "ready to move",
        furnishingStatus: "unfurnished",
        image: "house-img-4.jpg",
        owner: users[0]._id
      },
      {
        title: "Studio Apartment in Goregaon",
        description: "Compact studio apartment perfect for bachelors or young couples. Well connected to public transport. The apartment features a smart layout that maximizes space efficiency with built-in storage solutions. The kitchen includes essential appliances and the bathroom has been recently renovated with modern fixtures.",
        type: "flat",
        offerType: "rent",
        price: 22000, // 22k per month
        location: "Goregaon, Mumbai, India - 400063",
        bedrooms: 1,
        bathrooms: 1,
        area: 450,
        status: "ready to move",
        furnishingStatus: "furnished",
        image: "house-img-5.jpg",
        owner: users[0]._id
      },
      {
        title: "Penthouse in South Mumbai",
        description: "Exclusive penthouse with sea view in South Mumbai. Ultimate luxury living experience. This prestigious property offers panoramic views of the Arabian Sea and city skyline. Features include Italian marble flooring, designer kitchen, home automation system, and private terrace. The master suite includes a walk-in closet and spa-like bathroom.",
        type: "flat",
        offerType: "sale",
        price: 50000000, // 5 crore
        location: "South Mumbai, India - 400005",
        bedrooms: 4,
        bathrooms: 4,
        area: 3000,
        status: "ready to move",
        furnishingStatus: "furnished",
        image: "house-img-6.webp",
        owner: users[0]._id
      }
    ];

    // Insert properties
    const result = await Property.insertMany(properties);
    console.log(`Successfully added ${result.length} sample property listings`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample listings:', error);
    process.exit(1);
  }
}

createSampleListings();