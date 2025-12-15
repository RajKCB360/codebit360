import { forwardRef } from "react";

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
  score?: string;
}

interface ResumeData {
  template: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary: string;
  };
  skills: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
}

interface ResumePreviewProps {
  data: ResumeData;
}

// Classic Template - Clean and traditional
const ClassicTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-black p-6 min-h-[700px]" style={{ fontFamily: "Georgia, serif" }}>
    <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
      <h1 className="text-2xl font-bold tracking-wide text-gray-900">
        {data.personal.fullName || "Your Name"}
      </h1>
      <div className="text-xs text-gray-600 mt-2 flex flex-wrap justify-center gap-3">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>| {data.personal.phone}</span>}
        {data.personal.location && <span>| {data.personal.location}</span>}
      </div>
      <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-3">
        {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
        {data.personal.github && <span>| {data.personal.github}</span>}
      </div>
    </div>

    {data.personal.summary && (
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1">Summary</h2>
        <p className="text-xs leading-relaxed text-gray-700">{data.personal.summary}</p>
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1">Skills</h2>
        <p className="text-xs text-gray-700">{data.skills.join(" • ")}</p>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1">Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-xs">{exp.role}</span>
              <span className="text-xs italic text-gray-500">{exp.duration}</span>
            </div>
            <div className="text-xs text-gray-600 italic">{exp.company}</div>
            <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    )}

    {data.projects.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1">Projects</h2>
        {data.projects.map((proj) => (
          <div key={proj.id} className="mb-3">
            <div className="font-semibold text-xs">{proj.name}</div>
            <div className="text-xs text-gray-500 italic">{proj.technologies}</div>
            <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
          </div>
        ))}
      </div>
    )}

    {data.education.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-xs">{edu.degree}</span>
              <span className="text-xs italic text-gray-500">{edu.year}</span>
            </div>
            <div className="text-xs text-gray-600">{edu.institution} {edu.score && `• ${edu.score}`}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Modern Template - Sleek with accent color
const ModernTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-black p-6 min-h-[700px]" style={{ fontFamily: "Arial, sans-serif" }}>
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-indigo-700">
        {data.personal.fullName || "Your Name"}
      </h1>
      <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-3">
        {data.personal.email && <span className="flex items-center gap-1">📧 {data.personal.email}</span>}
        {data.personal.phone && <span className="flex items-center gap-1">📱 {data.personal.phone}</span>}
        {data.personal.location && <span className="flex items-center gap-1">📍 {data.personal.location}</span>}
      </div>
      <div className="text-xs text-indigo-600 mt-1 flex flex-wrap gap-3">
        {data.personal.linkedin && <span>🔗 {data.personal.linkedin}</span>}
        {data.personal.github && <span>💻 {data.personal.github}</span>}
      </div>
    </div>

    <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-500 mb-4 rounded" />

    {data.personal.summary && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">👤</span>
          PROFILE
        </h2>
        <p className="text-xs leading-relaxed text-gray-700 pl-8">{data.personal.summary}</p>
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">⚡</span>
          SKILLS
        </h2>
        <div className="flex flex-wrap gap-1 pl-8">
          {data.skills.map((skill, i) => (
            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">💼</span>
          EXPERIENCE
        </h2>
        <div className="pl-8 space-y-3">
          {data.experience.map((exp) => (
            <div key={exp.id} className="border-l-2 border-indigo-200 pl-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-xs text-gray-900">{exp.role}</span>
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{exp.duration}</span>
              </div>
              <div className="text-xs text-gray-600 font-medium">{exp.company}</div>
              <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.projects.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">🚀</span>
          PROJECTS
        </h2>
        <div className="pl-8 space-y-3">
          {data.projects.map((proj) => (
            <div key={proj.id} className="border-l-2 border-indigo-200 pl-3">
              <div className="font-semibold text-xs text-gray-900">{proj.name}</div>
              <div className="text-xs text-indigo-600">{proj.technologies}</div>
              <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.education.length > 0 && (
      <div className="mb-4">
        <h2 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">🎓</span>
          EDUCATION
        </h2>
        <div className="pl-8 space-y-2">
          {data.education.map((edu) => (
            <div key={edu.id} className="border-l-2 border-indigo-200 pl-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-xs">{edu.degree}</span>
                <span className="text-xs text-indigo-600">{edu.year}</span>
              </div>
              <div className="text-xs text-gray-600">{edu.institution} {edu.score && `• ${edu.score}`}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Creative Template - Two-column with sidebar
const CreativeTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-black min-h-[700px] flex" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
    {/* Sidebar */}
    <div className="w-1/3 bg-gradient-to-b from-teal-600 to-teal-800 text-white p-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
          {data.personal.fullName?.charAt(0) || "?"}
        </div>
        <h1 className="text-lg font-bold">{data.personal.fullName || "Your Name"}</h1>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <h3 className="font-bold uppercase tracking-wider border-b border-white/30 pb-1 mb-2">Contact</h3>
          <div className="space-y-1 opacity-90">
            {data.personal.email && <p>📧 {data.personal.email}</p>}
            {data.personal.phone && <p>📱 {data.personal.phone}</p>}
            {data.personal.location && <p>📍 {data.personal.location}</p>}
            {data.personal.linkedin && <p>🔗 {data.personal.linkedin}</p>}
            {data.personal.github && <p>💻 {data.personal.github}</p>}
          </div>
        </div>

        {data.skills.length > 0 && (
          <div>
            <h3 className="font-bold uppercase tracking-wider border-b border-white/30 pb-1 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/20 rounded text-xs">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <h3 className="font-bold uppercase tracking-wider border-b border-white/30 pb-1 mb-2">Education</h3>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="font-semibold">{edu.degree}</div>
                <div className="opacity-80">{edu.institution}</div>
                <div className="opacity-70">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Main Content */}
    <div className="w-2/3 p-5">
      {data.personal.summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">About Me</h2>
          <p className="text-xs leading-relaxed text-gray-700">{data.personal.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">Work Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3 pl-3 border-l-2 border-teal-300">
              <div className="flex justify-between">
                <span className="font-semibold text-xs text-gray-900">{exp.role}</span>
                <span className="text-xs text-teal-600">{exp.duration}</span>
              </div>
              <div className="text-xs text-gray-600">{exp.company}</div>
              <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-3 pl-3 border-l-2 border-teal-300">
              <div className="font-semibold text-xs text-gray-900">{proj.name}</div>
              <div className="text-xs text-teal-600">{proj.technologies}</div>
              <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Minimal Template - Clean and spacious
const MinimalTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-black p-8 min-h-[700px]" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
    <div className="mb-6">
      <h1 className="text-3xl font-light text-gray-900 tracking-tight">
        {data.personal.fullName || "Your Name"}
      </h1>
      <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-4">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-4">
        {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
        {data.personal.github && <span>{data.personal.github}</span>}
      </div>
    </div>

    <div className="h-px bg-gray-200 mb-6" />

    {data.personal.summary && (
      <div className="mb-6">
        <p className="text-xs leading-relaxed text-gray-600">{data.personal.summary}</p>
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Skills</h2>
        <p className="text-xs text-gray-700">{data.skills.join("  ·  ")}</p>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-sm text-gray-900">{exp.role}</span>
                <span className="text-xs text-gray-400">{exp.duration}</span>
              </div>
              <div className="text-xs text-gray-500">{exp.company}</div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.projects.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Projects</h2>
        <div className="space-y-4">
          {data.projects.map((proj) => (
            <div key={proj.id}>
              <div className="font-medium text-sm text-gray-900">{proj.name}</div>
              <div className="text-xs text-gray-400">{proj.technologies}</div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.education.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Education</h2>
        <div className="space-y-3">
          {data.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-sm text-gray-900">{edu.degree}</span>
                <span className="text-xs text-gray-400">{edu.year}</span>
              </div>
              <div className="text-xs text-gray-500">{edu.institution} {edu.score && `· ${edu.score}`}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Professional Dark Template
const DarkTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-gray-900 text-white p-6 min-h-[700px]" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="mb-5">
      <h1 className="text-2xl font-bold text-cyan-400">
        {data.personal.fullName || "Your Name"}
      </h1>
      <div className="text-xs text-gray-400 mt-2 flex flex-wrap gap-3">
        {data.personal.email && <span className="text-cyan-300">{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
      <div className="text-xs text-cyan-400 mt-1 flex flex-wrap gap-3">
        {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
        {data.personal.github && <span>{data.personal.github}</span>}
      </div>
    </div>

    <div className="h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 mb-5" />

    {data.personal.summary && (
      <div className="mb-5">
        <h2 className="text-sm font-bold text-cyan-400 mb-2">// ABOUT</h2>
        <p className="text-xs leading-relaxed text-gray-300">{data.personal.summary}</p>
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-bold text-cyan-400 mb-2">// TECH STACK</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-gray-800 text-cyan-300 text-xs rounded border border-cyan-900">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-bold text-cyan-400 mb-2">// EXPERIENCE</h2>
        <div className="space-y-3">
          {data.experience.map((exp) => (
            <div key={exp.id} className="bg-gray-800/50 p-3 rounded border-l-2 border-cyan-500">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-xs text-white">{exp.role}</span>
                <span className="text-xs text-cyan-400">{exp.duration}</span>
              </div>
              <div className="text-xs text-gray-400">{exp.company}</div>
              <p className="text-xs text-gray-300 mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.projects.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-bold text-cyan-400 mb-2">// PROJECTS</h2>
        <div className="space-y-3">
          {data.projects.map((proj) => (
            <div key={proj.id} className="bg-gray-800/50 p-3 rounded border-l-2 border-blue-500">
              <div className="font-semibold text-xs text-white">{proj.name}</div>
              <div className="text-xs text-blue-400">{proj.technologies}</div>
              <p className="text-xs text-gray-300 mt-2">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.education.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-bold text-cyan-400 mb-2">// EDUCATION</h2>
        <div className="space-y-2">
          {data.education.map((edu) => (
            <div key={edu.id} className="bg-gray-800/50 p-3 rounded">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-xs text-white">{edu.degree}</span>
                <span className="text-xs text-cyan-400">{edu.year}</span>
              </div>
              <div className="text-xs text-gray-400">{edu.institution} {edu.score && `• ${edu.score}`}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Bold Template - High contrast with color blocks
const BoldTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-black p-6 min-h-[700px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
    <div className="bg-gradient-to-r from-orange-500 to-red-500 -m-6 mb-4 p-6 text-white">
      <h1 className="text-2xl font-extrabold tracking-tight">
        {data.personal.fullName?.toUpperCase() || "YOUR NAME"}
      </h1>
      <div className="text-xs mt-2 flex flex-wrap gap-4 opacity-90">
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.location && <span>{data.personal.location}</span>}
      </div>
      <div className="text-xs mt-1 flex flex-wrap gap-4 opacity-80">
        {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
        {data.personal.github && <span>{data.personal.github}</span>}
      </div>
    </div>

    {data.personal.summary && (
      <div className="mb-5">
        <h2 className="text-sm font-extrabold text-orange-500 uppercase tracking-wide mb-2">Profile</h2>
        <p className="text-xs leading-relaxed text-gray-700">{data.personal.summary}</p>
      </div>
    )}

    {data.skills.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-extrabold text-orange-500 uppercase tracking-wide mb-2">Expertise</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-extrabold text-orange-500 uppercase tracking-wide mb-2">Career</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-4 pl-4 border-l-4 border-orange-500">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs text-gray-900">{exp.role}</span>
              <span className="text-xs font-medium text-orange-500">{exp.duration}</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">{exp.company}</div>
            <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    )}

    {data.projects.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-extrabold text-orange-500 uppercase tracking-wide mb-2">Projects</h2>
        {data.projects.map((proj) => (
          <div key={proj.id} className="mb-4 pl-4 border-l-4 border-red-500">
            <div className="font-bold text-xs text-gray-900">{proj.name}</div>
            <div className="text-xs text-orange-500">{proj.technologies}</div>
            <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
          </div>
        ))}
      </div>
    )}

    {data.education.length > 0 && (
      <div className="mb-5">
        <h2 className="text-sm font-extrabold text-orange-500 uppercase tracking-wide mb-2">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-3">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs">{edu.degree}</span>
              <span className="text-xs text-orange-500">{edu.year}</span>
            </div>
            <div className="text-xs text-gray-600">{edu.institution} {edu.score && `• ${edu.score}`}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data }, ref) => {
    const renderTemplate = () => {
      switch (data.template) {
        case "modern":
          return <ModernTemplate data={data} />;
        case "creative":
          return <CreativeTemplate data={data} />;
        case "minimal":
          return <MinimalTemplate data={data} />;
        case "dark":
          return <DarkTemplate data={data} />;
        case "bold":
          return <BoldTemplate data={data} />;
        case "classic":
        default:
          return <ClassicTemplate data={data} />;
      }
    };

    return (
      <div ref={ref} className="rounded-lg shadow-inner overflow-hidden print:shadow-none print:rounded-none">
        {renderTemplate()}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
