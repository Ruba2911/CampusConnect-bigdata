import streamlit as st
import pandas as pd
import json

# PAGE TITLE
st.title("Apache Spark Big Data Dashboard")

# LOAD ROLE ANALYSIS
with open(
    "server/analytics/analytics-output/role_analysis.json",
    "r"
) as file:

    role_data = json.load(file)

# LOAD DEPARTMENT ANALYSIS
with open(
    "server/analytics/analytics-output/department_analysis.json",
    "r"
) as file:

    department_data = json.load(file)

# CONVERT TO DATAFRAME
role_df = pd.DataFrame(role_data)
department_df = pd.DataFrame(department_data)

# SHOW TABLES
st.subheader("Role Analysis")
st.dataframe(role_df)

st.subheader("Department Analysis")
st.dataframe(department_df)

# BAR CHART
st.subheader("User Role Distribution")
st.bar_chart(role_df.set_index("ROLE"))

# DEPARTMENT CHART
st.subheader("Department Distribution")
st.bar_chart(department_df.set_index("DEPARTMENT"))