import analyticsRoutes from "./routes/analytics.js";
import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import { connectDb } from "./db.js";

const app = express();
const port = process.env.PORT || 4000;
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:8080,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: clientOrigins }));

// Important: keep this BEFORE routes.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const createErrorResponse = (res, status, message) => res.status(status).json({ success: false, message });
const postResponse = (post) => ({
  ...post,
  id: post._id?.toString?.() ?? post.id,
});
const postIdFilter = (postId) => ObjectId.isValid(postId) ? { _id: new ObjectId(postId) } : { id: postId };

async function main() {
  const db = await connectDb();
  const users = db.collection("users");
  const registrations = db.collection("registrations");
  const clubRegistrations = db.collection("clubregistrations");
  const posts = db.collection("posts");
  const drives = db.collection("drives");
  app.use("/api/spark", analyticsRoutes(users));

  await users.updateOne(
    { email: "admin@gmail.com" },
    {
      $setOnInsert: {
        email: "admin@gmail.com",
        password: "admin123",
        role: "super-admin",
        name: "Super Admin",
        phone: "0000000000",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "MongoDB server is connected." });
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) return createErrorResponse(res, 400, "Missing login credentials.");

      const user = await users.findOne({ email: email.toLowerCase() });
      if (!user) return createErrorResponse(res, 401, "No account found with this email.");
      if (user.password !== password) return createErrorResponse(res, 401, "Incorrect password.");
      if (user.role !== role) return createErrorResponse(res, 401, `This email is not registered as ${role.replace("-", " ")}.`);

      const safeUser = {
        email: user.email,
        role: user.role,
        name: user.name,
        rollNumber: user.rollNumber,
        clubName: user.clubName,
        department: user.department,
        phone: user.phone,
      };

      res.json({ success: true, message: "Logged in successfully.", user: safeUser });
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to process login.");
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, role, name, rollNumber, clubName, department, phone } = req.body;
      if (!email || !password || !role || !name) return createErrorResponse(res, 400, "Missing signup fields.");
      if (role === "super-admin") return createErrorResponse(res, 403, "Super Admin account cannot be created here.");

      const existing = await users.findOne({ email: email.toLowerCase() });
      if (existing) return createErrorResponse(res, 409, "An account already exists with this email.");

      const saved = {
        email: email.toLowerCase(),
        password,
        role,
        name,
        rollNumber,
        clubName,
        department,
        phone,
        createdAt: new Date(),
      };

      await users.insertOne(saved);
      const safeUser = {
        email: saved.email,
        role: saved.role,
        name: saved.name,
        rollNumber: saved.rollNumber,
        clubName: saved.clubName,
        department: saved.department,
        phone: saved.phone,
      };

      res.status(201).json({ success: true, message: "Account created successfully.", user: safeUser });
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to create account.");
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const { role, postedBy } = req.query;
      const filter = role === "da-officer"
        ? { category: { $in: ["placement", "internship", "announcement"] } }
        : role === "club-admin"
        ? { category: { $in: ["club-event", "workshop", "cultural", "announcement"] } }
        : {};
      if (postedBy) filter.postedBy = String(postedBy);
      const allPosts = await posts.find(filter).sort({ createdAt: -1 }).toArray();
      res.json(allPosts.map(postResponse));
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to load posts.");
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const { title, description, category, postedBy, postedByAvatar, deadline, tags, eligibility, image, authorRole } = req.body;
      if (!title || !description || !category || !postedBy) {
        return createErrorResponse(res, 400, "Missing required post fields.");
      }

      const clubCategories = ["club-event", "workshop", "cultural", "announcement"];
      const daCategories = ["placement", "internship", "announcement"];
      if (authorRole === "club-admin" && !clubCategories.includes(category)) {
        return createErrorResponse(res, 403, "Club admins can publish club events, workshops, cultural posts, and announcements only.");
      }
      if (authorRole === "da-officer" && !daCategories.includes(category)) {
        return createErrorResponse(res, 403, "DA officers can publish placements, internships, and announcements only.");
      }

      const post = {
        title,
        description,
        category,
        postedBy,
        postedByAvatar: postedByAvatar || postedBy.substring(0, 2).toUpperCase(),
        deadline: deadline || "",
        tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
        eligibility: eligibility || "All students",
        image: image || "",
        postedAt: "Just now",
        likes: 0,
        saves: 0,
        views: 0,
        registrations: 0,
        comments: 0,
        createdAt: new Date(),
      };

      const result = await posts.insertOne(post);
      const saved = await posts.findOne({ _id: result.insertedId });
      res.status(201).json(postResponse(saved));
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to create post.");
    }
  });

  app.get("/api/drives", async (req, res) => {
    try {
      const allDrives = await drives.find({}).sort({ createdAt: -1 }).toArray();
      res.json(allDrives);
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to load drives.");
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const { role, postedBy } = req.query;
      const postFilter = {};
      if (postedBy) postFilter.postedBy = String(postedBy);
      if (role === "da-officer") postFilter.category = { $in: ["placement", "internship", "announcement"] };
      if (role === "club-admin") postFilter.category = { $in: ["club-event", "workshop", "cultural", "announcement"] };

      const [allPosts, placementRegistrations, clubRegs] = await Promise.all([
        posts.find(postFilter).toArray(),
        registrations.find({}).toArray(),
        clubRegistrations.find({}).toArray(),
      ]);

      const postIds = new Set(allPosts.map((post) => post._id?.toString?.() ?? post.id).filter(Boolean));
      const isScopedAnalytics = Boolean(postedBy) || role === "club-admin" || role === "da-officer";
      const allRegistrations = [...placementRegistrations, ...clubRegs].filter((record) =>
        isScopedAnalytics ? postIds.has(record.postId) : true
      );

      const totalPosts = allPosts.length;
      const totalViews = allPosts.reduce((sum, post) => sum + Number(post.views || 0), 0);
      const totalLikes = allPosts.reduce((sum, post) => sum + Number(post.likes || 0), 0);
      const totalRegistrations = allRegistrations.length;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfToday);
        date.setDate(startOfToday.getDate() - (6 - index));
        return date;
      });

      const sameDay = (left, right) =>
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate();

      const engagementTrend = lastSevenDays.map((date) => {
        const dayPosts = allPosts.filter((post) => post.createdAt && sameDay(new Date(post.createdAt), date));
        const dayRegistrations = allRegistrations.filter((record) => record.registeredAt && sameDay(new Date(record.registeredAt), date));
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          views: dayPosts.reduce((sum, post) => sum + Number(post.views || 0), 0),
          likes: dayPosts.reduce((sum, post) => sum + Number(post.likes || 0), 0),
          registrations: dayRegistrations.length,
        };
      });

      const currentWeekPosts = allPosts.filter((post) => post.createdAt && new Date(post.createdAt) >= lastSevenDays[0]).length;
      const previousWeekStart = new Date(lastSevenDays[0]);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousWeekPosts = allPosts.filter((post) => {
        if (!post.createdAt) return false;
        const createdAt = new Date(post.createdAt);
        return createdAt >= previousWeekStart && createdAt < lastSevenDays[0];
      }).length;

      const weeklyGrowth = previousWeekPosts === 0
        ? currentWeekPosts > 0 ? 100 : 0
        : Math.round(((currentWeekPosts - previousWeekPosts) / previousWeekPosts) * 100);

      const categoryLabels = {
        "club-event": "Club Event",
        placement: "Placement",
        internship: "Internship",
        workshop: "Workshop",
        announcement: "Announcement",
        cultural: "Cultural",
      };

      const topCategories = Object.entries(
        allPosts.reduce((acc, post) => {
          const category = post.category || "Unknown";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name: categoryLabels[name] || name, value }));

      res.json({
        totalPosts,
        totalViews,
        totalLikes,
        totalRegistrations,
        weeklyGrowth,
        engagementTrend,
        topCategories,
      });
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to load analytics.");
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const [allUsers, allPosts, placementRegistrations, clubRegs] = await Promise.all([
        users.find({}, { projection: { password: 0 } }).toArray(),
        posts.find({}).sort({ createdAt: -1 }).toArray(),
        registrations.find({}).toArray(),
        clubRegistrations.find({}).toArray(),
      ]);

      const allRegistrations = [...placementRegistrations, ...clubRegs];
      const clubCategories = ["club-event", "workshop", "cultural", "announcement"];
      const daCategories = ["placement", "internship", "announcement"];
      const students = allUsers.filter((user) => user.role === "student");
      const clubAdmins = allUsers.filter((user) => user.role === "club-admin");
      const daOfficers = allUsers.filter((user) => user.role === "da-officer");
      const studentRolls = new Set(students.map((student) => student.rollNumber).filter(Boolean));
      const activeStudentRolls = new Set(allRegistrations.map((record) => record.rollNumber).filter(Boolean));

      const registrationsForPosts = (postList) => {
        const postIds = new Set(postList.map((post) => post._id?.toString?.() ?? post.id).filter(Boolean));
        return allRegistrations.filter((record) => postIds.has(record.postId));
      };

      const summarizePosts = (postList) => {
        const scopedRegistrations = registrationsForPosts(postList);
        return {
          posts: postList.length,
          registrations: scopedRegistrations.length,
          views: postList.reduce((sum, post) => sum + Number(post.views || 0), 0),
          likes: postList.reduce((sum, post) => sum + Number(post.likes || 0), 0),
          saves: postList.reduce((sum, post) => sum + Number(post.saves || 0), 0),
          comments: postList.reduce((sum, post) => sum + Number(post.comments || 0), 0),
        };
      };

      const clubPosts = allPosts.filter((post) => clubCategories.includes(post.category));
      const daPosts = allPosts.filter((post) => daCategories.includes(post.category));
      const total = summarizePosts(allPosts);
      const clubTotal = summarizePosts(clubPosts);
      const daTotal = summarizePosts(daPosts);

      const clubAnalytics = clubAdmins.map((club) => {
        const name = club.clubName || club.name;
        const postList = allPosts.filter((post) => post.postedBy === name);
        return {
          name,
          email: club.email,
          owner: club.name,
          ...summarizePosts(postList),
        };
      });

      const clubNames = new Set(clubAnalytics.map((club) => club.name));
      allPosts
        .filter((post) => clubCategories.includes(post.category) && !clubNames.has(post.postedBy))
        .forEach((post) => {
          const existing = clubAnalytics.find((club) => club.name === post.postedBy);
          if (existing) return;
          const postList = allPosts.filter((item) => item.postedBy === post.postedBy);
          clubAnalytics.push({ name: post.postedBy, email: "", owner: post.postedBy, ...summarizePosts(postList) });
        });

      const daAnalytics = daOfficers.map((officer) => {
        const postList = allPosts.filter((post) => post.postedBy === officer.name);
        return {
          name: officer.name,
          email: officer.email,
          department: officer.department || "DA",
          ...summarizePosts(postList),
        };
      });

      const daNames = new Set(daAnalytics.map((officer) => officer.name));
      allPosts
        .filter((post) => daCategories.includes(post.category) && !daNames.has(post.postedBy))
        .forEach((post) => {
          const existing = daAnalytics.find((officer) => officer.name === post.postedBy);
          if (existing) return;
          const postList = allPosts.filter((item) => item.postedBy === post.postedBy);
          daAnalytics.push({ name: post.postedBy, email: "", department: "DA", ...summarizePosts(postList) });
        });

      const studentApplied = allRegistrations.filter((record) => studentRolls.has(record.rollNumber)).length;
      const studentLiked = allPosts.reduce((sum, post) => sum + Number(post.likes || 0), 0);

      res.json({
        dashboard: {
          totalStudents: students.length,
          activeStudents: [...activeStudentRolls].filter((roll) => studentRolls.has(roll)).length,
          totalClubs: clubAnalytics.length,
          totalDaOfficers: daAnalytics.length,
          totalPosts: total.posts,
          totalRegistrations: total.registrations,
          totalViews: total.views,
          totalLikes: total.likes,
          totalSaves: total.saves,
          totalComments: total.comments,
          clubPosts: clubTotal.posts,
          clubRegistrations: clubTotal.registrations,
          daPosts: daTotal.posts,
          daRegistrations: daTotal.registrations,
        },
        students: {
          total: students.length,
          active: [...activeStudentRolls].filter((roll) => studentRolls.has(roll)).length,
          applied: studentApplied,
          likes: studentLiked,
          registrations: allRegistrations.length,
        },
        clubs: clubAnalytics.sort((a, b) => b.posts - a.posts),
        da: daAnalytics.sort((a, b) => b.posts - a.posts),
      });
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to load admin analytics.");
    }
  });

  app.get("/api/registrations", async (req, res) => {
    try {
      const [placementRegistrations, clubRegs] = await Promise.all([
        registrations.find({}).toArray(),
        clubRegistrations.find({}).toArray(),
      ]);
      // UI expects merged list
      res.json([...placementRegistrations, ...clubRegs]);
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to load registrations.");
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const record = req.body;
      const requiredFields = ["postId", "postTitle", "postCategory", "postedBy", "name", "rollNumber", "email"];
      for (const field of requiredFields) {
        if (!record[field]) return createErrorResponse(res, 400, `Missing ${field} in registration.`);
      }

      record.registeredAt = new Date();

      const clubCategories = ["club-event", "workshop", "cultural"];
      const isClubEvent = clubCategories.includes(record.postCategory);

      const collection = isClubEvent ? clubRegistrations : registrations;
      const result = await collection.insertOne(record);
      await posts.updateOne(postIdFilter(record.postId), { $inc: { registrations: 1 } });
      record._id = result.insertedId;
      res.status(201).json(record);
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to save registration.");
    }
  });

  app.delete("/api/registrations", async (req, res) => {
    try {
      const { postId, rollNumber } = req.body;
      if (!postId || !rollNumber) return createErrorResponse(res, 400, "postId and rollNumber are required.");

      await Promise.all([
        registrations.deleteOne({ postId, rollNumber }),
        clubRegistrations.deleteOne({ postId, rollNumber }),
        posts.updateOne(postIdFilter(postId), { $inc: { registrations: -1 } }),
      ]);

      res.json({ success: true, message: "Registration removed." });
    } catch (error) {
      console.error(error);
      createErrorResponse(res, 500, "Unable to remove registration.");
    }
  });

  // Body parser errors: return JSON, not HTML.
  app.use((err, req, res, next) => {
    if (err) {
      if (err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Poster image is too large. Please upload an image under 5 MB." });
      }
      const isJsonParseError = err instanceof SyntaxError || err.type === "entity.parse.failed";
      if (isJsonParseError) {
        return res.status(400).json({ success: false, message: "Invalid JSON body." });
      }
    }
    return next(err);
  });


  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || "mongodb://localhost:27017/campusconnect"}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

