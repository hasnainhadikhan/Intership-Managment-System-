<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Auth routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('interns', 'App\Http\Controllers\Api\InternController');
        Route::post('interns/{id}/activate', 'App\Http\Controllers\Api\InternController@activate');
        Route::post('interns/{id}/deactivate', 'App\Http\Controllers\Api\InternController@deactivate');
        Route::get('interns/{id}/tasks', 'App\Http\Controllers\Api\InternController@tasks');
        Route::get('interns/{id}/attendance', 'App\Http\Controllers\Api\InternController@attendance');

        Route::get('dashboard/stats', 'App\Http\Controllers\Api\DashboardController@stats');
        Route::get('dashboard/charts', 'App\Http\Controllers\Api\DashboardController@charts');

        Route::get('reports/attendance', 'App\Http\Controllers\Api\ReportController@attendance');
        Route::get('reports/tasks', 'App\Http\Controllers\Api\ReportController@tasks');
    });

    // Lead routes
    Route::middleware('role:lead,admin')->group(function () {
        Route::apiResource('tasks', 'App\Http\Controllers\Api\TaskController');
        Route::put('tasks/{id}/status', 'App\Http\Controllers\Api\TaskController@updateStatus');
        Route::post('tasks/{id}/review', 'App\Http\Controllers\Api\TaskController@review');

        Route::get('submissions', 'App\Http\Controllers\Api\SubmissionController@index');
        Route::put('submissions/{id}/feedback', 'App\Http\Controllers\Api\SubmissionController@updateFeedback');
    });

    // Intern routes
    Route::middleware('role:intern')->group(function () {
        Route::get('my/tasks', 'App\Http\Controllers\Api\InternDashboardController@tasks');
        Route::get('my/attendance', 'App\Http\Controllers\Api\InternDashboardController@attendance');
        Route::get('my/submissions', 'App\Http\Controllers\Api\InternDashboardController@submissions');

        Route::post('checkin', 'App\Http\Controllers\Api\AttendanceController@checkin');
        Route::post('checkout', 'App\Http\Controllers\Api\AttendanceController@checkout');
        Route::get('checkin/status', 'App\Http\Controllers\Api\AttendanceController@status');

        Route::post('submit/{taskId}', 'App\Http\Controllers\Api\SubmissionController@store');
    });

    // Shared routes
    Route::get('notifications', 'App\Http\Controllers\Api\NotificationController@index');
    Route::put('notifications/{id}/read', 'App\Http\Controllers\Api\NotificationController@read');
    Route::put('notifications/read-all', 'App\Http\Controllers\Api\NotificationController@readAll');
});
