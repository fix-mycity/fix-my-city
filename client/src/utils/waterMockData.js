// Mock data for the Water Authority Dashboard (Phase 1)

export const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/water/dashboard' },
  { id: 'complaints', label: 'Complaint Management', icon: 'assignment', path: '/water/complaints' },
  { id: 'assignments', label: 'Work Assignments', icon: 'assignment_turned_in', path: '#assignments' },
  { id: 'workers', label: 'Field Workers', icon: 'engineering', path: '/water/workers' },
  { id: 'supply', label: 'Water Supply', icon: 'water_drop', path: '#supply' },
  { id: 'pipelines', label: 'Pipeline Management', icon: 'schema', path: '#pipelines' },
  { id: 'tanks', label: 'Water Tank Management', icon: 'propane_tank', path: '#tanks' },
  { id: 'quality', label: 'Water Quality', icon: 'biotech', path: '#quality' },
  { id: 'maintenance', label: 'Maintenance', icon: 'build', path: '#maintenance' },
  { id: 'emergency', label: 'Emergency Shutdown', icon: 'dangerous', path: '#emergency' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications_active', path: '#notifications' },
  { id: 'reports', label: 'Reports', icon: 'assessment', path: '#reports' },
  { id: 'citizens', label: 'Citizen Management', icon: 'people', path: '#citizens' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '#settings' }
];

export const statsData = [
  {
    id: 'supply',
    title: "Today's Water Supply",
    count: "420 MGD",
    description: "Million Gallons per Day",
    icon: "water_drop",
    trend: "+2.4% from yesterday",
    trendType: "up",
    color: "blue"
  },
  {
    id: 'complaints_today',
    title: "Today's Complaints",
    count: "48",
    description: "New reports logged",
    icon: "report_problem",
    trend: "-12% from avg",
    trendType: "down",
    color: "orange"
  },
  {
    id: 'complaints_pending',
    title: "Pending Complaints",
    count: "18",
    description: "Awaiting assignment",
    icon: "pending_actions",
    trend: "8 urgent cases",
    trendType: "warning",
    color: "red"
  },
  {
    id: 'complaints_resolved',
    title: "Resolved Complaints",
    count: "30",
    description: "Closed in last 24h",
    icon: "check_circle",
    trend: "92% SLA compliance",
    trendType: "up",
    color: "green"
  },
  {
    id: 'leakage',
    title: "Leakage Reports",
    count: "12",
    description: "Active pipeline leaks",
    icon: "plumbing",
    trend: "4 repaired today",
    trendType: "neutral",
    color: "red"
  },
  {
    id: 'dirty_water',
    title: "Dirty Water Reports",
    count: "3",
    description: "Mainly in Zone B",
    icon: "opacity",
    trend: "Under investigation",
    trendType: "warning",
    color: "amber"
  },
  {
    id: 'emergency',
    title: "Emergency Cases",
    count: "1",
    description: "Main Pipe Burst",
    icon: "error_outline",
    trend: "Team dispatched",
    trendType: "danger",
    color: "red"
  },
  {
    id: 'workers_available',
    title: "Available Workers",
    count: "24",
    description: "Field staff on standby",
    icon: "person_play",
    trend: "6 teams ready",
    trendType: "up",
    color: "green"
  },
  {
    id: 'workers_busy',
    title: "Busy Workers",
    count: "36",
    description: "On active assignments",
    icon: "construction",
    trend: "60% utilization rate",
    trendType: "neutral",
    color: "blue"
  },
  {
    id: 'water_tanks',
    title: "Water Tanks",
    count: "15 / 15",
    description: "Operational reservoirs",
    icon: "database",
    trend: "94% average level",
    trendType: "up",
    color: "blue"
  },
  {
    id: 'maintenance',
    title: "Scheduled Maint.",
    count: "4",
    description: "Planned for tonight",
    icon: "calendar_month",
    trend: "Zone A & D affected",
    trendType: "warning",
    color: "indigo"
  }
];

