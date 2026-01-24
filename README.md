Role: You are an Expert Full-Stack Developer and UI/UX Designer specializing in HR-Tech.
Task: Design and provide the code architecture for a premium, highly creative ATS (Applicant Tracking System) Checker App.
Core Functionality:
• Dynamic Matching: The app must compare a user’s resume against a specific Job Description (JD).
• Scoring Engine: Generate a "Match Score" (0-100) using a weighted algorithm (Keywords, Formatting, Impact Verbs, and Experience Relevance).
• Deep Analysis: Provide a structured breakdown of "Strengths," "Critical Gaps," and "Actionable Optimization Tips."
Technical Constraints:
• Input Validation: The system must strictly only process .pdf and .tex (LaTeX) files.
• Frontend Logic: The file upload component must use an accept attribute restricted to .pdf, .tex. Include client-side validation to reject other formats with a custom error state.
• Processing: Describe how the LLM should parse the .tex file versus the .pdf to ensure no data loss.
UI/UX Requirements (The "Anti-Generic" Mandate):
• Visual Style: Avoid the "SaaS Blue" corporate look. Use a bold, modern aesthetic (e.g., Cyberpunk-minimalism, Glassmorphism, or a high-contrast Neo-brutalism).
• Creativity: Incorporate a unique "Scanning" animation or a real-time "Resume Pulse" that changes color based on the match score.
• Layout: Instead of a simple list, use an interactive dashboard with "Impact Heatmaps" or a "Skill Radar Chart."
Deliverables:
1. System Architecture: A brief overview of the tech stack (e.g., Next.js, FastAPI, LangChain).
2. Frontend Code: A React/Tailwind CSS component for the "Creative Upload Wizard."
3. Prompt Engineering Logic: The specific system prompt the app should use to evaluate the resume accurately.
