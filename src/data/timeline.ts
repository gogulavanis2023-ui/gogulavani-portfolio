export type TimelineItem = {
  when: string;
  title: string;
  org: string;
  kind: 'Research' | 'Industry' | 'Training' | 'Academic' | 'Leadership';
  detail: string;
  points?: string[];
};

// Dates verified against the internship certificate record, the
// resume (Nov 2026) and the project files.
export const timeline: TimelineItem[] = [
  {
    when: 'Aug – Nov 2026',
    title: 'Runtime-reconfigurable FIR filter',
    org: 'VIT Vellore · FPGA Based System Design',
    kind: 'Academic',
    detail: 'Course project taken from filter design to a timing-closed, power-characterised Artix-7 implementation.',
  },
  {
    when: 'May – Jul 2026',
    title: 'Research Intern',
    org: 'IIT Madras (on-site)',
    kind: 'Research',
    detail: 'Runtime-configurable parallel GPS C/A code acquisition engine in Verilog on a Xilinx Artix-7 (Basys 3).',
    points: [
      'G1/G2 LFSR PRN generator, variable delay line, up to 32 parallel correlators',
      'Active-correlator count set from board switches: one bitstream for every setting',
      'Brought up on hardware; fixed an index off-by-one, divider settling and switch bounce',
    ],
  },
  {
    when: '2026',
    title: 'CAN-bus voltage fingerprinting research',
    org: 'Independent research · in progress',
    kind: 'Research',
    detail: 'CAN bench, STM32 guardian and digital twin for physical-layer sender authentication; IEEE-format paper in preparation.',
  },
  {
    when: 'Sep – Oct 2025',
    title: 'Student Coordinator, Campus Decoration',
    org: 'GraVITas Tech Fest, VIT',
    kind: 'Leadership',
    detail: 'Coordinated campus decoration for the university technical festival.',
  },
  {
    when: 'May – Jul 2025',
    title: 'Embedded Systems Intern',
    org: 'C Systems Pvt Ltd, Chennai (on-site)',
    kind: 'Industry',
    detail: 'Real-time industrial temperature monitoring on a PIC microcontroller with DHT sensors in Embedded C; debugged sensor timing and firmware on hardware.',
  },
  {
    when: 'Mar 2024',
    title: 'IoT with ESP32 (7-day internship)',
    org: 'COGTIS Technologies Pvt Ltd',
    kind: 'Training',
    detail: 'ESP32 programming, IoT protocol integration and sensor data processing.',
  },
  {
    when: '2023',
    title: 'B.Tech, Electronics and Communication Engineering',
    org: 'Vellore Institute of Technology, Vellore',
    kind: 'Academic',
    detail: 'Started the B.Tech programme (2023 – 2027). CGPA 8.05 / 10.',
  },
];
