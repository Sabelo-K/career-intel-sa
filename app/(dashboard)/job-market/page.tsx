"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  RadialBarChart, RadialBar, PieChart, Pie,
} from "recharts";
import { TrendingUp, TrendingDown, Globe, Zap, AlertTriangle, Search, SlidersHorizontal, X, MapPin, GraduationCap, Shield, ChevronRight, Target, MessageCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SA_CAREERS, SA_SECTORS, SCARCE_SKILLS } from "@/lib/data/sa-careers";
import { CAREER_SUBJECTS } from "@/lib/data/sa-subjects";
import { SA_MARKET_STATS } from "@/lib/data/sa-provinces";
import { formatSalaryRange, getDemandBadgeColor, getTrendLabel, getAutomationRiskLabel } from "@/lib/utils";

// ── Data freshness ─────────────────────────────────────────────────────────────
// Update this string each quarter when career data is refreshed.
// Sources: Stats SA QES · DHET Scarce Skills List · Adzuna SA · Robert Walters SA Salary Guide
const DATA_LAST_UPDATED = "May 2026";
const NEXT_UPDATE_DUE   = "September 2026";

// Shared tooltip style — dark background with white text for all charts
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(13,21,38,0.97)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 8,
    fontSize: 12,
    color: "#f1f5f9",
  },
  labelStyle: { color: "#cbd5e1", marginBottom: 4, fontWeight: 600 },
  itemStyle: { color: "#f1f5f9" },
  cursor: { fill: "rgba(99,102,241,0.08)" },
};

const PROVINCE_DATA = [
  { province: "WESTERN_CAPE", score: 78, label: "Western Cape", topOpportunity: "Tech Hub" },
  { province: "GAUTENG", score: 85, label: "Gauteng", topOpportunity: "Financial Centre" },
  { province: "KWAZULU_NATAL", score: 62, label: "KwaZulu-Natal", topOpportunity: "Port Logistics" },
  { province: "EASTERN_CAPE", score: 52, label: "Eastern Cape", topOpportunity: "Automotive" },
  { province: "FREE_STATE", score: 45, label: "Free State", topOpportunity: "Agriculture" },
  { province: "LIMPOPO", score: 48, label: "Limpopo", topOpportunity: "Mining" },
  { province: "MPUMALANGA", score: 55, label: "Mpumalanga", topOpportunity: "Energy" },
  { province: "NORTH_WEST", score: 44, label: "North West", topOpportunity: "Platinum Mining" },
  { province: "NORTHERN_CAPE", score: 58, label: "Northern Cape", topOpportunity: "Renewables" },
];

const SECTOR_PIE_DATA = [
  { name: "Technology", value: 28, fill: "#6366f1" },
  { name: "Healthcare", value: 20, fill: "#10b981" },
  { name: "Finance", value: 16, fill: "#f59e0b" },
  { name: "Engineering", value: 14, fill: "#8b5cf6" },
  { name: "Energy", value: 10, fill: "#06b6d4" },
  { name: "Other", value: 12, fill: "#6b7280" },
];

