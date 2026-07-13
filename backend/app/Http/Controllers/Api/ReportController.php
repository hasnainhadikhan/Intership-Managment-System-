<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Task;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function attendance(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $report = Attendance::with('intern')
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->get();

        return response()->json(['data' => $report]);
    }

    public function tasks(Request $request)
    {
        $request->validate([
            'status' => 'nullable|string',
        ]);

        $query = Task::with('intern');
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json(['data' => $query->get()]);
    }
}
