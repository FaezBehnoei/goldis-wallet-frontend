# 🪙 Goldis Goldflow – Online Molten Gold Trading Platform

A professional frontend application for molten gold trading, built with Vue 3 and Quasar Framework. This app was developed for a company project and allows users to purchase gold (in grams or local currency), view transaction history, request withdrawals, and securely authenticate via an external Identity Provider (IDP).

---

## 🔹 Features

- 🔐 SSO Authentication (via IDP → SP redirection)
- 📊 Transaction History with filtering and grouping
- 💰 Dual Purchase Modes: Rial-based or Gram-based
- 🧾 Withdrawal Requests with status tracking
- 🧑‍💼 Admin Dashboard for managing user transactions
- 🌐 Full RTL Support for Persian UI
- 🔢 Dynamic Persian number formatting in inputs
- 🕒 Jalali Date support (served from backend)

---

## 🧰 Tech Stack

| Layer        | Technology            |
|--------------|------------------------|
| Frontend     | Vue 3 + Quasar CLI     |
| State        | Pinia                  |
| HTTP Client  | Axios                  |
| Backend API  | FastAPI (by teammate)  |
| Styling      | SCSS, Custom Fonts     |
| Localization | Persian, RTL Layout    |

---

## 🚀 Setup & Run Locally

```bash
npm install
quasar dev
