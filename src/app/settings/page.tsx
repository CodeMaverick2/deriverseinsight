"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useWalletStore } from "@/stores/wallet-store";
import { useAppStore } from "@/stores/app-store";
import { Settings, Wallet, Database, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const { network, setNetwork } = useWalletStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      {/* Network Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle>Network</CardTitle>
          </div>
          <CardDescription>
            Configure your Solana network connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Solana Network</Label>
              <p className="text-xs text-muted-foreground">
                Select which network to connect to
              </p>
            </div>
            <Select value={network} onValueChange={(v: any) => setNetwork(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devnet">Devnet</SelectItem>
                <SelectItem value="mainnet-beta">Mainnet</SelectItem>
                <SelectItem value="testnet">Testnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Display</CardTitle>
          </div>
          <CardDescription>
            Customize the appearance of the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Collapsed Sidebar</Label>
              <p className="text-xs text-muted-foreground">
                Show a compact sidebar navigation
              </p>
            </div>
            <Switch
              checked={sidebarCollapsed}
              onCheckedChange={setSidebarCollapsed}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Use dark theme (always enabled)
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data</CardTitle>
          </div>
          <CardDescription>
            Manage your trading data and storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Source</Label>
              <p className="text-xs text-muted-foreground">
                Currently using mock data for demonstration
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Connect to Deriverse
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear Local Data</Label>
              <p className="text-xs text-muted-foreground">
                Remove all locally stored data
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to clear all local data?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications (Future) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification settings coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
