<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\View\View;

class PosTerminalController extends Controller
{
    /**
     * Render the POS terminal (cashier) page.
     */
    public function index(): View
    {
        /** @var User $user */
        $user = auth()->user();

        /** @var Outlet|null $outlet */
        $outlet = $user->outlet;

        return view('pos.index', [
            'cashierName' => $user->name,
            'outletId' => $outlet?->id,
            'outletName' => $outlet?->name ?? 'Outlet Tidak Diatur',
        ]);
    }
}
