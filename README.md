# AI-Exam-Reviewer

AI Exam Reviewer is designed to help teachers check students' essays for mistakes such as grammar or pronunciation errors. This application leverages AI to provide feedback and assist with the review process.

## Table of Contents
- [Deployment Guide](#deployment-guide)
  - [Build Applications](#build-applications)
  - [Release](#release)
- [Local Installation](#local-installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install Frontend dependencies](#2-install-frontend-dependencies)
  - [3. Install Backend dependencies](#3-install-backend-dependencies)
  - [4. Create a .env file](#4-create-a-env-file-in-the-backend-folder-and-add-the-following-information)
- [Usage](#usage)
  - [1. Start the Backend](#1-start-the-backend)
  - [2. Start the Frontend](#2-start-the-frontend)
- [Demo Video](#demo-video)
  - [Text Checking](#text-checking)
  - [Task Checking](#task-checking)
- [Run pre-commit](#run-pre-commit)

## Deployment Guide

### Build Applications

In each `backend` and `frontend` folder, there is a Dockerfile. For each push to the `main` branch, the `docker-build` workflow will run to build Docker images and push to the GitHub Container Registry. However, the `frontend` Dockerfile is not being properly written at the moment and thus, result in a very slow build of 10-11 minutes.

### Release

1. Create Azure Container App Environment
   ```
   az containerapp env create -n <env-name> -g ai-exam-reviewer
   ```
2. Deploy with the following command:
   ```
   az containerapp compose create -g ai-exam-reviewer --environment ai-exam-reviewer-env --compose-file-path "docker-compose.yml" --registry-server "ghcr.io" --registry-username <GITHUB_USERNAME> --registry-password <GITHUB_PAT>
   ```

Note: You will need to manually add each environment variable for the backend container to work properly. The author hasn't found a solution more efficient at the moment.

## Local Installation

### Prerequisites
- [Node.js](https://nodejs.org) for frontend setup
- [Python](https://www.python.org) for backend setup
- [pnpm](https://pnpm.io) for managing frontend dependencies
- [pip](https://pip.pypa.io/en/stable/) for managing Python dependencies

### 1. Clone the repository
Clone this repository to your local machine:
```bash
   git clone https://github.com/thanh-hoang-codeleap/AI-Exam-Review.git
   cd AI-Exam-Reviewer
   ```

### 2. Install Frontend dependencies:
   ```bash
   cd frontend
   pnpm install
   ```

### 3. Install Backend dependencies:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

### 4. Create a `.env` file in the Backend folder and add the following information:
   ```ini
   API_KEY=your_api_key
   END_POINT=your_endpoint
   RAI_API_KEY=your_rai_api_key
   RAI_REGION=your_rai_region
   RAI_PROJECT=your_rai_project
   ```

## Usage

### 1. Start the Backend:
   ```bash
   cd backend
   python app.py
   ```
   The Flask backend will run on http://127.0.0.1:5000/

### 2. Start the Frontend:
   ```bash
   cd frontend
   pnpm dev
   ```
   This will start the frontend development server and will be available at http://localhost:3000 \
   If you want to access the frontend from another device on the same network, use http://192.168.1.247:3000

## Demo Video
### Text Checking
Upload a handwritten PDF, and the AI will read the text, analyze it for potential mistakes, and return the results in a downloadable Excel file.\
[Text Checking Demo](https://drive.google.com/file/d/1CNTsygMxIUIIiZyI6-CDWEfUqjJ99DuY/view?usp=sharing)

### Task Checking
Upload both the exam paper and the corresponding solution file. The system will extract the correct answers, allowing you to review and verify them. In the future, this can be enhanced to support adjusting answers and assigning points as needed.\
Once the solution extraction is complete, upload the exam paper for review. The system will extract the answers from the exam paper, compare them with the solution, and display the final result. For any incorrect answers, you can review both the answer and the solution to determine if the answer is correct.\
[Task Checking Demo](https://drive.google.com/file/d/1NrsjiQw558_dXlKGfUNQ0Prit2XUvP_N/view?usp=sharing)

## Run `pre-commit`
Run this command before `git commit`
   ```shell
   pre-commit run --all-files
   ```
