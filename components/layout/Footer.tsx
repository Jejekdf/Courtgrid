import Link from "next/link";
import {
  Globe,
  MonitorPlay,
  MessageSquare,
  MapPin,
  Mail,
  Phone,
  Hexagon,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const company = [
    { title: "About Us", href: "/#about" },
    { title: "Careers", href: "#" },
    { title: "Contact", href: "#" },
  ];

  const resources = [
    { title: "Terms of Service", href: "#" },
    { title: "Privacy Policy", href: "#" },
    { title: "FAQ", href: "#" },
  ];

  const socialLinks = [
    { icon: <Globe className="w-5 h-5" />, link: "#" },
    { icon: <MonitorPlay className="w-5 h-5" />, link: "#" },
    { icon: <MessageSquare className="w-5 h-5" />, link: "#" },
  ];

  return (
    <footer className="w-full bg-zinc-50 border-t border-zinc-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group w-max outline-none [-webkit-tap-highlight-color:transparent]">
              <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-[0.98]">
                <Hexagon className="absolute inset-0 w-full h-full text-zinc-950 fill-zinc-950/5 stroke-[1.5]" />
                <img src="/favicon.ico" alt="CourtGrid Logo" className="absolute w-4 h-4 object-contain" />
              </div>
              <span className="text-zinc-950 font-bold tracking-tight text-xl">
                CourtGrid
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              The premium sports venue reservation platform. Book your favorite courts instantly with our Anti-Palkor system.
            </p>
            <div className="flex gap-3 mt-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50 rounded-md transition-colors border border-transparent hover:border-zinc-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Resources Column */}
            <div className="flex flex-col gap-3">
              <span className="text-zinc-950 font-semibold text-sm uppercase tracking-wider mb-1">
                Resources
              </span>
              <div className="flex flex-col gap-2.5">
                {resources.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className="w-max text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company Column */}
            <div className="flex flex-col gap-3">
              <span className="text-zinc-950 font-semibold text-sm uppercase tracking-wider mb-1">
                Company
              </span>
              <div className="flex flex-col gap-2.5">
                {company.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    href={href}
                    className="w-max text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Contact Column */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
              <span className="text-zinc-950 font-semibold text-sm uppercase tracking-wider mb-1">
                Contact
              </span>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-zinc-500">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-sm">123 Blok M, Jakarta Selatan 12190</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span className="text-sm">+62 877 4628 8262</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="text-sm">mail@courtgrid.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-400 text-sm">
              &copy; {year} CourtGrid. All rights reserved.
            </p>
            <p className="text-zinc-400 text-sm">
              Designed with <span className="text-zinc-300">Love</span> by Randi Maulana
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
