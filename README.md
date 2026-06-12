
# ExamPlatform

A full-stack online examination platform built with React, Node.js, Express, and PostgreSQL. The system supports role-based access control, AI-powered descriptive answer evaluation, automated grading, exam management, candidate analytics, and secure online assessments.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Five user roles:
  - Super Admin
  - Admin
  - Coordinator
  - Evaluator
  - Candidate
- OTP-based email verification
- Forgot Password functionality

### Exam Management
- Create and manage exams
- Dynamic question builder
- Support for:
  - Multiple Choice Questions (MCQ)
  - True/False Questions
  - Fill in the Blanks
  - Descriptive Questions
- Exam scheduling and publishing

### Online Examination System
- Live exam interface
- Auto-save answers
- Countdown timer
- Secure submission workflow
- Multilingual exam instructions page

### Automated Evaluation
- Instant evaluation for:
  - MCQs
  - True/False Questions
  - Fill in the Blanks
- AI-powered descriptive answer assessment
- Multi-model fallback mechanism for reliable AI evaluation

### Results & Analytics
- Detailed score reports
- Pass/Fail status
- Correct, Incorrect, and Skipped answer analysis
- Rank calculation
- Percentile calculation
- Candidate performance analytics dashboard

### Email Services
- OTP verification emails
- Hall Ticket generation and delivery
- Notification emails via SendGrid

### Security
- JWT Authentication
- Password hashing
- Helmet security middleware
- Rate limiting
- CORS protection
- Protected API routes

### Admin Dashboard
- Real-time statistics
- Candidate management
- Exam monitoring
- Results management
- Performance tracking

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- React Router

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL (Supabase)

### AI Integration
- OpenRouter API
- Llama 3.3 70B Instruct

### Email Service
- SendGrid

### Deployment
- Frontend: Vercel
- Backend: Render

## Future Enhancements
- Razorpay Payment Integration
- AI-Based Proctoring
- Certificate Generation
- Advanced Analytics Dashboard
- Question Bank Management
- Bulk Candidate Import

## Installation

### Clone Repository

bash

git clone https://github.com/your-username/exam-platform.git
cd exam-platform

###Backend Setup
cd backend
npm install
npm run dev

##Frontend Setup
cd frontend
npm install
npm run dev

##Environment Variables
Backend

DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
OPENROUTER_API_KEY=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_OTP_TEMPLATE_ID=

Frontend

VITE_API_URL=

