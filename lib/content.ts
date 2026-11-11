// All site copy lives here. Edit this file to update the site.

export const site = {
  name: "Luke Horton",
  /** Job title, shown under the name in the hero, in the footer and the page title. */
  title: "Electrical Engineer I, Systems",
  officialTitle: "Electrical Engineer I, Systems",
  company: "True Anomaly",
  location: "Long Beach, California",
  city: "Long Beach, CA",
  url: "https://www.lukehorton.me",
  email: "lukerhorton4@gmail.com",
  resume: "/Luke-Horton-Resume.pdf",
  /** The PDF is older than the site; say so wherever it is linked. */
  resumeDate: "Aug 2026",
  gaId: "G-7JRD0V232N",
  tagline: "Spacecraft data interfaces and integrated test.",
  description:
    "Luke Horton is an Electrical Engineer I, Systems at True Anomaly, working on spacecraft data interfaces, interface control documents and integrated test. B.S. Aerospace Engineering, San Diego State University (2026).",
  links: {
    linkedin: "https://www.linkedin.com/in/luke-r-horton",
    github: "https://github.com/lukerhort",
  },
};

export const about = {
  heading: "Systems first, down to the board.",
  paragraphs: [
    "I'm an Electrical Engineer I, Systems at True Anomaly. I work on the data side of spacecraft electrical systems at the vehicle level: how the components talk to each other over RS-422, Ethernet and CAN, and what every input and output is used for.",
    "I studied Aerospace Engineering at San Diego State University, where I led avionics on a ground-effect vehicle and performance analysis on a carrier fighter design. I started at True Anomaly as a Program Manager Intern in summer 2026 and moved into engineering that September.",
    "On my own time I build ATLAS, an AI assistant that runs on my PC and my phone.",
  ],
  facts: [
    { label: "Current", value: "Electrical Engineer I, Systems · True Anomaly" },
    { label: "Based", value: "Long Beach, CA" },
    { label: "Education", value: "B.S. Aerospace Engineering, SDSU '26" },
    { label: "Focus", value: "Data interfaces · ICDs · Integrated test" },
  ],
};

export type Role = {
  title: string;
  org: string;
  type?: string;
  dates: string;
  location?: string;
  body: string[];
};

export const experience: Role[] = [
  {
    title: "Electrical Engineer I, Systems",
    org: "True Anomaly",
    type: "Full-time",
    dates: "Sep 2026 – Present",
    location: "Long Beach, California",
    body: [
      "I'm responsible for the vehicle-level electrical design of two products, on the data side: RS-422, Ethernet and CAN. Other engineers own power, and we work with them closely. I also own the avionics side of an integrated test campaign.",
      "Most of the work is block diagrams of the data interface architecture, I/O allocation for every component, and interface control documents (ICDs). I work from the ICDs of the components we buy and write them for the ones we build. I help with harnessing and test procedures, mostly in Altium.",
    ],
  },
  {
    title: "Program Manager Intern",
    org: "True Anomaly",
    type: "Internship",
    dates: "Jun 2026 – Aug 2026",
    location: "Denver, Colorado",
    body: [
      "Built a library of program and engineering templates for the company's defense-space programs: milestone reviews and documents (SRD, ICD, PDR/CDR/TRR, IBR, WBS), with entry and exit criteria checked against DoD 5000, NASA and INCOSE standards.",
      "Built an AI tool that fills in milestone review decks from one program input. It cut processing cost by about 94%.",
    ],
  },
  {
    title: "External Structures Engineer",
    org: "SDSU Rocket Project",
    dates: "Fall 2023 – Fall 2024",
    location: "San Diego, California",
    body: [
      "Ran structural analysis and testing on rocket launch lugs, and updated SolidWorks CAD and drawings so the parts could be made and fitted.",
    ],
  },
];

export type ProjectImage = {
  src: string;
  alt: string;
  /** Short label shown under the gallery frame. */
  caption: string;
  width: number;
  height: number;
  fit?: "contain";
  /** With fit "contain": the margin around the image inside the frame (default is a wide one). */
  pad?: "tight" | "none";
  /** Presentational: a mostly-white image that is dimmed slightly to sit on the dark page. */
  tone?: "light";
};

