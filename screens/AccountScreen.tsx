
import React, { useState } from 'react';
import type { User } from '../types';
import Swal from 'sweetalert2';

const MOCK_USER: User = {
  name: 'RONA DAWUHAN',
  email: 'ronadawuhan@gmail.com',
  memberId: 'KAI-12345678',
  avatarUrl: '/rona.jpg',
};

type MenuOption = 
  | 'lihat-profil'
  | 'ganti-kata-sandi'
  | 'tentang'
  | 'pusat-bantuan'
  | 'metode-pembayaran'
  | 'daftar-penumpang'
  | 'bahasa'
  | 'keluar';

const MenuItem: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  onClick: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}> = ({ icon, title, onClick, showArrow = true, rightElement }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
  >
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <span className="text-gray-800 dark:text-gray-200 font-medium">{title}</span>
    </div>
    {rightElement || (showArrow && (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ))}
  </button>
);

const LanguageToggle: React.FC<{ language: string; onToggle: () => void }> = ({ language, onToggle }) => (
  <div className="flex items-center space-x-3">
    <span className={`text-sm ${language === 'ENG' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>IND</span>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        language === 'ENG' ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          language === 'ENG' ? 'transform translate-x-7' : 'transform translate-x-1'
        }`}
      />
    </button>
    <span className={`text-sm ${language === 'IND' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>ENG</span>
  </div>
);

const AccountScreen: React.FC = () => {
  const [language, setLanguage] = useState<'ENG' | 'IND'>('ENG');
  const [showDetail, setShowDetail] = useState<MenuOption | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleMenuClick = (option: MenuOption) => {
    if (option === 'bahasa') {
      setLanguage(language === 'ENG' ? 'IND' : 'ENG');
      return;
    }
    
    if (option === 'keluar') {
      Swal.fire({
        icon: 'warning',
        title: 'Konfirmasi Keluar',
        text: 'Apakah Anda yakin ingin keluar?',
        showCancelButton: true,
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil Keluar',
            text: 'Anda telah berhasil keluar dari aplikasi',
            confirmButtonText: 'Baik'
          });
        }
      });
      return;
    }

    setShowDetail(option);
  };

  const handleBack = () => {
    setShowDetail(null);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ENG' ? 'IND' : 'ENG');
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Minimal 8 karakter');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Huruf kecil');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Huruf besar');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Angka');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Karakter khusus');

    return { score, feedback };
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Sangat Lemah';
    if (score <= 2) return 'Lemah';
    if (score <= 3) return 'Sedang';
    if (score <= 4) return 'Kuat';
    return 'Sangat Kuat';
  };

  if (showDetail) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {showDetail === 'lihat-profil' && 'Lihat Profil'}
            {showDetail === 'ganti-kata-sandi' && 'Ganti Kata Sandi'}
            {showDetail === 'tentang' && 'Tentang Aplikasi'}
            {showDetail === 'pusat-bantuan' && 'Pusat Bantuan'}
            {showDetail === 'metode-pembayaran' && 'Metode Pembayaran'}
            {showDetail === 'daftar-penumpang' && 'Daftar Penumpang'}
          </h1>
        </div>

        {showDetail === 'lihat-profil' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg mx-auto overflow-hidden">
                  <img
                    src={MOCK_USER.avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover object-center scale-200"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{MOCK_USER.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{MOCK_USER.email}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Informasi Akun</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Nama Lengkap</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{MOCK_USER.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{MOCK_USER.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">Member ID</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{MOCK_USER.memberId}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700">
              Edit Profil
            </button>
          </div>
        )}

        {showDetail === 'ganti-kata-sandi' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Ganti Kata Sandi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kata Sandi Lama</label>
                  <div className="relative">
                    <input 
                      type={showPasswords.oldPassword ? "text" : "password"} 
                      value={passwords.oldPassword}
                      onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('oldPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.oldPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kata Sandi Baru</label>
                  <div className="relative">
                    <input 
                      type={showPasswords.newPassword ? "text" : "password"} 
                      value={passwords.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.newPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
{}
                  {passwords.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Kekuatan kata sandi:</span>
                        <span className={`text-xs font-medium ${getPasswordStrengthColor(calculatePasswordStrength(passwords.newPassword).score).replace('bg-', 'text-')}`}>
                          {getPasswordStrengthText(calculatePasswordStrength(passwords.newPassword).score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(calculatePasswordStrength(passwords.newPassword).score)}`}
                          style={{ width: `${(calculatePasswordStrength(passwords.newPassword).score / 5) * 100}%` }}
                        ></div>
                      </div>
                      {calculatePasswordStrength(passwords.newPassword).feedback.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tambahkan: {calculatePasswordStrength(passwords.newPassword).feedback.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input 
                      type={showPasswords.confirmPassword ? "text" : "password"} 
                      value={passwords.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
{}
                  {passwords.confirmPassword && (
                    <div className="mt-1">
                      {passwords.newPassword === passwords.confirmPassword ? (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center">                          
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Kata sandi tidak cocok
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!passwords.oldPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword || calculatePasswordStrength(passwords.newPassword).score < 3}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetail === 'tentang' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">🚄</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">KAI Access</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Versi 1.0.0</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Aplikasi resmi Kereta Api Indonesia untuk pemesanan tiket dan layanan perjalanan.
              </p>
            </div>
          </div>
        )}

        {showDetail === 'pusat-bantuan' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pusat Bantuan</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Cara Pemesanan Tiket</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Panduan lengkap pemesanan tiket</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Pembatalan Tiket</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Informasi pembatalan dan refund</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Hubungi Kami</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kontak customer service</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetail === 'metode-pembayaran' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Metode Pembayaran</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  + Tambah
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v2h16V6H4zm0 4v6h16v-6H4z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Visa **** 1234</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kadaluarsa 12/25</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => Swal.fire({
                        icon: 'info',
                        title: 'Edit Metode Pembayaran',
                        text: 'Fitur edit metode pembayaran akan segera tersedia',
                        confirmButtonText: 'Baik'
                      })}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Hapus Metode Pembayaran',
                          text: 'Apakah Anda yakin ingin menghapus metode pembayaran ini?',
                          showCancelButton: true,
                          confirmButtonText: 'Ya, Hapus',
                          cancelButtonText: 'Batal',
                          confirmButtonColor: '#ef4444'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            Swal.fire({
                              icon: 'success',
                              title: 'Berhasil Dihapus',
                              text: 'Metode pembayaran telah dihapus',
                              confirmButtonText: 'Baik'
                            });
                          }
                        });
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v2h16V6H4zm0 4v6h16v-6H4z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Mastercard **** 5678</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kadaluarsa 08/26</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => Swal.fire({
                        icon: 'info',
                        title: 'Edit Metode Pembayaran',
                        text: 'Fitur edit metode pembayaran akan segera tersedia',
                        confirmButtonText: 'Baik'
                      })}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Hapus Metode Pembayaran',
                          text: 'Apakah Anda yakin ingin menghapus metode pembayaran ini?',
                          showCancelButton: true,
                          confirmButtonText: 'Ya, Hapus',
                          cancelButtonText: 'Batal',
                          confirmButtonColor: '#ef4444'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            Swal.fire({
                              icon: 'success',
                              title: 'Berhasil Dihapus',
                              text: 'Metode pembayaran telah dihapus',
                              confirmButtonText: 'Baik'
                            });
                          }
                        });
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">BCA Virtual Account</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">1234567890</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => Swal.fire({
                        icon: 'info',
                        title: 'Edit Metode Pembayaran',
                        text: 'Fitur edit metode pembayaran akan segera tersedia',
                        confirmButtonText: 'Baik'
                      })}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Hapus Metode Pembayaran',
                          text: 'Apakah Anda yakin ingin menghapus metode pembayaran ini?',
                          showCancelButton: true,
                          confirmButtonText: 'Ya, Hapus',
                          cancelButtonText: 'Batal',
                          confirmButtonColor: '#ef4444'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            Swal.fire({
                              icon: 'success',
                              title: 'Berhasil Dihapus',
                              text: 'Metode pembayaran telah dihapus',
                              confirmButtonText: 'Baik'
                            });
                          }
                        });
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDetail === 'daftar-penumpang' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daftar Penumpang</h3>
                <button 
                  onClick={() => Swal.fire({
                    icon: 'info',
                    title: 'Tambah Penumpang',
                    text: 'Fitur tambah penumpang akan segera tersedia',
                    confirmButtonText: 'Baik'
                  })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  + Tambah
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">RONA DAWUHAN</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dewasa • NIK: 1234567890123456</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ronadawuhan@gmail.com</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button 
                      onClick={() => Swal.fire({
                        icon: 'info',
                        title: 'Edit Penumpang',
                        text: 'Fitur edit penumpang akan segera tersedia',
                        confirmButtonText: 'Baik'
                      })}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Hapus Penumpang',
                          text: 'Apakah Anda yakin ingin menghapus penumpang ini?',
                          showCancelButton: true,
                          confirmButtonText: 'Ya, Hapus',
                          cancelButtonText: 'Batal',
                          confirmButtonColor: '#ef4444'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            Swal.fire({
                              icon: 'success',
                              title: 'Berhasil Dihapus',
                              text: 'Penumpang telah dihapus dari daftar',
                              confirmButtonText: 'Baik'
                            });
                          }
                        });
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">JOHN SMITH</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dewasa • NIK: 9876543210987654</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">john.smith@email.com</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button 
                      onClick={() => Swal.fire({
                        icon: 'info',
                        title: 'Edit Penumpang',
                        text: 'Fitur edit penumpang akan segera tersedia',
                        confirmButtonText: 'Baik'
                      })}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Hapus Penumpang',
                          text: 'Apakah Anda yakin ingin menghapus penumpang ini?',
                          showCancelButton: true,
                          confirmButtonText: 'Ya, Hapus',
                          cancelButtonText: 'Batal',
                          confirmButtonColor: '#ef4444'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            Swal.fire({
                              icon: 'success',
                              title: 'Berhasil Dihapus',
                              text: 'Penumpang telah dihapus dari daftar',
                              confirmButtonText: 'Baik'
                            });
                          }
                        });
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg overflow-hidden">
          <img
            src={MOCK_USER.avatarUrl}
            alt="User Avatar"
            className="w-full h-full object-cover object-center scale-200"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{MOCK_USER.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{MOCK_USER.email}</p>
        </div>
      </div>

      {}
      <div className="space-y-3">
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          title="Lihat Profil" 
          onClick={() => handleMenuClick('lihat-profil')}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          title="Ganti Kata Sandi" 
          onClick={() => handleMenuClick('ganti-kata-sandi')}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Tentang" 
          onClick={() => handleMenuClick('tentang')}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
          }
          title="Pusat Bantuan" 
          onClick={() => handleMenuClick('pusat-bantuan')}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          title="Metode Pembayaran" 
          onClick={() => handleMenuClick('metode-pembayaran')}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="Daftar Penumpang" 
          onClick={() => handleMenuClick('daftar-penumpang')}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          }
          title="Bahasa" 
          onClick={() => handleMenuClick('bahasa')}
          rightElement={<LanguageToggle language={language} onToggle={toggleLanguage} />}
          showArrow={false}
        />
        <MenuItem 
          icon={
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
          title="Keluar" 
          onClick={() => handleMenuClick('keluar')}
        />
      </div>
    </div>
  );
};

export default AccountScreen;
