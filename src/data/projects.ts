// Project content. Every number on this page is taken from the project's
// repository (Vivado / Quartus reports, simulation logs, results.json) or
// from the project documents. Simulation results are labelled as such.

export type Fact = { label: string; value: string; note?: string };
export type Section = { heading: string; body?: string; bullets?: string[] };
export type Figure = { src: string; caption: string };

export type Project = {
  slug: string;
  index: string;
  title: string;
  short: string;
  domain: string;
  status: 'Complete' | 'In progress';
  context: string;
  repo: string;
  stack: string[];
  facts: Fact[];
  overview: string;
  problem: string;
  approach: string[];
  architecture: Section;
  hardware: string[];
  software: string[];
  methodology: string[];
  results: { intro?: string; table?: { head: string[]; rows: string[][] }; notes?: string[] };
  limitations: string[];
  future: string[];
  figures?: Figure[];
  viz: 'gps' | 'fir' | 'can' | 'fifo';
};

const GH = 'https://github.com/gogulavanis2023-ui';

export const featured: Project[] = [
  {
    slug: 'gps-acquisition',
    index: '01',
    title: 'Parallel GPS C/A Code Acquisition Engine',
    short:
      'Up to 32 runtime-selectable parallel correlators search the 1023 code phases of the GPS L1 C/A code on an Artix-7, so one bitstream covers the whole search-time vs. resource trade-off.',
    domain: 'FPGA · GNSS · Digital design',
    status: 'Complete',
    context: 'Research internship, IIT Madras · May–Jul 2026',
    repo: `${GH}/fpga-gps-ca-code-acquisition`,
    stack: ['Verilog', 'Vivado', 'Artix-7 / Basys 3', 'MATLAB'],
    facts: [
      { label: 'Parallel correlators', value: '1–32', note: 'set at runtime from sw[4:0]' },
      { label: 'Timing (WNS @ 100 MHz)', value: '+5.852 ns', note: 'post-route, 0 failing endpoints' },
      { label: 'Slice LUTs', value: '3,753', note: '18.0 % of XC7A35T, full 32-slice build' },
      { label: 'On-chip power', value: '0.138 W', note: '0.069 W dynamic' },
    ],
    overview:
      'A GPS receiver has to find the code phase of each satellite PRN before it can track it. This design implements the code-phase search in hardware: a G1/G2 LFSR C/A code generator, a delayed test signal, and an array of up to 32 correlator slices that split the 1023-chip search space between them. The number of active slices is a runtime register, so speed and resources can be traded on the board without re-synthesis.',
    problem:
      'A single serial correlator must test all 1023 code phases one after another, which is slow. A fully parallel search is fast but expensive in logic and power. The goal was a single design where the degree of parallelism is a runtime parameter, so the trade-off can be measured on real hardware.',
    approach: [
      'Generate the PRN in hardware with the C/A code structure: two 10-stage LFSRs (G1 taps 3, 10; G2 taps 2, 3, 6, 8, 9, 10) and per-satellite G2 phase taps.',
      'Create a known test signal by delaying the replica by 800 chips.',
      'Divide the 1023 offsets into N equal ranges (range = ⌊1023 / N⌋); each slice tests one offset per 1023-chip period through a variable delay line.',
      'Declare lock when the agreement count over one period reaches 950/1023, and priority-select the locked offset for the display.',
    ],
    architecture: {
      heading: 'RTL architecture',
      bullets: [
        'prn_generator: G1/G2 LFSRs; chip = G1 output ⊕ (G2 tap A ⊕ G2 tap B), taps 2/6 for PRN 1',
        'delay_line: 800-chip shift register producing the "incoming" chip stream',
        'correlator_slice ×32 (generate loop): 8-cycle settle, variable_delay_line (1023 taps), XNOR-accumulate correlator, offset stepping and lock register',
        'correlator_top: active_count = sw + 1, range partitioning, priority select of locked slices',
        'clk_divider: 100 MHz → 500 Hz chip clock so acquisition is visible on the board',
        'debounce and seven_seg_driver: clean button input and display the recovered offset',
      ],
    },
    hardware: ['Digilent Basys 3 (Xilinx Artix-7 XC7A35T-1CPG236C)', 'Slide switches for N, centre button for reset, 4-digit 7-segment display, lock LED'],
    software: ['Xilinx Vivado: synthesis, implementation, timing, power', 'MATLAB: pseudorange/SISRE calculator (WGS-84) and Doppler analysis'],
    methodology: [
      'Write each block as a small parameterised module, then compose 32 slices with a generate loop.',
      'Constrain the 100 MHz clock and board I/O in XDC, implement, and read the timing, utilisation and power reports.',
      'Bring up on the board and sweep N; the design was characterised at N = 1, 4, 16 and 32.',
      'Debug on hardware: fixed an index off-by-one in range partitioning, settling of the runtime range divider, and switch/button bounce.',
    ],
    results: {
      intro: 'From the post-route Vivado reports of the full 32-slice build (all slices exist in hardware; N only enables them):',
      table: {
        head: ['Metric', 'Value'],
        rows: [
          ['Slice LUTs', '3,753 / 20,800 (18.04 %)'],
          ['Slice registers', '2,049 / 41,600 (4.93 %)'],
          ['Worst negative slack @ 100 MHz', '+5.852 ns (met)'],
          ['Total on-chip power', '0.138 W (0.069 W dynamic)'],
        ],
      },
      notes: [
        'Periods to lock follow directly from the RTL: the slice whose range contains offset 800 steps through its range one offset per 1023-chip period. N = 1 needs 800 periods; N = 32 needs 25.',
      ],
    },
    limitations: [
      'A bit-accurate model of the current prn_generator shows its register shifts opposite to its tap indexing, so G1 repeats every 63 chips and the output is not the ICD PRN sequence. Acquisition still locks correctly because the test signal is a delayed copy of the same sequence. Reversing the shift (g ← {g[8:0], fb}) reproduces PRN 1 exactly (first chips 1100100000); the fix is pending re-verification on hardware.',
      'The incoming signal is a delayed copy of the replica: no noise, carrier or Doppler.',
      'Only the code-phase dimension is searched; there is no Doppler-bin search.',
      'The chip clock is deliberately slowed to 500 Hz for visual demonstration.',
    ],
    future: [
      'Live L1 samples from a MAX2769 RF front end (scoped) with carrier wipe-off and Doppler bins.',
      'Add noise and Doppler to the test signal and measure detection probability against C/N₀.',
      'Self-checking testbench sweeping all N and PRNs; FFT-based parallel search for comparison.',
    ],
    viz: 'gps',
  },
  {
    slug: 'fir-filter',
    index: '02',
    title: 'Runtime-Reconfigurable Parallel FIR Filter',
    short:
      'A 48-tap Q1.15 low-pass FIR filter whose number of active MAC units is chosen at runtime. Bit-exact against a Python golden model, implemented at 100 MHz on Artix-7 with per-mode power analysis.',
    domain: 'FPGA · DSP · Verification',
    status: 'Complete',
    context: 'FPGA Based System Design course project · Aug–Nov 2026',
    repo: `${GH}/fpga-reconfigurable-fir-filter`,
    stack: ['Verilog', 'Vivado', 'DSP48E1', 'Python', 'SAIF power'],
    facts: [
      { label: 'Taps / format', value: '48 · Q1.15', note: 'Kaiser window, β = 3.395' },
      { label: 'Verification', value: '1000 / 1000', note: 'outputs bit-exact vs. Python model' },
      { label: 'Timing (WNS @ 100 MHz)', value: '+2.641 ns', note: 'v1, post-route' },
      { label: 'Energy per output', value: '≈ 7× lower', note: 'P = 8 vs. P = 1 (dynamic, from SAIF)' },
    ],
    overview:
      'One FIR datapath, four operating points. The switches select how many MAC units work on each output; a mode change is accepted only at the end of an output window, so switching never corrupts a sample. The filter was designed in Python, verified bit-exactly in simulation, implemented on a Basys 3 and analysed for power in every mode.',
    problem:
      'Fixed FIR architectures are sized for one operating point: a fully parallel filter wastes energy at low sample rates, while a serial filter cannot keep up at high rates. The aim was a single datapath with runtime-selectable parallelism, and to measure how throughput, timing, resources and power actually change.',
    approach: [
      'Design the filter (fs 100 MHz, pass 0–5 MHz, stop 10–50 MHz, ≥ 40 dB) with a Kaiser window: β = 3.395, length estimate ≈ 45.6 → 48 taps.',
      'Build a bit-exact golden model: y[n] = sat16((Σ h[k]·x[n−k] + 2¹⁴) >> 15).',
      'v1: 8 MAC lanes; unselected lanes hold their operands and a zero coefficient so they stop toggling. 49 / 25 / 13 / 7 cycles per output for P = 1 / 2 / 4 / 8.',
      'v2: 48 MACs, MAC j handles taps j·L … j·L+L−1 (L = 48/P), followed by a 6-level pipelined adder tree. 48 / 12 / 4 / 1 cycles per output.',
    ],
    architecture: {
      heading: 'Datapath',
      bullets: [
        'Input ROM → 48 × 16-bit delay line → P active MAC lanes → pipelined adder tree → round and saturate → y_out',
        '16-bit samples × 16-bit Q1.15 coefficients → 32-bit products → 40-bit accumulator (8 guard bits)',
        'Tap counter; the new mode and the next sample are taken only at the last tap of an output window',
        'Basys 3 wrapper: sw[1:0] selects P, 7-segment shows P and the cycles per output measured in hardware',
        'FIXED_MODE parameter synthesises fixed-mode baselines to measure the cost of reconfigurability',
      ],
    },
    hardware: ['Digilent Basys 3 (Artix-7 XC7A35T)', 'Switches for mode, 7-segment display for measured cycles/output, LEDs for output sample'],
    software: ['Vivado: synthesis, implementation, XSim, SAIF-based power', 'Python: NumPy / SciPy / Matplotlib for filter design, golden model and plots'],
    methodology: [
      'fir_design.py writes coeffs.mem, input.mem (0.2 + 12 + 46 MHz tones, 1000 samples) and golden.mem.',
      'tb_fir_core streams all 1000 samples and changes mode every 250 samples (P = 48 → 12 → 4 → 1), comparing every output with golden.mem.',
      'tb_fir_real checks v1 against an independent integer direct-form model inside the testbench: RESULT: PASS.',
      'Post-implementation simulation per mode writes SAIF activity; report_power_modes.tcl turns it into per-mode power.',
    ],
    results: {
      intro: 'v1, from the Vivado reports in the repository:',
      table: {
        head: ['Mode', 'MACs', 'Cycles / output', 'Throughput', 'Dynamic power', 'Energy / output'],
        rows: [
          ['0', '1', '49', '2.04 MS/s', '0.040 W', '≈ 19.6 nJ'],
          ['1', '2', '25', '4.00 MS/s', '0.041 W', '≈ 10.3 nJ'],
          ['2', '4', '13', '7.69 MS/s', '0.034 W', '≈ 4.4 nJ'],
          ['3', '8', '7', '14.29 MS/s', '0.038 W', '≈ 2.7 nJ'],
        ],
      },
      notes: [
        'Utilisation: 1,476 LUTs (7.1 %), 966 registers, 12 DSP48E1 (13.3 %). WNS +2.641 ns at 100 MHz.',
        'Dynamic power stays almost flat because the clock tree, input ROM and delay line toggle every cycle in every mode. Energy per output therefore falls about 7× at full parallelism, so lower parallelism does not save power in this design.',
      ],
    },
    limitations: [
      'Input comes from an on-chip ROM; no ADC/DAC path.',
      'v2 (P up to 48) is verified in simulation; implementation figures are for v1.',
      'Power is Vivado estimation from simulated activity, not measured board current.',
    ],
    future: [
      'Clock-gate (BUFGCE) unused MAC lanes and gate the delay-line shift so low-parallelism modes actually save power.',
      'Implement v2 and compare against the FIXED_MODE baselines.',
      'Symmetric (folded) coefficient structure to halve multipliers; XADC or Pmod ADC/DAC input.',
    ],
    figures: [
      { src: 'img/fir/freq_response.png', caption: 'Designed 48-tap response vs. specification' },
      { src: 'img/fir/sim_vs_golden.png', caption: 'RTL simulation output overlaid on the Python golden model' },
      { src: 'img/fir/time_domain.png', caption: 'Test input (0.2 + 12 + 46 MHz) and filtered output' },
    ],
    viz: 'fir',
  },
  {
    slug: 'can-ids',
    index: '03',
    title: 'CAN-Bus ECU Voltage Fingerprinting IDS',
    short:
      'Identifies which physical ECU sent each CAN frame from the analog bus waveform, so spoofed frames are flagged even when they carry a legitimate ID. CAN bench, STM32 guardian and a bit-level digital twin.',
    domain: 'Automotive · Embedded · Embedded ML',
    status: 'In progress',
    context: 'Research project · 2026',
    repo: `${GH}/can-ecu-voltage-fingerprinting-ids`,
    stack: ['CAN', 'MCP2515 / TJA1050', 'STM32F103', 'Arduino', 'Python', 'scikit-learn'],
    facts: [
      { label: 'Closed-set accuracy', value: '97.73 %', note: 'linear SVM · simulation' },
      { label: 'Unknown-device detection', value: '99.5 %', note: 'Mahalanobis open-set · simulation' },
      { label: 'Masquerade detected in', value: '0.12 s', note: 'CUSUM · simulation' },
      { label: 'Model size', value: '1,396 B', note: 'fits a microcontroller' },
    ],
    overview:
      'CAN has no sender authentication, so any node can transmit any ID. Every transceiver, however, has small analog differences in its dominant levels, edges and noise. This project treats those differences as a fingerprint: a guardian node samples CAN_H/CAN_L, extracts 15 statistical features per frame and checks whether the physical sender matches the owner of the ID.',
    problem:
      'A compromised or foreign ECU can masquerade as a legitimate one by sending its ID with valid data. Cryptographic message authentication needs bandwidth and key management that legacy ECUs cannot provide. The question is whether a low-cost monitor can authenticate senders from the physical layer alone.',
    approach: [
      'Build a 3-node CAN bench (Arduino Nano + MCP2515 + TJA1050, 125 kbit/s) and an STM32F103 guardian.',
      'Model the bench bit by bit: per-device transceiver parameters from TJA1050 datasheet ranges, a 100k/100k divider and CA3130 buffer, and a 12-bit ADC at 1 MS/s (8 samples per bit).',
      'Per frame: decode the ID from the waveform, compute 15 moment features, classify the sender with a linear SVM, reject unknown devices with a Mahalanobis check, verify the ID owner, and accumulate evidence with per-ID CUSUM.',
      'Run a 65 s scenario: enrolment, then masquerade, interleaved spoofing (30 %) and a foreign device.',
    ],
    architecture: {
      heading: 'Guardian pipeline',
      bullets: [
        '1 · dual ADC on CAN_H / CAN_L',
        '2 · frame sync and bit decoding (ID read from the waveform itself)',
        '3 · 15 moment features (mean, variance, skewness, kurtosis, 5th moment × CAN_H, CAN_L, CAN_diff)',
        '4 · linear SVM sender classification',
        '5 · Mahalanobis open-set check for never-seen devices',
        '6 · ID-owner check · 7 · per-ID CUSUM · 8 · alarm log',
      ],
    },
    hardware: [
      'Arduino Nano ×3 + MCP2515 (8 MHz crystal) + TJA1050 transmitting IDs 0x100 / 0x200 / 0x300',
      'STM32F103 "Blue Pill" + MCP2515 guardian (SPI2 PB13/14/15, CS PB12, UART1 PA9/PA10)',
      '120 Ω terminated twisted-pair bus',
    ],
    software: ['Arduino IDE + mcp_can library, STM32duino core', 'Python: NumPy, SciPy, scikit-learn, Matplotlib', 'LaTeX (IEEEtran) paper'],
    methodology: [
      'Firmware: node_tx sends 8-byte frames every 100 ms with a rolling counter; node_rx and the guardian receive, bounds-check the DLC and log over UART.',
      'Simulation 1 compares 7 classifiers on accuracy, size and speed, tests 0–60 mV drift and open-set rejection.',
      'Simulation 2 (digital twin) runs the full 8-block guardian pipeline on the modelled bench.',
    ],
    results: {
      intro: 'Digital-twin simulation (results.json). These are simulation results, not hardware measurements.',
      table: {
        head: ['Metric', 'Value'],
        rows: [
          ['Frames processed', '5,734'],
          ['ID decoded from waveform', '100 %'],
          ['Closed-set sender accuracy', '97.73 %'],
          ['Open-set detection', '99.5 %'],
          ['Genuine-frame false rejects', '0.77 %'],
          ['False alarms in normal traffic', '0'],
          ['Detection: masquerade / 30 % spoof / foreign device', '0.12 s / 7.27 s / 0.70 s'],
          ['Model size · estimated CPU load', '1,396 B · ≈ 6.3 %'],
        ],
      },
      notes: ['CUSUM catches the interleaved spoofing attack that a 10-of-10 batch alarm never flags.'],
    },
    limitations: [
      'The analog front end (divider, CA3130 buffer, dual-ADC capture) is not built yet; fingerprinting runs on simulated waveforms.',
      'Device variation is modelled from datasheet ranges; real transceivers, cable length and temperature may differ.',
    ],
    future: [
      'Build the analog front end and collect a real per-ECU waveform dataset.',
      'Port SVM + Mahalanobis + CUSUM to C on the STM32 and measure real CPU load.',
      'Drift handling with periodic re-enrolment; extend to CAN-FD.',
    ],
    figures: [
      { src: 'img/can/fig1_waveforms.png', caption: 'Simulated CAN_H / CAN_L waveforms per device' },
      { src: 'img/can/fig2_fingerprints.png', caption: 'Feature-space fingerprints of genuine and foreign devices' },
      { src: 'img/can/fig3_attack_timeline.png', caption: 'Attack timeline with CUSUM alarms' },
      { src: 'img/can/fig4_confusion.png', caption: 'Sender confusion matrix' },
    ],
    viz: 'can',
  },
  {
    slug: 'async-fifo',
    index: '04',
    title: 'Asynchronous FIFO with Gray-Code CDC',
    short:
      'A dual-clock FIFO that moves data safely between a 50 MHz write domain and a 12.5 MHz read domain using Gray-coded pointers, 2-flop synchronisers, SDC clock groups and a scoreboard testbench.',
    domain: 'VLSI · RTL · Clock-domain crossing',
    status: 'Complete',
    context: 'FPGA lab (Task 6) · DE2-115',
    repo: `${GH}/async-fifo-cdc-verilog`,
    stack: ['Verilog', 'Quartus Prime', 'SDC / TimeQuest', 'Cyclone IV', 'ModelSim'],
    facts: [
      { label: 'Depth × width', value: '32 × 8', note: '6-bit pointers (1 wrap bit)' },
      { label: 'Clock domains', value: '50 / 12.5 MHz', note: 'unrelated sources' },
      { label: 'Synchroniser', value: '2-FF', note: 'on Gray-coded pointers' },
      { label: 'Testbench', value: 'Scoreboard', note: '40 writes / 45 reads, overflow & underflow blocked' },
    ],
    overview:
      'Passing a multi-bit pointer between unrelated clocks can capture a half-updated value. Gray-coding the pointers means only one bit changes per increment, so after two synchronising flip-flops the receiving domain sees either the old or the new pointer, never a mixture.',
    problem:
      'Move data between two asynchronous clock domains without metastability-induced corruption, without overwriting unread data, and without reading the same word twice.',
    approach: [
      'Keep binary pointers in each domain with one extra wrap bit (6 bits for 32 entries).',
      'Convert each pointer to Gray code, synchronise it into the other domain through two flip-flops, convert back to binary there.',
      'empty = (synchronised write pointer == read pointer); full = MSBs differ and lower 5 bits match.',
      'Gate wren with !full and rden with !empty.',
    ],
    architecture: {
      heading: 'Modules',
      bullets: [
        'asynchronous_fifo: pointer logic and flags (DEPTH = 32, DATA_WIDTH = 8, PTR_WIDTH = 6)',
        'bin2gray / gray2bin: pointer encoding',
        'double_sync: 2-FF synchroniser with asynchronous reset',
        'dpram: 32 × 8 true dual-clock RAM (Quartus altsyncram wrapper)',
        'AsyncFIFO_top: DE2-115 wrapper with debounced write/read keys, switches, LEDs and hex displays',
      ],
    },
    hardware: ['Terasic DE2-115 (Intel Cyclone IV E EP4CE115F29C7)', 'CLOCK_50 for writes, CLOCK2_50 / 4 for reads, keys, switches, hex displays'],
    software: ['Intel Quartus Prime (Lite)', 'TimeQuest with SDC constraints', 'ModelSim with altera_mf'],
    methodology: [
      'SDC: create_clock on both inputs, create_generated_clock for the ÷4 read clock, set_clock_groups -asynchronous between domains.',
      'Testbench clocks at 10 and 14 time units (non-integer ratio).',
      '40 write attempts into the 32-deep FIFO (last 8 must be blocked by full), then 45 read attempts (surplus must be blocked by empty).',
      'Every accepted write is pushed to an expected queue and every read is compared in order; PASS only with 0 errors and exactly 32 in / 32 out.',
    ],
    results: {
      intro: 'Self-checking scoreboard testbench (sim/AsyncFIFO_tb.v):',
      table: {
        head: ['Check', 'Expectation'],
        rows: [
          ['Writes accepted', 'exactly 32 of 40 (8 blocked by full)'],
          ['Reads accepted', 'exactly 32 of 45 (surplus blocked by empty)'],
          ['Data order', 'every read matches the expected queue'],
        ],
      },
    },
    limitations: ['The RAM is a vendor IP wrapper, which ties the design to Intel devices.'],
    future: [
      'Replace the RAM with inferred RTL for portability to Vivado and ASIC flows.',
      'SystemVerilog assertions (no write when full, no read when empty) and constrained-random clock ratios with coverage.',
      'Almost-full / almost-empty thresholds; parameterise depth with $clog2.',
    ],
    viz: 'fifo',
  },
];

