# Step 1: Build the React app
FROM node:16-slim AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . ./

# Build the app for production
RUN npm run build

# Step 2: Serve the React app
FROM nginx:alpine-slim

# Copy the build folder from the build stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx container
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
