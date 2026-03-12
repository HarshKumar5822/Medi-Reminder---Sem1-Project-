import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getTodayStr } from "@/lib/medicines";

const Profile = () => {
    const { user, updateUser, updatePassword, isLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditingStats, setIsEditingStats] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Form States - Initialize with user data or defaults
    const [personalInfo, setPersonalInfo] = useState({
        fullName: "",
        email: "",
        phone: ""
    });

    const navigate = useNavigate();

    // Update local state when user data loads
    useEffect(() => {
        if (isLoading) return; // Wait for auth to initialize

        if (user) {
            setPersonalInfo({
                fullName: user.name || "",
                email: user.email || "",
                phone: user.phone || ""
            });
        } else {
            navigate("/login");
        }
    }, [user, isLoading, navigate]);

    const [healthStats, setHealthStats] = useState({
        age: "28",
        height: "175",
        weight: "70",
        bloodType: "O+"
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser({ avatar: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPersonalInfo({ ...personalInfo, [e.target.id]: e.target.value });
    };

    const handleStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHealthStats({ ...healthStats, [e.target.id]: e.target.value });
    };

    const saveStats = () => {
        setIsEditingStats(false);
        toast.success("Health stats updated!");
    };

    const savePersonalInfo = () => {
        updateUser({
            name: personalInfo.fullName,
            email: personalInfo.email,
            phone: personalInfo.phone
        });
    };

    const handlePasswordUpdate = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error("Please fill in both password fields");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordData({ currentPassword: '', newPassword: '' }); // Clear form on success
        } catch (error) {
            // Error is already toasted by the context
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </header>

            <div className="grid gap-6 md:gap-8 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <Avatar className="h-24 w-24 mb-4 transition-opacity group-hover:opacity-80">
                                    <AvatarImage src={user.avatar} className="object-cover" />
                                    <AvatarFallback>{user.name ? user.name.charAt(0) : "U"}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full mb-4">
                                    <Camera className="text-white h-6 w-6" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Button className="w-full mt-6" variant="outline" onClick={handleAvatarClick}>
                                Change Avatar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Health Stats</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={async () => {
                                        toast.info("Preparing 30-Day Export...");
                                        try {
                                            const token = localStorage.getItem("medi_reminder_token");
                                            if (!token) throw new Error("Not authenticated");

                                            // Fetch all logs directly for the report to avoid context wiring issues here
                                            const API_URL = import.meta.env.VITE_API_URL || "https://medi-reminder-sem1-project-s6re.onrender.com";
                                            const res = await fetch(`${API_URL}/logs/`, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            if (!res.ok) throw new Error("Failed to fetch logs");

                                            const allLogs = await res.json();

                                            // Filter last 30 days
                                            const thirtyDaysAgo = new Date();
                                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                                            const recentLogs = allLogs.filter((l: any) => new Date(l.date) >= thirtyDaysAgo);

                                            if (recentLogs.length === 0) {
                                                toast.error("No data found for the last 30 days.");
                                                return;
                                            }

                                            // Build CSV string
                                            const headers = ["Date", "Scheduled Time", "Medicine Name", "Dosage", "Status", "Taken At"];
                                            const rows = recentLogs.map((l: any) => [
                                                l.date,
                                                l.scheduled_time,
                                                `"${l.medicine_name}"`, // Quote to handle commas in names
                                                `"${l.dosage}"`,
                                                l.status,
                                                l.taken_at ? new Date(l.taken_at).toLocaleString() : "N/A"
                                            ]);

                                            const csvContent = [
                                                headers.join(","),
                                                ...rows.map((row: any[]) => row.join(","))
                                            ].join("\n");

                                            // Trigger Download
                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const link = document.createElement("a");
                                            const url = URL.createObjectURL(blob);
                                            link.setAttribute("href", url);
                                            link.setAttribute("download", `medication_report_${getTodayStr()}.csv`);
                                            link.style.visibility = 'hidden';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);

                                            toast.success("Report downloaded successfully.");
                                        } catch (error) {
                                            toast.error("Error generating report.");
                                        }
                                    }}
                                >
                                    Export Health Report
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => isEditingStats ? saveStats() : setIsEditingStats(true)}
                                >
                                    {isEditingStats ? "Save" : "Edit"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {isEditingStats ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <Label htmlFor="age" className="text-xs">Age</Label>
                                        <Input id="age" value={healthStats.age} onChange={handleStatsChange} className="h-8" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <Label htmlFor="height" className="text-xs">Height (cm)</Label>
                                        <Input id="height" value={healthStats.height} onChange={handleStatsChange} className="h-8" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
                                        <Input id="weight" value={healthStats.weight} onChange={handleStatsChange} className="h-8" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 items-center">
                                        <Label htmlFor="bloodType" className="text-xs">Blood Type</Label>
                                        <Input id="bloodType" value={healthStats.bloodType} onChange={handleStatsChange} className="h-8" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Age</span>
                                        <span className="font-medium">{healthStats.age}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Height</span>
                                        <span className="font-medium">{healthStats.height} cm</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Weight</span>
                                        <span className="font-medium">{healthStats.weight} kg</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Blood Type</span>
                                        <span className="font-medium">{healthStats.bloodType}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={personalInfo.fullName} onChange={handleInfoChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={personalInfo.email} onChange={handleInfoChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={personalInfo.phone}
                                    onChange={handleInfoChange}
                                    placeholder="+91 99999 99999"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Please use +91 for India
                                </p>
                            </div>
                            <Button className="w-full sm:w-auto" onClick={savePersonalInfo}>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <Button
                                className="w-full sm:w-auto"
                                onClick={handlePasswordUpdate}
                                disabled={isUpdatingPassword}
                            >
                                {isUpdatingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
