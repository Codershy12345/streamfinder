# 🎬 StreamFinder

A modern movie recommendation and legal streaming aggregator web app built with Next.js and TypeScript. StreamFinder helps users discover where to stream movies legally, find ad-supported free options, explore cheap rental alternatives, and get regional/global genre recommendations.

🔗 **Live Demo:** [streamfinder-nu.vercel.app](https://streamfinder-nu.vercel.app)

---

## ✨ Features

* **Multi-Region Streaming Discovery:** Find legal streaming sources across India (IN), United States (US), and United Kingdom (GB).
* **Streaming Types Breakdown:**
  * **Free Legal Streams:** Highlights ad-supported official streams (AVOD).
  * **Subscription (SVOD):** Shows platforms like Netflix, Prime Video, JioCinema, Hotstar, etc., with telecom pack tips.
  * **Affordable Rent/Buy:** Shows cheap pay-per-view options (Google TV, Apple TV, Prime Rent) without requiring full subscriptions.
* **Smart YouTube Fallback:** Direct one-click search for legal full-movie uploads when direct streams are unavailable.
* **Global Free via VPN (Region Hopper):** Detects if a movie is available for free legally on platforms like Tubi or Pluto TV in the US/UK.
* **Dual Recommendation Engine:**
  * **Regional Hits:** Top movies in the same genre and original language.
  * **Worldwide Best:** All-time top-rated movies in the same genre globally.
* **Dual-Mode Search:** Instant autocomplete search by title or direct filtering by popular genre chips.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **API Integration:** [Watchmode API](https://api.watchmode.com/)
* **Deployment:** Vercel

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone [https://github.com/](https://github.com/)<your-username>/streamfinder.git
cd streamfinder
