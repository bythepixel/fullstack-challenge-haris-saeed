<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    private WeatherService $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    /**
     * Get all users with their current weather
     */
    public function index(): JsonResponse
    {
        $users = User::all();

        $usersWithWeather = $users->map(function ($user) {
            // Always try to get fresh weather data
            $weather = $this->weatherService->getWeatherForUser($user);
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'latitude' => (float) $user->latitude,
                'longitude' => (float) $user->longitude,
                'weather' => $weather ? [
                    'temperature' => (float) $weather->temperature,
                    'description' => $weather->description,
                    'humidity' => (int) $weather->humidity,
                    'wind_speed' => (float) $weather->wind_speed,
                    'icon' => $weather->icon,
                    'fetched_at' => $weather->fetched_at->toISOString(),
                ] : null
            ];
        });

        return response()->json([
            'users' => $usersWithWeather,
            'meta' => [
                'total' => $users->count(),
                'with_weather' => $usersWithWeather->filter(fn($u) => $u['weather'] !== null)->count(),
                'cached_at' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Get detailed weather for a specific user
     */
    public function show(User $user): JsonResponse
    {
        $weather = $this->weatherService->getWeatherForUser($user);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
            'weather' => $weather ? [
                'temperature' => $weather->temperature,
                'description' => $weather->description,
                'humidity' => $weather->humidity,
                'wind_speed' => $weather->wind_speed,
                'icon' => $weather->icon,
                'fetched_at' => $weather->fetched_at->toISOString(),
            ] : null
        ]);
    }
}