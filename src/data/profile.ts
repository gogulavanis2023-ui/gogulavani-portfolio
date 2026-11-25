// Single source of truth for personal details shown on the site.
// Only verified information goes here. Leave a field empty to hide it.

export const BASE = import.meta.env.BASE_URL; // '/gogulavani-portfolio/'

export const profile = {
  name: 'Gogulavani S',
  role: 'FPGA · RTL Design · Embedded Systems',
  headline: 'Building intelligent hardware, from RTL to real-world systems.',
  intro:
    'Electronics and Communication Engineering undergraduate exploring FPGA architecture, VLSI, embedded systems and hardware innovation.',
  university: 'Vellore Institute of Technology (VIT), Vellore',
  degree: 'B.Tech, Electronics and Communication Engineering',
  years: '2023 – 2027',
  cgpa: '8.05 / 10',
  locations: ['Chennai', 'Bengaluru'],
  email: 'gogulavani.s2023@vitstudent.ac.in',
  github: 'https://github.com/gogulavanis2023-ui',
  // Add the full LinkedIn profile URL here to show LinkedIn buttons across the site.
  linkedin: '',
  resume: {
    file: `${BASE}resume/Gogulavani_S_Resume.pdf`,
    downloadName: 'Gogulavani_S_Resume_FPGA_RTL_Embedded.pdf',
    label: 'Resume: FPGA / RTL / Embedded',
    updated: 'November 2026',
  },
};

export const interests = [
  'VLSI and digital design',
  'FPGA engineering',
  'RTL design and verification',
  'Embedded systems and firmware',
  'Automotive electronics',
  'Semiconductor and hardware R&D',
];
