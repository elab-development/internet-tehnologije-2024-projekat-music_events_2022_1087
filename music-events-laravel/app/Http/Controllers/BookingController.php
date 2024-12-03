<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Event;

class BookingController extends Controller
{
    public function index()
{
    // Provera da li je korisnik admin
    if (!auth()->user() || !auth()->user()->is_manager) {
        return response()->json(['error' => 'Unauthorized. Only managers can view all bookings.'], 403);
    }

   // Dohvati sve rezervacije sa relacijama (korisnik i događaj)
   $bookings = Booking::with(['user', 'event'])->paginate(10);

    return response()->json([
        'message' => 'All bookings retrieved successfully!',
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

    

}
