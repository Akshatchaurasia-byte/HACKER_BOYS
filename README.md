# DevMatch — Hackathon Teammate Finder

A modern, responsive web application that helps hackathon participants find the perfect teammates based on complementary skills, shared interests, and experience compatibility.

## Live Demo

Open `index.html` directly in any modern browser — no server or build step required.

## Features

### Core MVP
- **User Profile Creation** — 4-step guided wizard with name, role, bio, skills (33+), interests (12 domains), experience level, availability, and links
- **Intelligent Matching** — Custom algorithm scoring users on:
  - Complementary skills (40% weight): What the other person has that you lack
  - Shared interests (35% weight): Common project domains
  - Experience compatibility (25% weight): Closeness in skill level
  - Seeking bonus: Extra score if they have skills you're looking for
- **Ranked Match Results** — Circular progress ring, score breakdown bars, and match percentage
- **Browse All Builders** — People page with full search + 4 filters + sort

### Advanced / Bonus
- **Swipe-style matching** (Tinder-like deck with drag support) on the Matches page
- **Global search bar** with live results across people/skills/interests
- **Connect modal** — simulates sending your profile to matched teammates
- **Skill scoring breakdown** — complementary, interest, and experience scores shown per match
- **Skill filters** with multiple dimensions (skill, experience, domain, availability)
- **Toast notifications** and smooth animations throughout

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES5+) |
| Styling | Custom CSS with CSS variables, glassmorphism, animations |
| Data | localStorage (no backend required) |
| Fonts | Google Fonts (Inter) |

## Project Structure

```
hackathon/
├── index.html        # Explore / Landing page
├── profile.html      # 4-step profile creation wizard
├── matches.html      # My Matches + Swipe deck
├── people.html       # Browse all builders
├── css/
│   └── style.css     # Complete design system
├── js/
│   ├── data.js       # Seed data, DB helpers, constants
│   ├── matcher.js    # Matching algorithm + UI card builder
│   ├── app.js        # Explore page logic
│   ├── profile.js    # Profile wizard logic
│   ├── matches.js    # Matches page logic
│   └── people.js     # People browse page logic
└── README.md
```

## Setup Instructions

1. **Download/clone** this project
2. **Open `index.html`** in Chrome, Edge, Firefox, or Safari
3. No npm install, no build step, no server needed

## Matching Algorithm

```
Score = (complementarySkills * 40%) + (sharedInterests * 35%) + (experienceCompat * 25%)

complementarySkills = skills the other user has that you don't / total unique skills
sharedInterests     = intersection(A.interests, B.interests) / union(A.interests, B.interests)
experienceCompat    = 100 if same level, 75 if 1 level apart, 40 if 2, 15 if 3+
```

An optional seeking bonus (+15%) is applied when a user specifies which skills they're looking for and the candidate has them.

## Data Persistence

All user profiles and connections are stored in the browser's `localStorage`. 12 seed users are pre-loaded on first visit. Your created profile persists across sessions.

## Evaluation Criteria Coverage

| Criterion | Implementation |
|---|---|
| Innovation | Swipe deck, skill complementarity algorithm, seeking bonus |
| System Design | Modular JS (data/matcher/pages), localStorage DB pattern |
| Code Quality | IIFE modules, clear separation of concerns |
| Completeness | All MVP + most bonus features |
| User Experience | Glassmorphism design, animations, responsive, mobile bottom nav |

## Edge Cases Handled

- Sparse data (< 3 users): Still renders matches with lower scores
- No matching skills: Algorithm falls back to interest + experience scores
- Duplicate profiles: Existing users are updated (not duplicated) on re-submit
- Incomplete profiles: Optional fields skipped gracefully

## Author

Built for the DevMatch Hackathon Challenge — completed within 24 hours.