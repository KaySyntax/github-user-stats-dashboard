# 📊 GitHub Stats Dashboard

This is a lightweight, client-side React application that transforms standard GitHub profiles into beautiful, interactive data visualizations. By hooking directly into the public GitHub API and handling personal access tokens to bypass rate limits, this dashboard instantly generates charts for language usage, repository stars, and commit history. Built entirely on the frontend to showcase clean UI design and complex state management.

## 🚀 Tech Stack

*   **Framework:** React (scaffolded with Vite for lightning-fast HMR)
*   **Language:** TypeScript (strict type-checking for API payloads)
*   **Data Visualization:** Recharts (composable SVG charting library)
*   **Data Fetching:** Native JavaScript Fetch API 

## ✨ Key Features

*   **Interactive Visualizations:** Transforms raw JSON API data into dynamic bar, pie, and line charts.
*   **Rate-Limit Bypass:** Configured to accept GitHub Personal Access Tokens (PAT) via environment variables, bumping the API limit from 60 to 5,000 requests per hour.
*   **Dynamic Searching:** Enter any public GitHub handle to instantly fetch and render their developer footprint.

## 🛠️ Local Setup & Installation

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/KaySyntax/github-stats-dashboard.git
cd github-stats-dashboard
\`\`\`

**2. Install dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Configure your environment variables**
Create a new file named `.env.local` in the root directory and add your GitHub Personal Access Token:
\`\`\`env
VITE_GITHUB_TOKEN=ghp_your_personal_access_token_here
\`\`\`
*(Note: This file is included in `.gitignore` and will never be pushed to a public repository).*

**4. Start the development server**
\`\`\`bash
npm run dev
\`\`\`

## 👨‍💻 Author

**Nana Kofi Opoku-Temeng**
*Computer Engineering, KNUST*
Learning in public and building scalable systems for the web.