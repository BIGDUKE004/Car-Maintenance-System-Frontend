import { X } from 'lucide-react';

export default function Modal({ kicker, title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="modal-card">
        <div className="modal-heading">
          <div><span className="panel-kicker">{kicker}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={19} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}
