# ShowBuzz – Premium Event & Ticket Booking Platform

A modern, full-featured entertainment booking platform built with **React**, **Vite**, and **Firebase** that enables users to discover and book **movies, concerts, and sports events** through a seamless, interactive experience.

ShowBuzz combines secure authentication, intelligent recommendations, interactive seat booking, digital rewards, and cloud-based data management to deliver a premium ticket booking experience.

---

## Live Demo

**Website:** https://show-buzz-eight.vercel.app/

---

# Features

### Multi-Category Event Booking

* Browse and book tickets for **Movies**, **Music Concerts**, and **Sports Events**
* View event information, ratings, descriptions, and schedules
* Explore content across multiple categories through an intuitive interface

### ShowBuzz AI Concierge

An intelligent in-app assistant that helps users by:

* Recommending events based on user preferences
* Suggesting preferred seats based on previous bookings
* Guiding users to rewards and loyalty features
* Sending personalized event recommendations

### BuzzRewards System

A gamified loyalty program featuring:

* Daily Spin & Win
* Weekly booking streaks
* BuzzCoins reward points
* Achievement badges
* Membership progression (Silver → Gold)

### Interactive Seat Selection

* Visual theater and stadium seating layouts
* Real-time seat selection and price calculation
* Reserved and unavailable seat visualization

### Secure Authentication

* Email & Password authentication
* Google Sign-In
* Persistent user sessions using Firebase Authentication

### Cloud Data Management

* User profiles
* Booking history
* Reward progress
* Favorites and preferences
* Firestore cloud synchronization

---

# Tech Stack

| Category       | Technologies                     |
| -------------- | -------------------------------- |
| Frontend       | React 19, Vite, JavaScript (ES6) |
| Styling        | Tailwind CSS v4, PostCSS         |
| Authentication | Firebase Authentication          |
| Database       | Firebase Cloud Firestore         |
| Routing        | React Router DOM v7              |
| Icons          | Lucide React                     |
| Deployment     | Vercel                           |

---

# Project Architecture

```
React + Vite
      │
React Router
      │
Firebase Authentication
      │
Cloud Firestore
      │
Interactive Booking Modules
```

---

# Key Modules

* Authentication
* Event Discovery
* Seat Selection
* Booking System
* AI Concierge
* Rewards & Loyalty
* User Profile
* Booking History

---

# Installation

### Clone the repository

```bash
git clone https://github.com/bhavyasanthoshi02/ShowBuzz.git
cd ShowBuzz
```

### Install dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Start Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:5173
```

---

# Technical Highlights

* Built a responsive single-page application using React and Vite
* Integrated Firebase Authentication with secure session persistence
* Developed reusable React components for scalability
* Designed interactive seat selection with dynamic price calculation
* Implemented AI-inspired recommendation and loyalty modules
* Configured client-side routing for seamless deployment on Vercel

---

# Future Enhancements

* QR-code based digital tickets
* Live seat availability synchronization
* Booking history analytics
* Push notifications
* Event organizer dashboard
* AI-powered personalized recommendations
* Payment gateway expansion

---

# Author

**Bhavya Santhoshi**

If you found this project useful, consider giving it a ⭐ on GitHub.
