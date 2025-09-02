<?php

namespace App\Services;

use App\Models\User;
use App\Models\Weather;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    private ?string $openWeatherApiKey;
    private string $openWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

    public function __construct()
    {
        $this->openWeatherApiKey = config('services.openweather.api_key');
    }

    /**
     * Get weather for a user, using cache if available and fresh
     */
    public function getWeatherForUser(User $user): ?Weather
    {
        // Check if we have fresh cached data
        $weather = Weather::where('user_id', $user->id)
            ->orderBy('fetched_at', 'desc')
            ->first();

        if ($weather && $weather->isFresh()) {
            return $weather;
        }

        // Fetch fresh data from API
        return $this->fetchWeatherFromApi($user);
    }

    /**
     * Fetch weather data from external API with timeout handling
     */
    private function fetchWeatherFromApi(User $user): ?Weather
    {
        try {
            $cacheKey = "weather_fetch_{$user->id}";
            
            // Use cache to prevent multiple simultaneous API calls for same user
            return Cache::remember($cacheKey, 60, function () use ($user) {
                // Use OpenWeatherMap API directly (it works globally)
                if (!$this->openWeatherApiKey) {
                    Log::warning("OpenWeatherMap API key not configured");
                    return null;
                }

                return $this->fetchFromOpenWeather($user);
            });
        } catch (\Exception $e) {
            Log::error("Weather fetch failed for user {$user->id}", [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }



    /**
     * Fetch weather from OpenWeatherMap API
     */
    private function fetchFromOpenWeather(User $user): ?Weather
    {
        try {
            $response = Http::timeout(5)
                ->get($this->openWeatherUrl, [
                    'lat' => $user->latitude,
                    'lon' => $user->longitude,
                    'appid' => $this->openWeatherApiKey,
                    'units' => 'metric'
                ]);

            if (!$response->successful()) {
                Log::error("OpenWeatherMap API failed for user {$user->id}", [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            
            if (!isset($data['main']['temp']) || !isset($data['weather'][0])) {
                Log::error("Invalid OpenWeatherMap response for user {$user->id}", $data);
                return null;
            }
            
            $weather = Weather::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'temperature' => $data['main']['temp'],
                    'description' => $data['weather'][0]['description'],
                    'humidity' => $data['main']['humidity'],
                    'wind_speed' => $data['wind']['speed'] ?? 0,
                    'icon' => $data['weather'][0]['icon'],
                    'fetched_at' => now(),
                ]
            );

            return $weather;

        } catch (\Exception $e) {
            Log::error("OpenWeatherMap API exception for user {$user->id}: " . $e->getMessage());
            return null;
        }
    }



    /**
     * Get weather for multiple users efficiently
     */
    public function getWeatherForUsers($users): array
    {
        $weatherData = [];
        
        foreach ($users as $user) {
            $weather = $this->getWeatherForUser($user);
            $weatherData[$user->id] = $weather;
        }

        return $weatherData;
    }
}