export type Project = {
  name: string;
  subtitle: string;
  tag: string;
  role: string;
  status: "Complete" | "In Progress" | "Paused";
  summary: string;
  details: string[];
  stats: string[];
  /** Project website, if there is one. */
  href?: string;
  /** Source code repository, shown as a second link next to the project site. */
  repo?: string;
  /** Primary image (first in the gallery). */
  image: ProjectImage;
  /** Additional real build / design images shown in the gallery. */
  gallery: ProjectImage[];
};

export const projects: Project[] = [
  {
    name: "ATLAS",
    subtitle: "AI Assistant",
    tag: "Personal Project · 2026",
    role: "Solo build",
    status: "In Progress",
    summary:
      "An AI assistant that runs on my PC and my phone. I give it a goal. It plans the work, hands tasks to AI agents, checks the results, and asks me before it does anything risky.",
    details: [
      "One Node.js process runs it all. An orchestrator turns a goal into a task graph, runs agents in parallel on Claude, GPT, Grok and Gemini, reviews what comes back and replans. State is kept in SQLite, so work survives a restart.",
      "The phone app is Expo and React Native. It shows my day, the missions that are running, and anything that needs my approval. Shell commands and emails wait for a yes.",
    ],
    stats: ["TypeScript · Node.js", "SQLite", "Expo · React Native"],
    image: {
      src: "/images/atlas-architecture.webp",
      alt: "ATLAS block diagram: a phone app sends goals to a server on a PC that holds a chief agent, an orchestrator, model providers, tools and a SQLite database",
      caption: "System block diagram",
      width: 1400,
      height: 1050,
      fit: "contain",
      pad: "none",
    },
    gallery: [
      {
        src: "/images/atlas-mission.webp",
        alt: "ATLAS mission flow: goal, plan, task graph, parallel agents, review, then approval on the phone before any outside action",
        caption: "How a goal runs",
        width: 1400,
        height: 1050,
        fit: "contain",
        pad: "none",
      },
    ],
  },
  {
    name: "Barrelborne",
    subtitle: "Ground Effect Vehicle",
    tag: "AE 403W · Senior Design",
    role: "Project Manager · Avionics Lead & Pilot",
    status: "Complete",
    summary:
      "An RC-scale wing-in-ground-effect vehicle. Four SDSU seniors designed it, built it and flew it in one semester.",
    details: [
      "I led the four-person team and owned the schedule.",
      "I did all the avionics: a Pixhawk 6C on ArduPlane with an ExpressLRS link, seven control surfaces on six PWM channels, and battery monitoring with voltage and current failsafes. I tuned the fly-by-wire modes in flight test until it ran in ground effect at 42.7 mph.",
    ],
    stats: ["Flew @ 42.7 mph", "20 lb airframe", "Pixhawk 6C"],
    href: "https://www.barrelborne.co/",
    image: {
      src: "/images/barrelborne.webp",
      alt: "Barrelborne WIG vehicle and the four-person team at SDSU Senior Design Day",
      caption: "Senior Design Day",
      width: 1200,
      height: 900,
    },
    gallery: [
      {
        src: "/images/barrelborne-avionics.webp",
        alt: "Barrelborne fuselage opened up, with its wiring run out to a Pixhawk flight controller, a power board and a telemetry radio",
        caption: "Avionics wiring",
        width: 1000,
        height: 750,
      },
      {
        src: "/images/barrelborne-power-harness.webp",
        alt: "Barrelborne power wiring laid out on a chair: a small distribution board with red and black leads ending in yellow connectors",
        caption: "Power wiring",
        width: 1000,
        height: 750,
      },
      {
        src: "/images/barrelborne-assembly.webp",
        alt: "Assembled Barrelborne airframe on grass, showing the wing, four motor pods and the tail",
        caption: "Assembled airframe",
        width: 1000,
        height: 750,
      },
    ],
  },
  {
    name: "Aleborne",
    subtitle: "F-44 Strike Fighter",
    tag: "AE 460A/B · AIAA Capstone",
    role: "Performance Lead & Systems Engineer",
    status: "Complete",
    summary:
      "A carrier-based strike fighter designed for the AIAA Navy RFP. Seven SDSU students, one replacement for the F/A-18E/F Super Hornet.",
    details: [
      "I led performance and test planning. I turned the mission and carrier requirements into verification metrics, owned weight estimation, wing sizing and takeoff and landing analysis, and built the MATLAB sizing models. I wrote the technical memos for PDR and CDR.",
      "I ran parametric sweeps to find our carrier-suitability margins, then locked the configuration for CDR.",
    ],
    stats: ["M 1.84 dash", "+7.5g", "63,464 lb MTOW"],
    href: "https://lukerhort.github.io/aleborne/",
    image: {
      src: "/images/aleborne.webp",
      tone: "light",
      alt: "Aleborne F-44 final CAD render, seen from above",
      caption: "Final CAD render",
      width: 1248,
      height: 1090,
    },
    gallery: [
      {
        src: "/images/aleborne-layout.webp",
        tone: "light",
        alt: "Aleborne wireframe CAD view from above, with internal components visible through the outer skin",
        caption: "Wireframe CAD view",
        width: 1000,
        height: 624,
      },
      {
        src: "/images/aleborne-profile.webp",
        tone: "light",
        alt: "Aleborne side profile render with landing gear down",
        caption: "Side profile, gear down",
        width: 1000,
        height: 617,
        fit: "contain",
        pad: "tight",
      },
    ],
  },
  {
    name: "Daedalus",
    subtitle: "Flight Computer",
    tag: "Personal Project · 2026",
    role: "Solo: Firmware & Test",
    status: "Paused",
    summary:
      "A flight computer for a high-power rocket, on a Teensy 4.1. It is paused at sensor bring-up and has not flown.",
    details: [
      "All the flight logic sits behind a hardware abstraction layer. The same state machine and estimator compile for the Teensy and for a desktop simulator.",
      "The simulator is fed OpenRocket trajectories. Its tests run in GitHub Actions on every commit.",
    ],
    stats: ["Teensy 4.1", "C++17", "SITL tests in CI"],
    href: "https://lukerhort.github.io/daedalus-site/",
    repo: "https://github.com/lukerhort/daedalus",
    image: {
      src: "/images/daedalus-breadboard.webp",
      alt: "Teensy 4.1 on a breadboard, wired to a SparkFun pressure sensor breakout",
      caption: "Breadboard bring-up",
      width: 1000,
      height: 750,
    },
    gallery: [
      {
        src: "/images/daedalus.webp",
        tone: "light",
        alt: "Daedalus flight computer logo",
        caption: "Project mark",
        width: 900,
        height: 900,
        fit: "contain",
      },
    ],
  },
];

