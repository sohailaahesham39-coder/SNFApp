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

## شرح مبسط للطلاب — يقولو إيه لو الدكتور سأل؟

الجزء ده معمول كـ **سكريبت شرح سريع** للطلبة عشان يفهموا الكود ويعرفوا يجاوبوا على أي سؤال بشكل مختصر وواضح.

### 1) التطبيق ده شغال إزاي؟
- أول ما التطبيق يفتح، يروح على **Splash Screen**.
- بعد كده يراجع هل فيه **profile محفوظ** ولا لأ.
- لو فيه بيانات محفوظة، يدخل على **Home**.
- لو مفيش، يروح لجزء الـ **Auth / Welcome**.

### 2) الجزء الأمامي Frontend فيه إيه؟
- **`app/index.tsx`**  
  ده شاشة البداية اللي فيها لوجو وحركة بسيطة، وبعدها بيدخل المستخدم للصفحة المناسبة.
- **`app/(tabs)/_layout.tsx`**  
  ده اللي عامل شريط التنقل بين الصفحات الأساسية: Home / Meals / Workout / Chat / Profile.
- **`app/(tabs)/home.tsx`**  
  دي الصفحة الرئيسية، بتعرض:
  - التحية حسب الوقت
  - السعرات اليومية
  - الـ BMI
  - الـ BMR و TDEE
  - اقتراحات أكل وتمرين
  - نصائح حسب الحالة الصحية
- **`app/(tabs)/profile.tsx`**  
  دي صفحة البروفايل، وبتعرض:
  - بيانات المستخدم
  - التحليل الطبي
  - خطة العادات
  - تحليل الأعراض
  - إعدادات الثيم
- **`app/(tabs)/workout.tsx`**  
  دي صفحة التمارين، وبتعرض التمارين من الداتا المحلية وتفلترها حسب الصعوبة.

### 3) الملفات اللي فيها المنطق والذكاء
- **`data/userStore.ts`**  
  ده مسؤول عن:
  - حفظ البروفايل
  - تحميله
  - مسحه
  - حساب BMI / BMR / TDEE / calories target
- **`data/localData.ts`**  
  ده فيه الداتا الجاهزة:
  - meals
  - workouts
  - health conditions
  - allergens
  - chatbot responses
- **`data/medicalEngine.ts`**  
  ده الجزء الطبي، وفيه:
  - قائمة الأمراض
  - التحاليل المناسبة لكل حالة
  - خطة 10 أيام آمنة
  - تقييم الالتزام بالخطة
- **`data/mlEngine.ts`**  
  ده جزء الذكاء/الـ ML المحلي، وفيه:
  - توصية وجبات
  - توقع الوزن
  - تصنيف نوع الدايت المناسب
- **`data/habitPlan.ts`**  
  ده بيعمل خطة عادات صحية للمستخدم حسب هدفه.
- **`context/ThemeContext.tsx`**  
  ده مسؤول عن:
  - Dark Mode / Light Mode
  - حفظ اختيار الثيم
  - ألوان الواجهة

### 4) التطبيق ده بيعمل إيه عمليًا؟
- يحفظ بيانات المستخدم محليًا.
- يحسب له احتياجاته الغذائية.
- يقترح أكل مناسب له.
- يقترح تمارين مناسبة.
- ينبهه لو فيه حالة صحية أو عرض ممكن يحتاج متابعة.
- يجهز شكل أولي لذكاء اصطناعي ونظام متابعة.

### 5) إيه اللي ناقص عشان يبقى Full Project؟
- Backend حقيقي
- Login / Register بجزء JWT
- Database
- API endpoints
- Chatbot فعلي
- ربط الداتا كلها بالسيرفر بدل التخزين المحلي فقط

### 6) لو الدكتور سأل “ليه عملتوا المشروع ده؟”
ممكن الرد يكون:
> عملنا التطبيق ده عشان يساعد المستخدم في الأكل الصحي والرياضة بشكل شخصي، ويأخذ في الاعتبار الحالة الصحية والحساسية والأهداف المختلفة، وكل ده بأسلوب بسيط يناسب المستخدم المصري.

### 7) لو سأل “إيه المميز فيه؟”
ممكن الرد يكون:
- فيه **تخصيص** حسب الهدف والحالة الصحية.
- فيه **داتا مصرية** في الأكل والبدائل.
- فيه **حسابات تلقائية** للسعرات و BMI.
- فيه **تحليل أعراض وحالات طبية**.
- واجهته **موبايل بسيطة وسهلة**.

### 8) لو سأل “إيه دور كل قسم بسرعة؟”
- **Frontend**: شكل الصفحات والتنقل.
- **Data**: المعلومات الجاهزة والرسائل.
- **Engine**: الحسابات والتوصيات والتحليل.
- **Context**: إعدادات الشكل والثيم.
- **Storage**: حفظ واسترجاع بيانات المستخدم.

### 9) ملخص سريع جدًا للحفظ
> التطبيق عبارة عن مساعد غذائي ورياضي ذكي.  
> الواجهة موجودة شغالة على Expo، والبيانات والحسابات كلها محلية حاليًا.  
> الجزء الناقص هو الـ backend والـ database والـ auth عشان يبقى system كامل.

## Summary

This project is a promising smart nutrition and fitness assistant focused on Egyptian food and health culture. The app already includes solid local logic for profiles, meals, workouts, medical insights, and theme handling. The next major step is to add a backend and database so the app can support real authentication, sync, chatbot intelligence, and production deployment.
