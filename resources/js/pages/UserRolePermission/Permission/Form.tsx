import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Permission } from '@/types/UserRolePermission';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Separator } from '@/components/ui/separator';

export default function PermissionForm({ permission }: { permission?: Permission }) {
  const isEdit = !!permission;
  const { data, setData, post, put, processing, errors } = useForm({
    name: permission ? permission.name : '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan', href: '/settings' },
    { title: 'Manajemen Hak Akses', href: '/permissions' },
    { title: isEdit ? 'Ubah Hak Akses' : 'Buat Hak Akses', href: '#' },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(route('permissions.update', permission!.id));
    } else {
      post(route('permissions.store'));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Ubah Hak Akses' : 'Buat Hak Akses'} />
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Pengaturan</h1>

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="w-full max-w-xl lg:w-48">
            <nav className="flex flex-col space-y-1">
              <Button asChild variant="ghost" size="sm" className="justify-start">
                <Link href="/users">Daftar Pengguna</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="justify-start">
                <Link href="/roles">Manajemen Peran</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="justify-start">
                <Link href="/permissions">Manajemen Hak Akses</Link>
              </Button>
            </nav>
          </aside>

          <Separator className="my-6 md:hidden" />

          <div className="flex-1 md:max-w-2xl space-y-6">
            <HeadingSmall
              title={isEdit ? 'Ubah Hak Akses' : 'Buat Hak Akses'}
              description="Isi detail di bawah ini"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Hak Akses</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
                <InputError message={errors.name} />
              </div>

              <div className="flex items-center space-x-4">
                <Button disabled={processing}>
                  {isEdit ? 'Perbarui Hak Akses' : 'Buat Hak Akses'}
                </Button>
                <Link
                  href={route('permissions.index')}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
