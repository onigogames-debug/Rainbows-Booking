import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, MessageSquare, User, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { eventService } from '../services/eventService';
import type { EventData, Availability } from '../types';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [responses, setResponses] = useState<Record<string, Availability>>({});
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      eventService.getEvent(id).then(data => {
        setEvent(data);
        setLoading(false);
        // Initialize default responses to 'ok'
        if (data) {
          const initial: Record<string, Availability> = {};
          data.dates.forEach(d => initial[d] = 'ok');
          setResponses(initial);
        }
      });
    }
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !event) return;

    const updatedEvent = await eventService.submitResponse(id, { name, responses, comment });
    setEvent({ ...updatedEvent }); // Trigger re-render
    setName('');
    setComment('');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>読み込み中...</div>;
  if (!event) return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
      <AlertCircle size={64} color="var(--accent-1)" style={{ marginBottom: '1rem' }} />
      <h2>イベントが見つかりません</h2>
      <Link to="/"><button style={{ marginTop: '2rem' }}>ホームに戻る</button></Link>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'grid', gap: '2rem' }}>
      {/* Event Info Header */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{event.title}</h2>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </div>
          <button onClick={copyLink} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {copied ? <Check size={18} color="var(--accent-3)" /> : <Copy size={18} />}
            {copied ? 'コピーしました' : 'URLをコピー'}
          </button>
        </div>
      </div>

      {/* Availability Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={24} /> 出欠状況
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #eee' }}>日程</th>
              {event.participants.map(p => (
                <th key={p.id} style={{ padding: '1rem', borderBottom: '2px solid #eee', fontWeight: 600 }}>
                  {p.name}
                </th>
              ))}
              <th style={{ padding: '1rem', borderBottom: '2px solid #eee', color: 'var(--text-secondary)' }}>
                ○ / △ / ×
              </th>
            </tr>
          </thead>
          <tbody>
            {event.dates.map(date => {
              const stats = { ok: 0, maybe: 0, no: 0 };
              event.participants.forEach(p => {
                const res = p.responses[date];
                if (res) stats[res]++;
              });

              return (
                <tr key={date}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                    {format(new Date(date), 'MM/dd (eee)', { locale: ja })}
                  </td>
                  {event.participants.map(p => (
                    <td key={p.id} style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <AvailabilityIcon type={p.responses[date]} />
                    </td>
                  ))}
                  <td style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#4caf50' }}>{stats.ok}</span> / 
                    <span style={{ color: '#ff9800' }}> {stats.maybe}</span> / 
                    <span style={{ color: '#f44336' }}> {stats.no}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Comments Section */}
        <div style={{ marginTop: '2rem' }}>
          {event.participants.filter(p => p.comment).map(p => (
            <div key={p.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
              <MessageSquare size={20} color="var(--text-secondary)" />
              <div>
                <strong>{p.name}:</strong> <span style={{ color: 'var(--text-secondary)' }}>{p.comment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Form */}
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} /> あなたの回答を追加
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="name">お名前</label>
            <input
              id="name"
              type="text"
              placeholder="例：田中"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label>日程の都合</label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {event.dates.map(date => (
                <div key={date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#fff', border: '1px solid #eee', borderRadius: '12px' }}>
                  <span style={{ fontWeight: 600 }}>{format(new Date(date), 'MM/dd (eee)', { locale: ja })}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <AvailabilityButton 
                      active={responses[date] === 'ok'} 
                      onClick={() => setResponses({...responses, [date]: 'ok'})}
                      type="ok"
                    />
                    <AvailabilityButton 
                      active={responses[date] === 'maybe'} 
                      onClick={() => setResponses({...responses, [date]: 'maybe'})}
                      type="maybe"
                    />
                    <AvailabilityButton 
                      active={responses[date] === 'no'} 
                      onClick={() => setResponses({...responses, [date]: 'no'})}
                      type="no"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="comment">コメント (任意)</label>
            <input
              id="comment"
              type="text"
              placeholder="遅れるかもしれません、など"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '1rem' }} disabled={!name}>
            回答を登録する
          </button>
        </form>
      </div>
    </div>
  );
}

function AvailabilityIcon({ type }: { type: Availability }) {
  if (type === 'ok') return <span style={{ color: '#4caf50', fontSize: '1.5rem', fontWeight: 'bold' }}>○</span>;
  if (type === 'maybe') return <span style={{ color: '#ff9800', fontSize: '1.5rem', fontWeight: 'bold' }}>△</span>;
  return <span style={{ color: '#f44336', fontSize: '1.5rem', fontWeight: 'bold' }}>×</span>;
}

function AvailabilityButton({ active, onClick, type }: { active: boolean, onClick: () => void, type: Availability }) {
  const styles = {
    ok: { label: '○', color: '#4caf50' },
    maybe: { label: '△', color: '#ff9800' },
    no: { label: '×', color: '#f44336' }
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        background: active ? styles[type].color : 'white',
        color: active ? 'white' : '#ccc',
        border: `2px solid ${active ? styles[type].color : '#eee'}`,
        borderRadius: '8px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        minWidth: '50px'
      }}
    >
      {styles[type].label}
    </button>
  );
}
