import { useMemo, useState } from "react";
import { useRegistrations } from "@/contexts/RegistrationsContext";
import { useRole } from "@/contexts/RoleContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const RegistrationsPage = () => {
  const { registrations } = useRegistrations();
  const { role } = useRole();
  const [query, setQuery] = useState("");

  const scoped = useMemo(() => {
    if (role === "super-admin") return registrations;
    if (role === "da-officer")
      return registrations.filter((r) =>
        ["placement", "internship", "announcement"].includes(r.postCategory)
      );
    if (role === "club-admin")
      return registrations.filter((r) =>
        ["club-event", "workshop", "cultural"].includes(r.postCategory)
      );
    return [];
  }, [registrations, role]);

  const filtered = scoped.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(query.toLowerCase()) ||
      r.postTitle.toLowerCase().includes(query.toLowerCase())
  );

  // Group by event
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, r) => {
    (acc[r.postTitle] ||= []).push(r);
    return acc;
  }, {});

  const exportCsv = () => {
    const rows = [
      ["Event", "Category", "Name", "Roll", "Email", "Dept", "Phone", "Registered At"],
      ...filtered.map((r) => [r.postTitle, r.postCategory, r.name, r.rollNumber, r.email, r.department, r.phone, r.registeredAt]),
    ];
    const csv = rows.map((row) => row.map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${role}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Event Registrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "super-admin"
              ? "All registrations across the platform"
              : role === "da-officer"
              ? "Placement & internship registrations"
              : "Club event & workshop registrations"}
          </p>
        </div>
        <Button onClick={exportCsv} variant="outline" disabled={!filtered.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, roll number, or event…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0"
        />
        <Badge variant="outline" className="ml-auto">
          <Users className="mr-1 h-3 w-3" /> {filtered.length} total
        </Badge>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No registrations yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([event, regs], i) => (
            <motion.div
              key={event}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div>
                  <h3 className="font-heading font-bold text-foreground">{event}</h3>
                  <p className="text-xs text-muted-foreground">Posted by {regs[0].postedBy}</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">{regs.length} registered</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-accent/30 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2">Name</th>
                      <th className="text-left px-4 py-2">Roll No.</th>
                      <th className="text-left px-4 py-2">Email</th>
                      <th className="text-left px-4 py-2">Dept</th>
                      <th className="text-left px-4 py-2">Phone</th>
                      <th className="text-left px-4 py-2">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regs.map((r) => (
                      <tr key={r.id} className="border-t border-border/30 hover:bg-accent/20">
                        <td className="px-4 py-2 text-foreground font-medium">{r.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.rollNumber}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.email}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.department}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.phone || "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">
                          {new Date(r.registeredAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegistrationsPage;
