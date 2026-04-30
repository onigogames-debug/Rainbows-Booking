import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { eventService } from '../services/eventService';
import Confetti from 'react-confetti';
import type { EventDate } from '../types';

export function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState<EventDate[]>([]);
  const [isCreated, setIsCreated] = useState(false);

  const handleAddDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date && !dates.find(d => d.date === date)) {
      setDates([...dates, { date }].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  const updateDateTime = (dateStr: string, time: string) => {
    setDates(dates.map(d => d.date === dateStr ? { ...d, time } : d));
  };

  const removeDate = (dateToRemove: string) => {
    setDates(dates.filter(d => d.date !== dateToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || dates.length === 0) return;

    const event = await eventService.createEvent(title, description, dates);
    setIsCreated(true);
    
    // Wait a bit before navigating to show confetti
    setTimeout(() => {
      navigate(`/e/${event.id}`);
    }, 3000);
  };

  if (isCreated) {
    return (
      <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
        <Confetti numberOfPieces={200} recycle={false} />
        <div style={{ background: 'var(--accent-3)', color: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <Check size={48} />
        </div>
        <h2 style={{ fontSize: '2.5rem' }}>作成完了！</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          イベントページに移動します...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
      style={{ maxWidth: '700px', margin: '0 auto' }}
    >
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Plus color="var(--accent-2)" /> 新しいイベントを作成
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="title">イベント名</label>
          <input
            id="title"
            type="text"
            placeholder="例：週末のバーベキュー、野球の練習試合"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="description">詳細・メモ (任意)</label>
          <textarea
            id="description"
            rows={3}
            placeholder="集合場所や持ち物など"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label>候補日を選択</label>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <CalendarIcon style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={20} />
            <input
              type="date"
              onChange={handleAddDate}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <AnimatePresence>
              {dates.map((item) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="glass-card"
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'white',
                    border: '1px solid #eee'
                  }}
                >
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {format(new Date(item.date), 'MM/dd (eee)', { locale: ja })}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="time"
                      value={item.time || ''}
                      onChange={(e) => updateDateTime(item.date, e.target.value)}
                      style={{ width: 'auto', padding: '4px 8px', borderRadius: '6px' }}
                    />
                    <X
                      size={20}
                      style={{ cursor: 'pointer', opacity: 0.5, color: 'var(--accent-1)' }}
                      onClick={() => removeDate(item.date)}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {dates.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                カレンダーから日程を選択してください（複数可）
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!title || dates.length === 0}
          style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', opacity: (!title || dates.length === 0) ? 0.5 : 1 }}
        >
          イベントを作成して共有する
        </button>
      </form>
    </motion.div>
  );
}
