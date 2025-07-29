import React from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import { User } from '@/types/UserRolePermission';
import Header from '../HomeComponents/Header';
import Footer from '../HomeComponents/Footer';

export default function AccountSetting() {
  const { auth } = usePage<{ auth: { user: User } }>().props;
  const user = auth.user;
  const { data, setData, patch, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    patch(route('user.profile.update'));
  }

  const [showPasswordForm, setShowPasswordForm] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Head title="Pengaturan Akun" />
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-8 sm:py-12 flex-1 w-full">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 sm:p-8 border border-indigo-100 dark:border-slate-700 max-w-xl mx-auto w-full space-y-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-200 mb-6 flex items-center gap-2 justify-center">
            Pengaturan Akun
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Nama Pengguna</label>
              <input type="text" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.name} onChange={e => setData('name', e.target.value)} />
              {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
            </div>
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Email</label>
              <input type="email" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.email} onChange={e => setData('email', e.target.value)} />
              {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
            </div>
            <button
              type="button"
              className="w-full px-4 py-2 mt-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-xl font-semibold shadow hover:bg-indigo-200 dark:hover:bg-indigo-900 transition flex items-center justify-between"
              onClick={() => setShowPasswordForm((prev) => !prev)}
              aria-expanded={showPasswordForm}
            >
              <span>Ubah Kata Sandi</span>
              <span>{showPasswordForm ? '▲' : '▼'}</span>
            </button>
            {showPasswordForm && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Kata Sandi Baru</label>
                  <input type="password" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.password} onChange={e => setData('password', e.target.value)} autoComplete="new-password" />
                  {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                </div>
                <div>
                  <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Konfirmasi Kata Sandi</label>
                  <input type="password" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                  {errors.password_confirmation && <div className="text-red-500 text-sm">{errors.password_confirmation}</div>}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-10 justify-center">
            <button type="submit" className="px-8 py-3 bg-indigo-600 dark:bg-indigo-800 text-white rounded-full font-bold shadow hover:bg-indigo-700 dark:hover:bg-indigo-900 transition" disabled={processing}>Simpan Perubahan</button>
          </div>
        </form>
      </main>
    </div>
  );
}
