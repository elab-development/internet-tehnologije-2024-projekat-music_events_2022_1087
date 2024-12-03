<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Booking::all()->each(function ($booking) {
            Review::factory()->create([
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
            ]);
        });
    }
}
