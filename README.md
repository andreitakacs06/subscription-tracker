# 💳 Subtrack

> A modern subscription tracker for iOS and Android. Built with React Native + Expo, featuring a sleek dark theme, smooth animations, and insights into your spending.


## ✨ Highlights

<table>
<tr>
<td width="50%">

### 🎯 Smart Dashboard
- Monthly & yearly spending totals
- Active subscription count
- Upcoming renewals at a glance
- Category spending breakdown
- Custom made widgets

</td>
<td width="50%">

### 📊 Deep Insights
- 12-month spending trends
- Category breakdown with donut chart
- Most expensive subscriptions
- Spending history
- Yearly projections

</td>
</tr>
<tr>
<td width="50%">

### 🗓️ Calendar View
- Month grid with renewal highlights
- Heat map showing expensive days
- Tap any day to see renewals
- Smooth month navigation
- Visual spending intensity

</td>
<td width="50%">

### ⚙️ Full Control
- Dark mode toggle
- Multi-currency support (USD, EUR, GBP, RON, JPY, etc.)
- Push notifications for renewals
- Custom categories

</td>
</tr>
</table>

## 🚀 Core Features

| Feature | Description |
|---------|-------------|
| **Add Subscriptions** | Modal form with name, price, cycle, renewal date, category, color, icon, and notes |
| **Search & Filter** | Find subscriptions by name or notes; filter by category |
| **Edit & Delete** | Swipe-to-delete with quick actions; full edit screen for existing subscriptions |
| **Local Notifications** | Configurable reminders before renewal dates (0–7 days) |
| **Auto-Renewal** | Stale renewal dates automatically roll forward by one billing cycle |
| **Currency Conversion** | Change currency in settings; all prices auto-convert instantly |
| **Custom Categories** | Create unlimited categories with custom icons and colors |
| **Persistent Storage** | All data saved locally via AsyncStorage; survives app restarts |
| **Smooth Animations** | Powered by `react-native-reanimated` for premium feel |
| **TypeScript** | End-to-end type safety with strict mode |

---

## 🛠️ Tech Stack

```
Frontend Framework    React Native + Expo SDK 54
Language             TypeScript
State Management     Zustand
Persistence          AsyncStorage
Animations           react-native-reanimated
Charts               react-native-svg
Icons                @expo/vector-icons
Date Utilities       date-fns
Routing              Expo Router
Gestures             react-native-gesture-handler
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm (or pnpm/yarn)
- **Expo CLI** (installed on-the-fly via `npx`)
- **Expo Go** app on your phone (App Store or Google Play)

### Installation

```bash
# Clone the repo
git clone https://github.com/andreitakacs06/subscription-tracker
cd subscription-tracker

# Install dependencies
npm install
```

### Run Locally

```bash
# Start the Expo dev server
npx expo start

# From the Metro bundler menu:
# - Press 'i' for iOS simulator (macOS only)
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

### Test on Your Phone

1. Install **Expo Go** from your app store
2. Ensure your phone and computer are on the same Wi-Fi
3. Run `npx expo start`
4. Scan the QR code:
   - **iOS**: Use the system Camera app
   - **Android**: Use the QR scanner in Expo Go
5. The app opens with an empty state — tap **Add subscription** to get started

**Troubleshooting:** If you're on a corporate network or VPN, try tunnel mode:
```bash
npx expo start --tunnel
```

## 💾 Data & Storage

| Aspect | Details |
|--------|---------|
| **Storage** | All data persists locally via AsyncStorage (no cloud sync) |
| **Initial State** | App starts empty; users add subscriptions through the UI |
| **Reset** | Settings → Reset all data clears everything on the device |
| **Currency** | Per-user setting in Settings; each subscription stores its own currency code |
| **Sync** | Automatic sync to AsyncStorage after every mutation |
| **Backup** | No built-in backup; data is device-local only |

---

## 📱 Screens Overview

### 🏠 Dashboard
Your subscription hub at a glance. Shows monthly/yearly totals, active count, upcoming renewals, and a category breakdown donut chart.

### 📋 Subscriptions
Searchable, filterable list of all subscriptions. Swipe left to edit or delete. Tap to view details.

### 🗓️ Calendar
Month grid with heat-map coloring. Tap any day to see renewals scheduled for that date. Navigate months with arrow buttons.

### 📊 Statistics
Deep insights: yearly projection, 12-month spending trend, category breakdown, and most expensive subscriptions.

### ⚙️ Settings
- Dark mode toggle
- Currency selector (auto-converts all prices)
- Notification toggle + lead-time picker
- Manage custom categories
- Reset all data
- About section
---

## 📄 License

**GNU Affero General Public License v3.0 (AGPL-3.0)**

This project is licensed under the AGPL-3.0, which means:

✅ **You can:**
- Use this app for personal purposes
- Modify the code for your own needs
- Run it privately on your devices
- Learn from and study the codebase

❌ **You cannot:**
- Publish or distribute this app commercially without sharing your modifications
- Use this code in a commercial product without making your changes publicly available
- Remove or modify the original author attribution

For more details, see the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

## 🤝 Contributing

Found a bug or have a feature idea? Open an issue or submit a pull request!

---
**© 2026 Andrei Takacs. All rights reserved.**

---
