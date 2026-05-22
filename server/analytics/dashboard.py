import streamlit as st
import pandas as pd
import json
import os

# PAGE CONFIG
st.set_page_config(
    page_title="Apache Spark Big Data Dashboard",
    layout="wide"
)

# TITLE
st.title("Apache Spark Big Data Dashboard")

# FILE PATHS
ROLE_FILE = "server/analytics/analytics-output/role_analysis.json"
DEPARTMENT_FILE = "server/analytics/analytics-output/department_analysis.json"

# -----------------------------
# LOAD ROLE ANALYSIS
# -----------------------------
if os.path.exists(ROLE_FILE):
    with open(ROLE_FILE, "r") as file:
        role_data = json.load(file)

    role_df = pd.DataFrame(role_data)

else:
    role_df = pd.DataFrame(columns=["ROLE", "count"])

# -----------------------------
# LOAD DEPARTMENT ANALYSIS
# -----------------------------
if os.path.exists(DEPARTMENT_FILE):
    with open(DEPARTMENT_FILE, "r") as file:
        department_data = json.load(file)

    department_df = pd.DataFrame(department_data)

else:
    department_df = pd.DataFrame(columns=["DEPARTMENT", "count"])

# -----------------------------
# CLEAN NULL VALUES
# -----------------------------
if not department_df.empty:
    department_df["DEPARTMENT"] = (
        department_df["DEPARTMENT"]
        .fillna("None")
        .replace("", "None")
    )

# -----------------------------
# DISPLAY TABLES
# -----------------------------
col1, col2 = st.columns(2)

with col1:
    st.subheader("Role Analysis")
    st.dataframe(role_df, use_container_width=True)

with col2:
    st.subheader("Department Analysis")
    st.dataframe(department_df, use_container_width=True)

# -----------------------------
# ROLE BAR CHART
# -----------------------------
st.subheader("User Role Distribution")

if not role_df.empty:
    role_chart = role_df.set_index("ROLE")
    st.bar_chart(role_chart)
else:
    st.warning("No role data available")

# -----------------------------
# DEPARTMENT BAR CHART
# -----------------------------
st.subheader("Department Distribution")

if not department_df.empty:
    dept_chart = department_df.set_index("DEPARTMENT")
    st.bar_chart(dept_chart)
else:
    st.warning("No department data available")

# -----------------------------
# METRICS SECTION
# -----------------------------
st.subheader("Dashboard Summary")

total_users = role_df["count"].sum() if not role_df.empty else 0
total_departments = (
    department_df["DEPARTMENT"].nunique()
    if not department_df.empty
    else 0
)

m1, m2 = st.columns(2)

with m1:
    st.metric("Total Users", total_users)

with m2:
    st.metric("Departments", total_departments)

# -----------------------------
# AUTO REFRESH BUTTON
# -----------------------------
if st.button("Refresh Dashboard"):
    st.rerun()