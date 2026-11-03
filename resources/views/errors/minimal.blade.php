<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Terjadi Gangguan - QLon POS & CRM</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.5rem;
        }
        .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 1.5rem;
            padding: 2.5rem;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .badge {
            width: 4.5rem;
            height: 4.5rem;
            border-radius: 1.25rem;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            color: #0f2b5c;
            font-size: 2rem;
            font-weight: 900;
        }
        h1 { font-size: 1.5rem; font-weight: 900; margin-bottom: 0.5rem; color: #0f2b5c; }
        p { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin-bottom: 2rem; }
        .btn-group { display: flex; gap: 0.75rem; }
        .btn {
            flex: 1;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .btn-primary { background: #0f2b5c; color: #ffffff; border: none; }
        .btn-primary:hover { background: #163a75; }
        .btn-secondary { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; }
        .btn-secondary:hover { background: #f1f5f9; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">QL</div>
        <h1>@yield('code', '500') - @yield('title', 'Terjadi Gangguan')</h1>
        <p>@yield('message', 'Sistem sedang memproses pemulihan data transaksi. Harap muat ulang halaman.')</p>
        <div class="btn-group">
            <button class="btn btn-secondary" onclick="window.location.reload()">Muat Ulang</button>
            <a href="/dashboard" class="btn btn-primary">Kembali ke Dasbor</a>
        </div>
    </div>
</body>
</html>
