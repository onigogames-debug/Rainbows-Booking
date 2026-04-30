import { Link } from 'react-router-dom';
import { Calendar, Users, Share2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero */}
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2.5rem 1.5rem' }}>
          <div style={{ 
            display: 'inline-flex', padding: '0.75rem', 
            background: 'var(--bg-gradient)', borderRadius: '16px', 
            marginBottom: '1.25rem', color: 'white' 
          }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            日程調整を、もっと簡単に。
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            ログイン不要。URLを送るだけで<br />
            みんなの予定をサクッと集計できます。
          </p>

          <Link to="/create" style={{ textDecoration: 'none' }}>
            <button style={{ 
              fontSize: '1.1rem', padding: '0.9rem 2rem', 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem' 
            }}>
              イベントを作成する <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { icon: <Calendar size={28} color="#667eea" />, title: '日程を選ぶ', desc: 'カレンダーから候補日を選択' },
            { icon: <Share2 size={28} color="#764ba2" />, title: 'URLを共有', desc: 'LINEやメールで送るだけ' },
            { icon: <Users size={28} color="#69f0ae" />, title: '自動で集計', desc: '出欠を一覧表で確認' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="glass-card"
              style={{ textAlign: 'center', padding: '1.25rem 0.75rem' }}
            >
              <div style={{ marginBottom: '0.5rem' }}>{step.icon}</div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
