<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('intern');

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('intern_id')) {
            $query->where('intern_id', $request->intern_id);
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    public function checkin(Request $request)
    {
        $user = $request->user();
        if (!$user->intern_id) {
            return response()->json(['message' => 'User is not an intern'], 403);
        }

        $today = Carbon::today()->toDateString();
        $existing = Attendance::where('intern_id', $user->intern_id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already checked in today'], 400);
        }

        $attendance = Attendance::create([
            'intern_id' => $user->intern_id,
            'date' => $today,
            'check_in' => Carbon::now()->toTimeString(),
            'status' => Carbon::now()->hour > 9 ? 'late' : 'present',
        ]);

        return response()->json([
            'data' => $attendance,
            'message' => 'Checked in successfully',
        ]);
    }

    public function checkout(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('intern_id', $user->intern_id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'No check-in found for today'], 404);
        }

        if ($attendance->check_out) {
            return response()->json(['message' => 'Already checked out today'], 400);
        }

        $checkOut = Carbon::now();
        $checkIn = Carbon::parse($attendance->check_in);
        $duration = $checkOut->diffInMinutes($checkIn);

        $attendance->update([
            'check_out' => $checkOut->toTimeString(),
            'duration_minutes' => $duration,
        ]);

        return response()->json([
            'data' => $attendance,
            'message' => 'Checked out successfully',
        ]);
    }

    public function status(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('intern_id', $user->intern_id)
            ->where('date', $today)
            ->first();

        return response()->json(['data' => $attendance]);
    }
}
