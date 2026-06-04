'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/lib/api';
import Layout from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Home() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            {t.appName}
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              className={`flex-1 py-3 rounded-md font-semibold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setMode('login')}
            >
              {t.login}
            </button>
            <button
              className={`flex-1 py-3 rounded-md font-semibold transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setMode('register')}
            >
              {t.register}
            </button>
          </div>
          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </Layout>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser(data);
      localStorage.setItem('token', (await result).token);
      router.push('/borrower');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.email}</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
        <input
          type="password"
          {...register('password')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
      >
        {isLoading ? 'Logging in...' : t.login}
      </button>
    </form>
  );
}

function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser(data);
      localStorage.setItem('token', (await result).token);
      router.push('/borrower');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.firstName}</label>
          <input
            {...register('firstName')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.lastName}</label>
          <input
            {...register('lastName')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.email}</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.phone}</label>
        <input
          {...register('phone')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
        <input
          type="password"
          {...register('password')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
      >
        {isLoading ? 'Creating account...' : t.createAccount}
      </button>
    </form>
  );
}
