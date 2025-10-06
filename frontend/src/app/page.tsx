"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const features = [
  {
    icon: "⚡",
    title: "Instant Commands",
    description: "Execute AWS operations directly from Slack in seconds",
  },
  {
    icon: "🔐",
    title: "Secure Connection",
    description: "Encrypted connections and JWT authentication",
  },
  {
    icon: "📊",
    title: "Action History",
    description: "Full audit log of all executed commands",
  },
  {
    icon: "🎯",
    title: "Intuitive Interface",
    description: "Simple text commands – no complex dashboards",
  },
  {
    icon: "🔄",
    title: "Integrations",
    description: "AWS, Slack, and more platforms in one place",
  },
  {
    icon: "📱",
    title: "Accessible Everywhere",
    description: "Manage infrastructure from your phone, tablet, or laptop",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "49",
    description: "For small teams",
    features: [
      "Up to 5 users",
      "100 commands/month",
      "Basic history",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "149",
    description: "For growing companies",
    features: [
      "Up to 25 users",
      "Unlimited commands",
      "Full history",
      "Priority support",
      "Custom integrations",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited users",
      "Dedicated instances",
      "99.9% SLA",
      "24/7 support",
      "On-premise option",
    ],
  },
];

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full opacity-20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 font-medium text-sm"
            >
              🚀 The new era of infrastructure management
            </motion.div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
              Control
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                AWS through Slack
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Run commands, monitor resources, and respond to alerts — all
              without leaving Slack. ChatOps is the future of DevOps.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg shadow-2xl shadow-indigo-500/50 hover:bg-indigo-700 transition-all"
              >
                Get Started for Free
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-indigo-600 transition-all"
              >
                See Demo
              </motion.a>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-sm text-gray-500"
            >
              ✓ No credit card required · ✓ 5-minute setup · ✓ 14-day free trial
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "50k+", label: "Commands per day" },
              { value: "500+", label: "Satisfied companies" },
              { value: "<100ms", label: "Avg response time" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Features built for <span className="text-indigo-600">DevOps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for efficient infrastructure management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group"
              >
                <div
                  className={`
                  p-8 rounded-2xl border-2 transition-all duration-300 h-full
                  ${
                    hoveredFeature === i
                      ? "border-indigo-500 bg-indigo-50 shadow-xl shadow-indigo-100 scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How it works
              </h2>
              <p className="text-xl text-gray-600">As simple as 1-2-3</p>
            </motion.div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Connect to Slack",
                    desc: "Install the app in your workspace",
                  },
                  {
                    step: "2",
                    title: "Configure AWS",
                    desc: "Add your credentials and select resources",
                  },
                  {
                    step: "3",
                    title: "Start managing",
                    desc: "Run commands directly from Slack",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-6"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-lg">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 p-6 bg-gray-900 rounded-2xl text-white font-mono text-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-green-400">$</span> /aws list s3
                    buckets
                  </div>
                  <div className="text-gray-400">✓ Found 12 S3 buckets</div>
                  <div>
                    <span className="text-green-400">$</span> /aws ec2 status
                  </div>
                  <div className="text-gray-400">✓ 5 instances running</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, transparent{" "}
              <span className="text-indigo-600">pricing</span>
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your team
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div
                  className={`
                  p-8 rounded-3xl h-full flex flex-col transition-all duration-300
                  ${
                    plan.popular
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/50 scale-105"
                      : "bg-white border-2 border-gray-200 hover:border-indigo-300 hover:shadow-xl"
                  }
                `}
                >
                  <div className="text-center mb-8">
                    <h3
                      className={`text-2xl font-bold mb-2 ${
                        !plan.popular && "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${
                        plan.popular ? "text-indigo-100" : "text-gray-600"
                      }`}
                    >
                      {plan.description}
                    </p>
                    <div className="mb-2">
                      {plan.price === "Custom" ? (
                        <span className="text-4xl font-bold">
                          {plan.price}
                        </span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold">
                            {plan.price}
                          </span>
                          <span
                            className={`text-xl ${
                              plan.popular ? "text-indigo-100" : "text-gray-600"
                            }`}
                          >
                            {" "}
                            €/mo
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <svg
                          className={`w-6 h-6 flex-shrink-0 ${
                            plan.popular ? "text-white" : "text-indigo-600"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span
                          className={
                            plan.popular ? "text-indigo-50" : "text-gray-700"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-4 rounded-xl font-semibold text-lg transition-all
                      ${
                        plan.popular
                          ? "bg-white text-indigo-600 hover:bg-gray-100"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }
                    `}
                  >
                    Choose Plan
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to revolutionize your DevOps?
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
              Join hundreds of teams already automating their infrastructure
              management
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              Start for Free →
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
