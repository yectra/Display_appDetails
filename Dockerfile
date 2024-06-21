# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/main

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies specified in package.json
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3013

# Command to run the application
CMD ["node", "main.js"]
