<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Uklanjanje kolone email_verified_at
            $table->dropColumn('email_verified_at');
            
            // Dodavanje kolone is_manager sa podrazumevanom vrednoscu false
            $table->boolean('is_manager')->default(false)->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ponovno dodavanje kolone email_verified_at
            $table->timestamp('email_verified_at')->nullable();
            
            // Uklanjanje kolone is_manager
            $table->dropColumn('is_manager');
        });
    }
};
