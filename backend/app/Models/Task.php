<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'assigned_to',
        'priority',
        'status',
        'deadline',
        'progress',
        'created_by',
        'tags',
    ];

    protected $casts = [
        'deadline' => 'date',
        'tags' => 'array',
        'progress' => 'integer',
    ];

    public function intern()
    {
        return $this->belongsTo(Intern::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}
