import { useState } from "react";
import { Heart, Bookmark, MessageCircle, Eye, Clock, Users, ExternalLink, Share2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Post, categories } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventDetailsModal } from "@/components/EventDetailsModal";
import { useRegistrations } from "@/contexts/RegistrationsContext";
import { useRole } from "@/contexts/RoleContext";
import posterAnnouncement from "@/assets/poster-announcement.jpg";

interface PostCardProps {
  post: Post;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const postId = (post as any).id ?? (post as any)._id;
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [modalOpen, setModalOpen] = useState(false);
  const { isRegistered } = useRegistrations();
  const { role } = useRole();
  const registered = isRegistered(postId);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const canRegister = role === "student";

  const categoryInfo = categories.find((c) => c.value === post.category);

  const getCategoryClasses = () => {
    switch (post.category) {
      case "placement": return "bg-success/15 text-success border-success/30";
      case "internship": return "bg-secondary/15 text-secondary border-secondary/30";
      case "workshop": return "bg-warning/15 text-warning border-warning/30";
      case "announcement": return "bg-destructive/15 text-destructive border-destructive/30";
      case "cultural": return "bg-primary/15 text-primary border-primary/30";
      default: return "bg-primary/15 text-primary border-primary/30";
    }
  };

  const getDeadlineUrgency = () => {
    // Simple urgency based on deadline text
    const deadline = post.deadline ?? "";
    if (deadline.includes("10") || deadline.includes("12")) return "bg-destructive/20 text-destructive border-destructive/40";
    if (deadline.includes("15") || deadline.includes("18")) return "bg-warning/20 text-warning border-warning/40";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass glass-hover rounded-2xl overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={post.image || posterAnnouncement}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <Badge variant="outline" className={`${getCategoryClasses()} backdrop-blur-md text-xs font-semibold`}>
            {categoryInfo?.label}
          </Badge>
        </div>

        {/* Deadline Badge */}
        <div className="absolute right-3 top-3">
          <Badge variant="outline" className={`${getDeadlineUrgency()} backdrop-blur-md text-xs font-semibold`}>
            <Clock className="mr-1 h-3 w-3" />
            {post.deadline || "No deadline"}
          </Badge>
        </div>

        {/* Views overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/60 px-2 py-1 backdrop-blur-md">
          <Eye className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{(post.views ?? 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Author Row */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {post.postedByAvatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{post.postedBy}</p>
            <p className="text-xs text-muted-foreground">{post.postedAt}</p>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground leading-tight">{post.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">{post.description}</p>
        </div>

        {/* Eligibility */}
        {post.eligibility && (
          <div className="flex items-start gap-2 rounded-lg bg-accent/50 p-2.5">
            <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Eligibility:</span> {post.eligibility}
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(post.tags ?? []).map((tag) => (
            <span key={tag} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsLiked(!isLiked); setLikes((l) => isLiked ? l - 1 : l + 1); }}
              className="flex items-center gap-1 text-sm transition-colors"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
              <span className={isLiked ? "text-destructive" : "text-muted-foreground"}>{likes}</span>
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center gap-1 text-sm transition-colors"
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-warning text-warning" : "text-muted-foreground hover:text-warning"}`} />
              <span className={isSaved ? "text-warning" : "text-muted-foreground"}>{post.saves ?? 0}</span>
            </button>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {post.comments ?? 0}
            </span>
          </div>

          {canRegister && post.category !== "announcement" ? (
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className={`${registered ? "bg-success/20 text-success hover:bg-success/30" : "glow-primary bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {registered ? (
                <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Registered</>
              ) : (
                <><ExternalLink className="mr-1.5 h-3.5 w-3.5" /> {post.category === "placement" || post.category === "internship" ? "Apply" : "Register"}</>
              )}
            </Button>
          ) : canRegister ? (
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)} className="border-border text-muted-foreground hover:text-foreground">
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">
              {post.registrations ?? 0} registrations
            </div>
          )}
        </div>

        <EventDetailsModal post={post} open={modalOpen} onClose={() => setModalOpen(false)} />

        {/* Registration count */}
        {(post.registrations ?? 0) > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-success">{post.registrations}</span> registered
          </p>
        )}
      </div>
    </motion.div>
  );
}
