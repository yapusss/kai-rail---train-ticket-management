
import React from 'react';
import type { User } from '../types';

const MOCK_USER: User = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  memberId: 'KAI-12345678',
  avatarUrl: 'https://picsum.photos/seed/janedoe/200',
};

const AccountInfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

const AccountScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-8">
      <div className="flex flex-col items-center space-y-2">
        <img
          src={MOCK_USER.avatarUrl}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-4 border-red-500 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{MOCK_USER.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">{MOCK_USER.email}</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Informasi Akun</h3>
        <AccountInfoRow label="Nama Lengkap" value={MOCK_USER.name} />
        <AccountInfoRow label="Email" value={MOCK_USER.email} />
        <AccountInfoRow label="Member ID" value={MOCK_USER.memberId} />
      </div>

      <button className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-red-600 transition-colors">
        Keluar
      </button>
    </div>
  );
};

export default AccountScreen;
