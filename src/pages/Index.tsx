import { useEffect, useMemo, useState } from "react";
import { PostCategory } from "@/data/mockData";
import { PostCard } from "@/components/PostCard";
import { FeedFilters } from "@/components/FeedFilters";
import { useRole } from "@/contexts/RoleContext";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";

interface PostItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: PostCategory;
  tags: string[];
}

const Index = () => {
  const { role, userName } = useRole();
  const [activeFilter, setActiveFilter] = useState<PostCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(getApiUrl("/api/posts"));
        if (!response.ok) return;
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Unable to load feed posts", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = activeFilter === "all" || post.category === activeFilter;
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery, posts]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Welcome back, <span className="text-gradient">{userName.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredPosts.length} posts in your feed • Stay updated with campus events
        </p>
      </motion.div>

      {/* Filters */}
      <FeedFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Feed */}
      <div className="space-y-6 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading feed...</div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <PostCard key={post._id ?? post.id ?? i} post={post as any} index={i} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">No posts found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
