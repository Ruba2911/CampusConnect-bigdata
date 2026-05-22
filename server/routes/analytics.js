import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { createObjectCsvWriter } from "csv-writer";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function analyticsRoutes(users) {

  // EXPORT USERS CSV
  router.get("/export-users", async (req, res) => {

    try {

      const allUsers = await users.find({}).toArray();

      const csvWriter = createObjectCsvWriter({

        path: path.join(
          __dirname,
          "../analytics/analytics-data/users.csv"
        ),

        header: [
          { id: "name", title: "NAME" },
          { id: "email", title: "EMAIL" },
          { id: "role", title: "ROLE" },
          { id: "department", title: "DEPARTMENT" },
        ],

      });

      await csvWriter.writeRecords(allUsers);

      res.json({
        success: true,
        message: "Users CSV exported successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        error: error.message,
      });

    }

  });

  // RUN SPARK ANALYTICS
  router.get("/spark-dashboard", async (req, res) => {

    exec(
      "python server/analytics/analytics.py",

      async (error, stdout, stderr) => {

        if (error) {

          console.log(stderr);

          return res.status(500).json({
            success: false,
            error: stderr || error.message,
          });

        }

        try {

          const roleData = JSON.parse(
            fs.readFileSync(
              path.join(
                __dirname,
                "../analytics/analytics-output/role_analysis.json"
              ),
              "utf-8"
            )
          );

          const departmentData = JSON.parse(
            fs.readFileSync(
              path.join(
                __dirname,
                "../analytics/analytics-output/department_analysis.json"
              ),
              "utf-8"
            )
          );

          res.json({
            success: true,
            roleAnalysis: roleData,
            departmentAnalysis: departmentData,
          });

        } catch (err) {

          console.log(err);

          res.status(500).json({
            success: false,
            error: err.message,
          });

        }

      }

    );

  });

  return router;

}