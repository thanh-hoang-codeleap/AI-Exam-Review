# AI-Exam-Reviewer

AI Exam Reviewer is designed to help teachers check students' essays for mistakes such as grammar or pronunciation errors. This application leverages AI to provide feedback and assist with the review process.

## Installation

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
   pnpm isntall
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
[Task Checking Demo](https://drive.google.com/file/d/1ALHSnxDN_XDssDCovClNQ8O3nGFnrAvz/view?usp=sharing)