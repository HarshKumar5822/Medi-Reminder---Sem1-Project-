import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Moon, Shield, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

const Settings = () => {
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        sound: true
    });

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences</p>
            </header>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <CardTitle>Notifications</CardTitle>
                    </div>
                    <CardDescription>Configure how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                        </div>
                        <Switch
                            id="push-notifications"
                            checked={notifications.push}
                            onCheckedChange={() => handleNotificationChange('push')}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive daily summaries via email</p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={notifications.email}
                            onCheckedChange={() => handleNotificationChange('email')}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="reminder-sound">Reminder Sound</Label>
                            <p className="text-sm text-muted-foreground">Play a sound when a reminder triggers</p>
                        </div>
                        <Switch
                            id="reminder-sound"
                            checked={notifications.sound}
                            onCheckedChange={() => handleNotificationChange('sound')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Moon className="h-5 w-5 text-primary" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                        </div>
                        <Switch
                            id="dark-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle>Privacy & Security</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="biometric">Biometric Login</Label>
                            <p className="text-sm text-muted-foreground">Use FaceID/TouchID to log in</p>
                        </div>
                        <Switch id="biometric" />
                    </div>
                    <Separator />
                    <Button variant="destructive" className="w-full sm:w-auto mt-4">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out of All Devices
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
