# 🗂️ TaskFlow — Smart Task Tracker

A full-stack task management app built with **React**, **Spring Boot**, and **Firebase**.

---

## 📁 Folder Structure

```
smart-task-tracker/
├── frontend/                          # React app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.js            # Individual task card
│   │   │   ├── TaskCard.css
│   │   │   ├── TaskModal.js           # Create/Edit modal
│   │   │   └── TaskModal.css
│   │   ├── context/
│   │   │   └── AuthContext.js         # Firebase auth state
│   │   ├── pages/
│   │   │   ├── Login.js               # Login page
│   │   │   ├── Signup.js              # Signup page
│   │   │   ├── Auth.css               # Shared auth styles
│   │   │   ├── Dashboard.js           # Main dashboard
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── taskService.js         # Axios API calls
│   │   ├── firebase.js                # Firebase client init
│   │   ├── App.js                     # Router + auth guards
│   │   └── index.js
│   └── package.json
│
├── backend/                           # Spring Boot app
│   ├── src/main/
│   │   ├── java/com/tasktracker/
│   │   │   ├── TaskTrackerApplication.java
│   │   │   ├── config/
│   │   │   │   ├── FirebaseConfig.java        # Firebase Admin SDK init
│   │   │   │   ├── FirebaseAuthFilter.java    # JWT verification filter
│   │   │   │   └── CorsConfig.java            # CORS settings
│   │   │   ├── controller/
│   │   │   │   └── TaskController.java        # REST endpoints
│   │   │   ├── service/
│   │   │   │   └── TaskService.java           # Business logic + DB ops
│   │   │   └── model/
│   │   │       └── Task.java                  # Task data model
│   │   └── resources/
│   │       ├── application.properties
│   │       └── firebase-service-account.json  # ⚠️ Replace with real file
│   └── pom.xml
│
├── firebase-database.rules.json       # Firebase security rules
└── README.md
```

---

## 🔥 Step 1: Firebase Setup

### 1.1 Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name → click through the wizard

### 1.2 Enable Authentication
1. In your project, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

