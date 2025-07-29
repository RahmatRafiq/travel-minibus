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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone_number' => 'nullable|string',
            'pickup_address' => 'nullable|string',
            'address' => 'nullable|string',
            'pickup_latitude' => 'nullable|numeric',
            'pickup_longitude' => 'nullable|numeric',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update user basic info
        $user->name = $data['name'];
        $user->email = $data['email'];
        if (!empty($data['password'])) {
            $user->password = bcrypt($data['password']);
        }
        $user->save();

        // Update profile
        $profileData = [
            'phone_number' => $data['phone_number'] ?? null,
            'pickup_address' => $data['pickup_address'] ?? null,
            'address' => $data['address'] ?? null,
            'pickup_latitude' => $data['pickup_latitude'] ?? null,
            'pickup_longitude' => $data['pickup_longitude'] ?? null,
        ];
        $profile = $user->profile;
        if (!$profile) {
            $profile = $user->profile()->create($profileData);
        } else {
            $profile->update($profileData);
        }
        return redirect('/profile')->with('success', 'Profile updated!');
    }
}
