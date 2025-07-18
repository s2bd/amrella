export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-gray-600">
              Manage your account preferences and privacy settings. More options coming soon.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <p className="text-gray-600">
              Control how and when you receive notifications. Feature in development.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Privacy Controls</h2>
            <p className="text-gray-600">
              Manage who can see your content and contact you. Coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
