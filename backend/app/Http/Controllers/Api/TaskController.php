<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with('intern')->latest()->get();
        return response()->json(['data' => $tasks]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'assigned_to' => 'required|exists:interns,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'deadline' => 'nullable|date',
        ]);

        $task = Task::create(array_merge($request->all(), [
            'created_by' => $request->user()->id,
        ]));

        return response()->json([
            'data' => $task,
            'message' => 'Task created successfully',
        ], 201);
    }

    public function show($id)
    {
        $task = Task::with(['intern', 'creator', 'submissions'])->findOrFail($id);
        return response()->json(['data' => $task]);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->all());

        return response()->json([
            'data' => $task,
            'message' => 'Task updated successfully',
        ]);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,in_progress,completed,reviewed']);
        $task = Task::findOrFail($id);
        $task->update(['status' => $request->status]);

        return response()->json(['message' => 'Task status updated']);
    }

    public function review(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $task->update(['status' => 'reviewed']);

        return response()->json(['message' => 'Task marked as reviewed']);
    }
}
