from pyspark.sql import SparkSession
import pandas as pd

# CREATE SPARK SESSION

spark = SparkSession.builder.appName("CampusConnectAnalytics").getOrCreate()

# READ USERS CSV

df = spark.read.csv(
"server/analytics/analytics-data/users.csv",
header=True,
inferSchema=True
)

print("ALL USERS")
df.show()

# ROLE ANALYSIS

role_count = df.groupBy("ROLE").count()

print("ROLE ANALYSIS")
role_count.show()

# DEPARTMENT ANALYSIS

dept_count = df.groupBy("DEPARTMENT").count()

print("DEPARTMENT ANALYSIS")
dept_count.show()

# SAVE ROLE JSON

role_count.toPandas().to_json(
"server/analytics/analytics-output/role_analysis.json",
orient="records"
)

# SAVE DEPARTMENT JSON

dept_count.toPandas().to_json(
"server/analytics/analytics-output/department_analysis.json",
orient="records"
)

print("SPARK ANALYTICS COMPLETED")
