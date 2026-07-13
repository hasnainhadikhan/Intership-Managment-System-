<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class InternController extends Controller
{
    public function index()
    {
        $interns = Intern::latest()->paginate(10);
        return response()->json([
            'data' => $interns->items(),
            'meta' => [
                'current_page' => $interns->currentPage(),
                'last_page' => $interns->lastPage(),
                'total' => $interns->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:interns,email|unique:users,email',
            'university' => 'nullable|string',
            'department' => 'nullable|string',
            'joined_date' => 'required|date',
            'password' => 'required|min:8',
        ]);

        return DB::transaction(function () use ($request) {
            $intern = Intern::create($request->only([
                'name', 'email', 'phone', 'university', 'department', 'skills', 'joined_date', 'avatar_url'
            ]));

            User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'intern',
                'intern_id' => $intern->id,
                'avatar_url' => $request->avatar_url,
            ]);

            return response()->json([
                'data' => $intern,
                'message' => 'Intern created successfully',
            ], 201);
        });
    }

    public function show($id)
    {
        $intern = Intern::with(['tasks', 'attendance', 'submissions'])->findOrFail($id);
        return response()->json(['data' => $intern]);
    }

    public function update(Request $request, $id)
    {
        $intern = Intern::findOrFail($id);
        $intern->update($request->all());

        if ($request->has('email')) {
            User::where('intern_id', $intern->id)->update(['email' => $request->email]);
        }

        return response()->json([
            'data' => $intern,
            'message' => 'Intern updated successfully',
        ]);
    }

    public function destroy($id)
    {
        $intern = Intern::findOrFail($id);
        User::where('intern_id', $intern->id)->delete();
        $intern->delete();

        return response()->json(['message' => 'Intern deleted successfully']);
    }

    public function activate($id)
    {
        $intern = Intern::findOrFail($id);
        $intern->update(['status' => 'active']);
        return response()->json(['message' => 'Intern activated']);
    }

    public function deactivate($id)
    {
        $intern = Intern::findOrFail($id);
        $intern->update(['status' => 'inactive']);
        return response()->json(['message' => 'Intern deactivated']);
    }

    public function tasks($id)
    {
        $intern = Intern::findOrFail($id);
        return response()->json(['data' => $intern->tasks]);
    }

    public function attendance($id)
    {
        $intern = Intern::findOrFail($id);
        return response()->json(['data' => $intern->attendance]);
    }
}
