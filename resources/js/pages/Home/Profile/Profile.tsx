




import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ProfileCustomer } from '@/types/ProfileCustomer';
import Header from '../HomeComponents/Header';
import Footer from '../HomeComponents/Footer';
import AccountSetting from './AccountSetting';
import ProfileSetting from './ProfileSetting';

interface ProfileProps {
  profile: ProfileCustomer;
}

export default function Profile({ profile }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'profile'>('profile');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-950 flex flex-col">
      <Head title="Account & Profile Setting" />
      <Header />
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="max-w-xl mx-auto w-full mb-8 flex justify-center gap-4">
          <button
            className={`px-6 py-2 rounded-full font-bold shadow transition border-2 border-indigo-600 dark:border-indigo-300 ${activeTab === 'profile' ? 'bg-indigo-600 dark:bg-indigo-800 text-white' : 'bg-white dark:bg-indigo-950 text-indigo-700 dark:text-indigo-200'}`}
            onClick={() => setActiveTab('profile')}
          >
            Pengaturan Profil
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold shadow transition border-2 border-indigo-600 dark:border-indigo-300 ${activeTab === 'account' ? 'bg-indigo-600 dark:bg-indigo-800 text-white' : 'bg-white dark:bg-indigo-950 text-indigo-700 dark:text-indigo-200'}`}
            onClick={() => setActiveTab('account')}
          >
            Pengaturan Akun
          </button>
        </div>
        {activeTab === 'profile' ? (
          <ProfileSetting profile={profile} />
        ) : (
          <AccountSetting />
        )}
      </main>
      <Footer />
    </div>
  );
}

