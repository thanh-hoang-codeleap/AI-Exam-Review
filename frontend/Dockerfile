FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies using the lock file for reproducibility
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend application code
COPY . .

# Build the application
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
