<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intern extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'university',
        'department',
        'skills',
        'status',
        'joined_date',
        'avatar_url',
    ];

    protected $casts = [
        'skills' => 'array',
        'joined_date' => 'date',
    ];

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}
