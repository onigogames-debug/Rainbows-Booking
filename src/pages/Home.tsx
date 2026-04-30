import { Link } from 'react-router-dom';
import { Calendar, Users, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          イベントの日程調整を、もっと美しく、もっと簡単に。
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Rainbows Bookingは、シンプルで直感的な日程調整ツールです。<br />
          ログイン不要で、誰でもすぐに使い始められます。
        </p>

        <Link to="/create">
          <button style={{ fontSize: '1.2rem', padding: '0.8rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            イベントを作成する <ArrowRight size={20} />
          </button>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
            <Calendar size={32} color="var(--accent-2)" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>候補日を選択</h3>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>カレンダーから日程を選ぶだけ。</p>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
            <Share2 size={32} color="var(--accent-1)" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>URLを共有</h3>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>URLをメンバーに送るだけ。</p>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
            <Users size={32} color="var(--accent-3)" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>回答を集計</h3>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>一覧表を自動生成します。</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
