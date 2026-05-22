import { useMemo, useState } from "react";
import { X, ImagePlus, Calendar, Tag, Users } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockData";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useRole } from "@/contexts/RoleContext";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  author: string;
  onCreated: (post: unknown) => void;
}

export function CreatePostModal({ open, onClose, author, onCreated }: CreatePostModalProps) {
  const { role } = useRole();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tags, setTags] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const allowedCategories = useMemo(() => {
    if (role === "club-admin") {
      return categories.filter((c) => ["club-event", "workshop", "cultural", "announcement"].includes(c.value));
    }
    if (role === "da-officer") {
      return categories.filter((c) => ["placement", "internship", "announcement"].includes(c.value));
    }
    return categories;
  }, [role]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setDeadline("");
    setTags("");
    setEligibility("");
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      toast.error("Please fill in required fields");
      return;
    }

    // NOTE: backend currently expects JSON and stores `image` as a string.
    // Since the backend doesn't support multipart uploads yet, we upload the image
    // as a Base64 data URL.
    const imageDataUrl = await (async () => {
      if (!imageFile) return "";
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("Poster image is too large. Please upload an image under 5 MB.");
      }
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
    })();

    const payload = {
      title,
      description,
      category,
      deadline,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      eligibility,
      postedBy: author || "Campus Team",
      postedByAvatar: author ? author.slice(0, 2).toUpperCase() : "CT",
      image: imageDataUrl,
      authorRole: role,
    };

    try {
      const response = await fetch(getApiUrl("/api/posts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        let message = "Unable to create post.";
        try {
          const errorData = JSON.parse(text);
          message = errorData?.message || errorData?.error || message;
        } catch {
          if (text) message = text;
        }
        console.error("CreatePostModal failed:", { status, message, responseText: text });
        toast.error(message);
        return;
      }

      const created = await response.json();
      toast.success("Post created successfully! 🎉");
      onCreated(created);
      onClose();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to create post.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-lg rounded-2xl border border-border/50 p-6 max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-foreground">Create New Post</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event / Drive title" className="glass border-border/50" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description *</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the event in detail..." className="glass border-border/50 min-h-[100px]" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="glass border-border/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {allowedCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" /> Deadline
                  </label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="glass border-border/50" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Tag className="h-4 w-4" /> Tags
                  </label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. AI, Tech" className="glass border-border/50" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4" /> Eligibility
                </label>
                <Input value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="e.g. CSE, 3rd year+" className="glass border-border/50" />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <ImagePlus className="h-4 w-4" /> Upload Poster
                </label>

                <div
                  className="flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById('posterInput')?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') document.getElementById('posterInput')?.click();
                  }}
                >
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-6 w-6 mb-1" />
                    <p className="text-xs">Click to upload</p>
                  </div>
                </div>

                <input
                  id="posterInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    if (file) {
                      setImagePreviewUrl(URL.createObjectURL(file));
                    } else {
                      setImagePreviewUrl("");
                    }
                  }}
                />

                {imagePreviewUrl && (
                  <div className="mt-3">
                    <img
                      src={imagePreviewUrl}
                      alt="Poster preview"
                      className="w-full h-40 object-cover rounded-xl border border-border/50"
                    />
                  </div>
                )}
              </div>


              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1 border-border text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button onClick={handleSubmit} className="flex-1 glow-primary bg-primary text-primary-foreground hover:bg-primary/90">Publish Post</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
