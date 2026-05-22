import { useEffect, useState } from "react";
import { BarChart3, Building2, Eye, Heart, MessageCircle, Save, Users, UserCheck } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getApiUrl } from "@/lib/api";

const CHART_COLORS = ["hsl(217, 91%, 53%)", "hsl(199, 89%, 42%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

type Summary = {
  posts: number;
  registrations: number;
  views: number;
  likes: number;
  saves: number;
  comments: number;
};

type AdminAnalytics = {
  dashboard: {
    totalStudents: number;
    activeStudents: number;
    totalClubs: number;
    totalDaOfficers: number;
    totalPosts: number;
    totalRegistrations: number;
    totalViews: number;
    totalLikes: number;
    totalSaves: number;
    totalComments: number;
    clubPosts: number;
    clubRegistrations: number;
    daPosts: number;
    daRegistrations: number;
  };
  students: {
    total: number;
    active: number;
    applied: number;
    likes: number;
    registrations: number;
  };
  clubs: Array<Summary & { name: string; email: string; owner: string }>;
  da: Array<Summary & { name: string; email: string; department: string }>;
};

type AdminAnalyticsViewProps = {
  mode: "dashboard" | "students" | "clubs" | "da";
};

const tooltipStyle = {
  background: "hsl(217, 33%, 10%)",
  border: "1px solid hsl(217, 33%, 20%)",
  borderRadius: "12px",
  color: "hsl(210, 40%, 98%)",
};

export function AdminAnalyticsView({ mode }: AdminAnalyticsViewProps) {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(getApiUrl("/api/admin/analytics"));
        if (!response.ok) throw new Error("Failed to load admin analytics");
        setData(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load admin analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) return <div className="glass rounded-xl p-6 text-muted-foreground">Loading analytics...</div>;
  if (error || !data) return <div className="glass rounded-xl p-6 text-destructive">{error || "Unable to load analytics."}</div>;

  if (mode === "students") {
    const inactive = Math.max(data.students.total - data.students.active, 0);
    return (
      <AdminPage title="Student Analytics" subtitle="Student activity, applications, and engagement from MongoDB.">
        <MetricGrid
          metrics={[
            { label: "Total Students", value: data.students.total, icon: Users },
            { label: "Active Students", value: data.students.active, icon: UserCheck },
            { label: "Applied / Registered", value: data.students.applied, icon: BarChart3 },
            { label: "Total Likes", value: data.students.likes, icon: Heart },
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <ChartCard title="Student Activity">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Active", value: data.students.active },
                    { name: "Inactive", value: inactive },
                  ]}
                  innerRadius={68}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {[data.students.active, inactive].map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <Legend items={[{ label: "Active", value: data.students.active, color: CHART_COLORS[0] }, { label: "Inactive", value: inactive, color: CHART_COLORS[1] }]} />
          </ChartCard>
          <ChartCard title="Student Engagement">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { name: "Applied", value: data.students.applied },
                { name: "Registrations", value: data.students.registrations },
                { name: "Likes", value: data.students.likes },
              ]}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[0, 1, 2].map((i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </AdminPage>
    );
  }

  if (mode === "clubs") {
    return (
      <AdminPage title="Club Analytics" subtitle="Club-wise posts, registrations, and engagement.">
        <EntityVisualAnalytics rows={data.clubs} emptyText="No club data available yet." kind="club" />
      </AdminPage>
    );
  }

  if (mode === "da") {
    return (
      <AdminPage title="DA Analytics" subtitle="DA-wise placement and internship performance.">
        <EntityVisualAnalytics rows={data.da} emptyText="No DA data available yet." kind="da" />
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Dashboard" subtitle="Combined analytics across students, clubs, DA, posts, and registrations.">
      <MetricGrid
        metrics={[
          { label: "Students", value: data.dashboard.totalStudents, icon: Users },
          { label: "Active Students", value: data.dashboard.activeStudents, icon: UserCheck },
          { label: "Clubs", value: data.dashboard.totalClubs, icon: Building2 },
          { label: "DA Officers", value: data.dashboard.totalDaOfficers, icon: BarChart3 },
          { label: "Total Posts", value: data.dashboard.totalPosts, icon: BarChart3 },
          { label: "Registrations", value: data.dashboard.totalRegistrations, icon: UserCheck },
          { label: "Views", value: data.dashboard.totalViews, icon: Eye },
          { label: "Likes", value: data.dashboard.totalLikes, icon: Heart },
          { label: "Saves", value: data.dashboard.totalSaves, icon: Save },
          { label: "Comments", value: data.dashboard.totalComments, icon: MessageCircle },
          { label: "Club Posts", value: data.dashboard.clubPosts, icon: Building2 },
          { label: "DA Posts", value: data.dashboard.daPosts, icon: BarChart3 },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Club Summary" posts={data.dashboard.clubPosts} registrations={data.dashboard.clubRegistrations} />
        <Breakdown title="DA Summary" posts={data.dashboard.daPosts} registrations={data.dashboard.daRegistrations} />
      </div>
    </AdminPage>
  );
}

const AdminPage = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <div className="mx-auto max-w-6xl space-y-6">
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </div>
);

const MetricGrid = ({ metrics }: { metrics: Array<{ label: string; value: number; icon: React.ComponentType<{ className?: string }> }> }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {metrics.map((metric) => (
      <div key={metric.label} className="glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between">
          <metric.icon className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Live</span>
        </div>
        <p className="mt-4 font-heading text-3xl font-bold text-foreground">{metric.value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{metric.label}</p>
      </div>
    ))}
  </div>
);

const EntityVisualAnalytics = <T extends Summary & { name: string }>({ rows, emptyText, kind }: { rows: T[]; emptyText: string; kind: "club" | "da" }) => {
  if (!rows.length) {
    return <div className="glass rounded-xl border border-border/60 px-4 py-10 text-center text-muted-foreground">{emptyText}</div>;
  }

  const topRows = rows.slice(0, 8);
  const totals = rows.reduce(
    (acc, row) => ({
      posts: acc.posts + row.posts,
      registrations: acc.registrations + row.registrations,
      views: acc.views + row.views,
      likes: acc.likes + row.likes,
      saves: acc.saves + row.saves,
      comments: acc.comments + row.comments,
    }),
    { posts: 0, registrations: 0, views: 0, likes: 0, saves: 0, comments: 0 }
  );
  const leader = [...rows].sort((a, b) => b.registrations - a.registrations || b.posts - a.posts)[0];

  return (
    <div className="space-y-5">
      <MetricGrid
        metrics={[
          { label: kind === "club" ? "Total Clubs" : "DA Officers", value: rows.length, icon: kind === "club" ? Building2 : Users },
          { label: "Posts", value: totals.posts, icon: BarChart3 },
          { label: "Registrations", value: totals.registrations, icon: UserCheck },
          { label: "Likes", value: totals.likes, icon: Heart },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title={kind === "club" ? "Club Performance" : "DA Performance"}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topRows} margin={{ left: 8, right: 12, top: 8, bottom: 36 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="posts" name="Posts" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="registrations" name="Registrations" fill={CHART_COLORS[2]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="space-y-5">
          <ChartCard title="Engagement Mix">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Views", value: totals.views },
                    { name: "Likes", value: totals.likes },
                    { name: "Saves", value: totals.saves },
                    { name: "Comments", value: totals.comments },
                  ]}
                  innerRadius={50}
                  outerRadius={82}
                  dataKey="value"
                  stroke="none"
                >
                  {[0, 1, 2, 3].map((i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <Legend
              items={[
                { label: "Views", value: totals.views, color: CHART_COLORS[0] },
                { label: "Likes", value: totals.likes, color: CHART_COLORS[1] },
                { label: "Saves", value: totals.saves, color: CHART_COLORS[2] },
                { label: "Comments", value: totals.comments, color: CHART_COLORS[3] },
              ]}
            />
          </ChartCard>

          <div className="glass rounded-xl border border-border/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top performer</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">{leader.name}</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniStat label="Posts" value={leader.posts} />
              <MiniStat label="Regs" value={leader.registrations} />
              <MiniStat label="Likes" value={leader.likes} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {topRows.map((row, index) => (
          <RankCard key={row.name} row={row} rank={index + 1} />
        ))}
      </div>
    </div>
  );
};

const RankCard = ({ row, rank }: { row: Summary & { name: string }; rank: number }) => {
  const maxValue = Math.max(row.posts, row.registrations, row.likes, row.saves, row.comments, 1);
  return (
    <div className="glass rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">#{rank}</p>
          <h3 className="line-clamp-1 font-heading text-lg font-bold text-foreground">{row.name}</h3>
        </div>
        <div className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">{row.registrations} regs</div>
      </div>
      <div className="mt-4 space-y-2">
        <ProgressLine label="Posts" value={row.posts} max={maxValue} color={CHART_COLORS[0]} />
        <ProgressLine label="Likes" value={row.likes} max={maxValue} color={CHART_COLORS[1]} />
        <ProgressLine label="Saves" value={row.saves} max={maxValue} color={CHART_COLORS[2]} />
        <ProgressLine label="Cmds" value={row.comments} max={maxValue} color={CHART_COLORS[3]} />
      </div>
    </div>
  );
};

const ProgressLine = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div className="grid grid-cols-[64px_1fr_44px] items-center gap-3 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <div className="h-2 overflow-hidden rounded-full bg-accent">
      <div className="h-full rounded-full" style={{ width: `${Math.max((value / max) * 100, value ? 8 : 0)}%`, backgroundColor: color }} />
    </div>
    <span className="text-right font-semibold text-foreground">{value}</span>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass rounded-xl border border-border/60 p-5">
    <h2 className="mb-4 font-heading text-lg font-bold text-foreground">{title}</h2>
    {children}
  </div>
);

const Legend = ({ items }: { items: Array<{ label: string; value: number; color: string }> }) => (
  <div className="grid grid-cols-2 gap-2">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="text-muted-foreground">{item.label}</span>
        <span className="ml-auto font-semibold text-foreground">{item.value.toLocaleString()}</span>
      </div>
    ))}
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg bg-accent/50 p-3">
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const Breakdown = ({ title, posts, registrations }: { title: string; posts: number; registrations: number }) => (
  <div className="glass rounded-xl border border-border/60 p-5">
    <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-2xl font-bold text-foreground">{posts}</p>
        <p className="text-xs text-muted-foreground">Posts</p>
      </div>
      <div className="rounded-lg bg-accent/50 p-4">
        <p className="text-2xl font-bold text-foreground">{registrations}</p>
        <p className="text-xs text-muted-foreground">Registrations</p>
      </div>
    </div>
  </div>
);
