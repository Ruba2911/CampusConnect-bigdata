import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, GraduationCap, Users, Briefcase, Mail, Lock, Hash, Building, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/contexts/RoleContext";
import { UserRole } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

type LoginRole = UserRole;

type LoginMode = "login" | "signup";

const roleConfig: Record<LoginRole, { label: string; icon: React.ReactNode; color: string }> = {
  student: { label: "Student", icon: <GraduationCap className="h-5 w-5" />, color: "primary" },
  "club-admin": { label: "Club Admin", icon: <Users className="h-5 w-5" />, color: "secondary" },
  "da-officer": { label: "DA / Placement Officer", icon: <Briefcase className="h-5 w-5" />, color: "warning" },
  "super-admin": { label: "Super Admin", icon: <Shield className="h-5 w-5" />, color: "destructive" },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useRole();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<LoginRole>("student");
  const [accountMode, setAccountMode] = useState<LoginMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    clubName: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePassword = (pw: string) => pw.length >= 8;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!validateEmail(form.email)) e.email = "Enter a valid email address";
    if (!validatePassword(form.password)) e.password = "Password must be at least 8 characters";
    if (accountMode === "signup") {
      if (!form.name.trim()) e.name = "Full name is required";
      if (selectedRole === "student" && !form.rollNumber.trim()) e.rollNumber = "Roll number is required";
      if (selectedRole === "club-admin" && !form.clubName.trim()) e.clubName = "Club name is required";
      if (selectedRole === "da-officer" && !form.department.trim()) e.department = "Department is required";
      if (selectedRole === "super-admin") e.email = "Super Admin sign-up is disabled. Use admin@gmail.com / admin123.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    if (accountMode === "login") {
      const result = await login(form.email.trim(), form.password, selectedRole);
      if (!result.success) {
        toast({ title: "Sign in failed", description: result.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
      toast({ title: "Login successful", description: `Welcome back, ${roleConfig[selectedRole].label}!` });
      navigate("/");
      setIsLoading(false);
      return;
    }

    const signupResult = await signup({
      email: form.email.trim(),
      password: form.password,
      role: selectedRole,
      name: form.name.trim(),
      rollNumber: selectedRole === "student" ? form.rollNumber.trim() : undefined,
      clubName: selectedRole === "club-admin" ? form.clubName.trim() : undefined,
      department: selectedRole === "da-officer" ? form.department.trim() : undefined,
      phone: form.phone.trim() || undefined,
    });

    if (!signupResult.success) {
      toast({ title: "Registration failed", description: signupResult.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    toast({ title: "Account created", description: "You are now logged in and can access the site." });
    navigate("/");
    setIsLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm text-muted-foreground">Secure Authentication</span>
          </motion.div>
          <h1 className="text-3xl font-bold font-heading text-gradient mb-2">CampusConnect</h1>
          <p className="text-muted-foreground text-sm">Sign in or sign up with your role-specific credentials.</p>
        </div>

        <div className="glass rounded-2xl p-8 glow-primary">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="rounded-2xl bg-accent/40 px-4 py-3 text-sm font-semibold text-foreground">
              {accountMode === "login" ? "Sign In" : "Sign Up"}
            </div>
            <div className="space-x-2 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setAccountMode("login")}
                className={`rounded-full px-3 py-1 ${accountMode === "login" ? "bg-primary/20 text-primary" : "hover:bg-accent/60"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAccountMode("signup")}
                className={`rounded-full px-3 py-1 ${accountMode === "signup" ? "bg-primary/20 text-primary" : "hover:bg-accent/60"}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {(Object.entries(roleConfig) as [LoginRole, typeof roleConfig[LoginRole]][]).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedRole(key);
                  setErrors({});
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 text-xs font-medium ${
                  selectedRole === key
                    ? "bg-primary/20 border-primary/50 text-primary-foreground glow-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/50"
                }`}
              >
                {cfg.icon}
                <span className="leading-tight text-center">{cfg.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${accountMode}-${selectedRole}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {accountMode === "signup" && (
                  <FieldWrapper label="Full Name" icon={<GraduationCap className="h-4 w-4" />} error={errors.name}>
                    <Input
                      placeholder="e.g. Alex Kumar"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="pl-10 bg-accent/50 border-border/50 focus:border-primary/50"
                    />
                  </FieldWrapper>
                )}

                {accountMode === "signup" && selectedRole === "student" && (
                  <FieldWrapper label="Roll Number" icon={<Hash className="h-4 w-4" />} error={errors.rollNumber}>
                    <Input
                      placeholder="e.g. 21CSE001"
                      value={form.rollNumber}
                      onChange={(e) => updateField("rollNumber", e.target.value)}
                      className="pl-10 bg-accent/50 border-border/50 focus:border-primary/50"
                    />
                  </FieldWrapper>
                )}
                {accountMode === "signup" && selectedRole === "club-admin" && (
                  <FieldWrapper label="Club Name" icon={<Users className="h-4 w-4" />} error={errors.clubName}>
                    <Input
                      placeholder="e.g. iQube Club"
                      value={form.clubName}
                      onChange={(e) => updateField("clubName", e.target.value)}
                      className="pl-10 bg-accent/50 border-border/50 focus:border-primary/50"
                    />
                  </FieldWrapper>
                )}
                {accountMode === "signup" && selectedRole === "da-officer" && (
                  <FieldWrapper label="Department" icon={<Building className="h-4 w-4" />} error={errors.department}>
                    <Input
                      placeholder="e.g. Computer Science"
                      value={form.department}
                      onChange={(e) => updateField("department", e.target.value)}
                      className="pl-10 bg-accent/50 border-border/50 focus:border-primary/50"
                    />
                  </FieldWrapper>
                )}

                <FieldWrapper
                  label={selectedRole === "student" ? "College Email" : selectedRole === "club-admin" ? "Club Email" : "Official Email"}
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                >
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="pl-10 bg-accent/50 border-border/50 focus:border-primary/50"
                  />
                </FieldWrapper>

                <FieldWrapper label="Password" icon={<Lock className="h-4 w-4" />} error={errors.password}>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="pl-10 pr-10 bg-accent/50 border-border/50 focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FieldWrapper>

                {accountMode === "signup" && selectedRole === "super-admin" && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    Super Admin sign-up is disabled here. Use <strong>admin@gmail.com</strong> / <strong>admin123</strong> to login.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary hover:underline">Forgot Password?</button>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : accountMode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {accountMode === "login" ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setAccountMode("signup")} className="text-primary font-medium hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setAccountMode("login")} className="text-primary font-medium hover:underline">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const FieldWrapper = ({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      {children}
    </div>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default LoginPage;
