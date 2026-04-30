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
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
          Rainbows Bookingは、シンプルで直感的な日程調整ツールです。<br />
          ログイン不要で、誰でもすぐに使い始められます。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, min-minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <Calendar size={48} color="var(--accent-2)" style={{ marginBottom: '1rem' }} />
            <h3>候補日を選択</h3>
            <p>カレンダーから日程を選ぶだけ。時間指定も自由自在です。</p>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <Share2 size={48} color="var(--accent-1)" style={{ marginBottom: '1rem' }} />
            <h3>URLを共有</h3>
            <p>生成されたURLをメンバーに送るだけ。アプリのインストールは不要です。</p>
          </div>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <Users size={48} color="var(--accent-3)" style={{ marginBottom: '1rem' }} />
            <h3>回答を集計</h3>
            <p>全員の空き状況がひと目でわかる一覧表を自動生成します。</p>
          </div>
        </div>

        <Link to="/create">
          <button style={{ fontSize: '1.4rem', padding: '1rem 3rem', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
            イベントを作成する <ArrowRight size={24} />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
