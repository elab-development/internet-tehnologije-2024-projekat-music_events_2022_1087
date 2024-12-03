<?php

namespace Database\Seeders;

use App\Models\User;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Manager One',
            'email' => 'manager1@example.com',
            'password' => Hash::make('manager'), 
            'is_manager' => true,
        ]);

        User::create([
            'name' => 'Manager Two',
            'email' => 'manager2@example.com',
            'password' => Hash::make('manager'), 
            'is_manager' => true,
        ]);

        // Kreiraj 2 obična korisnika
        User::factory()->count(2)->create(['is_manager' => false]);
    }
}
