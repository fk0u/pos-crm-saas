<!DOCTYPE html>
<html lang="id" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Owner Dashboard — {{ $tenantName }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-full bg-slate-100 text-slate-900">
    <div id="owner-dashboard-app">
        <div id="owner-dashboard">
            @include('dashboard.content')
        </div>
    </div>
</body>
</html>
