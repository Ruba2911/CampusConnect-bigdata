import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { driveStatusLabels, DriveStatus, Drive } from "@/data/drivesData";
import { getApiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRegistrations } from "@/contexts/RegistrationsContext";
import { useRole } from "@/contexts/RoleContext";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Layers,
  Tag,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/data/mockData";

const PlacementsPage = () => {
  const { role, userProfile } = useRole();
  const { registrations, register, unregister, isRegistered } = useRegistrations();
  const [status, setStatus] = useState<DriveStatus | "all">("ongoing");
  const [selected, setSelected] = useState<Drive | null>(null);

  const [drives, setDrives] = useState<Drive[]>([]);
  const [placementPosts, setPlacementPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        setIsLoading(true);
        const [drivesResponse, postsResponse] = await Promise.all([
          fetch(getApiUrl("/api/drives")),
          fetch(getApiUrl("/api/posts")),
        ]);
        if (!drivesResponse.ok) throw new Error("Failed to load drives");
        const data = (await drivesResponse.json()) as Drive[];
        setDrives(data);
        if (postsResponse.ok) {
          const postsData = (await postsResponse.json()) as Post[];
          setPlacementPosts(postsData.filter((post) => ["placement", "internship"].includes(post.category)));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrives();
  }, []);

  const filteredDrives = useMemo(() => {
    return status === "all" ? drives : drives.filter((d) => d.status === status);
  }, [status, drives]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: drives.length };
    drives.forEach((d) => {
      c[d.status] = (c[d.status] || 0) + 1;
    });
    return c;
  }, [drives]);

  const registrationCounts = useMemo(
    () =>
      registrations.reduce<Record<string, number>>((acc, r) => {
        if (r.postCategory === "placement") {
          acc[r.postId] = (acc[r.postId] || 0) + 1;
        }
        return acc;
      }, {}),
    [registrations]
  );

  const handleOptInToggle = async (drive: Drive) => {
    if (role !== "student") return;
    if (!userProfile) {
      toast({ title: "Student profile missing", description: "Unable to register without a student profile.", variant: "destructive" });
      return;
    }

    if (isRegistered(drive.id, userProfile.rollNumber)) {
      await unregister(drive.id, userProfile.rollNumber);
      toast({ title: "Opt-in removed", description: "Your placement opt-in has been undone." });
      return;
    }

    await register({
      postId: drive.id,
      postTitle: `${drive.company} — ${drive.role}`,
      postCategory: "placement",
      postedBy: drive.company,
      ...userProfile,
    });
    toast({ title: "Opted in successfully", description: "Your placement opt-in has been recorded." });
  };

  // ============ DETAIL VIEW ============
  if (selected) {
    const isOpted = role === "student" && userProfile ? isRegistered(selected.id, userProfile.rollNumber) : false;
    const registeredCount = registrationCounts[selected.id] || 0;
    const selectedRegistrations = registrations.filter(
      (r) => r.postId === selected.id && r.postCategory === "placement"
    );
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelected(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Drives
          </Button>
          {role === "student" ? (
            <Button
              onClick={() => handleOptInToggle(selected)}
              className={
                isOpted
                  ? "bg-destructive/10 text-destructive border border-destructive/40 hover:bg-destructive/20"
                  : "glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
              }
            >
              {isOpted ? (
                <>Undo Opt-In</>
              ) : (
                <>Opt-In</>
              )}
            </Button>
          ) : (
            <Button variant="outline" className="glass border-border/60" disabled>
              {registeredCount} student{registeredCount === 1 ? "" : "s"} opted
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left: Company card */}
          <div className="glass rounded-2xl overflow-hidden border border-border/60 self-start">
            <div className="relative p-5 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="flex items-start justify-between">
                <span className="rounded-md bg-warning/20 text-warning border border-warning/40 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  {role === "student"
                    ? isOpted
                      ? "Opted-In"
                      : "Not Opted"
                    : `${registeredCount} opted`}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${selected.logoColor} text-primary-foreground font-bold shadow-lg`}
                >
                  {selected.logoText}
                </div>
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold text-foreground">{selected.company}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.subtitle}</p>
            </div>

            <div className="p-5 space-y-5">
              <InfoRow icon={MapPin} label="LOCATION" value={selected.location} />
              <InfoRow icon={Briefcase} label="DRIVE TYPE" value={selected.driveType} />
              <InfoRow icon={Layers} label="DRIVE CATEGORY" value={selected.category} />
              <InfoRow icon={Tag} label="PLACEMENT CATEGORY" value={selected.placementCategory} />
            </div>

            <div className="bg-card/80 border-t border-border/60 px-5 py-3 flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">Apply Before</span>
              <span className="font-semibold text-foreground">{selected.applyDate}</span>
              <span className="text-secondary font-semibold">{selected.applyTime}</span>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <section className="glass rounded-2xl border border-border/60 p-6">
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">Drive Details</h3>

              <h4 className="font-semibold text-foreground mb-2">Description</h4>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Eligible Depts: <span className="text-foreground font-medium">{selected.eligibility}</span>
              </p>

              <div className="space-y-1 text-sm">
                <p><span className="font-semibold text-foreground">Job Role:</span> <span className="text-muted-foreground">{selected.role}</span></p>
                <p><span className="font-semibold text-foreground">Location:</span> <span className="text-muted-foreground">{selected.location}</span></p>
                {selected.stipend && (
                  <p><span className="font-semibold text-foreground">Stipend:</span> <span className="text-muted-foreground">{selected.stipend}</span></p>
                )}
              </div>

              <div className="mt-5">
                <h4 className="font-semibold text-foreground mb-2">Attachments</h4>
                <p className="text-sm italic text-muted-foreground">No attachments added</p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="glass rounded-2xl border border-border/60 p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-4">Round Details</h3>
                <ol className="space-y-3">
                  {selected.rounds.map((r, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="glass rounded-2xl border border-border/60 p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-4">Profile &amp; Salary Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Profile</span>
                    <span className="text-foreground font-medium">{selected.profile}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">CTC</span>
                    <span className="text-foreground font-medium flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" /> {selected.salary} <span className="text-muted-foreground text-xs">{selected.salaryUnit}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Drive Type</span>
                    <span className="text-foreground font-medium">{selected.driveType}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ============ LIST VIEW ============
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mr-4">Drives</h1>

        <div className="flex flex-wrap items-center gap-2">
          {driveStatusLabels.map((s) => {
            const active = status === s.value;
            const count = s.value === "all" ? counts.all : counts[s.value] || 0;
            return (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "glass text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" className="glass border-border/50">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="glass border-border/50">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="glass border-border/50">
            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort by
          </Button>
          <Button variant="outline" className="glass border-border/50">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filteredDrives.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center text-muted-foreground">
          No drives in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filteredDrives.map((d, i) => {
              const isOpted = role === "student" && userProfile ? isRegistered(d.id, userProfile.rollNumber) : false;
              const registeredCount = registrationCounts[d.id] || 0;
              return (
                <motion.button
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(d)}
                  className="group text-left glass rounded-2xl overflow-hidden border border-border/60 hover:border-primary/50 hover:glow-primary transition-all"
                >
                  {/* Top */}
                  <div className="relative p-5 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
                    <div className="flex items-start justify-between mb-8">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                          role === "student"
                            ? isOpted
                              ? "bg-warning/20 text-warning border-warning/40"
                              : "bg-muted/30 text-muted-foreground border-border"
                            : registeredCount > 0
                            ? "bg-success/20 text-success border-success/40"
                            : "bg-muted/30 text-muted-foreground border-border"
                        }`}
                      >
                        {role === "student"
                          ? isOpted
                            ? "Opted-In"
                            : "Opt-In Open"
                          : registeredCount > 0
                          ? `${registeredCount} opted`
                          : "No opt-ins yet"}
                      </span>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${d.logoColor} text-primary-foreground font-bold text-sm shadow-lg`}
                      >
                        {d.logoText}
                      </div>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-foreground">{d.company}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{d.subtitle}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <Chip>{d.role}</Chip>
                      <Chip>{d.driveType}</Chip>
                      <Chip>{d.location}</Chip>
                    </div>
                  </div>

                  {/* Apply before strip */}
                  <div className="bg-background/80 backdrop-blur border-t border-border/60 px-5 py-2.5 flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-muted-foreground">Apply Before</span>
                    <span className="font-semibold text-foreground">{d.applyBefore}</span>
                  </div>

                  {/* Salary */}
                  <div className="px-5 py-4 flex items-center gap-1 text-lg">
                    <IndianRupee className="h-4 w-4 text-success" />
                    <span className="font-bold text-foreground">{d.salary}</span>
                    <span className="text-xs text-muted-foreground ml-1">{d.salaryUnit}</span>
                    {!isOpted && (
                      <span className="ml-auto text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition">
                        View details →
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {placementPosts.length > 0 && (
        <section className="mt-8 space-y-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Placement Updates</h2>
            <p className="text-sm text-muted-foreground">Posts published by DA officers appear here and in the student feed.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {placementPosts.map((post, i) => (
              <PostCard key={(post as any)._id ?? post.id ?? i} post={post} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-accent/50 border border-border/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
    {children}
  </span>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-[10px] font-bold tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

export default PlacementsPage;
