# 🎓 Gesture & Voice Classroom Assistant
> **Google Vibe Coding Hackathon Submission**

**Classroom AI** is a futuristic, multimodal teaching assistant designed to transform the live classroom experience. Powered by **Gemini 3 Pro**, **MediaPipe**, and **WebRTC**, it turns static educational content—textbooks, diagrams, and whiteboards—into interactive, adaptive lessons.

It features a **"Minority Report" style gesture interface**, **real-time student engagement tracking** (using privacy-first facial analysis), and a **serverless P2P sync engine** that keeps an entire classroom connected without a backend database.

![Project Vibe](https://via.placeholder.com/800x400?text=Neon+Nebula+UI+Preview)

---

## 📚 Table of Contents
1. [Key Features & Technical Deep Dive](#-key-features--technical-deep-dive)
2. [User Manual: How to Use](#-user-manual-how-to-use)
    - [Teacher Workflow](#teacher-workflow)
    - [Student Workflow](#student-workflow)
    - [Gesture Cheat Sheet](#-gesture-cheat-sheet)
    - [Voice Command Cheat Sheet](#-voice-command-cheat-sheet)
3. [Architecture & Technology](#-architecture--technology)
4. [Privacy & Accessibility](#-privacy--accessibility)

---

## 🌟 Key Features & Technical Deep Dive

### 1. 🧠 Multimodal AI Analysis (Gemini 3 Pro)
We leverage the **Gemini 3 Pro (`gemini-3-pro-preview`)** model via the Google GenAI SDK to perform complex reasoning on visual inputs.

*   **Region of Interest (ROI) Analysis:**
    *   **The Problem:** Standard OCR often fails on dense textbook pages or cluttered whiteboards.
    *   **Our Solution:** Users can pinch-to-zoom and highlight a specific area. We use an offscreen HTML5 Canvas to crop this region, re-encode it as a high-fidelity Base64 string, and send it as the *primary* context to Gemini, ensuring the explanation focuses exactly on what the user wants.
*   **Persona Engine:** 
    *   We use advanced System Instructions to modulate the AI's tone. For example, the `Einstein` persona uses physics analogies ("Imagine a light beam..."), while `Cyber AI` uses futuristic computing metaphors.
*   **Grounding:**
    *   All generated facts are cross-referenced using the `googleSearch` tool. The app parses the returned `groundingMetadata` to display clickable "Verified Source" chips.

### 2. ✋ "Minority Report" Gesture Interface
We replace traditional inputs with a touch-free interface using **MediaPipe Tasks Vision**.

*   **Hold-to-Trigger Logic:** To prevent accidental misfires, actions require a "Hold" mechanic. The user must hold a gesture for **1 second**. A visual progress bar fills up on screen, and the API call is dispatched only upon completion.
*   **Virtual Cursor:** We track the index finger tip (`landmark[8]`) and map its coordinates to the viewport. A custom React component renders a glowing cursor that follows the hand, allowing for remote interaction.

### 3. 👀 Live Engagement Tracking (Privacy-First)
Teachers often struggle to gauge student attention in remote/hybrid settings. We solve this with local computer vision.

*   **Local Inference:** The **MediaPipe Face Landmarker** runs entirely on the student's device (Client-Side). **No video data is ever sent to the server.**
*   **Heuristic Analysis:** We analyze 52 face blendshapes to calculate an engagement state:
    *   **Confused:** High `browDownLeft` + `browDownRight` (Furrowed brows).
    *   **Bored/Drowsy:** High `eyeBlink` frequency or prolonged `eyeSquint`.
    *   **Distracted:** High `eyeLookOutLeft` / `eyeLookOutRight` scores (looking away from screen).
*   **Aggregated Vibe:** Only the resulting state (e.g., `"CONFUSED"`) is transmitted via P2P to the teacher's dashboard.

### 4. 🔗 Serverless P2P Classroom
We utilize **PeerJS** (WebRTC wrapper) to create a decentralized mesh network.

*   **State Synchronization:** When the teacher generates a new explanation or highlights an image, a `SYNC_STATE` payload (containing the Base64 image and text result) is broadcast to all connected peers. This ensures 0-latency synchronization without a heavy backend.

---

## 📖 User Manual: How to Use

### Teacher Workflow
1.  **Start a Class:**
    *   Click the **Classroom Icon** (top right).
    *   Share the generated **4-Character Code** with your students.
2.  **Input Content:**
    *   **Upload:** Click the "Upload" box to select a textbook image.
    *   **Live Capture:** Click "Camera" to snap a photo of a whiteboard.
3.  **Configure AI:**
    *   Select an **Action** (e.g., "Explain", "Quiz", "Socratic Method").
    *   Select a **Persona** (e.g., "Einstein").
4.  **Generate:**
    *   Click "Generate Content" (or use the Voice Command "Explain this").
    *   The result will instantly appear on your screen and all student screens.

### Student Workflow
1.  **Join a Class:**
    *   Select the "Student" role.
    *   Enter the **4-Character Code** provided by the teacher.
2.  **Participate:**
    *   Watch your screen update automatically as the teacher navigates.
    *   If you are confused, show a **Thumb Down** gesture to anonymously flag the teacher.

### ✋ Gesture Cheat Sheet
Open the "Gestures" panel to activate the camera.

| Gesture | Action | Description |
| :--- | :--- | :--- |
| **👍 Thumb Up** | `Summary` | Generates a concise summary of the content. |
| **✌️ Victory (Peace)** | `Quiz` | Generates a 3-question multiple choice quiz. |
| **✋ Open Palm** | `Explain` | Standard detailed explanation. |
| **🤟 I Love You** | `Examples` | Generates practice problems/examples. |
| **✊ Closed Fist** | `Scroll` | Hold fist and move hand up/down to scroll the page. |
| **🤏 Pinch** | `Select` | Pinch thumb & index to click/select a region. |

### 🎙️ Voice Command Cheat Sheet
Click "Voice" to activate the microphone. No wake word needed.

*   **"Explain this"** → Generates explanation.
*   **"Quiz me"** → Generates a quiz.
*   **"Create flashcards"** → Generates study cards.
*   **"Read this"** → Uses Text-to-Speech to read the result.
*   **"Dyslexia mode"** → Toggles OpenDyslexic-style font.
*   **"High contrast"** → Toggles high-contrast accessibility mode.
*   **"Scroll down"** / **"Scroll up"** → Navigates the page.

---

## 🏗️ Architecture & Technology

### Frontend
*   **React 19:** Utilizes the latest hooks (`useTransition`, `useOptimistic`) for smooth UI updates.
*   **Tailwind CSS:** Custom "Neon Nebula" configuration with complex keyframe animations (`animate-float`, `animate-neon-pulse`).

### AI & Vision
*   **Google GenAI SDK:** Direct interface to `gemini-3-pro-preview`.
*   **MediaPipe Tasks Vision:** WASM-based implementation for `GestureRecognizer` and `FaceLandmarker`.

### Networking
*   **PeerJS:** Handles ICE candidates and SDP negotiation for WebRTC data channels.
*   **Protocol:** Custom JSON-based protocol for identifying message types (`ENGAGEMENT_UPDATE`, `SYNC_STATE`).

---

## 🔒 Privacy & Accessibility

### Privacy by Design
*   **No Face Data Storage:** Facial landmarks are processed in ephemeral memory (RAM) within the browser. The video feed is never recorded or transmitted.
*   **Ephemeral Rooms:** P2P classrooms are destroyed as soon as the teacher closes the tab. No history is saved.

### Inclusive Education
*   **Dyslexia Support:** Integrated **Lexend** font family, proven to reduce reading errors.
*   **Color Blindness:** Real-time SVG matrix filters for Protanopia, Deuteranopia, and Tritanopia.
*   **Reading Ruler:** A focus guide overlay to help students with ADHD maintain reading position.

---

*Built with ❤️ for the Google Vibe Coding Hackathon 2025.*
