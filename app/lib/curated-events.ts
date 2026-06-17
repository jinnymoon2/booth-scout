export type CuratedTechEvent = {
  title: string;
  country: "Korea" | "Japan" | "United States" | "Global";
  city?: string;
  venue?: string;
  sourceName: string;
  sourceUrl: string;
  url: string;
  description: string;
  tags: string[];
  startDate: string;
  endDate: string;
};

export const CURATED_TECH_EVENTS: CuratedTechEvent[] = [
  {
    title: "KubeCon + CloudNativeCon India 2026",
    country: "Global",
    city: "Hyderabad",
    venue: "Hyderabad International Convention Centre",
    sourceName: "Linux Foundation Events",
    sourceUrl: "https://events.linuxfoundation.org/",
    url: "https://events.linuxfoundation.org/",
    description:
      "Cloud native, Kubernetes, DevOps, platform engineering, and open source infrastructure conference.",
    tags: ["cloud", "Kubernetes", "DevOps", "open source", "platform"],
    startDate: "2026-06-18",
    endDate: "2026-06-19",
  },
  {
    title: "KubeCon + CloudNativeCon Japan 2026",
    country: "Japan",
    city: "Yokohama",
    venue: "Yokohama",
    sourceName: "Linux Foundation Events",
    sourceUrl:
      "https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/",
    url: "https://events.linuxfoundation.org/kubecon-cloudnativecon-japan/",
    description:
      "Japan edition of KubeCon + CloudNativeCon for Kubernetes, cloud native infrastructure, platform teams, and open source communities.",
    tags: ["cloud", "Kubernetes", "DevOps", "open source", "infrastructure"],
    startDate: "2026-07-28",
    endDate: "2026-07-30",
  },
  {
    title: "Black Hat USA 2026",
    country: "United States",
    city: "Las Vegas",
    venue: "Mandalay Bay Convention Center",
    sourceName: "Black Hat",
    sourceUrl: "https://blackhat.com/upcoming.html",
    url: "https://blackhat.com/upcoming.html",
    description:
      "Major cybersecurity conference featuring trainings, briefings, security research, and enterprise security vendors.",
    tags: ["cybersecurity", "security", "enterprise", "network"],
    startDate: "2026-08-01",
    endDate: "2026-08-06",
  },
  {
    title: "Dreamforce 2026",
    country: "United States",
    city: "San Francisco",
    venue: "Moscone Center",
    sourceName: "Salesforce Dreamforce",
    sourceUrl: "https://www.salesforce.com/dreamforce/",
    url: "https://www.salesforce.com/dreamforce/",
    description:
      "Enterprise cloud, CRM, AI agents, data, customer experience, and Salesforce ecosystem conference.",
    tags: ["enterprise", "cloud", "AI", "SaaS", "data"],
    startDate: "2026-09-15",
    endDate: "2026-09-17",
  },
  {
    title: "SecTor 2026",
    country: "Global",
    city: "Toronto",
    venue: "Metro Toronto Convention Centre",
    sourceName: "Black Hat",
    sourceUrl: "https://blackhat.com/upcoming.html",
    url: "https://blackhat.com/upcoming.html",
    description:
      "Cybersecurity conference for security practitioners, researchers, and enterprise technology teams.",
    tags: ["cybersecurity", "security", "enterprise", "network"],
    startDate: "2026-10-06",
    endDate: "2026-10-08",
  },
  {
    title: "TechCrunch Disrupt 2026",
    country: "United States",
    city: "San Francisco",
    venue: "Moscone West",
    sourceName: "TechCrunch",
    sourceUrl: "https://techcrunch.com/events/techcrunch-disrupt/",
    url: "https://techcrunch.com/events/techcrunch-disrupt/",
    description:
      "Startup and venture capital conference focused on founders, investors, product launches, and Startup Battlefield.",
    tags: ["startup", "venture", "founders", "SaaS", "AI"],
    startDate: "2026-10-13",
    endDate: "2026-10-15",
  },
  {
    title: "Black Hat India 2026",
    country: "Global",
    city: "Bengaluru",
    venue: "Sheraton Grand Bengaluru",
    sourceName: "Black Hat",
    sourceUrl: "https://blackhat.com/upcoming.html",
    url: "https://blackhat.com/upcoming.html",
    description:
      "Security conference focused on cybersecurity research, enterprise security, and regional security communities.",
    tags: ["cybersecurity", "security", "enterprise", "network"],
    startDate: "2026-10-27",
    endDate: "2026-10-30",
  },
  {
    title: "GitHub Universe 2026",
    country: "United States",
    city: "San Francisco",
    venue: "Fort Mason Pavilion",
    sourceName: "GitHub Universe",
    sourceUrl: "https://githubuniverse.com/",
    url: "https://githubuniverse.com/",
    description:
      "GitHub's flagship developer event covering software development, AI coding agents, open source, DevOps, and the future of code.",
    tags: ["developer", "software", "AI", "open source", "DevOps"],
    startDate: "2026-10-28",
    endDate: "2026-10-29",
  },
  {
    title: "Web Summit Lisbon 2026",
    country: "Global",
    city: "Lisbon",
    venue: "MEO Arena",
    sourceName: "Web Summit",
    sourceUrl: "https://websummit.com/web-summit-2026/",
    url: "https://websummit.com/web-summit-2026/",
    description:
      "Global technology conference covering startups, AI, enterprise technology, investors, founders, and digital policy.",
    tags: ["startup", "AI", "enterprise", "venture", "technology"],
    startDate: "2026-11-09",
    endDate: "2026-11-12",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    country: "United States",
    city: "Los Angeles",
    venue: "Los Angeles Convention Center",
    sourceName: "Linux Foundation Events",
    sourceUrl: "https://events.linuxfoundation.org/",
    url: "https://events.linuxfoundation.org/",
    description:
      "North America cloud native conference for Kubernetes, containers, platform engineering, DevOps, and open source infrastructure.",
    tags: ["cloud", "Kubernetes", "DevOps", "open source", "infrastructure"],
    startDate: "2026-11-09",
    endDate: "2026-11-12",
  },
  {
    title: "AWS re:Invent 2026",
    country: "United States",
    city: "Las Vegas",
    venue: "Las Vegas",
    sourceName: "AWS",
    sourceUrl: "https://aws.amazon.com/events/reinvent/",
    url: "https://aws.amazon.com/events/reinvent/",
    description:
      "AWS flagship cloud computing conference covering AI, cloud architecture, security, data, infrastructure, and developer tools.",
    tags: ["cloud", "AI", "security", "data", "developer"],
    startDate: "2026-11-30",
    endDate: "2026-12-04",
  },
  {
    title: "Black Hat Middle East & Africa 2026",
    country: "Global",
    city: "Riyadh",
    venue: "Riyadh Exhibition & Convention Center",
    sourceName: "Black Hat",
    sourceUrl: "https://blackhat.com/upcoming.html",
    url: "https://blackhat.com/upcoming.html",
    description:
      "Cybersecurity conference for security research, enterprise defense, and regional security communities.",
    tags: ["cybersecurity", "security", "enterprise", "network"],
    startDate: "2026-12-01",
    endDate: "2026-12-03",
  },
  {
    title: "Black Hat Europe 2026",
    country: "Global",
    city: "London",
    venue: "ExCeL London",
    sourceName: "Black Hat",
    sourceUrl: "https://blackhat.com/upcoming.html",
    url: "https://blackhat.com/upcoming.html",
    description:
      "European cybersecurity conference with trainings, briefings, enterprise security, and security research.",
    tags: ["cybersecurity", "security", "enterprise", "network"],
    startDate: "2026-12-07",
    endDate: "2026-12-10",
  },
  {
    title: "CES 2027",
    country: "United States",
    city: "Las Vegas",
    venue: "Las Vegas",
    sourceName: "CES",
    sourceUrl: "https://www.ces.tech/attend/registration-notification/",
    url: "https://www.ces.tech/attend/registration-notification/",
    description:
      "Global consumer technology and innovation event covering AI, robotics, digital health, mobility, hardware, and enterprise technology.",
    tags: ["AI", "robotics", "hardware", "mobility", "electronics"],
    startDate: "2027-01-06",
    endDate: "2027-01-09",
  },
  {
    title: "NEPCON Japan 2027",
    country: "Japan",
    city: "Tokyo",
    venue: "Tokyo Big Sight",
    sourceName: "NEPCON Japan",
    sourceUrl: "https://www.nepconjapan.jp/tokyo/en-gb.html",
    url: "https://www.nepconjapan.jp/tokyo/en-gb.html",
    description:
      "Electronics manufacturing, R&D, semiconductor packaging, components, and hardware technology exhibition.",
    tags: ["electronics", "semiconductor", "hardware", "manufacturing"],
    startDate: "2027-02-17",
    endDate: "2027-02-19",
  },
  {
    title: "RSAC Conference 2027",
    country: "United States",
    city: "San Francisco",
    venue: "Moscone Center",
    sourceName: "RSA Conference",
    sourceUrl: "https://www.rsaconference.com/",
    url: "https://www.rsaconference.com/",
    description:
      "Major cybersecurity conference for enterprise security, risk, compliance, cloud security, and security innovation.",
    tags: ["cybersecurity", "security", "enterprise", "cloud"],
    startDate: "2027-04-05",
    endDate: "2027-04-08",
  },
  {
    title: "Japan IT Week Spring 2027",
    country: "Japan",
    city: "Tokyo",
    venue: "Tokyo Big Sight",
    sourceName: "Japan IT Week",
    sourceUrl: "https://www.japan-it.jp/spring/en-gb.html",
    url: "https://www.japan-it.jp/spring/en-gb.html",
    description:
      "Japan IT/DX trade show covering software, digital transformation, cloud, sales technology, e-commerce, and enterprise IT.",
    tags: ["software", "DX", "cloud", "enterprise", "SaaS"],
    startDate: "2027-04-07",
    endDate: "2027-04-09",
  },
];