export const chartPlaceholders = {
  complaintStatus: {
    title: "Complaint Status",
    type: "donut",
    data: [
      { label: "Resolved", value: 65, color: "#10b981" },
      { label: "In Progress", value: 20, color: "#f59e0b" },
      { label: "Pending", value: 15, color: "#ef4444" }
    ]
  },
  complaintCategories: {
    title: "Complaint Categories",
    type: "bar-horizontal",
    data: [
      { category: "Pipeline Leakage", count: 24, percent: 50 },
      { category: "Dirty Water Supply", count: 10, percent: 21 },
      { category: "Low Water Pressure", count: 8, percent: 17 },
      { category: "Billing Issues", count: 4, percent: 8 },
      { category: "Others", count: 2, percent: 4 }
    ]
  },
  monthlyComplaints: {
    title: "Monthly Complaints Trend",
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [65, 59, 80, 81, 56, 48]
  },
  workerPerformance: {
    title: "Worker Performance (Tasks Completed)",
    type: "bar-vertical",
    data: [
      { name: "John D.", completed: 18, rating: 4.8 },
      { name: "Sarah K.", completed: 15, rating: 4.9 },
      { name: "Robert M.", completed: 14, rating: 4.5 },
      { name: "Emily W.", completed: 12, rating: 4.7 },
      { name: "David L.", completed: 11, rating: 4.4 }
    ]
  },
  waterSupplyDistribution: {
    title: "Water Supply Distribution by Zone",
    type: "pie",
    data: [
      { zone: "North Zone", volume: "130 MGD", share: 31, color: "#3b82f6" },
      { zone: "South Zone", volume: "120 MGD", share: 29, color: "#60a5fa" },
      { zone: "East Zone", volume: "90 MGD", share: 21, color: "#93c5fd" },
      { zone: "West Zone", volume: "80 MGD", share: 19, color: "#bfdbfe" }
    ]
  }
};

export const recentActivities = [
  {
    id: 1,
    time: "10 mins ago",
    type: "complaint",
    text: "New Leakage Complaint #102 logged for Sector 4, Green Park.",
    status: "Pending",
    icon: "report_problem"
  },
  {
    id: 2,
    time: "25 mins ago",
    type: "assignment",
    text: "Field worker John Doe assigned to resolve dirty water issue in Zone B.",
    status: "In Progress",
    icon: "engineering"
  },
  {
    id: 3,
    time: "1 hour ago",
    type: "supply",
    text: "Water supply pressure stabilized for North Reservoir tank #3.",
    status: "Success",
    icon: "check_circle"
  },
  {
    id: 4,
    time: "2 hours ago",
    type: "maintenance",
    text: "Main transmission line valve replacement completed successfully on Link Road.",
    status: "Completed",
    icon: "build"
  },
  {
    id: 5,
    time: "4 hours ago",
    type: "emergency",
    text: "Emergency pressure release valve triggered at West Station. Controlled shutdown active.",
    status: "Alert",
    icon: "dangerous"
  }
];

export const notificationsData = [
  {
    id: "notif-1",
    title: "Water Delay Notice",
    message: "Supply to Sector 5 will be delayed by 2 hours due to power grid maintenance.",
    time: "Today, 09:30 AM",
    type: "warning",
    icon: "schedule_send"
  },
  {
    id: "notif-2",
    title: "Pipeline Maintenance",
    message: "Scheduled cleaning of trunk line T2 is active. Pressure drops expected in Zone A.",
    time: "Today, 08:00 AM",
    type: "info",
    icon: "settings_suggest"
  },
  {
    id: "notif-3",
    title: "Emergency Shutdown",
    message: "Main supply pipeline under Central Expressway shut down for emergency weld repair.",
    time: "Yesterday, 11:15 PM",
    type: "danger",
    icon: "error"
  },
  {
    id: "notif-4",
    title: "Water Restored",
    message: "Normal supply flow restored to Sector 12 after successful valve correction.",
    time: "Yesterday, 06:30 PM",
    type: "success",
    icon: "verified"
  },
  {
    id: "notif-5",
    title: "Water Quality Alert",
    message: "TDS levels in West Reservoir increased slightly. Standard treatment dosage adjusted.",
    time: "Yesterday, 02:45 PM",
    type: "warning",
    icon: "biotech"
  }
];
