<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use App\Models\Task;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalInterns = Intern::count();
        $activeTasks = Task::whereIn('status', ['pending', 'in_progress'])->count();
        $presentToday = Attendance::where('date', Carbon::today()->toDateString())
            ->whereIn('status', ['present', 'late'])
            ->count();
        $pendingReviews = Task::where('status', 'completed')->count();

        return response()->json([
            'data' => [
                'total_interns' => $totalInterns,
                'active_tasks' => $activeTasks,
                'present_today' => $presentToday,
                'pending_reviews' => $pendingReviews,
            ]
        ]);
    }

    public function charts()
    {
        // Attendance trend 30d
        $attendanceTrend = Attendance::select('date', DB::raw('count(*) as count'))
            ->where('date', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Task status distribution
        $taskStatus = Task::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Top performers (based on completed tasks)
        $topPerformers = Intern::withCount(['tasks' => function($query) {
                $query->where('status', 'reviewed');
            }])
            ->orderBy('tasks_count', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'attendance_trend' => $attendanceTrend,
                'task_status' => $taskStatus,
                'top_performers' => $topPerformers,
            ]
        ]);
    }
}
