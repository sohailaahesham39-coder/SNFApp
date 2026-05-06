# Smart Nutrition & Fitness Chatbot

A React Native + Expo application for personalized nutrition, workout guidance, health-condition-aware recommendations, and local AI-style coaching for an Egyptian audience.

## Project Summary

This project is a **mobile-first smart nutrition and fitness app** built as a **local-first Expo application**.

### Frontend / Mobile App
What already exists in the codebase:

- Splash screen
- Tab navigation
- Home dashboard
- Profile screen
- Workout screen
- Theme switching
- Local profile storage
- Built-in meal and workout datasets
- Medical condition logic
- ML-style recommendation logic
- Habit planning and symptom analysis

### Backend / Server Layer
What is **not implemented yet** in the current repository, but is required for the full product:

- Auth system with JWT
- User registration and login API
- Database tables for users, profiles, logs, and sessions
- API endpoints for meals, workouts, progress, and chatbot
- Real chatbot intent router
- Cloud-hosted ML services
- CSV import into a database
- Progress tracking backend
- Secure multi-user data synchronization

The app is designed to evolve into a full platform with backend APIs, auth, database storage, chatbot intelligence, and cloud deployment.

---

## Current Tech Stack

- **Expo**
- **React Native**
- **TypeScript**
- **Expo Router**
- **React Native Safe Area Context**
- **Expo Linear Gradient**
- **Expo Vector Icons**
- **AsyncStorage**

---

## Project Structure

- `app/` — app screens and navigation
- `context/` — theme context
- `data/` — local user storage, meal/workout data, medical engine, ML engine, habit plans
- `assets/` — images and splash assets
- `lib/` — helper modules
- `constants/` — static constants

---

## Implemented Screens

### 1) Splash Screen
File: `app/index.tsx`

- Animated branded splash page
- Checks if a saved profile exists
- Redirects to:
  - `/(tabs)/home` if profile exists
  - `/(auth)/welcome` if not

### 2) Main App Navigation
File: `app/(tabs)/_layout.tsx`

Tabs included:

- Home
- Meals
- Workout
- Chat
- Profile

### 3) Home Screen
File: `app/(tabs)/home.tsx`

Features:

- Greeting based on current time
- Loads saved profile from local storage
- Shows:
  - calorie target
  - macros
  - BMI category
  - TDEE
  - BMR
- Recommends meals from local dataset
- Recommends workouts from local dataset
- Shows condition-based health tips
- Quick access shortcuts

### 4) Profile Screen
File: `app/(tabs)/profile.tsx`

Features:

- Displays user profile details
- Tabbed internal sections:
  - Stats
  - AI
  - Habits
  - Health symptoms
  - Settings
- Runs local ML summary logic
- Generates habit plans
- Analyzes symptoms for possible deficiencies
- Supports dark mode toggle
- Logout with profile clearing

### 5) Workout Screen
File: `app/(tabs)/workout.tsx`

Features:

- Loads workouts from:
  - local dataset
  - database helper fallback
- Filters workouts by difficulty
- Displays weekly workout UI
- Shows workout cards with:
  - calories burned
  - equipment
  - sets and reps
  - duration

---

## Local Data & Logic Modules

### `data/userStore.ts`
Handles:

- Saving profile to AsyncStorage
- Loading profile
- Clearing profile
- BMI calculation
- BMR calculation
- TDEE calculation
- Target calorie calculation
- BMI category classification

### `data/localData.ts`
Contains local datasets:

- Meals
- Workouts
- Health conditions
- Allergens
- Chatbot responses

### `data/medicalEngine.ts`
Contains:

- Extended medical condition database
- Lab test recommendations
- 10-day safe plan generator
- Compliance analyzer
- Feedback questions

### `data/mlEngine.ts`
Contains local ML-style logic:

- KNN-based meal recommendation
- Linear regression weight prediction
- Diet classification decision tree
- Combined summary runner for UI

### `data/habitPlan.ts`
Provides habit-based planning logic for lifestyle and health improvement.

