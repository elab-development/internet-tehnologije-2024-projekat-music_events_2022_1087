<?php
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;

// Rute za autentifikaciju
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);


Route::middleware('auth:sanctum')->group(function () {
   
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    Route::resource('bookings', BookingController::class)->only(['index','store', 'update', 'destroy']);

    Route::post('/bookings/{bookingId}/reviews', [ReviewController::class, 'store']);

    Route::get('/bookings/export', [BookingController::class, 'export']);

    Route::post('/logout', [AuthController::class, 'logout']);
});