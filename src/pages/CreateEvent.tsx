import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { eventService } from '../services/eventService';
import Confetti from 'react-confetti';

export function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState<string[]>([]);
  const [isCreated, setIsCreated] = useState(false);

  const handleAddDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date && !dates.includes(date)) {
      setDates([...dates, date].sort());
    }
  };

  const removeDate = (dateToRemove: string) => {
    setDates(dates.filter(d => d !== dateToRemove));
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <AnimatePresence>
              {dates.map((date) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--secondary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600
                  }}
                >
                  {format(new Date(date), 'MM/dd (eee)', { locale: ja })}
                  <X
                    size={16}
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                    onClick={() => removeDate(date)}
                  />
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
