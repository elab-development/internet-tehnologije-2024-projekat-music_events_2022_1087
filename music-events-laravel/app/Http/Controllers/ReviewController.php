<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReviewResource;
use App\Models\Booking;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, $bookingId)
{
    // Pronađi rezervaciju
    $booking = Booking::find($bookingId);

    // Proveri da li rezervacija postoji i da li pripada trenutno ulogovanom korisniku
    if (!$booking || $booking->user_id !== auth()->id()) {
        return response()->json(['error' => 'You can only leave a review for your own bookings'], 403);
    }

    // Proveri da li je korisnik menadzer
    if (auth()->user()->is_manager) {
        return response()->json(['error' => 'Managers cannot leave reviews'], 403);
    }

    // Validacija podataka
    $validated = $request->validate([
        'rating' => 'required|integer|min:1|max:5', // Ocena između 1 i 5
        'comment' => 'required|string',    
    ]);

    // Proveri da li vec postoji recenzija za ovu rezervaciju
    if ($booking->review) {
        return response()->json(['error' => 'A review already exists for this booking'], 400);
    }

    $review = $booking->review()->create([
        'user_id' => auth()->id(),
        'rating' => $validated['rating'],
        'comment' => $validated['comment'],
    ]);

    return response()->json([
        'message' => 'Review created successfully!',
        'review' => new ReviewResource($review),
    ], 201);
}

}
