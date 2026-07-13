<?php

namespace Database\Seeders;

use App\Models\Intern;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a demo Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@ims.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create a demo Lead
        $lead = User::create([
            'name' => 'Jane Lead',
            'email' => 'lead@ims.com',
            'password' => Hash::make('password123'),
            'role' => 'lead',
        ]);

        // Create a demo Intern
        $intern = Intern::create([
            'name' => 'John Intern',
            'email' => 'intern@ims.com',
            'phone' => '1234567890',
            'university' => 'University of Technology',
            'department' => 'Computer Science',
            'skills' => ['PHP', 'React', 'Laravel'],
            'status' => 'active',
            'joined_date' => now()->toDateString(),
        ]);

        User::create([
            'name' => 'John Intern',
            'email' => 'intern@ims.com',
            'password' => Hash::make('password123'),
            'role' => 'intern',
            'intern_id' => $intern->id,
        ]);
    }
}