export const education = {
  degree: "B.S. Aerospace Engineering",
  school: "San Diego State University",
  date: "Graduated May 2026",
  coursework: [
    "Spacecraft Attitude Dynamics & Control",
    "Feedback Flight Control",
    "Astrodynamics",
    "Rocket & Space Propulsion",
    "Aircraft Stability & Control",
    "Programming & Numerical Methods",
  ],
  /** Short context lines: roles outside the space industry. */
  also: ["President, Kappa Alpha Order (2024)", "Inside Sales Engineer Intern, DMG Corporation (2025 – 2026)"],
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Electrical Systems",
    items: ["RS-422", "Ethernet", "CAN", "Interface Control Documents", "I/O Allocation", "Block Diagrams", "Harnessing", "Test Procedures"],
  },
  {
    group: "Design & PLM Tools",
    items: ["Altium Designer", "Visio", "Excel", "Siemens NX", "Teamcenter", "Jira", "Confluence", "Duro"],
  },
  {
    group: "Embedded & Software",
    items: ["Pixhawk 6C", "ArduPilot", "MAVLink", "Teensy 4.1", "C++17 / PlatformIO", "Python", "TypeScript / Node.js", "pytest", "GitHub Actions (CI)", "MATLAB", "Git"],
  },
  {
    group: "CAD & Fabrication",
    items: ["SolidWorks", "GD&T", "3D Printing", "MIG / TIG Welding", "Machining", "Soldering"],
  },
];

export const nav = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];
