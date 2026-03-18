<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * List all users.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'username', 'email', 'role', 'is_active', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Create a new user (admin-initiated).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users', 'alpha_dash'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'role' => ['sometimes', 'string', 'in:admin,user'],
            'is_active' => ['sometimes', 'boolean'],
        ], [
            'password.confirmed' => 'Password confirmation does not match.',
            'username.unique' => 'This username is already taken.',
            'email.unique' => 'This email is already registered.',
            'username.alpha_dash' => 'Username may only contain letters, numbers, dashes and underscores.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->input('role', 'user'),
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->only('id', 'name', 'username', 'email', 'role', 'is_active', 'created_at'),
        ], 201);
    }

    /**
     * Show a single user.
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user->only('id', 'name', 'username', 'email', 'role', 'is_active', 'created_at', 'updated_at'),
        ]);
    }

    /**
     * Update a user.
     */
    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:255', 'unique:users,username,' . $user->id, 'alpha_dash'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['sometimes', 'string', 'in:admin,user'],
            'is_active' => ['sometimes', 'boolean'],
        ];

        // Password is optional on update
        if ($request->filled('password')) {
            $rules['password'] = [
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ];
        }

        $validator = Validator::make($request->all(), $rules, [
            'password.confirmed' => 'Password confirmation does not match.',
            'username.unique' => 'This username is already taken.',
            'email.unique' => 'This email is already registered.',
            'username.alpha_dash' => 'Username may only contain letters, numbers, dashes and underscores.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['name', 'username', 'email', 'role', 'is_active']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->fresh()->only('id', 'name', 'username', 'email', 'role', 'is_active', 'created_at', 'updated_at'),
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroy(Request $request, User $user)
    {
        // Prevent deleting your own account
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(Request $request, User $user)
    {
        // Prevent deactivating your own account
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 403);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully',
            'data' => $user->only('id', 'is_active'),
        ]);
    }
}
