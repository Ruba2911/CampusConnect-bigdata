import { useEffect, useMemo, useState } from "react";
import { Grid3X3, PlusCircle, Settings, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useRole } from "@/contexts/RoleContext";
import type { Post } from "@/data/mockData";
import posterAnnouncement from "@/assets/poster-announcement.jpg";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { role, userName, userProfile } = useRole();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postedBy = role === "club-admin" ? userProfile?.clubName || userName : userName;
        const response = await fetch(getApiUrl(`/api/posts?role=${role}&postedBy=${encodeURIComponent(postedBy)}`));
        if (!response.ok) return;
        setPosts(await response.json());
      } catch (error) {
        console.error("Unable to load profile posts", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [role, userName, userProfile]);

  const profile = useMemo(() => {
    const displayName = role === "club-admin" ? userProfile?.clubName || userName : "DA Placements";
    const handle = role === "club-admin"
      ? (userProfile?.clubName || userName).toLowerCase().replace(/\s+/g, "")
      : "da_placements";
    const initials = displayName.slice(0, 2).toUpperCase();
    const bio = role === "club-admin"
      ? ["Campus club updates", "Competitions, workshops and events", "Register. Participate. Grow."]
      : ["Placement and internship updates", "Drive announcements and student registrations", "Career opportunities for students"];

    return { displayName, handle, initials, bio };
  }, [role, userName, userProfile]);

  const totalRegistrations = posts.reduce((sum, post) => sum + (post.registrations ?? 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.views ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <section className="border-b border-border/70 pb-8">
        <div className="grid grid-cols-[150px_1fr] gap-8 md:grid-cols-[190px_1fr]">
          <div className="flex justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-border bg-card text-3xl font-bold text-primary md:h-40 md:w-40">
              {profile.initials}
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate font-heading text-2xl font-bold text-foreground">{profile.handle}</h1>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <span><strong className="text-foreground">{posts.length}</strong> posts</span>
              <span><strong className="text-foreground">{totalRegistrations}</strong> registrations</span>
              <span><strong className="text-foreground">{totalViews}</strong> views</span>
            </div>

            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">{profile.displayName}</p>
              {profile.bio.map((line) => (
                <p key={line} className="text-muted-foreground">{line}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => navigate("/create")} className="bg-card text-foreground hover:bg-accent">
                <PlusCircle className="mr-2 h-4 w-4" />
                New post
              </Button>
              <Button variant="outline" className="border-border bg-card text-foreground hover:bg-accent">
                <UserCircle className="mr-2 h-4 w-4" />
                View profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 border-b border-border/70 py-4 text-xs font-semibold uppercase tracking-wider text-foreground">
        <Grid3X3 className="h-4 w-4" />
        Posts
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading profile posts...</div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-1 pt-1 md:grid-cols-3">
          {posts.map((post, index) => (
            <button
              key={(post as any)._id ?? post.id ?? index}
              type="button"
              className="group relative aspect-square overflow-hidden bg-card text-left"
              onClick={() => navigate("/create")}
            >
              <img
                src={post.image || posterAnnouncement}
                alt={post.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/10 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{post.title}</p>
                <p className="text-xs capitalize text-muted-foreground">{post.category.replace("-", " ")}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border text-muted-foreground">
            <PlusCircle className="h-8 w-8" />
          </div>
          <p className="font-heading text-xl font-bold text-foreground">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first update to show it here.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
