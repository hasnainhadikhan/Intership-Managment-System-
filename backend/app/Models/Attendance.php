<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $table = 'attendance';

    protected $fillable = [
        'intern_id',
        'date',
        'check_in',
        'check_out',
        'duration_minutes',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'duration_minutes' => 'integer',
    ];

    public function intern()
    {
        return $this->belongsTo(Intern::class);
    }
}