const CAREER_DESCRIPTIONS: Record<string, string> = {
  "data-scientist":            "Data Scientists uncover patterns in large datasets to drive business decisions, building predictive models and dashboards that turn raw data into strategic insight. They work closely with engineering and product teams to deploy models that create real business value.",
  "software-engineer":         "Software Engineers design, build, and maintain the applications and systems that power modern businesses — from web platforms and mobile apps to APIs and backend services. They write clean, tested code and collaborate across teams to ship reliable products.",
  "cloud-architect":           "Cloud Architects design an organisation's cloud infrastructure, choosing the right mix of AWS, Azure, or GCP services to ensure systems are scalable, secure, and cost-efficient. They set standards for how teams build and operate in the cloud.",
  "cybersecurity-analyst":     "Cybersecurity Analysts protect organisations from digital threats by monitoring networks, investigating incidents, and implementing security controls. They stay ahead of attackers to safeguard sensitive data and maintain compliance.",
  "data-analyst":              "Data Analysts transform raw data into clear reports and visualisations that help business teams make smarter decisions. They use SQL, Excel, and tools like Power BI or Tableau to track performance, spot trends, and answer key business questions.",
  "ai-ml-engineer":            "AI / ML Engineers build the pipelines and infrastructure that take machine learning models from research into production. They bridge data science and software engineering to deliver AI-powered features — recommendation engines, NLP tools, and computer vision systems — at scale.",
  "devops-engineer":           "DevOps Engineers keep software delivery fast and reliable by automating build, test, and deployment pipelines using tools like Docker, Kubernetes, and CI/CD platforms. They reduce downtime, shorten release cycles, and help teams ship with confidence.",
  "product-manager":           "Product Managers define the vision and roadmap for a product, prioritising features based on user research, data, and business strategy. They act as the connective tissue between engineering, design, and stakeholders — translating problems into shipped solutions.",
  "ux-designer":               "UX Designers research user behaviour and craft intuitive digital experiences — wireframes, prototypes, and interfaces that are both visually compelling and easy to use. They advocate for the user at every stage of the product development process.",
  "financial-analyst":         "Financial Analysts evaluate investment opportunities, build financial models, and produce forecasts and recommendations that guide executive and investor decisions. They work across banking, corporate finance, and asset management.",
  "chartered-accountant":      "Chartered Accountants (CA(SA)) manage the full financial health of organisations — from auditing and tax compliance to financial reporting and advisory. Holding one of SA's most respected professional designations, they operate across every sector of the economy.",
  "civil-engineer":            "Civil Engineers plan, design, and oversee the construction of infrastructure — roads, bridges, water systems, and buildings — that underpins communities and drives economic growth. They manage projects from feasibility through to handover.",
  "electrical-engineer":       "Electrical Engineers design power generation, distribution, and control systems for buildings, infrastructure, and industrial plants. They ensure systems are safe, efficient, and compliant with SANS electrical standards.",
  "nurse-professional":        "Professional Nurses provide frontline patient care in hospitals, clinics, and community settings — assessing patient conditions, administering treatment, and coordinating with doctors and allied health professionals. They are registered with the SANC and are the backbone of SA's healthcare system.",
  "renewable-energy-engineer": "Renewable Energy Engineers design and optimise solar, wind, and other clean-energy systems as South Africa accelerates its energy transition away from coal. They work on projects ranging from rooftop solar installations to utility-scale renewable power plants.",
  "supply-chain-manager":      "Supply Chain Managers oversee the end-to-end flow of goods — from suppliers through warehouses to customers — ensuring products arrive on time, at the right cost, and in the right condition. They combine logistics, procurement, and operational expertise.",
  "digital-marketing-specialist": "Digital Marketing Specialists plan and execute online campaigns across SEO, social media, paid advertising, and email to grow brand awareness and drive revenue. They analyse performance data continuously and optimise campaigns to maximise return on spend.",
  "teacher":                   "Teachers educate learners from Grade R through Grade 12, designing lessons, assessing progress, and inspiring curiosity across core and elective subjects. SACE-registered and qualified teachers are the foundation of SA's public and private education system.",
  "blockchain-developer":      "Blockchain Developers build decentralised applications and smart contracts on platforms like Ethereum and Solana. They combine knowledge of cryptography, distributed systems, and software engineering to create trustless digital systems for finance, logistics, and identity.",
  "environmental-scientist":   "Environmental Scientists study the impact of human activity on ecosystems and design solutions to reduce pollution, manage natural resources, and meet SA's growing ESG and regulatory compliance requirements. They work across mining, agriculture, government, and consulting.",
  "electrician-artisan":       "Electrician Artisans install, maintain, and repair electrical wiring and systems in homes, commercial buildings, and industrial facilities. Requiring a trade certificate and registration, they ensure compliance with SANS electrical standards — and demand far outstrips supply.",
  "plumber":                   "Plumbers install and maintain water, drainage, gas, and heating systems in residential and commercial properties. A regulated trade requiring a Certificate of Competence — constant demand is driven by new construction, ageing infrastructure, and geyser replacements.",
  "solar-pv-installer":        "Solar PV Installers fit rooftop and ground-mount photovoltaic systems — panels, inverters, batteries, and wiring — for homes and businesses looking to reduce their dependence on Eskom. One of South Africa's fastest-growing trades.",
  "motor-mechanic":            "Motor Mechanics diagnose and repair vehicle mechanical and electrical faults, from engines and gearboxes to modern onboard diagnostic systems. The trade covers petrol, diesel, and increasingly electric and hybrid vehicles.",
  "welder":                    "Welders join metal components for construction, manufacturing, pipeline, and fabrication projects using MIG, TIG, or arc welding techniques. Skilled coded welders command premium rates and are in constant demand on mines, petrochemical plants, and construction sites.",
  "carpenter":                 "Carpenters construct and install timber structures — frameworks, roofs, built-in cupboards, and fittings — for residential and commercial projects. The trade combines precision craftsmanship with a working knowledge of building regulations.",
  "hvac-technician":           "HVAC Technicians install and service heating, ventilation, and air conditioning systems in commercial buildings, hospitals, and data centres. Load-shedding has driven increased demand for standby cooling solutions and generator integration.",
  "chef":                      "Chefs plan menus, prepare food to a high standard, and manage kitchen operations in restaurants, hotels, lodges, and catering companies. Senior chefs lead kitchen teams, control food costs, and drive the culinary identity of the establishment.",
  "security-officer":          "Security Officers protect people, property, and assets at sites ranging from retail centres to mining operations and residential estates. PSIRA-registered officers work within South Africa's large private security industry — one of the biggest in the world.",
  "social-worker":             "Social Workers support vulnerable individuals, families, and communities — from child protection and poverty alleviation to mental health, substance abuse, and disability services. Registered with the SACSSP, they operate across government, NGOs, and the private sector.",
  "ecd-practitioner":          "ECD Practitioners provide early childhood development education and care to children from birth to age six, building the cognitive, emotional, and social foundations children need before entering formal schooling. Demand is growing rapidly as government expands the ECD subsidy programme.",
  "bookkeeper":                "Bookkeepers record day-to-day financial transactions, reconcile accounts, and prepare reports that keep small and medium businesses compliant and financially healthy. Cloud accounting tools like Xero, Sage, and QuickBooks have made the role more strategic and less manual.",
  "agricultural-technician":   "Agricultural Technicians apply science and technology to improve farming productivity — advising on soil health, crop management, precision irrigation, and pest control. They support SA's significant agricultural and agri-processing sector across all nine provinces.",
  "retail-manager":            "Retail Managers run the daily operations of a store — managing staff, stock levels, merchandising, and customer experience to hit sales targets. Strong commercial acumen and people management skills are essential.",
  "truck-driver":              "Truck Drivers transport goods across South Africa's road network in heavy-duty Code 14 vehicles on long-haul and regional routes. Road freight is SA's primary logistics mode, making experienced drivers with a clean record consistently in demand.",

  // ── Technology (extended) ─────────────────────────────────────────────────
  "full-stack-developer":      "Full Stack Developers build complete web applications end-to-end — from the database and server-side API to the user-facing interface. Comfortable in both front-end (React, Vue) and back-end (Node.js, Python) environments, they are one of the most versatile and in-demand profiles in SA's tech market.",
  "mobile-developer":          "Mobile App Developers build native and cross-platform applications for Android and iOS devices. Using frameworks like React Native and Flutter, they create smooth, responsive apps for banking, retail, health, and consumer platforms — a fast-growing discipline as smartphone usage in SA continues to rise.",
  "database-administrator":    "Database Administrators (DBAs) design, implement, and maintain the databases that store an organisation's most critical data. They tune queries for performance, manage backups and disaster recovery, and ensure data integrity across production systems running on SQL Server, PostgreSQL, Oracle, or cloud-native platforms.",
  "it-support":                "IT Support Specialists are the first responders of the technology department — diagnosing hardware and software issues, managing user accounts, and keeping networks and devices running. They are the most widely employed tech role across all SA industries, from small businesses to enterprise.",
  "network-engineer":          "Network Engineers design, implement, and maintain the network infrastructure that connects an organisation's offices, data centres, and cloud services. With deep expertise in routing, switching, and security, they ensure connectivity is fast, reliable, and protected from intrusion.",
  "bi-developer":              "Business Intelligence Developers build data warehouses, ETL pipelines, and dashboards — turning raw operational data into executive-ready reports using tools like Power BI, Tableau, and SQL. They bridge the gap between raw data and business decision-making.",
  "qa-engineer":               "QA Engineers design and run tests — manual and automated — to catch bugs before they reach users. They build testing frameworks, write test scripts, and work closely with developers to maintain high software quality. As SA tech teams scale up, QA is no longer optional.",
  "solutions-architect":       "Solutions Architects translate complex business requirements into scalable technical designs. They choose technologies, define system boundaries, and guide development teams to build solutions that are secure, performant, and aligned with enterprise strategy.",
  "scrum-master":              "Scrum Masters facilitate agile software delivery by coaching teams on Scrum practices, removing blockers, and fostering a culture of continuous improvement. They are the servant-leaders of agile product teams — valued in any SA organisation running digital projects.",
  "data-engineer":             "Data Engineers build and maintain the pipelines, warehouses, and infrastructure that make data available for analytics and machine learning. They work with tools like Apache Spark, dbt, Airflow, and cloud data platforms, turning raw streams of data into reliable, queryable assets.",

  // ── Healthcare ────────────────────────────────────────────────────────────
  "medical-doctor":            "Medical Doctors (GPs) are the entry point to SA's healthcare system — diagnosing illness, prescribing treatment, and referring patients to specialists. Registered with the HPCSA, they work in public hospitals, private practices, community health centres, and corporate wellness programmes. SA faces a chronic doctor shortage, making this one of the most in-demand professions in the country.",
  "pharmacist":                "Pharmacists dispense medication, counsel patients on drug interactions and dosage, and ensure pharmaceutical safety across hospitals, retail pharmacies, and clinics. Registered with the South African Pharmacy Council (SAPC), they are essential healthcare professionals with growing scope of practice in SA.",
  "physiotherapist":           "Physiotherapists assess and treat physical conditions — from sports injuries and post-surgical recovery to stroke rehabilitation and chronic pain — using exercise, manual therapy, and electrotherapy. They work in hospitals, private practices, sports clubs, and corporates. HPCSA-registered.",
  "radiographer":              "Radiographers operate diagnostic imaging equipment — X-ray, MRI, CT scan, and ultrasound — to produce images that guide medical diagnosis and treatment. They work closely with radiologists and are registered with the HPCSA. Both diagnostic and therapeutic radiography are growing fields in SA.",
  "paramedic":                 "Paramedics and Emergency Medical Technicians (EMTs) respond to medical emergencies, stabilising patients and providing pre-hospital care in life-threatening situations. They work for private ambulance services, the public EMS, mines, and events companies. Registered with the HPCSA under Emergency Care.",
  "psychologist":              "Psychologists assess and treat mental, emotional, and behavioural disorders through psychotherapy, psychometric testing, and evidence-based intervention. With SA's growing mental health awareness and high rates of trauma and depression, registered psychologists are in significant demand across clinical, corporate, and educational settings.",
  "dentist":                   "Dentists diagnose and treat diseases and conditions of the oral cavity — fillings, extractions, root canals, and cosmetic procedures. Registered with the HPCSA, they practice in private surgeries, community dental clinics, and hospital oral health departments. Private dental practices offer strong income potential.",
  "occupational-therapist":    "Occupational Therapists help people with physical, mental, or developmental conditions regain or develop the skills needed for daily life and work. They are HPCSA-registered and work in hospitals, rehabilitation centres, schools for learners with disabilities, and community settings.",

  // ── Finance ───────────────────────────────────────────────────────────────
  "actuary":                   "Actuaries apply advanced mathematical and statistical methods to assess financial risk for insurance companies, pension funds, and banks. Qualifying as a Fellow of the Actuarial Society of South Africa (FASSA) requires years of examinations — but the reward is one of the highest average salaries in SA's financial sector.",
  "tax-consultant":            "Tax Consultants advise individuals and businesses on tax planning, structuring, and compliance with SARS regulations. They prepare tax returns, manage audits, and help clients minimise tax liability within the law. With SA's complex tax code evolving constantly, qualified tax practitioners are always in demand.",
  "financial-planner":         "Financial Planners (CFPs) provide personalised advice on investments, retirement savings, insurance, and estate planning to help clients build and protect wealth. Regulated by the FSCA and requiring a CFP designation, they serve a growing middle class seeking professional money guidance.",
  "compliance-officer":        "Compliance Officers ensure that organisations adhere to financial regulations, industry standards, and internal policies — particularly in banking, insurance, and asset management. As South Africa's regulatory environment becomes more demanding (FICA, POPIA, Twin Peaks), this role has become indispensable.",
  "investment-analyst":        "Investment Analysts research companies, industries, and macroeconomic trends to produce recommendations that guide portfolio managers and traders. They work for asset managers, banks, stockbrokers, and research firms — often specialising in equities, fixed income, or alternative investments on the JSE.",
  "insurance-broker":          "Insurance Brokers assess the risk and insurance needs of individuals and businesses, sourcing the most suitable cover from multiple underwriters. They are FSP-licensed under the FAIS Act and work across short-term, life, and specialist insurance verticals across all nine provinces.",

  // ── Engineering ───────────────────────────────────────────────────────────
  "mechanical-engineer":       "Mechanical Engineers design, develop, and maintain mechanical systems and machinery across manufacturing, mining, automotive, FMCG, and infrastructure sectors. Registered with ECSA, they apply thermodynamics, materials science, and design principles to solve engineering challenges in SA's industrial economy.",
  "chemical-engineer":         "Chemical Engineers design and optimise industrial processes that transform raw materials into products — from petroleum refining and pharmaceutical manufacturing to food processing and water treatment. ECSA-registered, they are key to SA's petrochemical, mining, and manufacturing industries.",
  "structural-engineer":       "Structural Engineers design and analyse load-bearing structures — buildings, bridges, retaining walls, and foundations — ensuring they are safe, stable, and compliant with SANS structural standards. They work alongside architects and project managers on SA's infrastructure and property development projects.",
  "industrial-engineer":       "Industrial Engineers improve the efficiency of complex systems by analysing workflows, removing bottlenecks, and designing better production processes. They work in manufacturing, logistics, mining, and retail — anywhere that process optimisation and waste reduction create measurable value.",
  "project-manager":           "Project Managers plan, execute, and close projects on time, within scope, and on budget. Holding credentials like PMP or PRINCE2, they coordinate people, resources, and risk across industries ranging from construction and IT to healthcare and finance. SA's infrastructure and digital transformation drives strong demand.",

  // ── Mining & Resources ────────────────────────────────────────────────────
  "mining-engineer":           "Mining Engineers plan and oversee the extraction of minerals — gold, platinum, coal, iron ore, and diamonds — from South Africa's vast underground and surface mines. Registered with ECSA, they design mine layouts, manage blasting operations, and ensure DMRE safety and environmental compliance.",
  "geologist":                 "Geologists study the Earth's composition and structure to locate and characterise mineral deposits for mining and exploration. They work in the field and in labs, analysing core samples and producing resource estimates. SA's deep mineral wealth makes geology a strategically important profession.",
  "mine-safety-officer":       "Mine Safety Officers implement and enforce health and safety legislation at mining operations in compliance with the Mine Health and Safety Act. They conduct risk assessments, investigate incidents, and drive a culture of safety on one of the world's most hazardous working environments.",
  "metallurgist":              "Metallurgists optimise the extraction and processing of metals from ore — managing smelting, refining, and recovery processes in SA's platinum, gold, and base-metal operations. They work closely with mining engineers and chemists to maximise mineral recoveries and reduce processing costs.",

  // ── Legal & Compliance ────────────────────────────────────────────────────
  "attorney":                  "Attorneys advise clients on their legal rights and obligations, draft contracts, represent clients in court, and provide specialist legal opinions. Admitted to the High Court through the LPC (Legal Practice Council), they work in private practice, in-house legal teams, the state attorney, and NGOs across all areas of law.",
  "paralegal":                 "Paralegals support attorneys by researching law, preparing legal documents, managing files, and assisting clients with access to justice. They work in law firms, legal aid organisations, and in-house legal departments — a growing profession as demand for affordable legal services increases across SA.",
  "labour-relations":          "Labour Relations Practitioners manage the employment relationship between organisations and their workforce. They handle CCMA disputes, draft employment contracts, advise on BBBEE and LRA compliance, and negotiate with trade unions. SA's complex labour law environment makes this one of the most critical HR-adjacent roles.",

  // ── Human Resources ───────────────────────────────────────────────────────
  "hr-manager":                "HR Managers oversee the full employee lifecycle — recruitment, onboarding, performance management, learning and development, employee relations, and offboarding. They ensure the organisation complies with SA's labour legislation (LRA, BCEA, EEA) and foster a culture that attracts and retains talent.",
  "recruiter":                 "Recruiters (Talent Acquisition Specialists) source, screen, and place candidates into roles across an organisation or for client companies. They build talent pipelines, manage job boards, conduct competency interviews, and partner with hiring managers to secure the right people quickly in a competitive SA talent market.",

  // ── Media & Creative ─────────────────────────────────────────────────────
  "graphic-designer":          "Graphic Designers create visual content — logos, marketing materials, social media assets, packaging, and digital interfaces — that communicate brand identity and drive engagement. They work for agencies, in-house marketing teams, and as freelancers, using tools like Adobe Creative Suite and Figma.",
  "content-creator":           "Content Creators produce written, video, and social media content that builds brand audiences and drives digital engagement. They operate across platforms (YouTube, Instagram, TikTok, LinkedIn) and combine creativity with analytics to grow and monetise communities — an increasingly professionalised role in SA's creator economy.",
  "journalist":                "Journalists research, investigate, and report on news stories across print, broadcast, and digital media. In South Africa's vibrant press landscape — from national newspapers to community news outlets and digital publishers — they hold power to account and keep the public informed.",
  "copywriter":                "Copywriters craft compelling text for advertising campaigns, websites, emails, and product descriptions that persuade and convert audiences. They work for agencies, in-house marketing teams, and as freelancers — blending linguistic skill with an understanding of consumer psychology and brand voice.",
  "video-editor":              "Video Editors assemble raw footage into polished productions for television, film, corporate communications, social media, and advertising. Using tools like Adobe Premiere, DaVinci Resolve, and After Effects, they shape narrative and emotion — a role in growing demand as video dominates digital content consumption.",
  "pr-manager":                "PR Managers shape and protect an organisation's public image by crafting press releases, managing media relationships, coordinating brand communications, and handling reputational crises. They work for corporates, government departments, and agencies — where controlling the narrative is a strategic priority.",

  // ── Property & Construction ───────────────────────────────────────────────
  "estate-agent":              "Estate Agents facilitate the buying, selling, and renting of residential and commercial property. Licensed with the Property Practitioners Regulatory Authority (PPRA), they are commission-driven professionals who combine market knowledge with relationship-building skills in SA's significant property sector.",
  "quantity-surveyor":         "Quantity Surveyors manage the financial and contractual aspects of construction projects — estimating costs, procuring contractors, tracking spend, and settling final accounts. Registered with ASAQS, they are essential on every major building project in South Africa.",
  "site-agent":                "Site Agents (Construction Site Managers) oversee the day-to-day execution of building projects on-site — coordinating subcontractors, enforcing health and safety, managing schedules, and reporting progress to project managers. They are the operational backbone of SA's construction industry.",
  "town-planner":              "Town and Regional Planners (Professional Planners registered with SACPLAN) guide the spatial development of cities, towns, and rural areas — advising on land use, zoning, infrastructure investment, and environmental impact. They work for municipalities, developers, and planning consultancies across SA.",
  "architect":                 "Architects design buildings and spaces that are functional, safe, and aesthetically meaningful — from residential homes and schools to hospitals, offices, and public infrastructure. Registered with SACAP, they manage projects from concept and documentation through to construction oversight.",

  // ── Hospitality & Tourism ─────────────────────────────────────────────────
  "hotel-manager":             "Hotel Managers run the full operation of accommodation establishments — overseeing front of house, housekeeping, food and beverage, and revenue management to deliver an exceptional guest experience. SA's tourism-driven hospitality sector employs thousands of managers across hotels, game lodges, and boutique properties.",
  "tour-guide":                "Tour Guides lead domestic and international tourists through SA's iconic landscapes, wildlife destinations, and cultural heritage sites. Registered with SATSA, they combine deep local knowledge with storytelling and customer experience skills to showcase the best of South Africa.",
  "events-coordinator":        "Events Coordinators plan and execute conferences, weddings, product launches, and exhibitions from brief to breakdown. They manage vendors, budgets, logistics, and on-the-day operations — a profession spanning corporate events, MICE tourism, and private celebrations across SA.",

  // ── Logistics & Supply Chain ──────────────────────────────────────────────
  "logistics-coordinator":     "Logistics Coordinators manage the movement of goods through the supply chain — booking freight, tracking shipments, resolving delays, and liaising between suppliers, warehouses, and customers. They are the operational heartbeat of SA's import/export, retail, and manufacturing logistics networks.",
  "freight-forwarder":         "Freight Forwarders arrange the international shipment of goods — managing customs clearance, documentation, shipping lines, and airfreight on behalf of importers and exporters. Registered with SAAFF, they are specialist intermediaries in SA's significant cross-border and port logistics industry.",
  "warehouse-manager":         "Warehouse Managers oversee the receipt, storage, and dispatch of goods — managing staff, stock accuracy, space utilisation, and health and safety across distribution centres and warehouses. As e-commerce and on-demand retail grow in SA, warehouse management is an increasingly strategic function.",

  // ── Agriculture & Agri-processing ────────────────────────────────────────
  "farm-manager":              "Farm Managers oversee the commercial production of crops, livestock, or both — managing staff, irrigation, inputs, machinery, and finances on agricultural enterprises. They combine agronomy knowledge with business acumen across SA's diverse farming regions from the Western Cape winelands to the Limpopo bushveld.",
  "veterinarian":              "Veterinarians diagnose and treat disease and injury in animals — from companion pets in urban practices to livestock on commercial farms and wildlife in game reserves. Registered with the SAVC, they serve SA's significant agricultural sector, pet-owning public, and rapidly growing wildlife veterinary field.",
  "food-scientist":            "Food Scientists and Technologists develop new food products, improve production processes, and ensure food safety and regulatory compliance for SA's large agri-processing and FMCG sector. They work in product development, quality assurance, and research — where science meets the R300-billion food manufacturing industry.",

  // ── BPO & Customer Service ────────────────────────────────────────────────
  "call-centre-agent":         "Call Centre Agents handle inbound and outbound customer interactions — resolving queries, processing orders, and providing support across phone, email, and chat channels. SA's BPO sector, particularly in Cape Town and Durban, is a major employer serving both local and international clients — especially UK and US markets.",
  "customer-experience-manager":"Customer Experience Managers design and oversee the end-to-end customer journey — from contact centre operations and digital touchpoints to complaint resolution and loyalty programmes. They combine data analysis, people management, and process design to drive customer satisfaction and retention.",

  // ── Government & Public Sector ────────────────────────────────────────────
  "public-administrator":      "Public Administrators manage the delivery of government services and the implementation of public policy at national, provincial, and local government levels. Positions span the DPSA, provincial departments, and municipalities — forming the foundation of SA's public service delivery system.",
  "policy-analyst":            "Policy Analysts research socioeconomic issues, evaluate policy options, and draft recommendations that inform government legislation and public-sector strategy. They work for government departments, think tanks, research organisations, and international development agencies active in South Africa.",

  // ── Education ─────────────────────────────────────────────────────────────
  "lecturer":                  "Lecturers deliver higher education instruction at universities, universities of technology, and TVET colleges — teaching, developing curriculum, conducting research, and mentoring students. With SA's drive to expand post-school education and training, qualified lecturers across all disciplines are in sustained demand.",
  "school-principal":          "School Principals provide educational leadership and management at public and independent schools — overseeing teaching quality, staff development, school governance, and compliance with the South African Schools Act. They bear ultimate accountability for learner outcomes and school culture.",

  // ── Social Services & NGO ─────────────────────────────────────────────────
  "community-development-worker":"Community Development Workers (CDWs) are government-employed liaisons who connect communities with public services — identifying needs, facilitating access to grants and healthcare, and mobilising residents around development projects. They are deployed by COGTA at ward level across all nine provinces.",
  "ngo-manager":               "NGO Managers lead non-profit organisations that deliver development, humanitarian, and advocacy programmes in SA. They manage donor relations, project teams, budgets, and impact reporting — translating grant funding into measurable change in communities facing poverty, inequality, and social exclusion.",

  // ── Trades & Artisans ─────────────────────────────────────────────────────
  "diesel-mechanic":           "Diesel Mechanics maintain and repair diesel-powered vehicles and equipment — trucks, buses, earthmoving machines, and generators. Trade-tested through the MERSETA, they are in chronic short supply across road transport, mining, construction, and agriculture — commanding strong wages as a result.",
  "refrigeration-mechanic":    "Refrigeration and Air Conditioning Mechanics (RAC Technicians) install and service refrigeration and HVAC systems in commercial, industrial, and residential settings. Trade-tested and registered, they are increasingly in demand as cold-chain logistics and data centre cooling requirements grow in SA.",
  "bricklayer":                "Bricklayers construct and repair walls, partitions, and structural elements using brick, block, and stone. A foundational trade for SA's construction sector, qualified bricklayers (trade certificate required) are in steady demand across residential building, commercial construction, and infrastructure projects.",
  "painter-decorator":         "Painters and Decorators apply paint, varnishes, and wall coverings to interior and exterior surfaces in residential, commercial, and industrial settings. Beyond aesthetics, they protect structures from weathering and corrosion — a trade that supports SA's continuous building and refurbishment cycle.",

  // ── Energy & Sustainability ───────────────────────────────────────────────
  "energy-auditor":            "Energy Auditors assess energy consumption in buildings and industrial facilities, identifying inefficiencies and recommending measures to reduce energy costs and carbon emissions. As SA navigates load-shedding, carbon tax, and ESG reporting requirements, energy auditing has become a high-growth niche.",
};

