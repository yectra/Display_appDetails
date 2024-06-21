const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB URI
const uri = 'mongodb+srv://demo1:mN4vGFPB8froOqfp@cluster0.yr2typg.mongodb.net/demoStorage';

// MongoDB Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log('MongoDB connected');
    return client.db('demoStorage').collection('developerDatabase');
  } catch (error) {
    console.error(error);
    throw error; // Ensure errors are propagated for proper error handling
  }
}

// Route to fetch all apps along with their last updated accepted version and description
app.get('/applications/all', async (req, res) => {
  let collection;
  try {
    collection = await connectToDatabase();
    const developers = await collection.find({}).toArray();

    const allAppsInfo = developers.map(developer => {
      return developer.userapp.map(app => {
        // Filter versions with approved status 'accepted' and sort by update timestamp
        const acceptedVersions = app.ver
          .filter(version => version.approvedStatus === 'accepted')
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // Get the most recent accepted version
        const latestVersion = acceptedVersions[0];

        // Prepare the response if there is at least one accepted version
        const appInfo = {
          appName: app.appname,
          numberOfVersions: latestVersion ? 1 : 0,
          versions: latestVersion ? [{
            version: latestVersion.v || `1.0.0`,
            description: latestVersion.appdescription || 'No description'
          }] : []
        };
        
        return appInfo;
      });
    }).flat();

    res.json(allAppsInfo);
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB client connection after completing operations
    await client.close();
  }
});

const PORT = process.env.PORT || 3014;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
