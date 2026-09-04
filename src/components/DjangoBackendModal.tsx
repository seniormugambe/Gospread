import { useState, useEffect } from 'react';
import { 
  Server, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Code, 
  Copy, 
  Check, 
  Database, 
  ShieldCheck, 
  Terminal, 
  X,
  Activity,
  Zap,
  Lock,
  Radio,
  Globe,
  Award,
  DollarSign,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { djangoApi, DJANGO_API_BASE_URL } from '../services/djangoApi';

interface DjangoBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DjangoBackendModal({ isOpen, onClose }: DjangoBackendModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'endpoints' | 'models' | 'views' | 'channels' | 'settings'>('status');
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState<{
    connected: boolean;
    baseUrl: string;
    latencyMs: number;
    message: string;
    version?: string;
  } | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<string | number | null>(null);
  const [apiUrl, setApiUrl] = useState(DJANGO_API_BASE_URL);

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  const runCheck = async () => {
    setChecking(true);
    djangoApi.setBaseUrl(apiUrl);
    const res = await djangoApi.checkDjangoHealth(apiUrl);
    setHealth(res);
    setChecking(false);
  };

  const handleCopyCode = (codeText: string, id: string | number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  const DJANGO_ENDPOINTS = [
    {
      group: 'Authentication & Spiritual Profile',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/login/',
          desc: 'Obtain JWT token pair & user profile with unlocked faith badges',
          sampleJson: `{\n  "email": "david.lawson@gospread.org",\n  "password": "••••••••"\n}`
        },
        {
          method: 'POST',
          path: '/api/v1/auth/register/',
          desc: 'Register new believer / creator / pastor with starting Grace Streak & initial badge',
          sampleJson: `{\n  "username": "sarah_jenkins",\n  "email": "sarah@gospread.org",\n  "password": "••••••••",\n  "church_name": "Living Waters Sanctuary"\n}`
        },
        {
          method: 'POST',
          path: '/api/v1/auth/streak/checkin/',
          desc: 'Record daily Grace Streak checkin (+50 Praise XP & unlock streak badges)',
          sampleJson: `{\n  "client_timestamp": "2026-08-14T08:00:00Z"\n}`
        }
      ]
    },
    {
      group: 'Churches & Multi-Campus Locations',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/churches/?q=atlanta',
          desc: 'List & search churches, branches, service schedules & Google Maps links',
          sampleJson: `[\n  {\n    "id": "ch-1",\n    "name": "Living Waters Sanctuary",\n    "lead_pastor": "Pastor Johnathan Cole",\n    "campuses": [\n      {\n        "campus_name": "Main Sanctuary",\n        "address": "777 Living Waters Blvd",\n        "city_state": "Houston, TX",\n        "google_maps_url": "https://maps.google.com/?q=Living+Waters+Houston",\n        "is_main_campus": true\n      }\n    ]\n  }\n]`
        },
        {
          method: 'POST',
          path: '/api/v1/churches/register/',
          desc: 'Register ministry with optional multiple campus locations and Google Maps URLs',
          sampleJson: `{\n  "name": "Grace City Cathedral",\n  "category": "Cathedral / Charismatic",\n  "lead_pastor": "Pastor Mark Anthony",\n  "campuses": [\n    {\n      "campus_name": "Midtown Main Cathedral",\n      "address": "100 Grace Way",\n      "city_state": "Atlanta, GA",\n      "google_maps_url": "https://maps.google.com/?q=Grace+City+Atlanta",\n      "service_times": "Sun 9:00 AM & 11:30 AM",\n      "is_main_campus": true\n    }\n  ]\n}`
        }
      ]
    },
    {
      group: 'Live Streams, Audio & Media',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/videos/?category=Sunday+Service&is_live=true',
          desc: 'Fetch live video streams, sermon recordings, viewer counts & timestamps',
          sampleJson: `[\n  {\n    "id": "v-live-1",\n    "title": "Sunday Worship & Covenant Revival",\n    "church_or_ministry": "Grace City Cathedral",\n    "is_live": true,\n    "viewers_count": 8940,\n    "likes_count": "18.2K"\n  }\n]`
        },
        {
          method: 'GET',
          path: '/api/v1/podcasts/',
          desc: 'Fetch audio sermons, devotional tracks, album series & 24/7 radio',
          sampleJson: `[\n  {\n    "id": "audio-1",\n    "title": "Abiding in Grace & Deep Communion",\n    "artist_or_preacher": "Elena Rostova",\n    "duration": "48:20"\n  }\n]`
        }
      ]
    },
    {
      group: 'Giving, Tithes & Super Amen Altars',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/giving/donate/',
          desc: 'Process Tithe, Offering, Seed Faith, Super Amen or Partner Pass',
          sampleJson: `{\n  "amount": 100.00,\n  "ministry_name": "Living Waters Sanctuary",\n  "fund_type": "Tithe",\n  "is_recurring": true,\n  "payment_method": "card",\n  "prayer_note": "Praying for family healing and favor"\n}`
        },
        {
          method: 'GET',
          path: '/api/v1/giving/history/',
          desc: 'Fetch user giving history, receipts and annual tax statements',
          sampleJson: `[\n  {\n    "transaction_id": "TXN-DJ-891042",\n    "amount": "100.00",\n    "fund_type": "Tithe",\n    "receipt_url": "https://gospread.org/receipts/TXN-891042",\n    "status": "completed"\n  }\n]`
        }
      ]
    },
    {
      group: 'Faith Badges & Global Rankings',
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/rankings/believers/?badge_filter=3plus',
          desc: 'Global leaderboard of verified believers who have gained unlocked faith badges',
          sampleJson: `[\n  {\n    "rank": 1,\n    "name": "Sister Sarah Jenkins",\n    "momentum_score": 99.1,\n    "streak_days": 32,\n    "praise_xp": 3250,\n    "badges_count": 5,\n    "badges": ["Global Intercessor", "30-Day Overcomer", "Kingdom Ambassador"]\n  }\n]`
        }
      ]
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-5xl bg-[#121212] border border-emerald-500/30 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-5 sm:p-6 border-b border-emerald-500/20 flex items-center justify-between relative">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Server className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">Django Backend Architecture & API Guide</h2>
                  <span className="text-[10px] font-extrabold font-mono bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    Django 5.0 + DRF
                  </span>
                  <span className="text-[10px] font-extrabold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    Channels / WebSockets
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete blueprint of Django apps, models schema, DRF serializers, JWT auth, WebSockets & multi-campus ministry APIs.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
            {[
              { id: 'status', label: 'Live Backend Health', icon: Activity },
              { id: 'endpoints', label: 'REST API Endpoints', icon: Code },
              { id: 'models', label: 'Django Models Schema', icon: Database },
              { id: 'views', label: 'DRF Views & Serializers', icon: Zap },
              { id: 'channels', label: 'Django Channels / Live Chat', icon: Radio },
              { id: 'settings', label: 'settings.py & CORS', icon: Lock }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm font-black'
                      : 'text-slate-400 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">

            {/* TAB 1: STATUS & HEALTH CHECK */}
            {activeTab === 'status' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="text-xs font-mono uppercase text-slate-400">Target Django Base URL</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-300 w-72 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={runCheck}
                          disabled={checking}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                          <span>{checking ? 'Pinging...' : 'Ping Live'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 self-start sm:self-auto">
                      <span className="font-bold text-slate-300">Environment Config:</span> <code className="text-amber-300 font-mono">VITE_DJANGO_API_URL</code>
                    </div>
                  </div>

                  {health && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Connection Status</span>
                        <div className="flex items-center gap-2">
                          {health.connected ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">LIVE & CONNECTED</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-black text-amber-400 uppercase tracking-wide">MOCK-RESILIENT FALLBACK</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Round-Trip Latency</span>
                        <div className="text-xs font-bold font-mono text-white">
                          {health.connected ? `${health.latencyMs} ms` : 'Local Fallback Simulated'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium">Backend Framework</span>
                        <div className="text-xs font-bold font-mono text-emerald-300">
                          {health.version || 'Django 5.0 (DRF 3.15)'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Frontend Fault Tolerance: </span>
                      {health?.message}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Automatic Header Injection</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Outgoing requests automatically pass <code className="text-amber-300 font-mono">Authorization: Bearer &lt;jwt&gt;</code> and <code className="text-amber-300 font-mono">X-CSRFToken</code> headers.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Behavioral Faith Badges Pipeline</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Daily prayer checkins trigger Django signals to award behavioral badges (Overcomer, Sower, Intercessor) and update Global Rankings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ENDPOINTS LIST */}
            {activeTab === 'endpoints' && (
              <div className="space-y-6">
                {DJANGO_ENDPOINTS.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{group.group}</span>
                    </h3>

                    <div className="space-y-3">
                      {group.endpoints.map((ep, idx) => {
                        const copyId = `${gIdx}-${idx}`;
                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                                  ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}>
                                  {ep.method}
                                </span>
                                <code className="text-xs font-bold font-mono text-white">{ep.path}</code>
                              </div>

                              <button
                                onClick={() => handleCopyCode(ep.sampleJson, copyId)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center gap-1 border border-slate-700"
                              >
                                {copiedIndex === copyId ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Sample JSON</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs text-slate-400">{ep.desc}</p>

                            <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-300 border border-slate-800/80 overflow-x-auto">
                              {ep.sampleJson}
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: DJANGO MODELS BLUEPRINT */}
            {activeTab === 'models' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Production-grade Django models covering Multi-Campus Churches, Faith Badges, Giving, Streams & Altar Chat.
                  </div>
                  <button
                    onClick={() => handleCopyCode(DJANGO_MODELS_CODE, 'models-all')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {copiedIndex === 'models-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'models-all' ? 'Copied models.py!' : 'Copy models.py'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-[11px] text-cyan-200 border border-slate-800 overflow-x-auto leading-relaxed max-h-[55vh]">
                  {DJANGO_MODELS_CODE}
                </pre>
              </div>
            )}

            {/* TAB 4: DRF VIEWS & SERIALIZERS */}
            {activeTab === 'views' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    DRF Serializers & ViewSets handling atomic transactions, receipt URLs, and multi-campus Google Maps endpoints.
                  </div>
                  <button
                    onClick={() => handleCopyCode(DJANGO_VIEWS_CODE, 'views-all')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {copiedIndex === 'views-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'views-all' ? 'Copied views.py!' : 'Copy views.py'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-[11px] text-amber-200 border border-slate-800 overflow-x-auto leading-relaxed max-h-[55vh]">
                  {DJANGO_VIEWS_CODE}
                </pre>
              </div>
            )}

            {/* TAB 5: DJANGO CHANNELS / WEBSOCKETS */}
            {activeTab === 'channels' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Altar Chat & Amen Reactions (Django Channels)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure WebSocket consumers in Django using Redis channel layers for sub-second live streaming chat:
                  </p>

                  <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-purple-200 border border-slate-800 overflow-x-auto leading-relaxed">
{`# consumers.py (Django Channels)
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AltarStreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.stream_id = self.scope['url_route']['kwargs']['stream_id']
        self.room_group_name = f'stream_{self.stream_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type') # 'chat_message', 'super_amen', 'prayer_point'
        
        # Broadcast to all live stream altar viewers
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_event',
                'payload': data
            }
        )

    async def broadcast_event(self, event):
        await self.send(text_data=json.dumps(event['payload']))`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 6: SETTINGS & CORS */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Django settings.py CORS & SimpleJWT Configuration</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add the following to your Django <code className="text-amber-300 font-mono">settings.py</code> to allow cross-origin API calls and configure JWT authentication:
                  </p>

                  <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-200 border border-slate-800 overflow-x-auto leading-relaxed">
{`# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',

    # Local Gospread Apps
    'apps.accounts',
    'apps.churches',
    'apps.streams',
    'apps.giving',
    'apps.rankings',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST be on top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True  # For easy development & cross-origin client apps
# Or restrict to specific frontend origins:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://ais-dev-prn3yqajheqpwqz23dpfvo-620618019121.europe-west2.run.app",
    "https://ais-pre-prn3yqajheqpwqz23dpfvo-620618019121.europe-west2.run.app",
]
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
}

# SimpleJWT Lifetime Configuration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
}`}
                  </pre>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Stack Django REST Framework Integration</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
            >
              Close Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const DJANGO_MODELS_CODE = `from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# 1. USER PROFILE & FAITH BADGES
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('believer', 'Global Believer'),
        ('creator', 'Gospel Creator'),
        ('pastor', 'Pastor / Church Leader'),
        ('artiste', 'Gospel Artiste / Psalmist'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='believer')
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    home_church = models.CharField(max_length=255, blank=True)
    praise_xp = models.IntegerField(default=100)
    streak_days = models.IntegerField(default=1)
    last_devotion_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class FaithBadge(models.Model):
    TIER_CHOICES = [('Bronze', 'Bronze'), ('Silver', 'Silver'), ('Gold', 'Gold')]
    name = models.CharField(max_length=100, unique=True) # e.g. "Global Intercessor", "7-Day Overcomer"
    icon = models.CharField(max_length=10) # emoji icon e.g. ⚡, 👑, 🔥
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='Bronze')
    category = models.CharField(max_length=50) # e.g. "Prayer", "Streak", "Giving"
    description = models.TextField()

class UserBadgeAward(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(FaithBadge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

# 2. CHURCH & MULTI-CAMPUS LOCATIONS
class Church(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    lead_pastor = models.CharField(max_length=255)
    avatar = models.URLField(blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class ChurchCampus(models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name='campuses')
    campus_name = models.CharField(max_length=255) # e.g. "Midtown Main Sanctuary", "North Branch"
    address = models.CharField(max_length=255)
    city_state = models.CharField(max_length=150)
    country = models.CharField(max_length=100, default='USA')
    google_maps_url = models.URLField(blank=True)
    service_times = models.CharField(max_length=255) # e.g. "Sun 9:00 AM & 11:30 AM"
    is_main_campus = models.BooleanField(default=False)

# 3. VIDEO STREAMS & MEDIA
class VideoStream(models.Model):
    title = models.CharField(max_length=255)
    speaker_or_artist = models.CharField(max_length=255)
    church_or_ministry = models.CharField(max_length=255)
    channel_avatar = models.URLField()
    category = models.CharField(max_length=100)
    is_live = models.BooleanField(default=False)
    viewers_count = models.IntegerField(default=0)
    thumbnail = models.URLField()
    description = models.TextField()
    bible_verse = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AudioTrack(models.Model):
    title = models.CharField(max_length=255)
    artist_or_preacher = models.CharField(max_length=255)
    album_or_series = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    cover_url = models.URLField()
    duration = models.CharField(max_length=50)
    is_live_radio = models.BooleanField(default=False)

# 4. GIVING & TITHE LEDGER
class Donation(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    ministry_name = models.CharField(max_length=255)
    fund_type = models.CharField(max_length=100) # Tithe, Seed, Super Amen, Partner Pass
    is_recurring = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, default='card')
    donor_name = models.CharField(max_length=255, default='Anonymous Partner')
    donor_email = models.EmailField(blank=True)
    prayer_note = models.TextField(blank=True)
    receipt_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)`;

const DJANGO_VIEWS_CODE = `from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
import uuid
from .models import Church, ChurchCampus, VideoStream, AudioTrack, Donation, UserProfile

# SERIALIZERS
class ChurchCampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChurchCampus
        fields = ['id', 'campus_name', 'address', 'city_state', 'google_maps_url', 'service_times', 'is_main_campus']

class ChurchSerializer(serializers.ModelSerializer):
    campuses = ChurchCampusSerializer(many=True, required=False)

    class Meta:
        model = Church
        fields = ['id', 'name', 'category', 'lead_pastor', 'avatar', 'website', 'verified', 'campuses']

# DONATION VIEW
class ProcessDonationView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        ministry_name = request.data.get('ministry_name', 'Gospread Global Mission')
        fund_type = request.data.get('fund_type', 'Tithe')
        
        if not amount or float(amount) <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        txn_id = f"TXN-DJ-{uuid.uuid4().hex[:8].upper()}"
        receipt = f"https://gospread.org/receipts/{txn_id}"

        donation = Donation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            transaction_id=txn_id,
            amount=amount,
            ministry_name=ministry_name,
            fund_type=fund_type,
            is_recurring=request.data.get('is_recurring', False),
            payment_method=request.data.get('payment_method', 'card'),
            donor_name=request.data.get('donor_name', 'Anonymous Partner'),
            donor_email=request.data.get('donor_email', ''),
            prayer_note=request.data.get('prayer_note', ''),
            receipt_url=receipt,
            status='completed'
        )

        return Response({
            'success': True,
            'transactionId': txn_id,
            'amount': float(amount),
            'receiptUrl': receipt,
            'message': f"Recorded {fund_type} of \${amount} successfully."
        }, status=status.HTTP_201_CREATED)`;
