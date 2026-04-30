# 🌈 Rainbows Booking by オギ監さん

「調整さん」と同等の機能を、モダンな技術スタックとプレミアムなデザインで再現した日程調整ツールです。

![Rainbow Booking](https://img.shields.io/badge/Status-Beta-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF)

## ✨ 特徴

- **爆速・快適**: ログイン不要。数クリックでイベント作成が完了します。
- **プレミアムデザイン**: 視認性が高く、使っていて心地よいモダンなUI。
- **モバイルファースト**: スマートフォンからの回答もスムーズ。
- **高いカスタマイズ性**: React + TypeScriptで構築されており、機能拡張が容易。

## 🚀 使い方

1. `イベントを作成する`ボタンをクリック。
2. イベント名、詳細、候補日を入力。
3. 生成されたURLをLINEやメールで共有。
4. メンバーが回答すると、リアルタイムで集計表が更新されます。

## 🛠 技術スタック

- **Frontend**: React, TypeScript, Vite
- **Styling**: Vanilla CSS (Modern Design Tokens)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Unique IDs**: nanoid

## 📦 ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 🌐 デプロイ方法

### GitHub Pages / Vercel / Netlify
フロントエンドのみで動作するため、リポジトリをGitHubにプッシュするだけで、VercelやNetlifyに簡単にデプロイ可能です。

> [!NOTE]
> 現在のバージョンでは `localStorage` を使用しているため、データはブラウザに保存されます。
> 本格的な運用（異なるデバイス間での同期）には、Supabase 等のバックエンド連携を推奨します。

### Supabase 連携（推奨）
共有機能を有効にするには、Supabase で以下の設定を行ってください。

1. **テーブルの作成**: Supabase の SQL Editor で以下のコマンドを実行します。

```sql
create table events (
  id text primary key,
  title text not null,
  description text,
  dates jsonb not null,
  participants jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 全員が読み書きできるように設定（デモ用）
alter table events enable row level security;
create policy "Allow public access" on events for all using (true) with check (true);
```

2. **環境変数の設定**: `.env` ファイルを作成し、Supabase の URL と Anon Key を設定します。

```env
VITE_SUPABASE_URL=あなたのプロジェクトURL
VITE_SUPABASE_ANON_KEY=あなたのAnon Key
```

## 📄 ライセンス
MIT License
