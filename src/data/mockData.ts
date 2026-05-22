export type PostCategory = "club-event" | "placement" | "internship" | "workshop" | "announcement" | "cultural";
export type UserRole = "student" | "club-admin" | "da-officer" | "super-admin";

export interface Post {
  id: string;
  _id?: string;
  title: string;
  description: string;
  image: string;
  category: PostCategory;
  tags: string[];
  deadline: string;
  postedBy: string;
  postedByAvatar: string;
  postedAt: string;
  likes: number;
  saves: number;
  views: number;
  registrations: number;
  comments: number;
  eligibility?: string;
  department?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
}

export const categories: { value: PostCategory; label: string; color: string }[] = [
  { value: "club-event", label: "Club Event", color: "primary" },
  { value: "placement", label: "Placement", color: "success" },
  { value: "internship", label: "Internship", color: "secondary" },
  { value: "workshop", label: "Workshop", color: "warning" },
  { value: "announcement", label: "Announcement", color: "destructive" },
  { value: "cultural", label: "Cultural", color: "primary" },
];
