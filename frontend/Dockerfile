# Use an official Node.js runtime as a base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and yarn.lock (or package-lock.json) files
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps
RUN npm install immutable --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the React application
RUN CI=false npm run build

# Use nginx to serve the built React application
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
