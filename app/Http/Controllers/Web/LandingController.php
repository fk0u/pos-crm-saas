<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Display public landing page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Landing/Index', [
            'isAuthenticated' => Auth::check(),
            'user' => Auth::user() ? [
                'name' => Auth::user()->name,
                'role' => Auth::user()->role,
            ] : null,
        ]);
    }

    /**
     * Display public pricing and plans page.
     */
    public function pricing(Request $request): Response
    {
        return Inertia::render('Landing/Pricing', [
            'isAuthenticated' => Auth::check(),
            'user' => Auth::user() ? [
                'name' => Auth::user()->name,
                'role' => Auth::user()->role,
            ] : null,
        ]);
    }
}