const PROVINCE_LABELS: Record<string, string> = {
  GAUTENG: "Gauteng", WESTERN_CAPE: "Western Cape", KWAZULU_NATAL: "KwaZulu-Natal",
  EASTERN_CAPE: "Eastern Cape", FREE_STATE: "Free State", LIMPOPO: "Limpopo",
  MPUMALANGA: "Mpumalanga", NORTH_WEST: "North West", NORTHERN_CAPE: "Northern Cape",
};

const OUTLOOK_LABEL: Record<string, { label: string; color: string }> = {
  EXCEPTIONAL: { label: "Exceptional outlook", color: "text-emerald-400" },
  EXCELLENT:   { label: "Excellent outlook",   color: "text-emerald-400" },
  GOOD:        { label: "Good outlook",         color: "text-indigo-400"  },
  FAIR:        { label: "Fair outlook",          color: "text-amber-400"  },
  POOR:        { label: "Poor outlook",          color: "text-red-400"    },
};

function CareerDetailDrawer({ career, onClose }: { career: (typeof SA_CAREERS)[0]; onClose: () => void }) {
  const router = useRouter();
  const { label: automationLabel } = getAutomationRiskLabel(career.automationRisk);
  const subjectReqs = CAREER_SUBJECTS[career.id];
  const outlook = OUTLOOK_LABEL[career.futureOutlook] ?? { label: career.futureOutlook, color: "text-foreground" };
  const avgK = Math.round(career.avgSalaryZar / 1000);

  const description = CAREER_DESCRIPTIONS[career.id];
  const marketContext = `${career.demandScore >= 85 ? "Extremely high demand" : career.demandScore >= 70 ? "Strong demand" : "Steady demand"} across SA${career.topProvinces.length > 0 ? `, particularly in ${career.topProvinces.slice(0, 2).map(p => PROVINCE_LABELS[p] ?? p).join(" and ")}` : ""}. ${career.internationalDemand ? "Skills are valued internationally." : "Primarily SA-based demand."}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{career.title}</h2>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border ${getDemandBadgeColor(career.demandScore)}`}>
                {career.demandScore}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{career.sector}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Role description */}
          {description && (
            <p className="text-sm text-foreground/90 leading-relaxed">{description}</p>
          )}

          {/* Market context pill */}
          <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3.5 py-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-300 leading-relaxed">{marketContext}</p>
          </div>

          {/* Key stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Avg Salary", value: `R${avgK}k/mo`, color: "text-emerald-400" },
              { label: "Demand", value: `${career.demandScore}/100`, color: "text-indigo-400" },
              { label: "Outlook", value: outlook.label.split(" ")[0], color: outlook.color },
            ].map((s) => (
              <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Salary breakdown */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Salary Range (ZAR/month)</h3>
            <div className="space-y-2">
              {[
                { label: "Entry level", value: career.minSalaryZar, pct: 30 },
                { label: "Average", value: career.avgSalaryZar, pct: 60 },
                { label: "Senior / top earner", value: career.maxSalaryZar, pct: 100 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold text-foreground">R{Math.round(s.value / 1000)}k</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Skills You Need</h3>
            <div className="flex flex-wrap gap-1.5">
              {career.topSkills.map((skill) => (
                <span key={skill} className="text-xs bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2.5 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* High school subject requirements */}
          {subjectReqs && (
            <div className="bg-card border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                Grade 12 Subject Requirements
              </h3>
              {subjectReqs.required.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-amber-400 mb-1.5">Required for entry:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectReqs.required.map((s) => (
                      <span key={s} className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {subjectReqs.recommended.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">Helpful to have:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectReqs.recommended.map((s) => (
                      <span key={s} className="text-xs bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-foreground">Top Provinces</span>
              </div>
              <div className="space-y-1">
                {career.topProvinces.map((p) => (
                  <div key={p} className="text-xs text-muted-foreground flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-indigo-400/60" />
                    {PROVINCE_LABELS[p] ?? p}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3 space-y-2">
              {career.nqfLevel && (
                <div className="flex items-start gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-foreground">Min Qualification</div>
                    <div className="text-xs text-muted-foreground">NQF Level {career.nqfLevel}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-foreground">AI Risk</div>
                  <div className="text-xs text-muted-foreground">{automationLabel} ({career.automationRisk}%)</div>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Work Style</div>
                  <div className="text-xs text-muted-foreground">
                    {career.remoteFriendly ? "Remote friendly" : "On-site"}
                    {career.internationalDemand ? " · Global demand" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Growth Trend</h3>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${career.growthTrend === "DECLINING" ? "text-red-400" : career.growthTrend === "STABLE" ? "text-blue-400" : "text-emerald-400"}`}>
                {getTrendLabel(career.growthTrend)}
              </span>
              <span className={`text-sm font-medium ${outlook.color}`}>{outlook.label}</span>
            </div>
          </div>

          {/* Related careers */}
          {career.relatedCareers.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Related Careers</h3>
              <div className="flex flex-wrap gap-1.5">
                {career.relatedCareers.map((r) => (
                  <span key={r} className="text-xs bg-secondary border border-border text-muted-foreground px-2.5 py-1 rounded-full hover:text-foreground transition-colors cursor-default">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <Button
              variant="indigo"
              size="sm"
              className="gap-2 w-full"
              onClick={() => { onClose(); router.push(`/skills-gap?role=${encodeURIComponent(career.title)}`); }}
            >
              <Target className="w-3.5 h-3.5" />
              Analyse My Gap
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={() => { onClose(); router.push(`/career-coach?q=${encodeURIComponent(`Tell me about a career as a ${career.title} in South Africa`)}`); }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ask AI Coach
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DemandCard({ career, onSelect }: { career: (typeof SA_CAREERS)[0]; onSelect: () => void }) {
  const { label: automationLabel, color: automationColor } = getAutomationRiskLabel(career.automationRisk);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className="bg-card border border-border rounded-xl p-5 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{career.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{career.sector}</p>
        </div>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${getDemandBadgeColor(career.demandScore)}`}>
          {career.demandScore}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Demand Score</span>
          <span className="text-foreground">{career.demandScore}/100</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${career.demandScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <div>
          <div className="text-muted-foreground">Salary Range</div>
          <div className="font-semibold text-foreground mt-0.5">{formatSalaryRange(career.minSalaryZar, career.maxSalaryZar)}</div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground">Trend</div>
          <div className={`font-medium mt-0.5 ${career.growthTrend === "DECLINING" ? "text-red-400" : career.growthTrend === "STABLE" ? "text-blue-400" : "text-emerald-400"}`}>
            {getTrendLabel(career.growthTrend)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-xs ${automationColor}`}>{automationLabel}</span>
        {career.remoteFriendly && <Badge variant="success" className="text-xs">Remote</Badge>}
        {career.internationalDemand && <Badge variant="indigo" className="text-xs">Global</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {career.topSkills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">{skill}</span>
        ))}
        {career.topSkills.length > 3 && (
          <span className="text-xs text-muted-foreground">+{career.topSkills.length - 3}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function JobMarketPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCareer, setSelectedCareer] = useState<(typeof SA_CAREERS)[0] | null>(null);
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [userSubjects, setUserSubjects] = useState<string[]>([]);

  // Load user's CAPS subjects for the "My Subjects" filter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => { if (profile?.subjects?.length) setUserSubjects(profile.subjects); })
      .catch(() => {});
  }, []);

  // Common search aliases — maps plain-English terms to sectors or keywords
  const SEARCH_ALIASES: Record<string, string[]> = {
    "law":        ["Legal & Compliance", "Attorney", "Paralegal", "Labour Relations"],
    "lawyer":     ["Legal & Compliance", "Attorney", "Paralegal", "Labour Relations"],
    "advocate":   ["Legal & Compliance", "Attorney"],
    "legal":      ["Legal & Compliance"],
    "doctor":       ["Healthcare", "Medical", "MBChB"],
    "medicine":     ["Healthcare", "MBChB", "Clinical"],
    "physician":    ["Healthcare", "Medical"],
    "nurse":        ["Healthcare", "Nursing"],
    "nursing":      ["Healthcare", "Nursing", "Nurse"],
    "coding":       ["Technology", "Software", "Developer"],
    "programming":  ["Technology", "Software Engineer", "Developer"],
    "programmer":   ["Technology", "Software Engineer", "Developer"],
    "developer":    ["Software Engineer", "Technology"],
    "coder":        ["Technology", "Software Engineer"],
    "finance":      ["Finance", "Accounting", "Chartered Accountant"],
    "accounting":   ["Finance", "Chartered Accountant", "BCom"],
    "accountant":   ["Finance", "Chartered Accountant", "Accounting"],
    "ca":           ["Chartered Accountant", "Finance"],
    "teaching":     ["Education", "Teacher", "BEd"],
    "teacher":      ["Education", "BEd"],
    "marketing":    ["Marketing", "Media & Creative", "Digital Marketing"],
    "design":       ["UX", "Graphic", "Media & Creative"],
    "designer":     ["UX", "Graphic", "Media & Creative"],
    "mining":       ["Mining & Resources"],
    "trade":        ["Construction & Trades", "Electrician", "Plumber"],
    "electrician":  ["Electrical", "Construction & Trades"],
    "plumber":      ["Construction & Trades", "Plumbing"],
    "hr":           ["Human Resources"],
    "it":           ["Technology", "Information Technology"],
    "tech":         ["Technology"],
    "cyber":        ["Cybersecurity"],
    "security":     ["Cybersecurity", "Security"],
    "data":         ["Data Scientist", "Data Analyst", "Technology"],
    "engineering":  ["Engineering"],
    "engineer":     ["Engineering", "Technology"],
    "psychology":   ["Industrial Psychology", "Psychology"],
    "social work":  ["Social Worker", "Social"],
    "pharmacy":     ["Pharmacy", "Healthcare"],
    "pharmacist":   ["Pharmacy", "Healthcare"],
    "architect":    ["Architecture", "Cloud Architect"],
    "journalism":   ["Media & Creative", "Journalist"],
    "journalist":   ["Media & Creative", "Journalist"],
  };

  const filtered = SA_CAREERS
    .filter((c) => {
      const q = search.toLowerCase().trim();
      // Check aliases first — expand the query to sector/title terms
      const aliasTerms = SEARCH_ALIASES[q] ?? [];
      const matchAlias = aliasTerms.some(term =>
        c.title.toLowerCase().includes(term.toLowerCase()) ||
        c.sector.toLowerCase().includes(term.toLowerCase())
      );
      const matchSearch = !q ? true :
        matchAlias ||
        c.title.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.topSkills.some(s => s.toLowerCase().includes(q)) ||
        (c.relatedCareers ?? []).some(r => r.toLowerCase().includes(q));
      const matchFilter =
        filter === "all" ? true :
        filter === "remote" ? c.remoteFriendly :
        filter === "high-demand" ? c.demandScore >= 85 :
        filter === "growing" ? ["GROWING", "STRONG_GROWTH", "EXPLOSIVE_GROWTH"].includes(c.growthTrend) :
        filter === "low-risk" ? c.automationRisk < 30 :
        filter === "my-subjects" ? (() => {
          if (userSubjects.length === 0) return true;
          const reqs = CAREER_SUBJECTS[c.id];
          if (!reqs) return false;
          return reqs.required.every((s) => userSubjects.includes(s));
        })() : true;
      const matchProvince =
        provinceFilter === "all" ? true :
        (c.topProvinces ?? []).includes(provinceFilter);
      return matchSearch && matchFilter && matchProvince;
    })
    .sort((a, b) => b.demandScore - a.demandScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Market Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            SA career demand intelligence · {SA_CAREERS.length} roles across {new Set(SA_CAREERS.map(c => c.sector)).size} sectors
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-300">
              Data updated: {DATA_LAST_UPDATED}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/60 pr-1">
            Next refresh: {NEXT_UPDATE_DUE}
          </span>
        </div>
      </div>

      {/* Market overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "National Unemployment", value: "32.1%", change: "Q4 2025 · Stats SA", icon: AlertTriangle, color: "amber" },
          { label: "Youth Unemployment", value: "46.1%", change: "Ages 15-34 · Q4 2025", icon: TrendingDown, color: "red" },
          { label: "Tech Jobs Growth", value: "+32%", change: "YoY 2026", icon: TrendingUp, color: "emerald" },
          { label: "Remote Jobs Available", value: "22%", change: "of SA listings · 2026", icon: Globe, color: "indigo" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                stat.color === "amber" ? "bg-amber-500/15" :
                stat.color === "red" ? "bg-red-500/15" :
                stat.color === "emerald" ? "bg-emerald-500/15" : "bg-indigo-500/15"
              }`}>
                <stat.icon className={`w-3.5 h-3.5 ${
                  stat.color === "amber" ? "text-amber-400" :
                  stat.color === "red" ? "text-red-400" :
                  stat.color === "emerald" ? "text-emerald-400" : "text-indigo-400"
                }`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              stat.color === "emerald" ? "text-emerald-400" :
              stat.color === "red" ? "text-red-400" :
              stat.color === "amber" ? "text-amber-400" : "text-foreground"
            }`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.change}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="careers">
        <TabsList className="mb-5">
          <TabsTrigger value="careers">Career Demand</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="provinces">Provinces</TabsTrigger>
          <TabsTrigger value="scarce">Scarce Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="careers">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search careers..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "high-demand", label: "High Demand" },
                { key: "growing", label: "Growing" },
                { key: "remote", label: "Remote" },
                { key: "low-risk", label: "Low AI Risk" },
                ...(userSubjects.length > 0 ? [{ key: "my-subjects", label: "My Subjects ✓" }] : []),
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    filter === f.key
                      ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Province dropdown */}
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
              >
                <option value="all">All Provinces</option>
                {Object.entries(PROVINCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {provinceFilter !== "all" && (
                <button
                  onClick={() => setProvinceFilter("all")}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              {provinceFilter !== "all" && (
                <span className="text-xs text-muted-foreground">
                  — {filtered.length} career{filtered.length !== 1 ? "s" : ""} with strong demand in {PROVINCE_LABELS[provinceFilter]}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((career) => (
              <DemandCard key={career.id} career={career} onSelect={() => setSelectedCareer(career)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Job Market Share by Sector</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={SECTOR_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SECTOR_PIE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Share"]}
                    {...TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {SECTOR_PIE_DATA.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.fill }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Sector Growth Rates (YoY)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={SA_SECTORS} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Growth"]}
                    {...TOOLTIP_STYLE}
                  />
                  <Bar dataKey="growth" radius={4}>
                    {SA_SECTORS.map((entry, i) => (
                      <Cell key={i} fill={entry.growth > 0 ? "#6366f1" : "#ef4444"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="provinces">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">Opportunity Score by Province</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                A score out of 100 showing how many job opportunities, active employers, and growth sectors exist in each province. Higher = more jobs available right now.
              </p>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[
                  { color: "bg-emerald-500", label: "High (70+) — Strong market" },
                  { color: "bg-indigo-500",  label: "Medium (55–69) — Decent prospects" },
                  { color: "bg-amber-500",   label: "Lower (below 55) — Fewer openings" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={PROVINCE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val, name) => [val, "Opportunity Score"]}
                    {...TOOLTIP_STYLE}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {PROVINCE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 70 ? "#10b981" : entry.score >= 55 ? "#6366f1" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Province Rankings</h3>
              <div className="space-y-3">
                {PROVINCE_DATA.sort((a, b) => b.score - a.score).map((p, i) => (
                  <div key={p.province} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground truncate">{p.label}</span>
                        <span className="text-xs font-bold text-indigo-400">{p.score}</span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full">
                        <div
                          className={`h-full rounded-full ${p.score >= 70 ? "bg-emerald-500" : p.score >= 55 ? "bg-indigo-500" : "bg-amber-500"}`}
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.topOpportunity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scarce">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-foreground">DHET / SETA Scarce Skills</h3>
                </div>
                <span className="text-[10px] text-muted-foreground/60">Updated {DATA_LAST_UPDATED}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Skills identified as critically scarce in South Africa. Learning these can unlock bursaries, learnerships, and premium salaries.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SCARCE_SKILLS.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary border border-border text-xs text-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-emerald-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Highest Premium for Scarce Skills
                </h3>
                <div className="space-y-3">
                  {[
                    { skill: "AI/ML Engineering", premium: "+R45k/mo", demand: 95 },
                    { skill: "Cloud Architecture", premium: "+R35k/mo", demand: 91 },
                    { skill: "Cybersecurity", premium: "+R28k/mo", demand: 90 },
                    { skill: "Renewable Energy", premium: "+R25k/mo", demand: 91 },
                    { skill: "Data Science", premium: "+R22k/mo", demand: 94 },
                  ].map((item) => (
                    <div key={item.skill} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{item.skill}</div>
                        <div className="h-1 bg-secondary rounded-full mt-1">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.demand}%` }} />
                        </div>
                      </div>
                      <span className="text-emerald-400 text-sm font-bold ml-3">{item.premium}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-red-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  High Automation Risk Careers
                </h3>
                <div className="space-y-2">
                  {[
                    { career: "Data Entry Clerk", risk: 92 },
                    { career: "Bank Teller", risk: 88 },
                    { career: "Telemarketer", risk: 85 },
                    { career: "Bookkeeper", risk: 78 },
                    { career: "Payroll Administrator", risk: 72 },
                  ].map((item) => (
                    <div key={item.career} className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground flex-1">{item.career}</span>
                      <div className="w-24 h-1.5 bg-secondary rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${item.risk}%` }} />
                      </div>
                      <span className="text-red-400 font-medium w-8 text-right">{item.risk}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedCareer && (
          <CareerDetailDrawer
            career={selectedCareer}
            onClose={() => setSelectedCareer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
