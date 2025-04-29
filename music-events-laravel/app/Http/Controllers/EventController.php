<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use App\Http\Resources\EventResource;

class EventController extends Controller
{
    
    public function index()
    {
        return response()->json(Event::all(), 200);
    }

  
    public function show($id)
    {
        $event = Event::findOrFail($id); // Pronalazenje događaja ili greska 404
        return new EventResource($event); 
    }

    //kreiranje dogadjaja - samo menadzeri
    public function store(Request $request)
    {
        
        if (!auth()->user() || !auth()->user()->is_manager) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validacija zahteva
        $validated = $request->validate([
            'title' => 'required|string|max:50',
            'description' => 'required|string',
            'date' => 'required|date',
            'time' => 'required',
            'location' => 'required|string',
            'performer' => 'required|string',
            'price' => 'required|integer|min:0',
            'type' => 'required|string|in:concert,festival,opera,benefit concert',
        ]);

        $event = Event::create($validated);

        return new EventResource($event); 
    }

    //azuriranje  dogadjaja - samo menadzer
    public function update(Request $request, $id)
    {
        // Provera da li je korisnik menadžer
        if (!auth()->user() || !auth()->user()->is_manager) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'location' => 'required|string',
            'performer' => 'required|string',
            'type' => 'required|string|in:concert,festival,opera,benefit concert',
        ]);

        $event = Event::findOrFail($id);
        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully!',
            'event' => new EventResource($event),
        ]);
    }

   //brisanje dogadjaja - samo menadzer
    public function destroy($id)
    {
        // Provera da li je korisnik menadžer
        if (!auth()->user() || !auth()->user()->is_manager) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}

