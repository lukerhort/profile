// All site copy lives here. Edit this file to update the site.
// Search for "TODO" to find places that still need details from Luke.

export const site = {
  name: "Luke Horton",
  title: "Avionics Engineer",
  company: "True Anomaly",
  location: "Long Beach, California",
  city: "Long Beach, CA",
  url: "https://www.lukehorton.me",
  email: "lukerhorton4@gmail.com",
  resume: "/Luke Horton Resume.pdf",
  gaId: "G-7JRD0V232N",
  description:
    "Luke Horton is an Avionics Engineer at True Anomaly working on vehicle avionics for space systems. B.S. Aerospace Engineering, San Diego State University (2026).",
  links: {
    linkedin: "https://www.linkedin.com/in/luke-r-horton",
    github: "https://github.com/lukerhort",
  },
};

export const about = {
  heading: "Vehicle avionics for space systems.",
  paragraphs: [
    "I'm an Avionics Engineer at True Anomaly, working on vehicle avionics for space systems. My background spans aerospace engineering, systems engineering, avionics integration, performance analysis, and technical program execution.",
    "Before this role I was a Program Manager Intern at True Anomaly. At San Diego State University I studied Aerospace Engineering and worked on aircraft performance, avionics, and systems engineering projects.",
    "I'm most interested in spacecraft avionics, systems engineering, test, and mission-focused engineering work.",
  ],
  facts: [
    { label: "Current", value: "Avionics Engineer, True Anomaly" },
    { label: "Based", value: "Long Beach, CA" },
    { label: "Education", value: "B.S. Aerospace Engineering, SDSU '26" },
    { label: "Focus", value: "Spacecraft avionics · Systems · Test" },
  ],
};

export type Role = {
  title: string;
  org: string;
  type?: string;
  dates: string;
  location?: string;
  body: string[];
  todo?: string;
};

export const experience: Role[] = [
  {
    title: "Avionics Engineer",
    org: "True Anomaly",
    type: "Full-time",
    dates: "Sep 2026 – Present",
    location: "Long Beach, California",
    body: ["Working on vehicle avionics for space systems."],
    // TODO(Luke): add 1–3 sentences on your avionics work (keep it within what you can share publicly).
    todo: "Add a short description of your avionics work.",
  },
  {
    title: "Program Manager Intern",
    org: "True Anomaly",
    type: "Internship",
    dates: "Jun 2026 – Aug 2026",
    location: "Denver, Colorado",
    body: [
      "Led an intern project across the company's active defense-space programs: a PMO and engineering template library supporting program-lifecycle execution and design reviews, with templates for major milestones and review gates (SRD, ICD, PDR/CDR/TRR, IBR, WBS) and entry/exit criteria benchmarked against DoD 5000, NASA SE, and INCOSE standards.",
      "Designed and shipped an enterprise-shareable AI tool that auto-populates milestone review decks from a single program input, cutting processing cost ~94%. Worked cross-functionally with engineering, production/test, and software teams.",
    ],
  },
  {
    title: "Inside Sales Engineer Intern",
    org: "DMG Corporation",
    dates: "Sep 2025 – 2026",
    location: "San Diego, California",
    body: [
      "Provided operational support to outside sales engineers: generating quotes, securing vendor pricing, processing sales orders and POs, coordinating with manufacturers, and managing customer status communications.",
    ],
  },
  {
    title: "External Structures Engineer",
    org: "SDSU Rocket Project",
    dates: "Fall 2023 – Fall 2024",
    location: "San Diego, California",
    body: [
      "Performed structural analysis and iterative testing on rocket launch lugs, refined SolidWorks CAD and drawings for manufacturability and subsystem integration, and collaborated in cross-team design reviews to meet structural and schedule constraints.",
    ],
  },
];

export type Project = {
  name: string;
  subtitle: string;
  tag: string;
  role: string;
  status: "Complete" | "In Progress";
  summary: string;
  details: string[];
  stats: string[];
  href: string;
  image: { src: string; alt: string; width: number; height: number; fit?: "contain" };
};