### 1.3 Enable Realtime Database
1. Go to **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose your region (e.g., `us-central1`)
4. Start in **test mode** for now (you'll add rules later)
5. Copy your database URL — it looks like:
   `https://your-project-id-default-rtdb.firebaseio.com`

### 1.4 Get Frontend Config (Web App)
1. Go to **Project Settings** (gear icon) → **Your apps**
2. Click **"Add app"** → choose **Web** (`</>`)
3. Register the app (no hosting needed)
4. Copy the `firebaseConfig` object shown

### 1.5 Get Backend Service Account Key
1. Go to **Project Settings → Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Rename it to `firebase-service-account.json`

### 1.6 Apply Database Security Rules
1. Go to **Realtime Database → Rules**
2. Paste the contents of `firebase-database.rules.json`
3. Click **Publish**

---

## ⚛️ Step 2: Frontend Setup (React)

### 2.1 Install dependencies
```bash
cd frontend
npm install
```

### 2.2 Configure Firebase
Open `src/firebase.js` and replace the placeholder config:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",                          // from Firebase console
  authDomain: "my-project.firebaseapp.com",
  databaseURL: "https://my-project-default-rtdb.firebaseio.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 2.3 Start the development server
```bash
npm start
```
The app opens at [http://localhost:3000](http://localhost:3000)

---

## ☕ Step 3: Backend Setup (Spring Boot)

### 3.1 Prerequisites
- Java 17+
- Maven 3.8+

Verify:
```bash
java -version
mvn -version
```

### 3.2 Add Firebase Service Account
1. Copy the downloaded `firebase-service-account.json` to:
   ```
   backend/src/main/resources/firebase-service-account.json
   ```
2. **⚠️ Never commit this file to Git!**
   Add to `.gitignore`:
   ```
   src/main/resources/firebase-service-account.json
   ```

### 3.3 Configure application.properties
Open `src/main/resources/application.properties` and set your DB URL:

```properties
firebase.database-url=https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com
```

### 3.4 Build and run
```bash
cd backend
mvn spring-boot:run
```

The API starts at [http://localhost:8080](http://localhost:8080)

Test it:
```bash
curl http://localhost:8080/tasks/health
# → {"status":"UP","service":"task-tracker"}
```

---

## 🔌 API Reference

All endpoints require:
```
Authorization: Bearer <Firebase ID Token>
```

| Method | Endpoint         | Description              |
|--------|-----------------|--------------------------|
| GET    | `/tasks`        | Fetch all tasks for user |
| POST   | `/tasks`        | Create a new task        |
| PUT    | `/tasks/{id}`   | Update a task            |
| DELETE | `/tasks/{id}`   | Delete a task            |
| GET    | `/tasks/health` | Health check (no auth)   |

### Example Request Bodies

**POST /tasks**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "createdAt": 1711234567000
}
```

**PUT /tasks/{id}**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter",
  "completed": true
}
```

---

## 🔐 Security Architecture

```
React Frontend
    │
    ├─ Firebase Auth (client SDK) ──► Gets ID Token (JWT)
    │
    └─► POST /tasks  { Authorization: Bearer <idToken> }
              │
    Spring Boot Backend
              │
    FirebaseAuthFilter
              │
    FirebaseAuth.verifyIdToken(token) ──► Firebase Auth Service
              │
    Verified UID attached to request
              │
    TaskService (query by userId)
              │
    Firebase Realtime Database
```

- Firebase Auth issues JWTs; the backend verifies every request
- Tasks are stored with `userId` and database rules enforce ownership
- Each user can only read/write their own tasks

---

## ✅ Features Checklist

- [x] Email/password signup & login (Firebase Auth)
- [x] JWT token verification on every API call
- [x] Create tasks with title + description
- [x] View all tasks (filtered by logged-in user)
- [x] Edit task title & description
- [x] Delete tasks
- [x] Mark tasks complete/incomplete
- [x] Filter tasks: All / In Progress / Completed
- [x] Search tasks by title or description
- [x] Progress bar (% completion)
- [x] Loading states throughout
- [x] Error handling with retry
- [x] CORS configured for local dev
- [x] Firebase Database security rules

---

## 🚀 Production Tips

1. **Environment variables** — Move Firebase config to `.env` files:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   ```

2. **Backend secrets** — Use environment variables or a secrets manager instead of bundling `firebase-service-account.json`

3. **CORS** — Update `CorsConfig.java` with your production frontend URL

4. **HTTPS** — Always use HTTPS in production; Firebase requires it for Auth

5. **Build React** for production:
   ```bash
   npm run build
   ```

---

## Online Deployment

The easiest setup for this project is:

- `Frontend:` Vercel or Netlify
- `Backend:` Any Java hosting provider
- `Database/Auth:` Firebase

### 1. Prepare environment variables

Frontend `frontend/.env`:

```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

Backend `backend/.env`:

```env
PORT=8080
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
FIREBASE_SERVICE_ACCOUNT_BASE64=PASTE_BASE64_OF_YOUR_FIREBASE_SERVICE_ACCOUNT_JSON
```

To generate `FIREBASE_SERVICE_ACCOUNT_BASE64`:

```bash
base64 firebase-service-account.json
```

On Windows PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase-service-account.json"))
```

### 2. Deploy the backend

1. Push this project to GitHub
2. Create a Java web service on your preferred hosting provider
3. Select the repo
4. Use these settings:

```text
Root Directory: smart-task-tracker/backend
Build Command: mvn clean package
Start Command: java -jar target/task-tracker-backend-1.0.0.jar
```

5. Add the backend environment variables from above
6. After deploy, note your backend URL, for example:
   `https://task-tracker-backend.example.com`

### 3. Deploy the frontend on Vercel

1. Import the same GitHub repo into Vercel
2. Set:

```text
Root Directory: smart-task-tracker/frontend
Build Command: npm run build
Output Directory: build
```

3. Add the frontend environment variables
4. Set `REACT_APP_API_BASE_URL` to your backend URL
5. Deploy

### 4. Update backend CORS

Set `CORS_ALLOWED_ORIGINS` in your backend hosting provider to your frontend URL, for example:

```env
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

If you use multiple frontend URLs, separate them with commas:

```env
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### 5. Important security note

The file `backend/src/main/resources/firebase-service-account.json` should not stay committed in a public repository. If this key is real, rotate it in Firebase Console after deployment and use environment variables instead.
