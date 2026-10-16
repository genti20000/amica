import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  TicketCheck,
  Users,
  Wine,
} from 'lucide-react';

type VesperTab = 'tonight' | 'concierge' | 'pass';

export const VesperPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VesperTab>('tonight');
  const [previewTime, setPreviewTime] = useState('20:00');
  const [previewSpace, setPreviewSpace] = useState('Main dining room');
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeApplied, setChangeApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [appliedPartySize, setAppliedPartySize] = useState(2);
  const [message, setMessage] = useState('');

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());

  const openChangePreview = () => {
    setChangeApplied(false);
    setPartySize(appliedPartySize);
    setChangeOpen(true);
  };

  const applyChange = () => {
    setPreviewTime('20:15');
    setPreviewSpace('Cocktail bar high-top');
    setAppliedPartySize(partySize);
    setChangeApplied(true);
    setChangeOpen(false);
  };

  const undoChange = () => {
    setPreviewTime('20:00');
    setPreviewSpace('Main dining room');
    setPartySize(2);
    setAppliedPartySize(2);
    setChangeApplied(false);
  };

  return (
    <div className="vesper-app">
      <div className="vesper-shell">
        <header className="vesper-header">
          <a className="vesper-wordmark" href="/vesper" aria-label="Vesper home">VESPER<span>®</span></a>
          <button className="vesper-avatar-button" type="button" aria-label="Guest profile">
            <span>G</span>
          </button>
        </header>

        <div className="vesper-context">
          <span className="vesper-live-dot" />
          <span>YOUR EVENING</span>
          <span className="vesper-context-separator">/</span>
          <span>{dateLabel.toUpperCase()}</span>
        </div>

        <main className="vesper-main">
          {activeTab === 'tonight' && (
            <section className="vesper-screen" aria-labelledby="tonight-title">
              <div className="vesper-title-row">
                <div>
                  <p className="vesper-eyebrow">A GOOD EVENING, WELL PLANNED</p>
                  <h1 id="tonight-title">Tonight<span className="vesper-title-period">.</span></h1>
                </div>
                <span className="vesper-preview-pill">DESIGN PREVIEW</span>
              </div>

              <div className="vesper-booking-card">
                <div className="vesper-card-topline">
                  <span className="vesper-eyebrow">YOUR TABLE</span>
                  <span className="vesper-status-pill"><span className="vesper-status-dot" /> PREVIEW</span>
                </div>
                <div className="vesper-booking-heading">
                  <div>
                    <h2>An evening for two</h2>
                    <p>Illustrative reservation · not a live booking</p>
                  </div>
                  <div className="vesper-booking-emblem"><Wine size={22} strokeWidth={1.4} /></div>
                </div>
                <div className="vesper-booking-details">
                  <div><CalendarDays size={17} /><span>{dateLabel}</span></div>
                  <div className={changeApplied ? 'vesper-detail-changed' : ''}>
                    <Clock3 size={17} /><span>{previewTime} <small>· 2 hours</small></span>
                  </div>
                  <div className={changeApplied ? 'vesper-detail-changed' : ''}>
                    <MapPin size={17} /><span>{previewSpace}</span>
                  </div>
                  <div><Users size={17} /><span>{appliedPartySize} guests</span></div>
                </div>

                <div className="vesper-booking-footer">
                  <span>Reference <strong>DEMO-042</strong></span>
                  <button type="button" onClick={() => setActiveTab('concierge')}>
                    Manage <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {changeApplied && (
                <div className="vesper-undo-banner" role="status">
                  <span><Check size={16} /> Preview updated to 8:15 PM</span>
                  <button type="button" onClick={undoChange}><RotateCcw size={14} /> Undo</button>
                </div>
              )}

              <div className="vesper-section-heading">
                <div>
                  <p className="vesper-eyebrow">A THOUGHTFUL ALTERNATIVE</p>
                  <h2>A little more room to arrive.</h2>
                </div>
                <Sparkles size={18} className="vesper-muted-icon" />
              </div>

              <button className="vesper-suggestion-card" type="button" onClick={() => setActiveTab('concierge')}>
                <span className="vesper-suggestion-time">8:15<span>PM</span></span>
                <span className="vesper-suggestion-copy">
                  <strong>A high-top by the cocktail bar</strong>
                  <small>Sample suggestion · availability is not live</small>
                </span>
                <ArrowUpRight size={18} />
              </button>

              <button type="button" className="vesper-outline-action" onClick={() => setActiveTab('concierge')}>
                Ask the concierge <ArrowRight size={16} />
              </button>

              <div className="vesper-cause-note">
                <span className="vesper-cause-line" />
                <p>Every suggested change shows what moves and what stays the same before you apply it.</p>
              </div>
            </section>
          )}

          {activeTab === 'concierge' && (
            <section className="vesper-screen" aria-labelledby="concierge-title">
              <div className="vesper-title-row">
                <div>
                  <p className="vesper-eyebrow">HERE TO MAKE IT EASY</p>
                  <h1 id="concierge-title">Concierge<span className="vesper-title-period">.</span></h1>
                </div>
              </div>

              <div className="vesper-concierge-hero">
                <div className="vesper-orb-wrap" aria-hidden="true">
                  <span className="vesper-orb-halo" />
                  <span className="vesper-orb"><span /></span>
                </div>
                <p className="vesper-eyebrow">VESPER CONCIERGE · CONCEPT PREVIEW</p>
                <h2>What would make tonight feel right?</h2>
                <p className="vesper-concierge-copy">Explore a different time, atmosphere or table setup. Suggestions here are illustrative, not connected to live inventory.</p>
              </div>

              <div className="vesper-quick-prompts" aria-label="Concierge prompts">
                {['A quieter table', 'Cocktails first', 'Arrive a little later'].map((prompt) => (
                  <button type="button" key={prompt} onClick={() => setMessage(prompt)}>{prompt}<ArrowUpRight size={13} /></button>
                ))}
              </div>

              <div className="vesper-suggestion-panel">
                <div className="vesper-panel-heading">
                  <div><p className="vesper-eyebrow">ONE IDEA FOR YOUR EVENING</p><h2>Shift by 15 minutes.</h2></div>
                  <span className="vesper-preview-pill">SAMPLE</span>
                </div>
                <p className="vesper-panel-description">A later arrival and a high-top beside the bar. Your party size stays the same.</p>
                <div className="vesper-alternative-row">
                  <div><Clock3 size={16} /><span>8:15 PM</span><small>Old time <s>8:00 PM</s></small></div>
                  <div><MapPin size={16} /><span>Bar high-top</span><small>Old space <s>Main dining</s></small></div>
                </div>
                <button type="button" className="vesper-primary-action" onClick={openChangePreview}>
                  Review this change <ArrowRight size={16} />
                </button>
              </div>

              <div className="vesper-message-box">
                <MessageCircle size={17} />
                <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask for a different kind of evening" aria-label="Message the concierge" />
                <button type="button" aria-label="Send message" onClick={() => setMessage('')}><ArrowRight size={16} /></button>
              </div>
            </section>
          )}

          {activeTab === 'pass' && (
            <section className="vesper-screen" aria-labelledby="pass-title">
              <div className="vesper-title-row">
                <div>
                  <p className="vesper-eyebrow">YOURS, WHENEVER YOU NEED IT</p>
                  <h1 id="pass-title">Your Pass<span className="vesper-title-period">.</span></h1>
                </div>
              </div>

              <div className="vesper-pass-card">
                <div className="vesper-pass-top">
                  <div><p className="vesper-eyebrow">VESPER · DIGITAL PASS PREVIEW</p><h2>Good evenings,<br />kept close.</h2></div>
                  <TicketCheck size={23} strokeWidth={1.4} />
                </div>
                <div className="vesper-pass-code" aria-hidden="true">
                  {Array.from({ length: 31 }, (_, index) => <span key={index} style={{ height: `${18 + ((index * 17) % 24)}px` }} />)}
                </div>
                <div className="vesper-pass-bottom"><span>GUEST PASS · PREVIEW</span><span>NOT VALID FOR ENTRY</span></div>
              </div>

              <div className="vesper-section-heading">
                <div><p className="vesper-eyebrow">SAVED FOR LATER</p><h2>Your kind of table.</h2></div>
              </div>
              <div className="vesper-saved-card">
                <div className="vesper-saved-icon"><MapPin size={18} /></div>
                <div><strong>{saved ? 'Cocktail bar high-top' : 'Save a spot you love'}</strong><small>{saved ? 'Saved in this design preview' : 'Keep a favourite setup close at hand.'}</small></div>
                <button type="button" onClick={() => setSaved((value) => !value)} aria-label={saved ? 'Remove saved spot' : 'Save a spot'}>
                  {saved ? <Check size={17} /> : <Plus size={17} />}
                </button>
              </div>
              <div className="vesper-perks-note">
                <Sparkles size={17} />
                <div><strong>Personal touches</strong><p>Saved places and any venue benefits can live here once configured.</p></div>
              </div>
            </section>
          )}
        </main>

        {changeOpen && (
          <div className="vesper-modal-backdrop" role="presentation" onClick={() => setChangeOpen(false)}>
            <section className="vesper-change-sheet" role="dialog" aria-modal="true" aria-labelledby="change-title" onClick={(event) => event.stopPropagation()}>
              <div className="vesper-sheet-handle" />
              <p className="vesper-eyebrow">CLEAR BEFORE YOU CHANGE</p>
              <h2 id="change-title">Review the difference.</h2>
              <p className="vesper-sheet-caption">This is a local design preview. No reservation will be changed.</p>
              <div className="vesper-timeline">
                <div className="vesper-timeline-dot vesper-timeline-old"><Minus size={13} /></div>
                <div><small>AS BOOKED</small><strong>8:00 PM · Main dining room</strong><span>{appliedPartySize} guests · 2 hours</span></div>
                <ArrowDownLeft size={16} className="vesper-timeline-arrow" />
                <div className="vesper-timeline-dot vesper-timeline-new"><Plus size={13} /></div>
                <div><small>PROPOSED</small><strong>8:15 PM · Cocktail bar high-top</strong><span>{partySize} guests · 2 hours {partySize === appliedPartySize && <em>unchanged</em>}</span></div>
              </div>
              <div className="vesper-party-control">
                <span><Users size={16} /> Party size</span>
                <div>
                  <button type="button" aria-label="Decrease party size" onClick={() => setPartySize((value) => Math.max(1, value - 1))}><Minus size={14} /></button>
                  <strong>{partySize}</strong>
                  <button type="button" aria-label="Increase party size" onClick={() => setPartySize((value) => Math.min(12, value + 1))}><Plus size={14} /></button>
                </div>
              </div>
              <button type="button" className="vesper-primary-action" onClick={applyChange}>Apply to preview <ArrowRight size={16} /></button>
              <button type="button" className="vesper-cancel-action" onClick={() => setChangeOpen(false)}>Keep current details</button>
            </section>
          </div>
        )}

        <nav className="vesper-tab-bar" aria-label="Vesper sections">
          <button type="button" className={activeTab === 'tonight' ? 'is-active' : ''} aria-current={activeTab === 'tonight' ? 'page' : undefined} onClick={() => setActiveTab('tonight')}>
            <CalendarDays size={19} /><span>Tonight</span>
          </button>
          <button type="button" className={activeTab === 'concierge' ? 'is-active' : ''} aria-current={activeTab === 'concierge' ? 'page' : undefined} onClick={() => setActiveTab('concierge')}>
            <span className="vesper-mini-orb" /><span>Concierge</span>
          </button>
          <button type="button" className={activeTab === 'pass' ? 'is-active' : ''} aria-current={activeTab === 'pass' ? 'page' : undefined} onClick={() => setActiveTab('pass')}>
            <TicketCheck size={19} /><span>Pass</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
