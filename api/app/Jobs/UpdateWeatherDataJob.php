<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\WeatherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateWeatherDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 30;
    public $tries = 3;

    private User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function handle(WeatherService $weatherService): void
    {
        try {
            $weatherService->getWeatherForUser($this->user);
            Log::info("Weather updated for user {$this->user->id}");
        } catch (\Exception $e) {
            Log::error("Failed to update weather for user {$this->user->id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Weather update job failed for user {$this->user->id}: " . $exception->getMessage());
    }
}