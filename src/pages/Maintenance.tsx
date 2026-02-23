import { useState } from 'react';
import { Leaf, Wrench, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export function Maintenance() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = () => {
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-[#f8faf8] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-cw   { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes spin-ccw  { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }

        .float    { animation: float 5s ease-in-out infinite; }
        .fade-1   { animation: fadeUp 0.6s ease both 0.10s; }
        .fade-2   { animation: fadeUp 0.6s ease both 0.25s; }
        .fade-3   { animation: fadeUp 0.6s ease both 0.40s; }
        .fade-4   { animation: fadeUp 0.6s ease both 0.55s; }
        .fade-5   { animation: fadeUp 0.6s ease both 0.70s; }
        .spin-cw  { animation: spin-cw  18s linear infinite; }
        .spin-ccw { animation: spin-ccw 12s linear infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #4CAF50, #81C784, #2E7D32, #4CAF50);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .dot-1 { animation: pulse-dot 1.4s ease-in-out infinite 0.0s; }
        .dot-2 { animation: pulse-dot 1.4s ease-in-out infinite 0.2s; }
        .dot-3 { animation: pulse-dot 1.4s ease-in-out infinite 0.4s; }

        .card-shadow {
          box-shadow: 0 1px 3px rgba(0,0,0,0.06),
                      0 4px 16px rgba(76,175,80,0.08),
                      0 0 0 1px rgba(76,175,80,0.08);
        }

        .input-focus:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76,175,80,0.12);
        }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="w-full px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#4CAF50]" />
          <span
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '0.05em' }}
            className="text-lg font-bold text-gray-900"
          >
            FOOPTRA
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-400 dot-1" />
          <span className="text-xs font-medium text-amber-700">Maintenance</span>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div className="text-left">
            {/* Badge */}
            <div className="fade-1 inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-8">
              <Wrench className="w-3.5 h-3.5 text-[#4CAF50]" />
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Sedang dalam perbaikan
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="fade-2 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6"
            >
              Kami sedang
              <br />
              <span className="shimmer-text">memperbarui</span>
              <br />
              semuanya.
            </h1>

            {/* Sub */}
            <p className="fade-3 text-gray-500 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              FOOPTRA sedang menjalani pemeliharaan terjadwal untuk menghadirkan
              pengalaman yang lebih baik, lebih cepat, dan lebih andal bagi Anda.
            </p>

            {/* Checklist */}
            <div className="fade-3 space-y-3 mb-10">
              {[
                'Peningkatan performa & kecepatan sistem',
                'Fitur pelacakan sampah makanan yang baru',
                'Keamanan data yang lebih kuat',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50]" />
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            {/* Notify form */}
            <div className="fade-4">
              {!submitted ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Beritahu saya saat sudah kembali:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <input
                      type="email"
                      placeholder="email@anda.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNotify()}
                      className="input-focus flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 transition-all"
                    />
                    <button
                      onClick={handleNotify}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
                    >
                      Beritahu Saya
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-4 max-w-md">
                  <CheckCircle className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Terima kasih!</p>
                    <p className="text-xs text-green-600">
                      Kami akan memberitahu Anda di{' '}
                      <span className="font-medium">{email}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="fade-5 mt-8 flex items-center gap-2 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              <span>Pertanyaan mendesak?</span>
              <a href="mailto:support@fooptra.com" className="text-[#4CAF50] font-medium hover:underline">
                support@fooptra.com
              </a>
            </div>
          </div>

          {/* Right — Illustration */}
          <div className="fade-2 hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80">
              {/* Outer ring CW */}
              <svg className="spin-cw absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                <circle
                  cx="160" cy="160" r="150"
                  fill="none" stroke="#4CAF50" strokeWidth="1"
                  strokeOpacity="0.15" strokeDasharray="8 6"
                />
              </svg>

              {/* Inner ring CCW */}
              <svg
                className="spin-ccw absolute"
                style={{ inset: '24px', width: 'calc(100% - 48px)', height: 'calc(100% - 48px)' }}
                viewBox="0 0 224 224"
              >
                <circle
                  cx="112" cy="112" r="104"
                  fill="none" stroke="#4CAF50" strokeWidth="1"
                  strokeOpacity="0.25" strokeDasharray="4 8"
                />
              </svg>

              {/* Radial glow */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.10) 0%, transparent 70%)' }}
              />

              {/* Center card */}
              <div className="float absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-3xl bg-white card-shadow flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center shadow-lg">
                    <Wrench className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Orbiting dots */}
              {[0, 120, 240].map((deg, i) => (
                <div
                  key={deg}
                  className="absolute w-3 h-3 rounded-full bg-[#4CAF50]"
                  style={{
                    top:  `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 130}px - 6px)`,
                    left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 130}px - 6px)`,
                    opacity: 0.3 + i * 0.2,
                  }}
                />
              ))}

              {/* Status badge */}
              <div className="absolute -bottom-4 -right-4 bg-white card-shadow rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] dot-1" />
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] dot-2" />
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] dot-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Sistem diperbarui</p>
                  <p className="text-[10px] text-gray-400">Segera kembali online</p>
                </div>
              </div>

              {/* Leaf badge */}
              <div className="absolute -top-4 -left-4 bg-white card-shadow rounded-2xl p-3">
                <Leaf className="w-6 h-6 text-[#4CAF50]" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="w-full px-6 py-5 border-t border-gray-100 bg-white/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[#4CAF50]" />
          <span className="text-sm text-gray-400">© 2025 FOOPTRA. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Maintenance berlangsung — mohon tunggu sebentar</span>
        </div>
      </footer>
    </div>
  );
}