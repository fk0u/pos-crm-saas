<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    /**
     * Render the Terms and Conditions page for QLon POS & CRM.
     */
    public function terms(Request $request): Response
    {
        return Inertia::render('Legal/Terms', [
            'lastUpdated' => '1 Januari 2026',
            'effectiveYear' => 2026,
            'appName' => 'QLon POS & CRM',
            'companyName' => 'PT QLon Teknologi Indonesia',
            'contactEmail' => 'legal@qlon.id',
            'dpoEmail' => 'dpo@qlon.id',
            'supportPhone' => '+62 821-4455-7788',
        ]);
    }

    /**
     * Render the Privacy Policy page for QLon POS & CRM.
     */
    public function privacy(Request $request): Response
    {
        return Inertia::render('Legal/Privacy', [
            'lastUpdated' => '1 Januari 2026',
            'effectiveYear' => 2026,
            'appName' => 'QLon POS & CRM',
            'companyName' => 'PT QLon Teknologi Indonesia',
            'contactEmail' => 'privacy@qlon.id',
            'dpoEmail' => 'dpo@qlon.id',
            'supportPhone' => '+62 821-4455-7788',
        ]);
    }
}

