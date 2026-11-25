import { useReveal } from '../lib/hooks';

// Four figures, each traceable to a report or log in the named repository.
const items = [
  { value: '+5.852 ns', label: 'Worst negative slack at 100 MHz', src: 'GPS engine · Vivado post-route' },
  { value: '1000 / 1000', label: 'FIR outputs bit-exact vs. golden model', src: 'FIR filter · tb_fir_core' },
  { value: '32', label: 'Runtime-selectable parallel correlators', src: 'GPS engine · Artix-7' },
  { value: '97.73 %', label: 'CAN sender accuracy (simulation)', src: 'CAN IDS · digital twin' },
];

export default function Strip() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div className="strip" ref={ref}>
      <div className="container strip__grid">
        {items.map((it, i) => (
          <div key={it.label} className={`strip__item reveal reveal-d${i}`}>
            <div className="strip__value">{it.value}</div>
            <div className="strip__label">{it.label}</div>
            <div className="strip__src mono">{it.src}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
