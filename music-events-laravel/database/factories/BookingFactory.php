<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $event = Event::inRandomOrder()->first(); 
        $tickets = $this->faker->numberBetween(1, 10); 

        return [
             
            'number_of_tickets' => $tickets,
            'total_price' => $event ? $event->price * $tickets : 0, 
            'user_id' => User::factory(), 
            'event_id' => $event->id ?? Event::factory(),
        ];
    }
}
