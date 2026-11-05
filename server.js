const express = require('express');
const path = require('path');
const app = express();
//const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


let jobs = [
  { id: 1, title: "Distribution Driver", company: "AB InBev - Matsapha Breweries", location: "Matsapha", category: "Driving", type: "Full-time", salary: "Market Related", phone: "26825180000", applyType: "portal", applyValue: "https://www.ab-inbev.com/careers/", deadline: "2026-11-30", description: "Distribution Driver, Requisition ID: 30105228." },
  { id: 2, title: "Sales Associate (108 Hours) - The FIX", company: "TFG - The Gables, Manzini", location: "Manzini", category: "Retail", type: "Full-time", salary: "Market Related", phone: "26825050000", applyType: "portal", applyValue: "https://www.tfg.co.za/careers", deadline: "2026-11-15", description: "Sales Associate at The FIX, The Gables. Grade 12 required." },
  { id: 3, title: "Shop Assistant / Cashier", company: "Clicks - Manzini Mall", location: "Manzini", category: "Retail", type: "Permanent", salary: "Market Related", phone: "26825050000", applyType: "portal", applyValue: "https://www.clicksgroup.co.za/careers/", deadline: "2026-11-20", description: "POS, merchandising and customer service." },
  { id: 4, title: "Marketing Officer / Sales Rep", company: "Siyakhula Sonkhe Cooperative", location: "Matsapha", category: "Sales", type: "Full-time", salary: "To discuss", phone: "26876447076", applyType: "email", applyValue: "siyakhulasonkhe.coop@gmail.com", deadline: "2026-11-18", description: "Must live in/around Matsapha. Also call 7644 7076." },
  { id: 5, title: "Driver - G2", company: "UNICEF Eswatini", location: "Mbabane", category: "Driving", type: "Fixed Term", salary: "UN Scale", phone: "26824050000", applyType: "portal", applyValue: "https://jobs.unicef.org/", deadline: "2026-11-13", description: "2+ years experience, valid licence. Job #00136101." },
  { id: 6, title: "Property & Assets Management Officer", company: "ESWACAA", location: "Matsapha", category: "Admin", type: "Full-time", salary: "Market Related", phone: "26825180000", applyType: "email", applyValue: "recruitment@eswacaa.co.sz", deadline: "2026-11-14", description: "Facilities Management Dept, Head Office Matsapha." },
  { id: 7, title: "Merchandiser", company: "Logico", location: "Big Bend", category: "Retail", type: "Full-time", salary: "Market Related", phone: "26825050000", applyType: "email", applyValue: "jobs@logico.co.sz", deadline: "2026-11-22", description: "Maintain shelf health. Must have smartphone." },
  { id: 8, title: "Construction Engineer", company: "World Vision", location: "Manzini", category: "Construction", type: "Fixed-term", salary: "Market Related", phone: "26825050000", applyType: "portal", applyValue: "https://www.wvi.org/careers", deadline: "2026-11-13", description: "WASH infrastructure projects, Ref: JR53699." },
  { id: 9, title: "Maintenance & General Worker (Driver)", company: "Eswatini Wire", location: "Matsapha", category: "Technical", type: "Full-time", salary: "To discuss", phone: "26876023845", applyType: "whatsapp", applyValue: "26876023845", deadline: "2026-11-15", description: "Yard cleaning, minor repairs, driving errands." },
  { id: 10, title: "National Product Delivery Program Lead", company: "Management Sciences for Health (MSH)", location: "Mbabane", category: "Health", type: "Consultancy - 4 months", salary: "Consultancy", phone: "26824040000", applyType: "portal", applyValue: "https://msh.org/careers/", deadline: "2026-11-30", description: "National Health Product Registry. Ref R5229." }
];

const levelNames = {
  1: "No Certificate Needed",
  2: "School Leaver",
  3: "Skilled Trade / Licence",
  4: "Diploma / Degree",
  5: "Professional / Management"
};

app.get('/api/jobs', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Hide expired jobs
  let active = jobs.filter(j => !j.deadline || j.deadline >= today);

  // Keep your existing filters if you have them
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    active = active.filter(j => (j.title + ' ' + j.company).toLowerCase().includes(s));
  }
  if (req.query.location) {
    active = active.filter(j => j.location === req.query.location);
  }
  if (req.query.level) {
    active = active.filter(j => j.category === req.query.level || j.levelName === req.query.level);
  }
  res.json(active);
});

// NEW: Post a Job
app.post('/api/jobs', (req, res) => {
  const { title, company, level, location, type, salary, deadline, whatsapp, description } = req.body;

  if (!title || !company || !level || !location || !whatsapp) {
    return res.status(400).json({ error: "Please fill title, company, level, location and WhatsApp" });
  }

  const newJob = {
    id: Date.now(),
    title,
    company,
    level: Number(level),
    levelName: levelNames[level],
    location,
    type: type || "Full-time",
    salary: salary || "To discuss",
    deadline: deadline || "No deadline",
    whatsapp: whatsapp.replace(/\s/g, ''),
    description: description || ""
  };

  jobs.push(newJob);
  res.json(newJob);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Sebenta running on ' + PORT));