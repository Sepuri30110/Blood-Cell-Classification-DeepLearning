# 🩸 Blood Cell Classification Deep Learning

🔗 Repository:
https://github.com/Sepuri30110/Blood-Cell-Classification-DeepLearning

Full-stack blood cell classification system using MERN, FastAPI, and PyTorch for automated microscopic image analysis.

------------------------------------------------------------------------

## 🚀 Project Overview

Blood Cell Classification Deep Learning is a scalable AI-powered medical imaging platform designed to classify microscopic blood cell images using multiple deep learning architectures.

The platform allows users to:

-   Select different deep learning models
-   Upload blood cell images
-   Compare predictions across architectures
-   View prediction history
-   Analyze usage statistics via dashboards

This project demonstrates real-world AI deployment using microservice architecture.

------------------------------------------------------------------------

## 🔬 Deep Learning Models

The system supports multiple architectures:

-   ResNet
-   DenseNet
-   MobileNet
-   Vision Transformer (ViT)
-   Multi-model comparison mode

Each model performs inference independently, allowing performance benchmarking and comparative analysis.

------------------------------------------------------------------------

## 🏗 System Architecture

    User (Browser) 
            ↓ 
    React Frontend 
            ↓ 
    Node.js / Express Backend 
            ↓ 
    FastAPI ML Microservice 
            ↓ 
    PyTorch Models 
            ↓ 
    MongoDB (Users & History)

This architecture follows a clean microservice-based design, separating application logic from AI inference.

------------------------------------------------------------------------

## 🌐 Full-Stack Features

### 🔐 Authentication

-   JWT-based authentication
-   Secure login & registration
-   Protected routes

### 📊 Dashboard

-   Total predictions count
-   Model usage statistics
-   Class distribution tracking
-   User-specific prediction history

### 📁 Data Management

-   Image uploads
-   MongoDB storage
-   Prediction logging
-   User-based history tracking

------------------------------------------------------------------------

## 📁 Project Structure

Blood-Cell-Classification-DeepLearning/
│ 
├── frontend/ \# React application 
├── backend/ \# Node.js + Express API 
├── ml-service/ \# FastAPI inference service 
├── .gitignore 
└── README

------------------------------------------------------------------------

## ⚙️ Tech Stack

### Frontend

-   React
-   React Router
-   Axios

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   JWT Authentication

### AI / ML

-   Python
-   TensorFlow
-   FastAPI
-   NumPy

------------------------------------------------------------------------

## 🧪 Running the Project Locally

### 1️⃣ Clone the Repository

git clone
https://github.com/Sepuri30110/Blood-Cell-Classification-DeepLearning.git
cd Blood-Cell-Classification-DeepLearning

------------------------------------------------------------------------

### 2️⃣ Start ML Service

cd ml-service pip install -r requirements.txt uvicorn main:app --reload

------------------------------------------------------------------------

### 3️⃣ Start Backend

cd backend npm install npm start

------------------------------------------------------------------------

### 4️⃣ Start Frontend

cd frontend npm install npm start

------------------------------------------------------------------------

## 🎯 Use Cases

-   Medical AI experimentation
-   Academic research projects
-   Model benchmarking
-   Full-stack AI system demonstration
-   Final year major project
-   Professional portfolio project

------------------------------------------------------------------------

## 🔮 Future Enhancements

-   Ensemble model voting
-   Admin analytics dashboard
-   CI/CD integration
-   Dockerized deployment
-   Cloud deployment (AWS / Azure / GCP)
-   Explainable AI (Grad-CAM visualization)

------------------------------------------------------------------------

## 👨‍💻 Author

Developed by 
├── Munipalli Abhishek 
├── Sepuri Ram charan
└── BeemReddy Dinesh Reddy

Full-Stack AI Engineering Project
