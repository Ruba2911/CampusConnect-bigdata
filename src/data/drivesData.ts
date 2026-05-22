export type DriveStatus = "upcoming" | "ongoing" | "completed" | "hold" | "reopened" | "not-eligible";

export interface Drive {
  id: string;
  company: string;
  subtitle: string;
  logoText: string;
  logoColor: string;
  role: string;
  driveType: string;
  location: string;
  category: string;
  placementCategory: string;
  applyBefore: string;
  applyDate: string;
  applyTime: string;
  salary: string;
  salaryUnit: "PA" | "PM";
  status: DriveStatus;
  optedIn: boolean;
  description: string;
  eligibility: string;
  stipend?: string;
  rounds: { name: string; description: string }[];
  profile: string;
}

export const driveStatusLabels: { value: DriveStatus | "all"; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hold", label: "Hold" },
  { value: "reopened", label: "Reopened" },
  { value: "not-eligible", label: "Not Eligible" },
  { value: "all", label: "All" },
];
