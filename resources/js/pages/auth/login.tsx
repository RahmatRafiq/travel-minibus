import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { FcGoogle } from "react-icons/fc"; 
import { FaGithub } from "react-icons/fa"; 

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        // Logo aplikasi dapat diletakkan di sini jika ingin menampilkan branding visual.
        // Logo Laravel default dihilangkan agar identitas aplikasi lebih jelas.
        // Contoh penggunaan logo:
        // import AppLogo from '@/components/app-logo';
        // <AppLogo />
        <AuthLayout
            title={"Zazy Travel\nBone Makassar"}
            description={
                "Masukkan email dan kata sandi Anda di bawah ini untuk masuk ke aplikasi.\nZazy Travel Bone Makassar"
            }
        >
            <Head title="Masuk" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@contoh.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Kata Sandi</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Kata Sandi"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Ingat saya</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>
                    <Button
                        type="button"
                        className="bg-red-500 hover:bg-red-600 w-full flex items-center justify-center gap-2"
                        onClick={() => (window.location.href = route('auth.redirect', { provider: 'google' }))}
                    >
                        <FcGoogle size={20} /> Masuk dengan Google
                    </Button>
                    <Button
                        type="button"
                        className="bg-gray-800 hover:bg-gray-900 text-white w-full flex items-center justify-center gap-2"
                        onClick={() => (window.location.href = route('auth.redirect', { provider: 'github' }))}
                    >
                        <FaGithub size={20} /> Masuk dengan GitHub
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Daftar
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
