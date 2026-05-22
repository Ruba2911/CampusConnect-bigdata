import { useEffect, useState } from "react";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { useRole } from "@/contexts/RoleContext";
import { getApiUrl } from "@/lib/api";
import type { Post } from "@/data/mockData";

const CreatePostPage = () => {
  const { userName, role, userProfile } = useRole();
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postedBy = role === "club-admin" ? userProfile?.clubName || userName : userName;
        const response = await fetch(getApiUrl(`/api/posts?role=${role}&postedBy=${encodeURIComponent(postedBy)}`));
        if (!response.ok) return;
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Unable to load posts", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [role, userName, userProfile]);

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Manage Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage your event posts</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl glass p-8 text-center text-muted-foreground">Loading posts...</div>
      ) : (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.slice(0, 4).map((post, i) => {
              const key = (post as any)._id ?? post.id ?? i;
              return <PostCard key={key} post={post as Post} index={i} />;
            })
          ) : (
            <div className="rounded-2xl glass p-8 text-center text-muted-foreground">No posts available yet.</div>
          )}
        </div>
      )}

      <CreatePostModal
        open={showModal}
        onClose={() => setShowModal(false)}
        author={role === "club-admin" ? userProfile?.clubName || userName : userName}
        onCreated={handlePostCreated}
      />
    </div>
  );
};

export default CreatePostPage;
