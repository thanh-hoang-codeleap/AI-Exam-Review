# --- Builder Stage ---
# Use a Node.js base image for building the application
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml first to leverage Docker cache
# Changes to these files invalidate the cache for the pnpm install step
COPY package.json pnpm-lock.yaml ./

# Install dependencies using the lock file for reproducibility
# This layer is cached as long as package.json and pnpm-lock.yaml don't change
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend application code
# Changes to application code invalidate the cache from this point onwards in this stage
COPY . .

# Build the application
# This layer is invalidated if code or dependencies change
RUN pnpm run build

# --- Runtime Stage ---
# Use a lighter base image for the final image, only containing the build output
# Using node:20-alpine again is fine if your app requires Node.js at runtime,
# otherwise, consider a static server like nginx:alpine if it's a static site.
FROM node:20-alpine AS runtime

# Set the working directory in the container
WORKDIR /app

# Copy the build output from the builder stage
# Next.js build output is typically in the .next directory
COPY --from=builder /app/.next /app/.next
# Copy public files if you have any
COPY --from=builder /app/public /app/public
# Copy node_modules needed for runtime
COPY --from=builder /app/node_modules /app/node_modules
# Copy package.json if needed for start script
COPY --from=builder /app/package.json /app/package.json

# Expose the port your application listens on (Next.js default is 3000)
EXPOSE 3000

# Define the command to run your Next.js application
# Use 'pnpm next start' to start the Next.js production server
CMD ["pnpm", "next", "start"]
