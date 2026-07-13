<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function download($path)
    {
        if (!Storage::exists($path)) {
            abort(404);
        }

        return Storage::download($path);
    }

    public function stream($path)
    {
        if (!Storage::exists($path)) {
            abort(404);
        }

        return Storage::response($path);
    }
}
