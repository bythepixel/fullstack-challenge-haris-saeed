<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weather extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'temperature',
        'description',
        'humidity',
        'wind_speed',
        'icon',
        'fetched_at',
    ];

    protected $casts = [
        'fetched_at' => 'datetime',
        'temperature' => 'float',
        'humidity' => 'integer',
        'wind_speed' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if weather data is fresh (less than 1 hour old)
     */
    public function isFresh(): bool
    {
        return $this->fetched_at && $this->fetched_at->gt(now()->subHour());
    }
}