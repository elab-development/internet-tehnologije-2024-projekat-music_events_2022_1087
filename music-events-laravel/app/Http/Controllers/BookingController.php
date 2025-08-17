<?php

namespace App\Http\Controllers;

use App\Exports\BookingExport;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        // Must be logged in
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        // Return ONLY this user's bookings (buyer = user_id)
        $bookings = Booking::with('event')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        return response()->json([
            'message'  => 'Your bookings retrieved successfully!',
            'bookings' => BookingResource::collection($bookings),
        ]);
    }
   
    public function store(Request $request)
    {
        // Validacija podataka
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id', // Proverava da li događaj postoji
            'number_of_tickets' => 'required|integer|min:1', // Broj karata mora biti pozitivan broj
        ]);

        // Kreiranje rezervacije
        $booking = Booking::create([
            'user_id' => auth()->id(), // Preuzima ID trenutno ulogovanog korisnika
            'event_id' => $validated['event_id'],
            'number_of_tickets' => $validated['number_of_tickets'],
            'total_price' => Event::find($validated['event_id'])->price * $validated['number_of_tickets'],
        ]);

        return response()->json([
            'message' => 'Booking created successfully!',
            'booking' => new BookingResource($booking),
        ], 201);
    }

    /**
     * Azuriranje rezervacije (samo za svoje rezervacije)
     */
    public function update(Request $request, $id)
    {
        // Pronađi rezervaciju
        $booking = Booking::find($id);
    
        // Provera vlasništva rezervacije
        if (!$booking || $booking->user_id !== auth()->id()) {
            return response()->json(['error' => 'You can only update your own bookings'], 403);
        }
    
        // Validacija podataka
        $validated = $request->validate([
            'number_of_tickets' => 'required|integer|min:1',
        ]);
    
        // Ažuriranje rezervacije
        $booking->update([
            'number_of_tickets' => $validated['number_of_tickets'],
            'total_price' => $booking->event->price * $validated['number_of_tickets'], // Preracunavanje totalne cene
        ]);
    
        return response()->json([
            'message' => 'Booking updated successfully!',
            'booking' => $booking,
        ]);
    }

    public function destroy($id)
    {
        $booking = Booking::find($id);

        if (!$booking || $booking->user_id !== auth()->id()) {
            return response()->json(['error' => 'You can only delete your own bookings'], 403);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully!',
        ]);
    }

    public function export()
    {
        if (!auth()->user() || !auth()->user()->is_manager) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        // Generisanje excel fajla
        return \Maatwebsite\Excel\Facades\Excel::download(new BookingExport, 'bookings.xlsx');
    }

    public function stats(Request $request)
    {
        // mora biti prijavljen i menadžer
        if (!auth()->check() || !auth()->user()->is_manager) {
            return response()->json(['error' => 'Unauthorized. Managers only.'], 403);
        }

        // Osnovni agregati
        $summary = [
            'total_bookings'           => (int) Booking::count(),
            'tickets_sold'             => (int) Booking::sum('number_of_tickets'),
            'total_revenue'            => (int) Booking::sum('total_price'),
            'avg_tickets_per_booking'  => round((float) Booking::avg('number_of_tickets'), 2),
        ];

        // Grupisano po događaju
        $perEvent = Booking::selectRaw('event_id, COUNT(*) as bookings, SUM(number_of_tickets) as tickets, SUM(total_price) as revenue')
            ->groupBy('event_id')
            ->with(['event:id,title'])
            ->get()
            ->map(function ($r) {
                return [
                    'event_id'    => (int) $r->event_id,
                    'event_title' => $r->event->title ?? ('#' . $r->event_id),
                    'bookings'    => (int) $r->bookings,
                    'tickets'     => (int) $r->tickets,
                    'revenue'     => (int) $r->revenue,
                ];
            })
            ->values();

        // Poslednjih 30 dana – dnevni promet & broj rezervacija
        $since = Carbon::today()->subDays(30);
        $last30 = Booking::selectRaw('DATE(created_at) as day, COUNT(*) as bookings, SUM(total_price) as revenue')
            ->where('created_at', '>=', $since)
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function ($r) {
                return [
                    'day'      => (string) $r->day,
                    'bookings' => (int) $r->bookings,
                    'revenue'  => (int) $r->revenue,
                ];
            });

        return response()->json([
            'message'        => 'Booking stats retrieved.',
            'summary'        => $summary,
            'per_event'      => $perEvent,
            'last_30_days'   => $last30,
        ]);
    }

}
