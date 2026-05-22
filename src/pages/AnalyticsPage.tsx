import { useEffect, useState } from "react";

import { AnalyticsCards } from "@/components/AnalyticsCards";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AnalyticsPage = () => {

  const [sparkData, setSparkData] = useState<any>(null);

  useEffect(() => {

    fetch("http://localhost:4000/api/spark/spark-dashboard")
      .then((res) => res.json())
      .then((data) => {

        console.log("Spark Data:", data);

        setSparkData(data);

      })
      .catch((err) => console.log(err));

  }, []);

  return (

    <div className="max-w-5xl mx-auto">

      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
        Analytics Dashboard
      </h1>

      {/* Existing Dashboard */}
      <AnalyticsCards />

      {/* Spark Analytics Section */}
      <div className="bg-[#0b1120] p-6 rounded-2xl mt-8 border border-gray-800">

        <h2 className="text-2xl font-bold text-green-400 mb-6">
          Apache Spark Big Data Analytics
        </h2>

        <div className="w-full h-[300px]">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              data={sparkData?.roleAnalysis || []}
            >

              <XAxis dataKey="ROLE" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#22c55e"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Department Analysis */}
      <div className="bg-[#0b1120] p-6 rounded-2xl mt-8 border border-gray-800">

        <h2 className="text-2xl font-bold text-blue-400 mb-6">
          Department Analysis
        </h2>

        <div className="w-full h-[300px]">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              data={sparkData?.departmentAnalysis || []}
            >

              <XAxis dataKey="DEPARTMENT" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#3b82f6"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );

};

export default AnalyticsPage;