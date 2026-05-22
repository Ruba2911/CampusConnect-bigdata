# CampusConnect Big Data Analytics Platform

A full-stack MERN-based campus management and analytics platform integrated with Apache Spark and Streamlit for real-time student and placement analytics.

---

# 🚀 Features

- 👨‍🎓 Student & Admin Dashboard
- 📢 Event and Placement Notifications
- 📝 Post Creation & Feed System
- 📊 Analytics Dashboard using Streamlit
- ⚡ Apache Spark Integration for Big Data Processing
- 📈 Department-wise & Role-wise Analysis
- 🔐 Authentication & Role Management
- 🎨 Modern UI with Tailwind CSS + ShadCN UI

---

# 🛠️ Tech Stack

## Frontend
- React.js
- TypeScript
- Tailwind CSS
- ShadCN UI
- Vite

## Backend
- Node.js
- Express.js
- MongoDB

## Big Data & Analytics
- Apache Spark
- Python
- Streamlit
- Pandas

---

# 🏗️ System Architecture

```text
                           ┌────────────────────┐
                           │      Users         │
                           │ Students / Admins  │
                           └─────────┬──────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │        React Frontend          │
                    │  (Vite + Tailwind + TS)        │
                    └────────────────┬───────────────┘
                                     │ API Requests
                                     ▼
                    ┌────────────────────────────────┐
                    │       Node.js + Express        │
                    │         Backend Server         │
                    └────────────────┬───────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
        ┌──────────────────────┐       ┌─────────────────────────┐
        │      MongoDB         │       │   Apache Spark Engine   │
        │ User & App Data      │       │ Big Data Processing     │
        └──────────────────────┘       └─────────────┬───────────┘
                                                      │
                                                      ▼
                                   ┌────────────────────────────┐
                                   │ Streamlit Analytics Panel  │
                                   │  Graphs & Visual Insights  │
                                   └────────────────────────────┘
```

---

# 📂 Project Structure

```bash
CampusConnect-bigdata/
│
├── public/                     # Static assets
│
├── server/
│   ├── analytics/
│   │   ├── analytics-data/     # CSV datasets
│   │   ├── analytics-output/   # Generated analytics results
│   │   ├── analytics.py        # Spark analytics processing
│   │   └── dashboard.py        # Streamlit dashboard
│   │
│   ├── routes/
│   ├── db.js
│   └── index.js
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   ├── hooks/
│   └── lib/
│
├── package.json
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Ruba2911/CampusConnect-bigdata.git
cd CampusConnect-bigdata
```

---

# 📦 Install Dependencies

## Frontend

```bash
npm install
```

## Backend

```bash
cd server
npm install
```

## Python Dependencies

```bash
pip install pyspark streamlit pandas
```

---

# 🔥 Running the Project

## Start Frontend

```bash
npm run dev
```

---

## Start Backend

```bash
cd server
node index.js
```

---

## Start Streamlit Dashboard

```bash
streamlit run server/analytics/dashboard.py
```

---

# 📊 Big Data Analytics

The project uses Apache Spark to process and analyze student engagement and placement-related datasets.

## Analytics Included

- Department-wise student analysis
- Role distribution analysis
- User activity insights
- Placement analytics visualization

Generated results are stored in:

```bash
server/analytics/analytics-output/
```

---

# 🧠 Spark Workflow

1. Load CSV dataset
2. Process data using PySpark
3. Generate analytics reports
4. Store JSON outputs
5. Visualize using Streamlit

---

# 🎯 Future Enhancements

- Real-time analytics
- AI-based placement prediction
- Attendance analytics
- Recommendation system
- Cloud deployment using AWS/GCP

---

# 👩‍💻 Contributors

- Sweda Keerthana
- Ruba2911

---

# 📸 Screenshots

Add project screenshots here.

---

# 📄 License

This project is developed for educational and academic purposes.
