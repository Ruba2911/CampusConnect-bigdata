import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Post, categories } from "@/data/mockData";
import { useRegistrations } from "@/contexts/RegistrationsContext";
import { Clock, Users, CheckCircle2, Calendar, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import posterAnnouncement from "@/assets/poster-announcement.jpg";

interface Props {
  post: Post | null;
  open: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ post, open, onClose }: Props) {
  const { register, isRegistered } = useRegistrations();
  const [step, setStep] = useState<"details" | "form" | "done">("details");
  const [form, setForm] = useState({ name: "", rollNumber: "", email: "", department: "", phone: "" });

  if (!post) return null;
  const postId = (post as any).id ?? (post as any)._id;
  const categoryInfo = categories.find((c) => c.value === post.category);
  const ctaLabel = post.category === "placement" || post.category === "internship" ? "Apply Now" : "Register Now";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber || !form.email || !form.department) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    register({
      postId,
      postTitle: post.title,
      postCategory: post.category,
      postedBy: post.postedBy,
      ...form,
    });
    toast({ title: "Registered successfully!", description: `You're in for ${post.title}.` });
    setStep("done");
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("details");
      setForm({ name: "", rollNumber: "", email: "", department: "", phone: "" });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-border/60">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-gradient">{post.title}</DialogTitle>
        </DialogHeader>

        {step === "details" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
              <img src={post.image || posterAnnouncement} alt={post.title} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3">
                <Badge className="bg-primary/80 backdrop-blur-md">{categoryInfo?.label}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-lg p-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-semibold text-foreground">{post.deadline || "No deadline"}</p>
                </div>
              </div>
              <div className="glass rounded-lg p-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="text-sm font-semibold text-foreground">{post.registrations ?? 0}+ students</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">About this event</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{post.description}</p>
            </div>

            {post.eligibility && (
              <div className="rounded-lg bg-accent/50 p-3">
                <p className="text-xs font-medium text-foreground mb-1">Eligibility</p>
                <p className="text-sm text-muted-foreground">{post.eligibility}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {(post.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Tag className="inline h-3 w-3 mr-1" />{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <div className="text-xs text-muted-foreground">
                Posted by <span className="font-medium text-foreground">{post.postedBy}</span>
              </div>
              <Button
                onClick={() => setStep("form")}
                disabled={isRegistered(postId)}
                className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isRegistered(postId) ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Already Registered</>
                ) : (
                  <><Clock className="mr-2 h-4 w-4" /> {ctaLabel}</>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "form" && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground">Fill in your details to {ctaLabel.toLowerCase()}.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roll">Roll Number *</Label>
                <Input id="roll" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className="glass" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="glass" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dept">Department *</Label>
                <Input id="dept" placeholder="e.g. CSE" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="glass" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="glass" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep("details")}>Back</Button>
              <Button type="submit" className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90">
                Confirm Registration
              </Button>
            </div>
          </motion.form>
        )}

        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8 space-y-3"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 glow-primary">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">You're registered!</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your registration for <span className="font-medium text-foreground">{post.title}</span> has been recorded.
              You'll receive updates via email.
            </p>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
