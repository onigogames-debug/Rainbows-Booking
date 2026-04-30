import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, MessageSquare, User, Clock, AlertCircle, Calendar } from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      // Prevent indexing of event pages
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);

      eventService.getEvent(id).then(data => {
        setEvent(data);
        setLoading(false);
        
        if (data) {
          // Initialize default responses to 'ok'
          const initial: Record<string, Availability> = {};
          data.dates.forEach(d => initial[d.date] = 'ok');
          setResponses(initial);

          // Check if I have already responded
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

      return () => {
        document.head.removeChild(meta);
      };
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

    setSubmitting(true);
    try {
      const { event: updatedEvent, participantId } = await eventService.submitResponse(
        id, 
        { name, responses, comment },
        myParticipantId || undefined
      );

      setEvent({ ...updatedEvent });
      localStorage.setItem(`event_auth_${id}`, participantId);
      setMyParticipantId(participantId);
      alert(myParticipantId ? '回答を更新しました！' : '回答を送信しました！');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('エラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
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
    <div className="fade-in" style={{ display: 'grid', gap: '1.5rem' }}>
      {/* 1. Event Info Header */}
      <div className="glass-card">
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{event.title}</h2>
        <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>{event.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Calendar size={16} /> 作成日: {format(new Date(event.createdAt || Date.now()), 'yyyy/MM/dd')}
        </div>
      </div>

      {/* 2. Availability Table (Top Results) */}
      <div className="glass-card" style={{ overflowX: 'hidden' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={24} /> 出欠状況
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '2px solid #eee', width: '80px' }}>日程</th>
              {event.participants.map(p => (
                <th key={p.id} style={{ padding: '0.75rem 0.25rem', borderBottom: '2px solid #eee', fontWeight: 600, fontSize: '0.85rem' }}>
                  {p.name}
                  {p.id === myParticipantId && <div style={{ fontSize: '0.6rem', color: 'var(--accent-1)' }}>(自分)</div>}
                </th>
              ))}
              <th style={{ padding: '0.75rem 0.25rem', borderBottom: '2px solid #eee', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                計
              </th>
            </tr>
          </thead>
          <tbody>
            {event.dates.map(date => {
              const stats = {
                ok: event.participants.filter(p => p.responses[date.date] === 'ok').length,
                maybe: event.participants.filter(p => p.responses[date.date] === 'maybe').length,
                no: event.participants.filter(p => p.responses[date.date] === 'no').length,
              };

              return (
                <tr key={date.date}>
                  <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{format(new Date(date.date), 'MM/dd (eee)', { locale: ja })}</div>
                    {date.time && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{date.time}〜</div>}
                  </td>
                  {event.participants.map(p => (
                    <td key={p.id} style={{ padding: '0.5rem 0.25rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <AvailabilityIcon type={p.responses[date.date]} />
                    </td>
                  ))}
                  <td style={{ padding: '0.5rem 0.25rem', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: '#4caf50' }}>{stats.ok}</span>/ 
                    <span style={{ color: '#ff9800' }}>{stats.maybe}</span>/ 
                    <span style={{ color: '#f44336' }}>{stats.no}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {event.participants.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={16} /> コメント一覧
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {event.participants.filter(p => p.comment).map(p => (
                <div key={p.id} style={{ fontSize: '0.9rem', background: '#f8f9fa', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}:</span>
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>{p.comment}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Registration Form (Middle) */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} /> {myParticipantId ? '回答を更新する' : '出欠を回答する'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：オギ監"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>出欠回答</label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {event.dates.map(date => (
                <div key={date.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: 600 }}>{format(new Date(date.date), 'MM/dd (eee)', { locale: ja })}</span>
                    {date.time && <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{date.time}〜</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>コメント（任意）</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="例：少し遅れるかもしれません！"
              rows={2}
            />
          </div>

          <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {submitting ? '送信中...' : myParticipantId ? '回答を更新する' : 'この内容で回答する'}
          </button>
        </form>
      </div>

      {/* 4. URL Copy Section (Bottom) */}
      <div className="glass-card" style={{ textAlign: 'center', background: 'var(--bg-gradient)', color: 'white' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>メンバーに共有しましょう</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>
          このページのURLを送るだけで、みんなの出欠を集計できます。
        </p>
        <button 
          onClick={copyLink} 
          className="secondary" 
          style={{ 
            width: '100%', 
            background: 'white', 
            color: 'var(--text-primary)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          {copied ? <Check size={20} color="#4caf50" /> : <Copy size={20} />}
          {copied ? 'URLをコピーしました！' : 'イベントURLをコピーする'}
        </button>
      </div>
    </div>
  );
}

function AvailabilityIcon({ type }: { type: Availability }) {
  return <span style={{ color: type === 'ok' ? '#4caf50' : type === 'maybe' ? '#ff9800' : '#f44336', fontSize: '1.2rem', fontWeight: 'bold' }}>
    {type === 'ok' ? '○' : type === 'maybe' ? '△' : '×'}
  </span>;
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
        padding: '0.4rem 0.6rem',
        background: active ? styles[type].color : 'white',
        color: active ? 'white' : '#ccc',
        border: `2px solid ${active ? styles[type].color : '#eee'}`,
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        minWidth: '40px'
      }}
    >
      {styles[type].label}
    </button>
  );
}
