"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Lock,
    AtSign,
    Trash2,
    Save,
    AlertTriangle,
    Eye,
    EyeOff,
    LogOut,
    Camera,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Profile update state
    const [profileData, setProfileData] = useState({
        fullName: "",
        username: "",
        profilePicture: "",
    });

    // Delete account state
    const [deletePassword, setDeletePassword] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRemovePicModal, setShowRemovePicModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const storedUser = authAPI.getStoredUser();
        if (!storedUser) {
            router.push("/login");
            return;
        }
        setUser(storedUser);
        setProfileData({
            fullName: storedUser.fullName || "",
            username: storedUser.username || "",
            profilePicture: storedUser.profilePicture || "",
        });
    }, [router]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (response.success) {
                toast.success("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                toast.error(response.message || "Failed to change password");
            }
        } catch (error) {
            console.error("Password change error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProfilePicture = async () => {
        setShowRemovePicModal(false);
        setLoading(true);
        try {
            // Pass empty string to remove
            const response = await authAPI.updateProfile({ ...profileData, profilePicture: "" });

            if (response.success) {
                toast.success("Profile picture removed");
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setUser(response.data.user);
                setProfileData(prev => ({ ...prev, profilePicture: "" }));
            } else {
                toast.error(response.message || "Failed to remove profile picture");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.updateProfile(profileData);

            if (response.success) {
                toast.success("Profile updated successfully!");
                // Update stored user data
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setUser(response.data.user);
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Please enter your password");
            return;
        }

        setDeleteLoading(true);

        try {
            const response = await authAPI.deleteAccount(deletePassword);

            if (response.success) {
                toast.success("Account deleted successfully");
                // Clear all data and logout
                authAPI.logout();
                router.push("/");
            } else {
                toast.error(response.message || "Failed to delete account");
            }
        } catch (error) {
            console.error("Delete account error:", error);
            toast.error("Something went wrong");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#e9e9e9] flex items-center justify-center">
                <div className="text-2xl font-black">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#e9e9e9] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white border-[3px] border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000]">
                    <h1 className="text-4xl font-black mb-2">Account Settings</h1>
                    <p className="text-gray-500 font-bold">
                        Manage your account preferences
                    </p>
                </div>

                {/* Profile Update Section */}
                <div className="bg-white border-[3px] border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative group">
                            <div className="w-20 h-20 bg-[#a881f3] border-2 border-black rounded-xl flex items-center justify-center overflow-hidden">
                                {profileData.profilePicture ? (
                                    <img
                                        src={profileData.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-white" />
                                )}
                                <div
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
                                    onClick={() => document.getElementById('profile-upload').click()}
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                id="profile-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    if (file.size > 5 * 1024 * 1024) {
                                        toast.error("Image size must be less than 5MB");
                                        return;
                                    }

                                    const toastId = toast.loading("Uploading image...");
                                    try {
                                        const formData = new FormData();
                                        formData.append("file", file);

                                        const res = await fetch("/api/upload", {
                                            method: "POST",
                                            body: formData,
                                        });

                                        const data = await res.json();

                                        if (!res.ok) throw new Error(data.error || "Upload failed");

                                        // Update profile immediately with new URL
                                        const updateRes = await authAPI.updateProfile({ ...profileData, profilePicture: data.url });

                                        if (updateRes.success) {
                                            localStorage.setItem("user", JSON.stringify(updateRes.data.user));
                                            setUser(updateRes.data.user);
                                            setProfileData(prev => ({ ...prev, profilePicture: data.url }));
                                            toast.success("Profile picture updated!", { id: toastId });
                                        } else {
                                            throw new Error(updateRes.message || "Failed to update profile");
                                        }

                                    } catch (error) {
                                        console.error(error);
                                        toast.error(error.message || "Upload failed", { id: toastId });
                                    }
                                }}
                            />
                        </div>
                        {profileData.profilePicture && (
                            <button
                                onClick={() => setShowRemovePicModal(true)}
                                type="button"
                                className="flex items-center justify-center p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                                title="Remove profile picture"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-2xl font-black">Profile Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profileData.fullName}
                                onChange={(e) =>
                                    setProfileData({ ...profileData, fullName: e.target.value })
                                }
                                placeholder="John Doe"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <AtSign className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) =>
                                        setProfileData({ ...profileData, username: e.target.value })
                                    }
                                    placeholder="johndoe"
                                    pattern="[a-zA-Z0-9_]+"
                                    minLength="3"
                                    maxLength="30"
                                    className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 font-bold ml-1">
                                Letters, numbers, and underscores only
                            </p>
                        </div>

                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                                Email (cannot be changed)
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full bg-gray-100 border-2 border-gray-300 rounded-2xl p-4 font-bold text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#a881f3] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#9570e3] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white border-[3px] border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#ccfd52] border-2 border-black rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-black" />
                        </div>
                        <h2 className="text-2xl font-black">Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value,
                                        })
                                    }
                                    placeholder="Enter current password"
                                    className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pr-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswords({
                                            ...showPasswords,
                                            current: !showPasswords.current,
                                        })
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPasswords.current ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                        })
                                    }
                                    placeholder="Enter new password"
                                    minLength="6"
                                    className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pr-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswords({
                                            ...showPasswords,
                                            new: !showPasswords.new,
                                        })
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPasswords.new ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    placeholder="Confirm new password"
                                    minLength="6"
                                    className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pr-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswords({
                                            ...showPasswords,
                                            confirm: !showPasswords.confirm,
                                        })
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPasswords.confirm ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#0f172a] border-[3px] border-black shadow-[6px_6px_0px_0px_#ccfd52] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Lock className="w-5 h-5" />
                            {loading ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                </div>

                {/* Danger Zone - Delete Account */}
                <div className="bg-red-50 border-[3px] border-red-500 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_#ff0000]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500 border-2 border-black rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-red-600">Danger Zone</h2>
                    </div>

                    <p className="text-red-700 font-bold mb-4">
                        Once you delete your account, there is no going back. Please be
                        certain.
                    </p>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-red-600 border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white border

-[3px] border-black rounded-3xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_#000000]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-red-500 border-2 border-black rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-red-600">
                                Delete Account?
                            </h2>
                        </div>

                        <p className="text-gray-700 font-bold mb-6">
                            This action cannot be undone. All your data will be permanently
                            deleted. Please enter your password to confirm.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ff0000] transition-all"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword("");
                                    }}
                                    className="flex-1 bg-gray-200 text-black py-3 rounded-2xl font-black hover:bg-gray-300 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading || !deletePassword}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-black hover:bg-red-600 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete Forever"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Profile Picture Modal */}
            {showRemovePicModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white border-[3px] border-black rounded-3xl p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_#000000]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 border-2 border-black rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <h2 className="text-xl font-black">Remove Picture?</h2>
                        </div>

                        <p className="text-gray-600 font-bold mb-6">
                            Are you sure you want to remove your profile picture?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRemovePicModal(false)}
                                className="flex-1 bg-gray-200 text-black py-3 rounded-xl font-black hover:bg-gray-300 border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveProfilePicture}
                                disabled={loading}
                                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black hover:bg-red-600 border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50"
                            >
                                {loading ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