### `context/ThemeContext.tsx`
Provides:

- Dark/light theme state
- Persistent theme storage
- Color palette helper

---

## What Is Already Working

This project already has a strong local foundation:

- Profile is saved locally
- Calorie formulas are implemented
- BMI/BMR/TDEE are functional
- Meals and workouts can be displayed from local datasets
- Medical condition suggestions are available
- ML-style summaries are shown in the UI
- Theme mode is persistent

---

## What Still Needs Backend

The current project is **not connected to a real backend yet**.  
To make it production-ready, these features still need to be built:

- Auth system with JWT
- User registration and login
- Database tables for users, profiles, logs, and sessions
- API endpoints for meals, workouts, progress, and chatbot
- Real chatbot intent router
- Cloud-hosted ML services
- CSV import into a database
- Progress tracking backend
- Secure multi-user data synchronization

---

## Recommended Next Development Steps

1. Build backend API
2. Add database schema
3. Add auth flow
4. Connect onboarding/profile to API
5. Replace local-only data access with API calls
6. Build chatbot endpoint
7. Add chart-based progress tracking
8. Prepare deployment

---

## Goal of the App

The goal is to provide:

- personalized meal plans
- tailored workout recommendations
- nutrition and health guidance
- condition-aware safety filtering
- Egyptian-food-focused support
- AI-assisted chatbot help

---

## Notes

This repo currently looks like an **Expo mobile application** rather than the React web app described in the project blueprint.  
That means the current codebase is best treated as a **mobile prototype / client-side demo** with strong offline logic, and the backend/database layer still needs to be added separately.

---

## Development Status

- **Frontend prototype:** in progress
- **Local recommendation logic:** done
- **Theme system:** done
- **Profile persistence:** done
- **Backend API:** not implemented yet
- **Database:** not implemented yet
- **Auth:** not implemented yet

---

## Student Quick Explanation

This section is a short script students can use to explain the project clearly during a review.

### 1) How the app flow works
- The app starts on a splash/loading path.
- It checks whether a profile/session exists.
- If profile data exists, it opens Home.
- If not, it opens the Auth/Welcome flow.

### 2) What the frontend includes
- **`app/index.tsx`**: initial entry and route handoff.
- **`app/(tabs)/_layout.tsx`**: main tab navigation (Home, Meals, Workout, Chat, Profile).
- **`app/(tabs)/home.tsx`**: greeting, calorie target, BMI/BMR/TDEE, meal/workout recommendations, health tips.
- **`app/(tabs)/profile.tsx`**: user profile, analysis views, habit plans, symptom section, theme settings.
- **`app/(tabs)/workout.tsx`**: workout list and filtering by difficulty and goal.

### 3) Core logic files
- **`data/userStore.ts`**: profile save/load/clear and BMI/BMR/TDEE/target calorie calculations.
- **`data/localData.ts`**: base meals, workouts, health conditions, allergens, chatbot responses.
- **`data/medicalEngine.ts`**: medical insights, condition/lab mapping, safe plans.
- **`data/mlEngine.ts`**: local recommendation and prediction logic.
- **`data/habitPlan.ts`**: habit reduction planning.
- **`context/ThemeContext.tsx`**: dark/light mode, theme persistence, and colors.

### 4) What the app currently does
- Stores and reads user data locally (with Supabase-first integration in key flows).
- Calculates calorie needs and fitness metrics.
- Recommends meals and workouts.
- Provides symptom/condition-based health guidance.
- Includes AI chat and progress tracking foundations.

### 5) What is required for full production maturity
- Complete backend automation for push events and scheduled jobs.
- Final native mobile messaging configuration per platform.
- Full API/event layer for all notification scenarios.
- Final migration from legacy/local fallback paths where needed.

## Summary

This project is a promising smart nutrition and fitness assistant focused on Egyptian food and health culture. The app already includes solid local logic for profiles, meals, workouts, medical insights, and theme handling. The next major step is to add a backend and database so the app can support real authentication, sync, chatbot intelligence, and production deployment.
