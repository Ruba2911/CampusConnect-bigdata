from pyspark.sql import SparkSession
import pandas as pd

# CREATE SPARK SESSION
spark = SparkSession.builder \
    .appName("CampusConnectAnalytics") \
    .getOrCreate()

# -----------------------------
# READ USERS CSV
# -----------------------------
df = spark.read.csv(
    "analytics-data/users.csv",
    header=True,
    inferSchema=True
)

# -----------------------------
# SHOW ALL USERS
# -----------------------------
print("\n===== ALL USERS =====")
df.show()

# -----------------------------
# ROLE ANALYSIS
# -----------------------------
role_count = df.groupBy("ROLE").count()

print("\n===== ROLE ANALYSIS =====")
role_count.show()

# -----------------------------
# DEPARTMENT ANALYSIS
# -----------------------------
dept_count = df.groupBy("DEPARTMENT").count()

print("\n===== DEPARTMENT ANALYSIS =====")
dept_count.show()

# -----------------------------
# SAVE ROLE JSON
# -----------------------------
role_count.toPandas().to_json(
    "analytics-output/role_analysis.json",
    orient="records"
)

# -----------------------------
# SAVE DEPARTMENT JSON
# -----------------------------
dept_count.toPandas().to_json(
    "analytics-output/department_analysis.json",
    orient="records"
)

print("\n===== SPARK ANALYTICS COMPLETED =====")

# STOP SPARK SESSION
spark.stop()