<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),  
            'description' => $this->faker->sentence(nbWords:5), 
            'date' => $this->faker->dateTimeBetween('now', '+1 year'), // Datum u narednih godinu dana
            'time' => $this->faker->time(), 
            'location' => $this->faker->city(), 
            'performer' => $this->faker->name(), 
            'price' => $this->faker->numberBetween(2, 10) * 500, // Generiše broj između 1000 i 5000 interval 500
            'type' => $this->faker->randomElement(['concert', 'festival', 'opera', 'benefit concert']),
        ];
    }
}
