<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    /**
     * Display the Help Center & Customer Support page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        return Inertia::render('Help/Index', [
            'userName' => $user?->name ?? 'Pengguna',
            'role' => $user?->role ?? 'owner',
            'outletName' => $user?->outlet?->name ?? 'Outlet Utama',
            'tenantName' => $user?->tenant?->name ?? 'QLon Store',
        ]);
    }
}
