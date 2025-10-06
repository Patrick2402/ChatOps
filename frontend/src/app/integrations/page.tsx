"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Integration {
  name: string;
  status: string;
  details: string;
}

interface IntegrationCardProps {
  icon: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "available";
  connectedDetails?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  comingSoon?: boolean;
  gradient: string;
}

const IntegrationCard = ({
  icon,
  name,
  description,
  status,
  connectedDetails,
  onConnect,
  onDisconnect,
  comingSoon,
  gradient,
}: IntegrationCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      {comingSoon && (
        <div className="absolute -top-3 -right-3 z-10">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Coming Soon
          </span>
        </div>
      )}

      <div className={`
        relative overflow-hidden bg-white rounded-2xl border-2 transition-all duration-300 h-full
        ${status === "connected" ? "border-green-400 shadow-lg shadow-green-100" : "border-gray-200 hover:border-gray-300 hover:shadow-xl"}
        ${comingSoon ? "opacity-60" : ""}
      `}>
        {/* Status Badge */}
        {status === "connected" && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Icon */}
          <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
            {icon}
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {description}
          </p>

          {/* Connected Details */}
          {status === "connected" && connectedDetails && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-medium">
                ✓ {connectedDetails}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {status === "connected" ? (
              <>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-sm"
                >
                  Details
                </button>
                <button
                  onClick={onDisconnect}
                  className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-all text-sm"
                >
                  Disconnect
                </button>
              </>
            ) : !comingSoon ? (
              <button
                onClick={onConnect}
                className={`w-full py-3 px-4 bg-gradient-to-r ${gradient} text-white rounded-lg font-semibold transition-all hover:shadow-lg text-sm`}
              >
                Connect {name}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 px-4 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-sm"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>

        {/* Details Dropdown */}
        <AnimatePresence>
          {showDetails && status === "connected" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-gray-50 overflow-hidden"
            >
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last sync:</span>
                  <span className="text-gray-900">2 minutes ago</span>
                </div>
                {connectedDetails && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-600">{connectedDetails}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [showAwsModal, setShowAwsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/integrations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setIntegrations(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const awsIntegration = integrations.find((i) => i.name === "AWS");
  const slackIntegration = integrations.find((i) => i.name === "Slack");

  const handleSlackConnect = () => {
    window.location.href = "https://slack.com/oauth/v2/authorize?client_id=8607441651234.9631141913621&scope=app_mentions:read,channels:history,chat:write,im:read,im:write,im:history&user_scope=";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ChatOps Dashboard</h1>
                  <p className="text-xs text-gray-500">Manage your infrastructure</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1 ml-8">
                <a
                  href="/dashboard"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/integrations"
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium"
                >
                  Integrations
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🔌
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600">Connect your tools and services</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-indigo-100 text-sm mb-1">Active Integrations</div>
              <div className="text-3xl font-bold">
                {integrations.filter(i => i.status.includes("Connected")).length}
              </div>
            </div>
            <div>
              <div className="text-indigo-100 text-sm mb-1">Available</div>
              <div className="text-3xl font-bold">6</div>
            </div>
            <div>
              <div className="text-indigo-100 text-sm mb-1">Coming Soon</div>
              <div className="text-3xl font-bold">4</div>
            </div>
          </div>
        </motion.div>

        {/* Main Integrations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            Core Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IntegrationCard
              icon="📦"
              name="AWS"
              description="Manage your AWS infrastructure with S3, EC2, Lambda and more directly from Slack"
              status={awsIntegration?.status.includes("Connected") ? "connected" : "disconnected"}
              connectedDetails={awsIntegration?.details}
              gradient="from-orange-500 to-yellow-500"
              onConnect={() => setShowAwsModal(true)}
              onDisconnect={() => alert("AWS disconnected")}
            />

            <IntegrationCard
              icon="💬"
              name="Slack"
              description="Execute commands and receive notifications directly in your Slack workspace"
              status={slackIntegration?.status.includes("Connected") ? "connected" : "disconnected"}
              connectedDetails={slackIntegration?.details}
              gradient="from-purple-600 to-pink-600"
              onConnect={handleSlackConnect}
              onDisconnect={() => alert("Slack disconnected")}
            />
          </div>
        </div>

        {/* Cloud Providers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            Cloud Providers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard
              icon="☁️"
              name="Google Cloud"
              description="Manage GCP resources, Cloud Functions, and Cloud Storage"
              status="available"
              gradient="from-blue-500 to-cyan-500"
              comingSoon
            />

            <IntegrationCard
              icon="🔷"
              name="Azure"
              description="Control Microsoft Azure services and virtual machines"
              status="available"
              gradient="from-blue-600 to-indigo-600"
              comingSoon
            />

            <IntegrationCard
              icon="🌊"
              name="DigitalOcean"
              description="Manage droplets, databases, and Kubernetes clusters"
              status="available"
              gradient="from-blue-400 to-blue-600"
              comingSoon
            />
          </div>
        </div>

        {/* Monitoring & Alerts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Monitoring & Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard
              icon="📈"
              name="Datadog"
              description="Monitor infrastructure metrics and set up custom alerts"
              status="available"
              gradient="from-purple-500 to-indigo-500"
              comingSoon
            />

            <IntegrationCard
              icon="🔔"
              name="PagerDuty"
              description="Incident management and on-call scheduling"
              status="available"
              gradient="from-green-500 to-emerald-500"
              comingSoon
            />

            <IntegrationCard
              icon="📉"
              name="Grafana"
              description="Visualize and analyze your infrastructure metrics"
              status="available"
              gradient="from-orange-500 to-red-500"
              comingSoon
            />
          </div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              💡
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need help with integrations?</h3>
              <p className="text-gray-600 mb-4">
                Check our documentation or contact support for assistance with connecting your services.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all">
                  View Documentation
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AWS Setup Modal */}
      <AnimatePresence>
        {showAwsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAwsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-2xl">
                  📦
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Connect AWS</h3>
                  <p className="text-sm text-gray-500">Configure your credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Region
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all">
                    <option>eu-central-1</option>
                    <option>us-east-1</option>
                    <option>us-west-2</option>
                    <option>ap-southeast-1</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowAwsModal(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert("AWS Connected!");
                      setShowAwsModal(false);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}