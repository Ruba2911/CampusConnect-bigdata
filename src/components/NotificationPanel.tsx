import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import type { Post } from "@/data/mockData";

const fallbackNotifications = [
  { id: 1, type: "deadline", title: "Evoke Cultural Night Auditions", message: "Deadline in 2 days!", time: "1h ago", icon: AlertTriangle, color: "text-warning" },
  { id: 2, type: "success", title: "TCS Digital Hiring", message: "Your application was received", time: "3h ago", icon: CheckCircle, color: "text-success" },
  { id: 3, type: "deadline", title: "iQube Startup Bootcamp", message: "Deadline tomorrow!", time: "5h ago", icon: AlertTriangle, color: "text-destructive" },
  { id: 4, type: "info", title: "Re Sustainability Hackathon", message: "New team formation update", time: "1d ago", icon: Bell, color: "text-secondary" },
  { id: 5, type: "deadline", title: "Garage Robotics Buildathon", message: "Registration closing in 3 days", time: "1d ago", icon: Clock, color: "text-warning" },
];

export function NotificationPanel() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(getApiUrl("/api/posts"));
        if (!response.ok) return;
        setPosts(await response.json());
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    fetchPosts();
  }, []);

  const notifications = posts.length > 0
    ? posts.slice(0, 8).map((post, index) => ({
        id: (post as any)._id ?? post.id ?? index,
        title: post.title,
        message: post.category === "placement" || post.category === "internship"
          ? "New placement update from DA"
          : `New ${post.category.replace("-", " ")} update`,
        time: post.postedAt || "Just now",
        icon: post.category === "placement" || post.category === "internship" ? CheckCircle : Bell,
        color: post.category === "announcement" ? "text-destructive" : post.category === "workshop" ? "text-warning" : "text-secondary",
      }))
    : fallbackNotifications;

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-bold text-foreground">Notifications</h2>
      <div className="space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass glass-hover flex items-start gap-3 rounded-xl p-4 cursor-pointer"
          >
            <n.icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${n.color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </div>
            <span className="flex-shrink-0 text-xs text-muted-foreground">{n.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
