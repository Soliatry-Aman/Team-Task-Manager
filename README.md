# Team Task Manager

A full-stack Team Task Manager web application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes

### Project Management
- Create Projects
- View Projects
- Add Team Members
- Remove Members
- Project Admin Controls

### Task Management
- Create Tasks
- Assign Tasks to Members
- Update Task Status (To Do / In Progress / Done)
- Delete Tasks
- Priority Levels (Low / Medium / High)
- Due Dates

### Dashboard
- Total Tasks
- To Do Tasks
- In Progress Tasks
- Completed Tasks
- Overdue Tasks

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs

---

## Installation

### Backend Setup

cd backend  
npm install  
npm run dev  

Create `.env`:

PORT=5000  
MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret_key  

### Frontend Setup

cd frontend  
npm install  
npm run dev  

Create `.env`:

VITE_API_URL=http://localhost:5000/api  

---

## Folder Structure

team-task-manager/  
┣ backend/  
┃ ┣ config/  
┃ ┣ middleware/  
┃ ┣ models/  
┃ ┣ routes/  
┃ ┗ server.js  
┣ frontend/  
┃ ┣ src/  
┃ ┃ ┣ api/  
┃ ┃ ┣ components/  
┃ ┃ ┣ context/  
┃ ┃ ┗ pages/  
┗ README.md  

---

## Future Improvements
- Role-based Admin Panel  
- Notifications  
- File Attachments  
- Comments  
- Dark Mode  
- Deployment  

---

## Author

Built as a beginner full-stack project for learning and portfolio development.