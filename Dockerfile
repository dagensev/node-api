# Use an official Node.js base image
FROM node:22-alpine

# Create and set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the app
COPY . .


# Optionally expose port (if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]