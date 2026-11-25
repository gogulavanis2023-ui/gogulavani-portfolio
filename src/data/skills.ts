// Evidence-based skills: every entry names the work that demonstrates it.
// No percentages; nothing listed that a project does not show.

export type Skill = { name: string; evidence: string };
export type SkillGroup = { group: string; blurb: string; skills: Skill[] };

export const skills: SkillGroup[] = [
  {
    group: 'FPGA & VLSI',
    blurb: 'RTL taken through synthesis, implementation and timing closure to working boards.',
    skills: [
      { name: 'Verilog RTL', evidence: 'GPS engine, FIR filter, async FIFO, digital design labs' },
      { name: 'Parameterised / generate-based design', evidence: '32 correlator slices; FIXED_MODE FIR baselines' },
      { name: 'Fixed-point datapaths', evidence: 'Q1.15 × 16-bit MACs, 40-bit accumulator, round & saturate' },
      { name: 'LFSR / PRN generation', evidence: 'GPS G1/G2 C/A code generator' },
      { name: 'Clock-domain crossing', evidence: 'Gray-code pointers, 2-FF synchronisers, async clock groups' },
      { name: 'Timing analysis', evidence: 'WNS +5.852 ns (GPS) and +2.641 ns (FIR) at 100 MHz' },
      { name: 'Power analysis', evidence: 'Per-mode SAIF power for the FIR filter' },
    ],
  },
  {
    group: 'Verification',
    blurb: 'Self-checking testbenches against independent reference models.',
    skills: [
      { name: 'Golden-model verification', evidence: 'FIR: 1000/1000 outputs bit-exact vs. Python' },
      { name: 'Scoreboard testbench', evidence: 'Async FIFO: overflow/underflow and ordering checks' },
      { name: 'Mid-stream mode-switch tests', evidence: 'FIR SWEEP test across all four parallelism modes' },
    ],
  },
  {
    group: 'Embedded systems',
    blurb: 'Firmware on real boards, from bare sensors to bus nodes.',
    skills: [
      { name: 'Embedded C (PIC)', evidence: 'C Systems internship: DHT temperature monitoring' },
      { name: 'STM32', evidence: 'CAN guardian node (STM32F103, SPI2 + UART1)' },
      { name: 'ESP32', evidence: 'PID line follower with Bluetooth tuning; COGTIS training' },
      { name: 'Arduino', evidence: 'CAN bench nodes; line-follower variants' },
      { name: 'Hardware bring-up & debug', evidence: 'GPS engine bugs found and fixed on the board' },
    ],
  },
  {
    group: 'Buses & automotive',
    blurb: 'In-vehicle networking and the interfaces around it.',
    skills: [
      { name: 'CAN (MCP2515 / TJA1050)', evidence: '3-node 125 kbit/s bench + guardian' },
      { name: 'SPI', evidence: 'MCP2515 controllers on Arduino and STM32' },
      { name: 'UART', evidence: 'Guardian logging on STM32 USART1' },
      { name: 'Bluetooth Classic', evidence: 'ESP32 live PID tuning' },
      { name: 'Physical-layer ECU authentication', evidence: 'Voltage-fingerprinting IDS research' },
    ],
  },
  {
    group: 'Tools & languages',
    blurb: 'The toolchain behind the projects above.',
    skills: [
      { name: 'Xilinx Vivado', evidence: 'Synthesis, implementation, XSim, timing, SAIF power' },
      { name: 'Intel Quartus Prime', evidence: 'DE2-115 designs with SDC / TimeQuest' },
      { name: 'ModelSim', evidence: 'Digital design labs; FIFO simulation' },
      { name: 'Python', evidence: 'Filter design, golden models, digital twin, scikit-learn' },
      { name: 'MATLAB', evidence: 'GPS pseudorange / SISRE and Doppler analysis' },
      { name: 'OptiSystem', evidence: 'Hybrid FSO–fibre link simulation' },
      { name: 'LaTeX', evidence: 'IEEEtran research paper' },
    ],
  },
];

export const learning = ['SystemVerilog & UVM-style verification', 'Bare-metal STM32 drivers (registers, interrupts, DMA)', 'Analog front end for CAN fingerprinting'];
