
import { User } from '@/types/UserRolePermission';
import { ProfileCustomer } from '@/types/ProfileCustomer';
import { Head, useForm, usePage } from '@inertiajs/react';

interface ProfileSettingProps {
  profile: ProfileCustomer;
}

export default function ProfileSetting({ profile }: ProfileSettingProps) {
  const { auth } = usePage<{ auth: { user: User } }>().props;
  const user = auth.user;
  const { data, setData, patch, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: profile?.phone_number || '',
    pickup_address: profile?.pickup_address || '',
    address: profile?.address || '',
    pickup_latitude: profile?.pickup_latitude || '',
    pickup_longitude: profile?.pickup_longitude || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    patch(route('user.profile.update'));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Head title="Pengaturan Profil" />
      <main className="container mx-auto px-2 sm:px-4 md:px-6 py-8 sm:py-12 flex-1 w-full">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 sm:p-8 border border-indigo-100 dark:border-slate-700 max-w-xl mx-auto w-full space-y-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-200 mb-6 flex items-center gap-2 justify-center">
            Pengaturan Profil
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Nomor Telepon</label>
              <input type="text" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} />
              {errors.phone_number && <div className="text-red-500 text-sm">{errors.phone_number}</div>}
            </div>
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Alamat Penjemputan</label>
              <input type="text" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.pickup_address} onChange={e => setData('pickup_address', e.target.value)} />
              {errors.pickup_address && <div className="text-red-500 text-sm">{errors.pickup_address}</div>}
            </div>
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Alamat Lengkap</label>
              <input type="text" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.address} onChange={e => setData('address', e.target.value)} />
              {errors.address && <div className="text-red-500 text-sm">{errors.address}</div>}
            </div>
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Latitude</label>
              <input type="number" step="any" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.pickup_latitude} onChange={e => setData('pickup_latitude', e.target.value)} />
              {errors.pickup_latitude && <div className="text-red-500 text-sm">{errors.pickup_latitude}</div>}
            </div>
            <div>
              <label className="block font-semibold text-indigo-700 dark:text-indigo-200 mb-1">Longitude</label>
              <input type="number" step="any" className="w-full border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 focus:ring focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200" value={data.pickup_longitude} onChange={e => setData('pickup_longitude', e.target.value)} />
              {errors.pickup_longitude && <div className="text-red-500 text-sm">{errors.pickup_longitude}</div>}
            </div>
          </div>
          <div className="flex gap-2 mt-10 justify-center">
            <button type="submit" className="px-8 py-3 bg-indigo-600 dark:bg-indigo-800 text-white rounded-full font-bold shadow hover:bg-indigo-700 dark:hover:bg-indigo-900 transition" disabled={processing}>Simpan Perubahan</button>
          </div>
        </form>
      </main>
    </div>
  );
}
