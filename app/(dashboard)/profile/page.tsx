"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { User, MapPin, Briefcase, GraduationCap, Code, Target, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape",
];

const EDUCATION_LEVELS = [
  "Grade 10/11", "Grade 12 / Matric", "Certificate (NQF 1-5)",
  "Diploma (NQF 6)", "Advanced Diploma", "Bachelor's Degree (NQF 7)",
  "Honours (NQF 8)", "Master's Degree (NQF 9)", "PhD (NQF 10)",
];

const POPULAR_SKILLS = [
  "Python", "JavaScript", "SQL", "Excel", "Power BI", "Tableau",
  "React", "Node.js", "AWS", "Azure", "Machine Learning", "Data Analysis",
  "Project Management", "Agile/Scrum", "Communication", "Leadership",
  "AutoCAD", "Java", "C#", ".NET", "Cybersecurity", "Cloud Computing",
];

export default function ProfilePage() {
  const { user } = useUser();
  const [skills, setSkills] = useState<string[]>(["Excel", "Communication", "Project Coordination"]);
  const [newSkill, setNewSkill] = useState("");
  const [saved, setSaved] = useState(false);

  const profileStrength = Math.min(
    20 + (skills.length > 0 ? 20 : 0) + 15 + 10 + 15 + 10 + 10,
    100
  );

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const save = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete your profile to improve your employability score and AI recommendations.</p>
        </div>
        <Button onClick={save} variant="indigo" size="sm" className="gap-2">
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Saved!" : "Save Profile"}
        </Button>
      </div>

      {/* Profile strength */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">Profile Strength</span>
          </div>
          <span className="text-lg font-bold text-amber-400">{profileStrength}%</span>
        </div>
        <Progress value={profileStrength} className="h-2" indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500" />
        <p className="text-xs text-muted-foreground mt-2">
          A stronger profile = better AI recommendations + higher employability score.
        </p>
      </div>

      {/* Basic info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
            <Input defaultValue={user?.fullName || ""} placeholder="Your full name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <Input defaultValue={user?.primaryEmailAddress?.emailAddress || ""} disabled />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">LinkedIn URL</label>
            <Input placeholder="https://linkedin.com/in/yourname" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">GitHub / Portfolio</label>
            <Input placeholder="https://github.com/yourname" />
          </div>
        </div>
      </div>

      {/* Location & experience */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          Work & Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Role</label>
            <Input placeholder="e.g. Junior Developer, Student, Unemployed" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Role</label>
            <Input placeholder="e.g. Data Scientist, Cloud Architect" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Province</label>
            <select className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select province...</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Years of Experience</label>
            <Input type="number" min={0} max={50} placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Industry</label>
            <Input placeholder="e.g. Technology, Finance, Healthcare" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Salary Expectation (ZAR/month)</label>
            <Input type="number" placeholder="e.g. 45000" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Professional Bio</label>
          <textarea
            rows={3}
            placeholder="Brief summary of your experience, skills, and career goals..."
            className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </div>

      {/* Education */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-violet-400" />
          Education
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Highest Qualification</label>
            <select className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select education level...</option>
              {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Institution</label>
            <Input placeholder="e.g. University of Cape Town, UNISA, Wits" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Field of Study</label>
            <Input placeholder="e.g. Computer Science, Engineering, Finance" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Year Completed</label>
            <Input type="number" placeholder="2024" min={1970} max={2030} />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Code className="w-4 h-4 text-amber-400" />
          Skills ({skills.length})
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <motion.div
              key={skill}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-sm text-indigo-300"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="text-indigo-400/60 hover:text-indigo-300 ml-0.5 text-xs">×</button>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
            className="flex-1"
          />
          <Button onClick={() => addSkill(newSkill)} variant="outline" size="sm">Add</Button>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Popular skills to add:</div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 12).map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-indigo-500/30 hover:bg-indigo-500/8 text-muted-foreground hover:text-foreground transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Open to work toggle */}
      <div className="bg-card border border-emerald-500/20 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-sm font-semibold text-foreground">Open to Work</div>
            <div className="text-xs text-muted-foreground">Recruiters can discover your profile on CareerIntel SA</div>
          </div>
        </div>
        <div className="w-12 h-6 rounded-full bg-emerald-600 flex items-center px-1 cursor-pointer">
          <div className="w-4 h-4 rounded-full bg-white ml-auto" />
        </div>
      </div>
    </div>
  );
}
