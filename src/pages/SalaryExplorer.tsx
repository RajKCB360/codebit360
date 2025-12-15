import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, MapPin, Briefcase, TrendingUp, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import SEO from "@/components/SEO";

interface SalaryData {
  role: string;
  category: string;
  experience: string;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  locations: { city: string; multiplier: number }[];
  skills: string[];
  growth: string;
}

const salaryData: SalaryData[] = [
  {
    role: "Software Developer",
    category: "Development",
    experience: "Fresher (0-1 years)",
    minSalary: 300000,
    maxSalary: 600000,
    avgSalary: 450000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.05 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["JavaScript", "React", "Node.js", "Python"],
    growth: "+15%",
  },
  {
    role: "Software Developer",
    category: "Development",
    experience: "Mid-Level (2-4 years)",
    minSalary: 600000,
    maxSalary: 1500000,
    avgSalary: 1000000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.05 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["JavaScript", "React", "Node.js", "System Design"],
    growth: "+12%",
  },
  {
    role: "Data Scientist",
    category: "Data & AI",
    experience: "Fresher (0-1 years)",
    minSalary: 400000,
    maxSalary: 800000,
    avgSalary: 600000,
    locations: [
      { city: "Bangalore", multiplier: 1.25 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.1 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    growth: "+20%",
  },
  {
    role: "Data Scientist",
    category: "Data & AI",
    experience: "Mid-Level (2-4 years)",
    minSalary: 1000000,
    maxSalary: 2500000,
    avgSalary: 1800000,
    locations: [
      { city: "Bangalore", multiplier: 1.25 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.1 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Python", "Deep Learning", "NLP", "MLOps"],
    growth: "+18%",
  },
  {
    role: "DevOps Engineer",
    category: "Cloud & DevOps",
    experience: "Fresher (0-1 years)",
    minSalary: 350000,
    maxSalary: 700000,
    avgSalary: 500000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.1 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.05 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Linux", "Docker", "AWS", "CI/CD"],
    growth: "+22%",
  },
  {
    role: "DevOps Engineer",
    category: "Cloud & DevOps",
    experience: "Mid-Level (2-4 years)",
    minSalary: 800000,
    maxSalary: 2000000,
    avgSalary: 1400000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.1 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.05 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Kubernetes", "Terraform", "AWS/GCP", "Python"],
    growth: "+20%",
  },
  {
    role: "Frontend Developer",
    category: "Development",
    experience: "Fresher (0-1 years)",
    minSalary: 280000,
    maxSalary: 550000,
    avgSalary: 400000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.0 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.9 },
    ],
    skills: ["React", "JavaScript", "CSS", "TypeScript"],
    growth: "+14%",
  },
  {
    role: "Backend Developer",
    category: "Development",
    experience: "Fresher (0-1 years)",
    minSalary: 300000,
    maxSalary: 600000,
    avgSalary: 450000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.05 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Java", "Spring Boot", "Node.js", "SQL"],
    growth: "+13%",
  },
  {
    role: "Cloud Engineer",
    category: "Cloud & DevOps",
    experience: "Fresher (0-1 years)",
    minSalary: 350000,
    maxSalary: 700000,
    avgSalary: 520000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.1 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.1 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["AWS", "Azure", "Linux", "Networking"],
    growth: "+25%",
  },
  {
    role: "ML Engineer",
    category: "Data & AI",
    experience: "Fresher (0-1 years)",
    minSalary: 450000,
    maxSalary: 900000,
    avgSalary: 650000,
    locations: [
      { city: "Bangalore", multiplier: 1.3 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.1 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps"],
    growth: "+28%",
  },
  {
    role: "ML Engineer",
    category: "Data & AI",
    experience: "Mid-Level (2-4 years)",
    minSalary: 1200000,
    maxSalary: 3000000,
    avgSalary: 2000000,
    locations: [
      { city: "Bangalore", multiplier: 1.3 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.1 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Deep Learning", "NLP", "Computer Vision", "MLOps"],
    growth: "+25%",
  },
  {
    role: "Data Analyst",
    category: "Data & AI",
    experience: "Fresher (0-1 years)",
    minSalary: 300000,
    maxSalary: 600000,
    avgSalary: 420000,
    locations: [
      { city: "Bangalore", multiplier: 1.15 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.0 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.9 },
    ],
    skills: ["SQL", "Excel", "Python", "Tableau"],
    growth: "+16%",
  },
  {
    role: "QA Engineer",
    category: "Testing",
    experience: "Fresher (0-1 years)",
    minSalary: 250000,
    maxSalary: 500000,
    avgSalary: 350000,
    locations: [
      { city: "Bangalore", multiplier: 1.1 },
      { city: "Mumbai", multiplier: 1.1 },
      { city: "Delhi NCR", multiplier: 1.05 },
      { city: "Hyderabad", multiplier: 1.0 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.9 },
    ],
    skills: ["Selenium", "Manual Testing", "JIRA", "API Testing"],
    growth: "+10%",
  },
  {
    role: "Cybersecurity Analyst",
    category: "Security",
    experience: "Fresher (0-1 years)",
    minSalary: 350000,
    maxSalary: 700000,
    avgSalary: 500000,
    locations: [
      { city: "Bangalore", multiplier: 1.2 },
      { city: "Mumbai", multiplier: 1.15 },
      { city: "Delhi NCR", multiplier: 1.15 },
      { city: "Hyderabad", multiplier: 1.05 },
      { city: "Pune", multiplier: 1.0 },
      { city: "Chennai", multiplier: 0.95 },
    ],
    skills: ["Network Security", "SIEM", "Ethical Hacking", "Linux"],
    growth: "+30%",
  },
  {
    role: "Product Manager",
    category: "Product",
    experience: "Mid-Level (2-4 years)",
    minSalary: 1200000,
    maxSalary: 3000000,
    avgSalary: 2000000,
    locations: [
      { city: "Bangalore", multiplier: 1.25 },
      { city: "Mumbai", multiplier: 1.2 },
      { city: "Delhi NCR", multiplier: 1.1 },
      { city: "Hyderabad", multiplier: 1.0 },
      { city: "Pune", multiplier: 0.95 },
      { city: "Chennai", multiplier: 0.9 },
    ],
    skills: ["Product Strategy", "Analytics", "Agile", "SQL"],
    growth: "+18%",
  },
];

const categories = ["All", "Development", "Data & AI", "Cloud & DevOps", "Testing", "Security", "Product"];
const experiences = ["All", "Fresher (0-1 years)", "Mid-Level (2-4 years)"];
const cities = ["All Cities", "Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai"];

const formatSalary = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
};

const SalaryExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  const filteredData = salaryData.filter((item) => {
    const matchesSearch = item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesExperience = selectedExperience === "All" || item.experience === selectedExperience;
    return matchesSearch && matchesCategory && matchesExperience;
  });

  const getAdjustedSalary = (salary: number, locations: { city: string; multiplier: number }[]) => {
    if (selectedCity === "All Cities") return salary;
    const location = locations.find(l => l.city === selectedCity);
    return location ? Math.round(salary * location.multiplier) : salary;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Tech Salary Explorer - Indian IT Salary Guide | CodeBit360"
        description="Explore tech salary ranges in India by role, experience, and location. Find salary data for Software Developers, Data Scientists, DevOps Engineers and more."
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Tech Salary Explorer
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover salary ranges for tech roles across India. Filter by role, experience level, and city to find accurate compensation data.
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search role or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experiences.map(exp => (
                      <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid gap-4">
            {filteredData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No roles found matching your criteria. Try adjusting filters.
                </CardContent>
              </Card>
            ) : (
              filteredData.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{item.role}</h3>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.experience}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-2 md:min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-5 w-5 text-green-600" />
                          <span className="text-xl font-bold text-green-600">
                            {formatSalary(getAdjustedSalary(item.avgSalary, item.locations))}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Range: {formatSalary(getAdjustedSalary(item.minSalary, item.locations))} - {formatSalary(getAdjustedSalary(item.maxSalary, item.locations))}
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">{item.growth} YoY</span>
                        </div>
                        {selectedCity !== "All Cities" && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Adjusted for {selectedCity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            * Salary data is indicative and based on industry research. Actual compensation may vary based on company, skills, and negotiation.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SalaryExplorer;
