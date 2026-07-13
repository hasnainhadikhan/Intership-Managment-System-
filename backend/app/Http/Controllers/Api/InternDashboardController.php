<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Attendance;
use App\Models\Submission;
use Illuminate\Http\Request;

class InternDashboardController extends Controller
{
    public function tasks(Request $request)
    {
        $user = $request->user();
        $tasks = Task::where('assigned_to', $user->intern_id)->latest()->get();
        return response()->json(['data' => $tasks]);
    }

    public function attendance(Request $request)
    {
        $user = $request->user();
        $attendance = Attendance::where('intern_id', $user->intern_id)->latest()->get();
        return response()->json(['data' => $attendance]);
    }

    public function submissions(Request $request)
    {
        $user = $request->user();
        $submissions = Submission::with('task')->where('intern_id', $user->intern_id)->latest()->get();
        return response()->json(['data' => $submissions]);
    }
}
