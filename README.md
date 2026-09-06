# StudySphere

> **Cross-Platform Academic & Study Workspace**  
> Designed & Built by **Muhammad Ramzan Khan**  
> Licensed under the [MIT License](./LICENSE)

StudySphere is a comprehensive academic study companion engineered for courses, syllabus tracking, lecture materials, assignment deadlines, and rich Markdown study notes. It is a fully installable Progressive Web App (PWA) that runs natively on mobile devices (Android, iOS) and desktop computers (Windows, macOS, Linux) with 100% offline support.

---

## 🌟 Key Features

- 📱 **Progressive Web App (PWA) & Instant Installation**: Installable with 1-click on mobile devices (Android / iOS) and desktop (Windows / macOS). Displays an app icon on the home screen and launches in full-screen standalone mode.
- ⚡ **100% Offline Capability**: Built with service worker precaching and IndexedDB local storage. All your subjects, documents, notes, and deadlines remain fully accessible and editable without an internet connection.
- 🔍 **Top Universal Search**: Instant real-time filtering across all subjects, study notes, deadlines, and uploaded course materials.
- 📱 **Ergonomic Bottom Navigation**: Bottom-docked navigation bar adapted to mobile safe-area insets with rapid access to **Overview**, **Subjects**, **Materials**, **Deadlines**, and **Study Notes**.
- 🌓 **Theme Modes (Dark & White)**: Dedicated theme toggle supporting both dark and light modes with instant persistence and zero-flicker startup.
- 📑 **In-App Document Viewer**: View PDFs, slides, assignments, lab sheets, and images directly inside the app with typography scaling, full-screen mode, and metadata management without leaving the workspace.
- 🛡️ **Advanced Data Management**:
  - **Strict Confirmation "Delete All Data"**: Safeguarded by requiring explicit typing of `DELETE ALL` to prevent accidental loss.
  - **Delete Selected Data**: Multi-item checklist allowing users to delete specific subjects, documents, deadlines, or notes.
  - **Restore Selected Data**: Granular restoration from curated academic catalog samples or uploaded JSON backup files.
- ⏱️ **Pomodoro Focus Timer**: Integrated study sessions with 25/5 interval cycles and custom audio-visual study feedback.

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

```bash
npm run build
```

The compiled static assets and service worker will be output to the `dist/` directory.

---

## ☁️ Deploying & Updating on Vercel

If you already connected your GitHub repository to Vercel (e.g. `https://study-sphere-begginer2.vercel.app`):

### How to push new updates to Vercel:
```bash
# 1. Check changes
git status

# 2. Stage and commit all changes
git add .
git commit -m "feat: add full PWA installation, mobile layout, and offline support"

# 3. Push to GitHub main branch
git push origin main
```
Vercel automatically detects the push and rebuilds the site in ~30 seconds. Your live link will immediately feature the "Install App" button, offline caching, and mobile optimizations.

---

## 📲 How Users Install StudySphere on Their Devices

When visiting your Vercel link (`https://study-sphere-begginer2.vercel.app`):

### 1. On Android Phones:
- Users will see the blue **"Install"** banner at the bottom or the **"Install App"** button at the top.
- Tapping it prompts: **"Add StudySphere to Home screen"**.
- Alternatively, tap the Chrome menu (**⋮**) ➔ **"Install app"**.
- StudySphere installs on the phone with a native app icon and runs full-screen completely offline!

### 2. On iPhone & iPad (iOS Safari):
- Tap the **"Install App"** button at the top to open the guide.
- Tap the Safari **Share** icon (box with arrow pointing up).
- Scroll down and tap **"Add to Home Screen"**.
- Tap **"Add"** in the top right. StudySphere is now saved on your iOS home screen with full offline access.

### 3. On Windows / Mac / Linux (Chrome & Edge):
- Click the **"Install App"** button in the header bar or the computer install icon in the URL address bar.
- StudySphere runs in its own native, distraction-free desktop window.

---

## 📦 Creating a Release Package on GitHub

1. **Tag the version**:
   ```bash
   git tag -a v1.1.0 -m "StudySphere PWA Release v1.1.0"
   git push origin v1.1.0
   ```
2. **Build and package distribution assets**:
   ```bash
   npm run build
   zip -r studysphere-v1.1.0-web.zip dist/
   ```
3. **Publish the Release on GitHub**:
   - Navigate to your repository on GitHub.
   - On the right sidebar, click **Releases** > **Draft a new release**.
   - Select tag `v1.1.0`.
   - Title: `StudySphere v1.1.0 - Installable PWA & Offline Academic Workspace`.
   - Drag and drop `studysphere-v1.1.0-web.zip` into the attachments area.
   - Click **Publish release**.

---

## 📄 License

This project is licensed under the **MIT License** — authored by **Muhammad Ramzan Khan**.

See the full [LICENSE](./LICENSE) file for terms and permissions.