export const projects: Project[] = [
  {
    name: "Aleborne",
    subtitle: "F-44 Strike Fighter",
    tag: "AE 460A/B · AIAA Capstone",
    role: "Performance Lead & Systems Engineer",
    status: "Complete",
    summary:
      "A carrier-based strike fighter designed for the AIAA Navy RFP: a seven-person SDSU team's take on an F/A-18E/F Super Hornet replacement.",
    details: [
      "Led performance and test-planning analysis: translated mission and carrier requirements into verification metrics, owned weight estimation, wing sizing, and takeoff/landing analyses, and built physics-based MATLAB sizing models (drag polar, T/W–W/S trades, constraint sets), delivering technical memos at PDR and CDR.",
      "Ran structured parametric sweeps and sensitivity checks to quantify carrier-suitability margins, then refined and locked the configuration for CDR based on integrated subsystem feedback.",
    ],
    stats: ["M 1.84 dash", "+7.5g", "63,464 lb MTOW"],
    href: "https://lukerhort.github.io/aleborne/",
    image: { src: "/images/aleborne.webp", alt: "ALEBORNE F-44 Falcon final CAD render", width: 1248, height: 1090 },
  },
  {
    name: "Barrelborne",
    subtitle: "Ground Effect Vehicle",
    tag: "AE 403W · Senior Design",
    role: "Project Manager · Avionics Lead & Pilot",
    status: "Complete",
    summary:
      "An RC-scale wing-in-ground-effect vehicle designed, built, and flown in a single semester by four SDSU seniors.",
    details: [
      "Led a four-person design-build-fly team, owning schedule and scope to hit a single-semester timeline.",
      "Led all avionics and flight software: configured a Pixhawk 6C on ArduPlane with an ExpressLRS link, mapped seven control surfaces across FMU PWM channels, and tuned fly-by-wire flight modes through iterative flight testing to a successful ground-effect run at 42.7 mph.",
    ],
    stats: ["Flew @ 42.7 mph", "20 lb airframe", "Pixhawk 6C"],
    href: "https://www.barrelborne.co/",
    image: { src: "/images/barrelborne.webp", alt: "Barrelborne WIG vehicle and team at SDSU Senior Design Day", width: 1400, height: 1050 },
  },
  {
    name: "Daedalus",
    subtitle: "Flight Computer",
    tag: "Personal Project · 2026",
    role: "Solo: Firmware, Hardware & Test",
    status: "In Progress",
    summary:
      "A high-power rocketry flight computer built from scratch and validated by a full software- and hardware-in-the-loop test pipeline.",
    details: [
      "C++17 firmware on a Teensy 4.1 with IMU, barometer, and GPS, a complementary-filter state machine, MOSFET pyro outputs, and 100 Hz SD logging, alongside a SITL/HITL test pipeline with a 50+ scenario pytest suite in GitHub Actions CI and automated fault injection.",
      "Earned Level 1 high-power rocketry certification and validated apogee and flight data against a commercial reference altimeter.",
    ],
    stats: ["Teensy 4.1", "50+ CI tests", "L1 certified"],
    href: "https://lukerhort.github.io/daedalus-site/",
    image: { src: "/images/daedalus.webp", alt: "Daedalus flight computer logo", width: 900, height: 900, fit: "contain" },
  },
];

export const education = {
  degree: "B.S. Aerospace Engineering",
  school: "San Diego State University",
  date: "Graduated May 2026",
  // TODO(Luke): optionally add GPA, honors, minor, or relevant awards here.
  coursework: [
    "Spacecraft Attitude Dynamics & Control",
    "Feedback Flight Control",
    "Astrodynamics",
    "Rocket & Space Propulsion",
    "Aircraft Stability & Control",
    "Programming & Numerical Methods",
  ],
  certifications: ["Level 1 High-Power Rocketry (HPR)"],
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Avionics & Embedded",
    items: ["Pixhawk 6C", "ArduPilot", "Mission Planner", "MAVLink", "Teensy 4.1", "C++17 / PlatformIO", "IMU / Baro / GPS", "ELRS / SiK Telemetry"],
  },
  {
    group: "Test, Simulation & Programming",
    items: ["SITL / HITL", "Fault Injection", "pytest", "GitHub Actions (CI)", "Python", "C / C++", "MATLAB", "Simulink", "ANSYS", "Linux / SSH", "Git"],
  },
  {
    group: "PMO & PLM Tools",
    items: ["Jira", "Confluence", "Duro", "Teamcenter", "Power BI", "Microsoft Office", "Google Suite"],
  },
  {
    group: "CAD & Fabrication",
    items: ["SolidWorks", "GD&T", "Design for Manufacturability", "3D Printing", "MIG / TIG Welding", "Machining", "Soldering & Electronics"],
  },
];

export const leadership = {
  stats: [
    { value: "170+", label: "Members led" },
    { value: "$200K+", label: "Annual budget" },
  ],
  items: [
    {
      title: "President, Kappa Alpha Order",
      meta: "2024 · IFC Most Improved Chapter",
      body: "Led a 170+ member chapter and a $200K+ annual budget, directing an executive board and 20+ chairs. Drove gains in membership and engagement, earning recognition as IFC Most Improved Chapter (2024).",
    },
    {
      title: "President, San Diego Sales Engineers",
      meta: "National Society of Sales Engineers · SDSU · Fall 2025 – Spring 2026",
      body: "Led chapter operations, planning networking sessions and technical workshops on sales engineering, and represented SDSU at the National Sales Engineering Conference (NSEC) in 2024 and 2025.",
    },
    {
      title: "Fabrication & Personal Projects",
      meta: "Welding · Modular Stage Design",
      body: "Co-led the design and fabrication of a custom 800-lb steel stage for charity events using welding and SolidWorks. Separately designed and built a 700 ft² modular stage system emphasizing repeatable assembly and interchangeable modules.",
    },
  ],
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];
