<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SupportChatController extends Controller
{
    /**
     * Get or create active ticket and its messages.
     */
    public function getActiveConversation(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['ticket' => null, 'messages' => []], 401);
        }

        if ($user->isSuperAdmin()) {
            $requestedTicketId = $request->query('ticket_id');
            if ($requestedTicketId) {
                $ticket = SupportTicket::with(['tenant:id,name', 'user:id,name,role'])->find($requestedTicketId);
                $messages = $ticket ? $ticket->messages()->with('user:id,name,role')->get() : [];
            } else {
                $ticket = SupportTicket::with(['tenant:id,name', 'user:id,name,role'])
                    ->whereIn('status', ['open', 'in_progress'])
                    ->latest()
                    ->first();
                $messages = $ticket ? $ticket->messages()->with('user:id,name,role')->get() : [];
            }

            $allOpenTickets = SupportTicket::with(['tenant:id,name', 'user:id,name,role'])
                ->whereIn('status', ['open', 'in_progress'])
                ->latest()
                ->take(10)
                ->get();

            return response()->json([
                'ticket' => $ticket,
                'messages' => $messages,
                'is_admin' => true,
                'admin_tickets' => $allOpenTickets,
            ]);
        }

        $tenantId = $user->tenant_id ?? TenantContext::current();

        if (! $tenantId) {
            return response()->json([
                'ticket' => null,
                'messages' => [],
                'is_admin' => false,
            ]);
        }

        $ticket = SupportTicket::firstOrCreate(
            ['tenant_id' => $tenantId, 'user_id' => $user->id, 'status' => 'open'],
            ['subject' => 'Bantuan Operasional POS', 'priority' => 'medium']
        );

        $messages = $ticket->messages()->with('user:id,name,role')->get();

        return response()->json([
            'ticket' => $ticket,
            'messages' => $messages,
        ]);
    }

    /**
     * Send a real-time message to support.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'ticket_id' => ['required', 'string'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $query = SupportTicket::query();
        if (! $user->isSuperAdmin()) {
            if (! $tenantId) {
                return response()->json(['error' => 'Tenant context required'], 403);
            }
            $query->where('tenant_id', $tenantId);
        }

        $ticket = $query->findOrFail($validated['ticket_id']);

        $message = SupportMessage::create([
            'id' => (string) Str::uuid(),
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_from_support' => $user->role === 'superadmin',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $message->load('user:id,name,role'),
        ]);
    }
}