export type MiniProject = {
  title: string;
  domain: string;
  summary: string;
  points: string[];
  stack: string[];
  repo?: string;
  source: 'Repository' | 'Report only' | 'Resume entry only';
  team?: string;
};

export const additional: MiniProject[] = [
  {
    title: 'Verilog Digital Design Labs',
    domain: 'Digital design',
    summary: 'Combinational and sequential building blocks in gate-level, dataflow and behavioural styles, plus a counter on the DE2-115.',
    points: ['4×4 array multiplier, ripple adders, 64:1 mux tree, one-hot encoder', 'SISO / SIPO / PISO / PIPO shift registers, ring and up/down counters', '50 MHz → 1 Hz divider, 4-bit counter and 7-segment decoder on Cyclone IV'],
    stack: ['Verilog', 'ModelSim', 'Quartus'],
    repo: `${GH}/verilog-digital-design-labs`,
    source: 'Repository',
  },
  {
    title: 'ESP32 PID Line Follower',
    domain: 'Robotics · Embedded',
    summary: 'Three stages of line-follower firmware, ending with a 5-sensor PID controller tuned live over Bluetooth.',
    points: ['QTR reflectance array calibrated at power-up; error = 2000 − position', 'Kp / Ki / Kd sent as 2-byte Bluetooth commands with decimal multipliers', 'Arduino version raises Timer0 PWM to ≈ 7.8 kHz for low-speed motor control'],
    stack: ['ESP32', 'Arduino', 'PID', 'Bluetooth', 'L298N'],
    repo: `${GH}/arduino-esp32-line-follower`,
    source: 'Repository',
  },
  {
    title: 'RF Amplifier Stability & Max-Gain Analysis',
    domain: 'RF · Microwave',
    summary: 'Works through amplifier design checks from measured S-parameters at 2.5, 3.2 and 4.5 GHz.',
    points: ['Rollett K and |Δ| for unconditional stability', 'Source and load stability circles', 'Conjugate-match Γs, ΓL and maximum available gain'],
    stack: ['Python', 'NumPy', 'S-parameters'],
    repo: `${GH}/rf-amplifier-stability-analysis`,
    source: 'Repository',
  },
  {
    title: 'Li-Fi Controlled Robot',
    domain: 'Optical communication · Robotics',
    summary: 'A robot car that receives Forward / Left / Right / Stop commands as coded visible-light pulses instead of RF.',
    points: ['LED / torch transmitter → photodiode / LDR receiver circuit', 'Arduino / ESP32 decodes the pulse pattern in real time', 'L298N motor driver; validated in the lab at TRL 3–4'],
    stack: ['Arduino / ESP32', 'Photodiode', 'L298N'],
    source: 'Report only',
    team: 'Team of 4',
  },
  {
    title: 'Hybrid FSO–Optical Fibre Link',
    domain: 'Optical communication · Simulation',
    summary: 'Visibility-aware hybrid link that switches between free-space optics and fibre, compared on BER, Q-factor and received power.',
    points: ['OptiSystem FSO chain: PRBS, NRZ, MZ modulator, 1 km FSO channel, PIN photodiode, Bessel filter, BER analyser', 'Switching unit selects FSO in clear air and fibre in fog'],
    stack: ['OptiSystem'],
    source: 'Report only',
    team: 'Team of 2',
  },
  {
    title: 'Solar-Powered Visible Light Communication Link',
    domain: 'Optical · Analog',
    summary: 'LED transmitter and photodiode receiver with analog filtering and a microcontroller, powered from solar.',
    points: ['Source files and measurements are not available, so no results are claimed here.'],
    stack: ['LED / photodiode', 'Analog filters', 'Microcontroller'],
    source: 'Resume entry only',
  },
];
