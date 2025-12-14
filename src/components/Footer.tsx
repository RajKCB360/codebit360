import { Link, useLocation } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About Us", href: "/#about" },
    { name: "Careers", href: "/jobs" },
    { name: "Blog", href: "/#" },
    { name: "Contact", href: "/#contact" },
  ],
  courses: [
    { name: "Python", href: "/#courses" },
    { name: "Web Development", href: "/#courses" },
    { name: "Cloud Computing", href: "/#courses" },
    { name: "Data Science", href: "/#courses" },
  ],
  resources: [
    { name: "Jobs Portal", href: "/jobs" },
    { name: "Internships", href: "/#internships" },
    { name: "Resume Services", href: "/#services" },
    { name: "Dashboard", href: "/dashboard" },
  ],
  support: [
    { name: "Help Center", href: "/#" },
    { name: "FAQs", href: "/#" },
    { name: "Terms of Service", href: "/#" },
    { name: "Privacy Policy", href: "/#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const isExternal = href.startsWith("http");
  const isHashLink = href.startsWith("/#") || href === "#";
  const location = useLocation();
  
  // Handle hash links - if we're not on home page, navigate to home first
  if (isHashLink) {
    const hash = href.replace("/", "");
    if (location.pathname !== "/") {
      return (
        <Link
          to={`/${hash}`}
          className="text-sm text-background/70 hover:text-background transition-colors duration-200 hover:translate-x-1 inline-block"
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={hash}
        className="text-sm text-background/70 hover:text-background transition-colors duration-200 hover:translate-x-1 inline-block"
      >
        {children}
      </a>
    );
  }
  
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-background/70 hover:text-background transition-colors duration-200 hover:translate-x-1 inline-block"
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link
      to={href}
      className="text-sm text-background/70 hover:text-background transition-colors duration-200 hover:translate-x-1 inline-block"
    >
      {children}
    </Link>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-indigo flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">
                Code<span className="text-brand-cyan">Bit360</span>
              </span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm leading-relaxed">
              Empowering CS/IT students with practical skills, real-world
              experience, and career support to land their dream tech jobs.
            </p>

            <div className="space-y-3">
              <a 
                href="mailto:hello@codebit360.com" 
                className="flex items-center gap-3 text-sm text-background/70 hover:text-background transition-colors group"
              >
                <Mail className="w-4 h-4 group-hover:text-brand-cyan transition-colors" />
                <span>hello@codebit360.com</span>
              </a>
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-3 text-sm text-background/70 hover:text-background transition-colors group"
              >
                <Phone className="w-4 h-4 group-hover:text-brand-cyan transition-colors" />
                <span>+91 98765 43210</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4" />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Courses</h4>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} CodeBit360. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-brand-cyan hover:text-foreground transition-all duration-200 hover:scale-110"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
