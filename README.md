# StudySphere

> **Cross-Platform Academic & Study Workspace**  
> Designed & Built by **Muhammad Ramzan Khan**  
> Licensed under the [MIT License](./LICENSE)

StudySphere is a comprehensive academic study companion engineered for courses, syllabus tracking, lecture materials, assignment deadlines, and rich Markdown study notes. It runs seamlessly on desktop browsers (macOS, Windows, Linux) and mobile devices (Android, iOS).

---

## 🌟 Key Features

- 🔍 **Top Universal Search**: Instant real-time filtering across all subjects, study notes, deadlines, and uploaded course materials.
- 📱 **Universal Bottom Navigation**: Ergonomic bottom-docked navigation bar providing rapid one-tap access to **Overview**, **Subjects**, **Materials**, **Deadlines**, and **Study Notes**.
- 🌓 **Theme Modes (Dark & Light)**: Dedicated theme toggle supporting both dark and light modes with instant persistence in `localStorage` and zero-flicker launch.
- 📑 **In-App Document Viewer**: View PDFs, slides, assignments, lab sheets, and images directly inside the app with typography scaling, full-screen mode, and metadata management without leaving the workspace.
- ✏️ **Complete CRUD Lifecycle**: Create, edit, and safely delete subjects, documents, tasks, and study notes with custom modal confirmations.
- 🛡️ **Advanced Data Management**:
  - **Strict Confirmation "Delete All Data"**: Safeguarded by requiring explicit typing of `DELETE ALL` to prevent accidental loss.
  - **Delete Selected Data**: Multi-item checklist allowing users to delete specific subjects, documents, deadlines, or notes.
  - **Restore Selected Data**: Granular restoration from curated academic catalog samples or uploaded JSON backup files.
- ⏱️ **Pomodoro Focus Timer**: Integrated study sessions with 25/5 interval cycles and custom audio-visual study feedback.
- 💾 **Offline-Ready Storage**: Fast, private client-side IndexedDB persistence keeping student data private and responsive offline.

---

## 🚀 Installation & Local Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or later ([Download Node.js](https://nodejs.org/))
- **npm**: Version 9.0.0 or later (bundled with Node.js) or **pnpm** / **yarn**
- **Git**: For version control

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/studysphere.git
cd studysphere
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to interact with the application.

### 4. Build for Production

To compile an optimized production bundle:

```bash
npm run build
```

The compiled static assets will be output to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## 📦 Setting Up GitHub Repository & Releases

### Step 1: Initialize Git and Commit

```bash
# Initialize git if not already initialized
git init

# Add all project files
git add .

# Create initial commit
git commit -m "feat: complete StudySphere workspace v1.0.0"
```

### Step 2: Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `studysphere`.
2. Link your local repository and push:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/studysphere.git
git push -u origin main
```

### Step 3: Create a Release Package on GitHub

1. **Tag the version**:
   ```bash
   git tag -a v1.0.0 -m "StudySphere Release Version 1.0.0"
   git push origin v1.0.0
   ```
2. **Build and package distribution assets**:
   ```bash
   npm run build
   # Create a zip of the compiled dist folder
   zip -r studysphere-v1.0.0-web.zip dist/
   ```
3. **Publish the Release on GitHub**:
   - Navigate to your repository on GitHub.
   - On the right sidebar, click **Releases** > **Draft a new release**.
   - Select tag `v1.0.0`.
   - Title: `StudySphere v1.0.0 - Academic Workspace`.
   - Paste release highlights and changelog notes in the description.
   - Drag and drop `studysphere-v1.0.0-web.zip` into the binary attachments area.
   - Click **Publish release**.

---

## 📲 Packaging for Mobile (Android) & Desktop (macOS / Windows)

StudySphere is built with responsive standard web technologies, making it ready to package as a native mobile or desktop app:

### Option A: Progressive Web App (PWA) / Direct Install
- **On Android**: Open the deployed URL in Google Chrome, tap the menu (⋮), and choose **Install app** or **Add to Home screen**.
- **On macOS / Windows**: Open the URL in Chrome, Edge, or Safari, and click the install icon in the address bar.

### Option B: Native Android App (via Capacitor)
To build a standalone `.apk` or `.aab` for Android:
```bash
# 1. Install Capacitor packages
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init StudySphere com.studysphere.app --web-dir dist

# 3. Build web assets & add Android platform
npm run build
npx cap add android

# 4. Open in Android Studio to build APK
npx cap open android
```

### Option C: Desktop App (macOS & Windows via Tauri)
To package as a native `.dmg` or `.exe`:
```bash
npm install -D @tauri-apps/cli
npx tauri init
npx tauri build
```

---

## 📄 License

This project is licensed under the **MIT License** — authored by **Muhammad Ramzan Khan**.

See the full [LICENSE](./LICENSE) file for terms and permissions.
