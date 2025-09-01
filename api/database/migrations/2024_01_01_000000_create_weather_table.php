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
        Schema::create('weather', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('temperature', 5, 2);
            $table->string('description');
            $table->integer('humidity');
            $table->decimal('wind_speed', 5, 2);
            $table->string('icon')->nullable();
            $table->timestamp('fetched_at');
            $table->timestamps();
            
            $table->index(['user_id', 'fetched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weather');
    }
};