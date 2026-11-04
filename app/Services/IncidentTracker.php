<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SystemIncident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class IncidentTracker
{
    /**
     * Capture an unhandled exception or critical error and record it to system_incidents.
     */
    public static function capture(Throwable $e, ?Request $request = null): ?SystemIncident
    {
        try {
            $request = $request ?? (app()->bound('request') ? app('request') : null);

            $statusCode = 500;
            if ($e instanceof HttpExceptionInterface) {
                $statusCode = $e->getStatusCode();
            }

            // We primarily care about 5xx server faults and severe errors
            $severity = $statusCode >= 500 ? 'critical' : 'warning';

            $user = Auth::user();
            $tenantId = $user?->tenant_id ?? (app()->bound('currentTenant') ? app('currentTenant')?->id : null);

            $url = $request ? $request->fullUrl() : (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'CLI / Background Job');
            $method = $request ? $request->method() : (isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'CLI');
            $ip = $request ? $request->ip() : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null);
            $userAgent = $request ? substr((string) $request->userAgent(), 0, 500) : null;
            $routeName = $request?->route() ? $request->route()->getName() : null;

            // Generate clean trace summary (first 8 lines)
            $traces = explode("\n", $e->getTraceAsString());
            $traceSummary = implode("\n", array_slice($traces, 0, 10));

            return SystemIncident::create([
                'tenant_id' => $tenantId,
                'user_id' => $user?->id,
                'user_name' => $user?->name,
                'user_email' => $user?->email,
                'user_role' => $user?->role,
                'url' => $url,
                'route_name' => $routeName,
                'method' => $method,
                'status_code' => $statusCode,
                'error_type' => get_class($e),
                'message' => substr($e->getMessage() ?: 'Unspecified runtime exception', 0, 2000),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace_summary' => $traceSummary,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'severity' => $severity,
                'status' => 'open',
            ]);
        } catch (Throwable $internalException) {
            // Failsafe: log to Laravel log file without interrupting app flow
            Log::error('IncidentTracker failed to record incident: '.$internalException->getMessage());

            return null;
        }
    }
}
