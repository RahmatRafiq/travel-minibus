<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_vehicle_id')->constrained('route_vehicle')->onDelete('cascade');
            $table->timestamp('departure_time');
            $table->enum('status', ['ready', 'departed', 'arrived', 'cancelled'])->default('ready');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
