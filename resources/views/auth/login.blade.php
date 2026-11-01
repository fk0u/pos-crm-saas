<!DOCTYPE html>
<html lang="id" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Kasir</title>
    @vite(['resources/css/app.css'])
</head>
<body class="h-full bg-slate-100">
    <div class="flex h-full items-center justify-center p-4">
        <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
            <h1 class="text-2xl font-black text-slate-800">☕ Kasir Kopi Kawan</h1>
            <p class="mt-1 text-sm text-slate-500">Login untuk mulai shift.</p>

            @if ($errors->any())
                <div class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}" class="mt-6 space-y-4">
                @csrf
                <div>
                    <label for="email" class="text-sm font-semibold text-slate-600">Email</label>
                    <input id="email" name="email" type="email" required value="{{ old('email') }}"
                           class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                </div>
                <div>
                    <label for="password" class="text-sm font-semibold text-slate-600">Password</label>
                    <input id="password" name="password" type="password" required
                           class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                </div>
                <button type="submit" class="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg hover:bg-blue-700">
                    Masuk
                </button>
            </form>
        </div>
    </div>
</body>
</html>
