<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class SubmissionController extends Controller
{
    public function index()
    {
        $submissions = Submission::with(['task', 'intern'])->latest()->get();
        return response()->json(['data' => $submissions]);
    }

    public function store(Request $request, $taskId)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'remarks' => 'nullable|string',
        ]);

        $task = Task::findOrFail($taskId);
        $user = $request->user();

        if (!$user->intern_id) {
            return response()->json(['message' => 'Only interns can submit work'], 403);
        }

        $file = $request->file('file');
        $path = $file->store('submissions');

        $submission = Submission::create([
            'task_id' => $taskId,
            'intern_id' => $user->intern_id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'remarks' => $request->remarks,
            'submitted_at' => Carbon::now(),
        ]);

        // Update task status to completed if it was in progress
        if ($task->status === 'in_progress' || $task->status === 'pending') {
            $task->update(['status' => 'completed', 'progress' => 100]);
        }

        return response()->json([
            'data' => $submission,
            'message' => 'Work submitted successfully',
        ]);
    }

    public function updateFeedback(Request $request, $id)
    {
        $request->validate(['feedback' => 'required|string']);
        $submission = Submission::findOrFail($id);
        
        $submission->update([
            'feedback' => $request->feedback,
            'feedback_by' => $request->user()->id,
        ]);

        return response()->json([
            'data' => $submission,
            'message' => 'Feedback added successfully',
        ]);
    }
}
