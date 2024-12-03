<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('is_manager', false)->get(); // Dohvati korisnike koji nisu menadžeri

        foreach ($users as $user) {
            // 3 događaja za svakog korisnika
            $events = Event::inRandomOrder()->take(3)->get();

            foreach ($events as $event) {
                Booking::factory()->create([
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'number_of_tickets' => rand(1, 5), 
                    //total price se sam racuna
                ]);
            }
        }
    }
}
