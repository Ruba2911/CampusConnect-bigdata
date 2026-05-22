import { categories, PostCategory } from "@/data/mockData";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FeedFiltersProps {
  activeFilter: PostCategory | "all";
  setActiveFilter: (f: PostCategory | "all") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function FeedFilters({ activeFilter, setActiveFilter, searchQuery, setSearchQuery }: FeedFiltersProps) {
  return (
    <div className="sticky top-0 z-30 space-y-4 bg-background/80 pb-4 pt-2 backdrop-blur-xl">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events, placements, clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass border-border/50 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground glow-primary"
              : "bg-accent text-muted-foreground hover:bg-accent/80 hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeFilter === cat.value
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-accent text-muted-foreground hover:bg-accent/80 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
