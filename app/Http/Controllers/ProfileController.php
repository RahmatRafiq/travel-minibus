<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Inertia\Inertia;

class ProfileController extends Controller
{

    public function index()
    {
        $profile = auth()->user()->profile;
        return Inertia::render('Home/Profile/Profile', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $data = $request->validate([
            'phone_number' => 'nullable|string',
            'pickup_address' => 'nullable|string',
            'address' => 'nullable|string',
            'pickup_latitude' => 'nullable|numeric',
            'pickup_longitude' => 'nullable|numeric',
        ]);
        $profile = $user->profile;
        if (!$profile) {
            $profile = $user->profile()->create($data);
        } else {
            $profile->update($data);
        }
        return redirect()->route('profile.index')->with('success', 'Profile updated!');
    }
}
