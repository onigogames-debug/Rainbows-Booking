import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, MessageSquare, User, Clock, AlertCircle, Calendar, Users } from 'lucide-react';
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
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (id) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);

      eventService.getEvent(id).then(data => {
        setEvent(data);
        setLoading(false);
        
        if (data) {
          const initial: Record<string, Availability> = {};
          data.dates.forEach(d => initial[d.date] = 'ok');
          setResponses(initial);

          const savedId = localStorage.getItem(`event_auth_${id}`);
          if (savedId) {
            setMyParticipantId(savedId);
            const me = data.participants.find(p => p.id === savedId);
            if (me) {
              setName(me.name);
              setComment(me.comment || '');
              setResponses(me.responses);
            }
          }
        }
      });

      return () => { document.head.removeChild(meta); };
    }
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('URLをコピーしました！');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !event) return;

    setSubmitting(true);
    try {
      const { event: updatedEvent, participantId } = await eventService.submitResponse(
        id, { name, responses, comment }, myParticipantId || undefined
      );
      setEvent({ ...updatedEvent });
      localStorage.setItem(`event_auth_${id}`, participantId);
      setMyParticipantId(participantId);
      showToast('回答を送信しました！');
    } catch (error) {
      console.error('Failed to submit:', error);
      showToast('エラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading & Error States ──
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>読み込み中...</div>
    </div>
  );

  if (!event) return (
    <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
      <AlertCircle size={56} color="var(--accent-1)" style={{ marginBottom: '1rem' }} />
      <h2 style={{ marginBottom: '0.5rem' }}>イベントが見つかりません</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>URLが正しいかご確認ください。</p>
      <Link to="/"><button>ホームに戻る</button></Link>
    </div>
  );

  const hasParticipants = event.participants.length > 0;

  // ── Main Render ──
  return (
    <div className="fade-in" style={{ display: 'grid', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast"><Check size={16} /> {toast}</div>
        </div>
      )}

      {/* 1. Header */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{event.title}</h2>
        {event.description && (
          <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            {event.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Calendar size={14} />
          {format(new Date(event.createdAt || Date.now()), 'yyyy年MM月dd日 作成', { locale: ja })}
          <span style={{ marginLeft: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={14} /> {event.participants.length}名回答
          </span>
        </div>
      </div>

      {/* 2. Results Table */}
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
          <Clock size={20} /> 出欠状況
        </h3>

        {!hasParticipants ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
            <Users size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>まだ回答がありません</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>下のフォームから最初の回答を送信しましょう</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: hasParticipants ? 'auto' : undefined }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0.4rem', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }}>日程</th>
                    {event.participants.map(p => (
                      <th key={p.id} style={{ padding: '0.6rem 0.3rem', borderBottom: '2px solid #eee', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                        {p.name}
                        {p.id === myParticipantId && <div style={{ fontSize: '0.6rem', color: '#667eea', fontWeight: 400 }}>自分</div>}
                      </th>
                    ))}
                    <th style={{ padding: '0.6rem 0.3rem', borderBottom: '2px solid #eee', color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>集計</th>
                  </tr>
                </thead>
                <tbody>
                  {event.dates.map(date => {
                    const stats = {
                      ok: event.participants.filter(p => p.responses[date.date] === 'ok').length,
                      maybe: event.participants.filter(p => p.responses[date.date] === 'maybe').length,
                      no: event.participants.filter(p => p.responses[date.date] === 'no').length,
                    };
                    const total = event.participants.length;
                    const ratio = total > 0 ? stats.ok / total : 0;

                    return (
                      <tr key={date.date} style={{ background: ratio >= 0.8 ? 'rgba(105, 240, 174, 0.08)' : undefined }}>
                        <td style={{ padding: '0.6rem 0.4rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {format(new Date(date.date), 'M/d (eee)', { locale: ja })}
                          </div>
                          {date.time && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{date.time}〜</div>}
                        </td>
                        {event.participants.map(p => (
                          <td key={p.id} style={{ padding: '0.4rem 0.2rem', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                            <AvailabilityIcon type={p.responses[date.date]} />
                          </td>
                        ))}
                        <td style={{ padding: '0.4rem 0.2rem', borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#4caf50', fontWeight: 600 }}>{stats.ok}</span>
                          <span style={{ color: '#ccc' }}>/</span>
                          <span style={{ color: '#ff9800' }}>{stats.maybe}</span>
                          <span style={{ color: '#ccc' }}>/</span>
                          <span style={{ color: '#f44336' }}>{stats.no}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Comments */}
            {event.participants.some(p => p.comment) && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={14} /> コメント
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {event.participants.filter(p => p.comment).map(p => (
                    <div key={p.id} style={{ fontSize: '0.85rem', background: '#f8f9fa', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{p.comment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Response Form */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
          <User size={20} /> {myParticipantId ? '回答を更新する' : '出欠を回答する'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label>お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：オギ監"
              required
            />
          </div>

          <div>
            <label style={{ marginBottom: '0.75rem' }}>出欠回答</label>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {event.dates.map(date => (
                <div key={date.date} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' 
                }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{format(new Date(date.date), 'M/d (eee)', { locale: ja })}</span>
                    {date.time && <span style={{ marginLeft: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{date.time}〜</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(['ok', 'maybe', 'no'] as Availability[]).map(type => (
                      <AvailabilityButton
                        key={type}
                        type={type}
                        active={responses[date.date] === type}
                        onClick={() => setResponses(prev => ({ ...prev, [date.date]: type }))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label>コメント（任意）</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="例：少し遅れるかもしれません"
            />
          </div>

          <button type="submit" disabled={submitting || !name.trim()} style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}>
            {submitting ? '送信中...' : myParticipantId ? '✓ 回答を更新する' : '✓ この内容で回答する'}
          </button>
        </form>
      </div>

      {/* 4. Share */}
      <div className="glass-card share-section">
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>メンバーに共有しましょう</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem', opacity: 0.85 }}>
          このURLを送るだけで出欠を集められます
        </p>
        <button 
          onClick={copyLink} 
          style={{ 
            width: '100%', background: 'white', color: 'var(--text-primary)',
            padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem'
          }}
        >
          {copied ? <Check size={18} color="#4caf50" /> : <Copy size={18} />}
          {copied ? 'コピーしました！' : 'イベントURLをコピー'}
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ──

function AvailabilityIcon({ type }: { type: Availability }) {
  const config = { ok: { symbol: '○', color: '#4caf50' }, maybe: { symbol: '△', color: '#ff9800' }, no: { symbol: '×', color: '#f44336' } };
  const c = config[type] || config.no;
  return <span style={{ color: c.color, fontSize: '1.1rem', fontWeight: 'bold' }}>{c.symbol}</span>;
}

function AvailabilityButton({ active, onClick, type }: { active: boolean, onClick: () => void, type: Availability }) {
  const config = { ok: { label: '○', color: '#4caf50' }, maybe: { label: '△', color: '#ff9800' }, no: { label: '×', color: '#f44336' } };
  const c = config[type];
  
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.35rem 0.55rem',
        background: active ? c.color : 'white',
        color: active ? 'white' : '#ccc',
        border: `2px solid ${active ? c.color : '#e0e0e0'}`,
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        minWidth: '38px',
        width: 'auto',
        boxShadow: active ? `0 2px 8px ${c.color}40` : 'none',
        transition: 'all 0.15s ease',
      }}
    >
      {c.label}
    </button>
  );
}
