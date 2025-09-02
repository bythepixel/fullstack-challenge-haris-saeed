<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Weather;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UserWeatherTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_users_list()
    {
        // Create test users
        User::factory(3)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'users' => [
                        '*' => [
                            'id',
                            'name',
                            'email',
                            'latitude',
                            'longitude',
                            'weather'
                        ]
                    ]
                ]);
    }

    public function test_can_get_specific_user()
    {
        $user = User::factory()->create();

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'latitude',
                        'longitude',
                    ],
                    'weather'
                ]);
    }

    public function test_weather_service_handles_api_timeout()
    {
        // Mock HTTP timeout
        Http::fake([
            'api.openweathermap.org/*' => Http::response([], 500)
        ]);

        $user = User::factory()->create();
        $weatherService = new WeatherService();

        $weather = $weatherService->getWeatherForUser($user);

        $this->assertNull($weather);
    }

    public function test_weather_caching_works()
    {
        $user = User::factory()->create();
        
        // Create fresh weather data
        $weather = Weather::create([
            'user_id' => $user->id,
            'temperature' => 25.5,
            'description' => 'sunny',
            'humidity' => 60,
            'wind_speed' => 5.2,
            'icon' => '01d',
            'fetched_at' => now(),
        ]);

        $weatherService = new WeatherService();
        $result = $weatherService->getWeatherForUser($user);

        $this->assertNotNull($result);
        $this->assertEquals($weather->id, $result->id);
    }

    public function test_stale_weather_data_is_refreshed()
    {
        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => [
                    'temp' => 22.0,
                    'humidity' => 65
                ],
                'weather' => [
                    ['description' => 'cloudy', 'icon' => '02d']
                ],
                'wind' => [
                    'speed' => 3.5
                ]
            ])
        ]);

        $user = User::factory()->create();
        
        // Create stale weather data (older than 1 hour)
        Weather::create([
            'user_id' => $user->id,
            'temperature' => 25.5,
            'description' => 'sunny',
            'humidity' => 60,
            'wind_speed' => 5.2,
            'icon' => '01d',
            'fetched_at' => now()->subHours(2),
        ]);

        $weatherService = new WeatherService();
        $result = $weatherService->getWeatherForUser($user);

        $this->assertNotNull($result);
        $this->assertEquals(22.0, $result->temperature);
        $this->assertEquals('cloudy', $result->description);
    }
}