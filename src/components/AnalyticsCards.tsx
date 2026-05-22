import { TrendingUp, Eye, Heart, UserCheck, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRole } from "@/contexts/RoleContext";

type AnalyticsResponse = {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalRegistrations: number;
  weeklyGrowth: number;
  engagementTrend: { day: string; views: number; likes: number; registrations: number }[];
  topCategories: { name: string; value: number }[];
};

const CHART_COLORS = [
  "hsl(217, 91%, 53%)",
  "hsl(199, 89%, 42%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
];

export function AnalyticsCards() {
  const { role, userName, userProfile } = useRole();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const postedBy = role === "club-admin" ? userProfile?.clubName || userName : role === "da-officer" ? userName : "";
        const params = new URLSearchParams();
        params.set("role", role);
        if (postedBy) params.set("postedBy", postedBy);
        const response = await fetch(getApiUrl(`/api/analytics?${params.toString()}`));
        if (!response.ok) throw new Error("Failed to load analytics");
        const json = (await response.json()) as AnalyticsResponse;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [role, userName, userProfile]);

  const stats = [
    { label: "Total Posts", value: data?.totalPosts ?? 0, icon: FileText, color: "text-primary" },
    {
      label: "Total Views",
      value: (data?.totalViews ?? 0).toLocaleString(),
      icon: Eye,
      color: "text-secondary",
    },
    {
      label: "Registrations",
      value: (data?.totalRegistrations ?? 0).toLocaleString(),
      icon: UserCheck,
      color: "text-success",
    },
    {
      label: "Total Likes",
      value: (data?.totalLikes ?? 0).toLocaleString(),
      icon: Heart,
      color: "text-destructive",
    },
  ];

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground">Loading analytics...</div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass rounded-2xl p-6 text-destructive">
        {error ? `Unable to load analytics: ${error}` : "Unable to load analytics."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass glass-hover rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" /> {data.weeklyGrowth >= 0 ? "+" : ""}{data.weeklyGrowth}%
              </span>
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Weekly Engagement</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.engagementTrend}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(217, 33%, 10%)",
                  border: "1px solid hsl(217, 33%, 20%)",
                  borderRadius: "12px",
                  color: "hsl(210, 40%, 98%)",
                }}
              />
              <Bar dataKey="views" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="likes" fill="hsl(199, 89%, 42%)" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="registrations"
                fill="hsl(142, 71%, 45%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Post Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={data.topCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {data.topCategories.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {data.topCategories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="ml-auto font-medium text-foreground">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
