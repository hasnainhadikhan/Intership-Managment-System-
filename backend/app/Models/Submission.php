<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
        'task_id',
        'intern_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'remarks',
        'feedback',
        'feedback_by',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'file_size' => 'integer',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function intern()
    {
        return $this->belongsTo(Intern::class);
    }

    public function feedbackBy()
    {
        return $this->belongsTo(User::class, 'feedback_by');
    }
}
