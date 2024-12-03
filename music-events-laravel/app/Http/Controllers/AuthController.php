<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;


class AuthController extends Controller
{

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

       // Generisanje tokena
       $token = $user->createToken('auth_token')->plainTextToken;

       // Vraćanje odgovora u JSON formatu
       return response()->json([
           'user' => $user,
           'token' => $token,
       ], 201); // Statusni kod 201 (Created)
        
    }


    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user = User::where('email', $validated['email'])->first();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }


        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

   
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}

