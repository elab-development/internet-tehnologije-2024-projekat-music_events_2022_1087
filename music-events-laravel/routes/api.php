<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;

// Rute za autentifikaciju
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Zaštićene API rute
Route::middleware('auth:sanctum')->group(function () {
   
    Route::post('/events', [EventController::class, 'store']);
    Route::patch('/events/{id}/type', [EventController::class, 'updateType']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
});