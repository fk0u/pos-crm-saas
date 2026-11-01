<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Lookup customer by phone number (CRM).
     */
    public function lookup(Request $request): JsonResponse
    {
        $phone = $request->query('phone');
        if (!$phone) {
            return response()->json(['success' => false, 'message' => 'Nomor telepon wajib diisi'], 422);
        }

        $customer = Customer::where('phone', $phone)->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'is_new' => true,
                'message' => 'Pelanggan belum terdaftar',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'is_new' => false,
            'data' => [
                'id' => $customer->id,
                'phone' => $customer->phone,
                'name' => $customer->name,
                'loyalty_points' => $customer->loyalty_points,
                'total_spend' => (float) $customer->total_spend,
                'visit_count' => $customer->visit_count,
                'last_visit' => $customer->last_visit_at?->diffForHumans(),
            ],
        ]);
    }
}
