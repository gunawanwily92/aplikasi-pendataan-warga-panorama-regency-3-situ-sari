import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types/census';
import { findUserByCredentials } from '../data/users';
import { LogoBlokD } from './LogoBlokD';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const user = findUserByCredentials(username, password);

      if (user) {
        const authUser: AuthUser = {
          username: user.username,
          nama: user.nama,
          jabatan: user.jabatan,
          loginTime: new Date().toISOString(),
        };

        if (rememberMe) {
          localStorage.setItem('PR3_AUTH_USER_SESSION', JSON.stringify(authUser));
        } else {
          sessionStorage.setItem('PR3_AUTH_USER_SESSION', JSON.stringify(authUser));
        }

        onLoginSuccess(authUser);
      } else {
        setErrorMessage('Username atau kata sandi tidak valid. Silakan periksa kembali!');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <LogoBlokD className="w-20 h-20 shadow-2xl ring-2 ring-blue-400/40 mx-auto mb-2" />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Akses Pengurus Data Blok D</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Data Warga Blok D
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Panorama Regency 3 • Desa Situ Sari, Cileungsi
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          <div className="border-b border-slate-700/70 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Masuk ke Sistem</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan username dan kata sandi pengurus untuk mengakses semua data dan menu.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukkan username..."
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 text-white placeholder:text-slate-500 rounded-xl text-sm border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukkan kata sandi..."
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 text-white placeholder:text-slate-500 rounded-xl text-sm border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Ingat sesi masuk ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer ring-1 ring-blue-500 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© 2025 Paguyuban Blok D Panorama Regency 3 Situ Sari</p>
          <p className="text-[11px]">Sistem Informasi & Manajemen Database Kependudukan Digital</p>
        </div>
      </div>
    </div>
  );
};
