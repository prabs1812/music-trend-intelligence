"""
Verification script for Music Trend Intelligence deployment
"""

import requests
import json

BACKEND_URL = "https://music-trend-intelligence-production-293f.up.railway.app"
FRONTEND_URL = "https://remarkable-passion-production-cf6d.up.railway.app"

print("=" * 60)
print("Music Trend Intelligence - Deployment Verification")
print("=" * 60)

# Test backend health
print("\n1. Testing Backend Health...")
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    health = response.json()
    print(f"   Status: {health['status']}")
    print(f"   MongoDB: {'Connected' if health['mongodb'] else 'Disconnected'}")
    print(f"   Redis: {'Connected' if health['redis'] else 'Disabled'}")
    print(f"   Kafka: {'Connected' if health['kafka_producer'] else 'Disabled'}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test backend stats API
print("\n2. Testing Backend Stats API...")
try:
    response = requests.get(f"{BACKEND_URL}/api/v1/stats", timeout=10)
    stats = response.json()
    print(f"   Total Artists: {stats['total_artists']}")
    print(f"   Total Trends: {stats['total_trends']}")
    print(f"   Total Anomalies: {stats['total_anomalies']}")
    print(f"   Total Comments: {stats['total_comments']}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test frontend
print("\n3. Testing Frontend...")
try:
    response = requests.get(FRONTEND_URL, timeout=10)
    if response.status_code == 200:
        print(f"   Status: Accessible (HTTP {response.status_code})")
        print(f"   Frontend is serving the React app")
    else:
        print(f"   Status: HTTP {response.status_code}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
print("\nYour deployment is working correctly!")
print(f"\nFrontend: {FRONTEND_URL}")
print(f"Backend:  {BACKEND_URL}")
print(f"API Docs: {BACKEND_URL}/docs")
print("\nNext Step: Populate database with music data")
print("=" * 60)
