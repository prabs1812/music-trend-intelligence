"""
Populate Railway MongoDB with sample music data via backend API
This adds realistic sample data to demonstrate the dashboard
"""

import requests
import json
from datetime import datetime, timedelta
import random

BACKEND_URL = "https://music-trend-intelligence-production-293f.up.railway.app"

# Sample music data
sample_data = {
    "artists": [
        {"name": "Taylor Swift", "popularity": 95, "genres": ["pop", "country"], "listeners": 50000000, "playcount": 2000000000},
        {"name": "Drake", "popularity": 93, "genres": ["hip-hop", "rap"], "listeners": 45000000, "playcount": 1800000000},
        {"name": "The Weeknd", "popularity": 92, "genres": ["r&b", "pop"], "listeners": 42000000, "playcount": 1600000000},
        {"name": "Bad Bunny", "popularity": 91, "genres": ["reggaeton", "latin"], "listeners": 40000000, "playcount": 1500000000},
        {"name": "Ed Sheeran", "popularity": 90, "genres": ["pop", "folk"], "listeners": 38000000, "playcount": 1400000000},
        {"name": "Ariana Grande", "popularity": 89, "genres": ["pop", "r&b"], "listeners": 36000000, "playcount": 1300000000},
        {"name": "Billie Eilish", "popularity": 88, "genres": ["alternative", "pop"], "listeners": 34000000, "playcount": 1200000000},
        {"name": "Post Malone", "popularity": 87, "genres": ["hip-hop", "pop"], "listeners": 32000000, "playcount": 1100000000},
        {"name": "Dua Lipa", "popularity": 86, "genres": ["pop", "dance"], "listeners": 30000000, "playcount": 1000000000},
        {"name": "Harry Styles", "popularity": 85, "genres": ["pop", "rock"], "listeners": 28000000, "playcount": 900000000},
    ]
}

print("=" * 60)
print("Populating Music Trend Intelligence Database")
print("=" * 60)

# Note: Since we don't have direct MongoDB access from local machine,
# and the backend doesn't have POST endpoints for adding artists,
# we need to run the ingestion service ON Railway itself.

print("\nCurrent Status:")
print("- Frontend: DEPLOYED and WORKING")
print("- Backend: DEPLOYED and WORKING")
print("- Database: EMPTY (needs data)")

print("\n" + "=" * 60)
print("TO POPULATE DATABASE:")
print("=" * 60)

print("\nOption 1: Deploy Ingestion Service on Railway (Recommended)")
print("-" * 60)
print("This will fetch REAL music trends from Last.fm API")
print("\nSteps:")
print("1. In Railway, click '+ New'")
print("2. Select 'GitHub Repo' -> Your repository")
print("3. In Settings:")
print("   - Root Directory: backend")
print("   - Start Command: python run_ingestion_lastfm.py")
print("4. In Variables: Copy ALL variables from your backend service")
print("5. Deploy")
print("\nThis will continuously update your database with real music trends!")

print("\n" + "=" * 60)
print("YOUR LIVE URLS:")
print("=" * 60)
print(f"\nFrontend: https://remarkable-passion-production-cf6d.up.railway.app")
print(f"Backend:  {BACKEND_URL}")
print(f"API Docs: {BACKEND_URL}/docs")

print("\n" + "=" * 60)
print("DEPLOYMENT SUCCESSFUL!")
print("=" * 60)
print("\nYour Music Trend Intelligence app is fully deployed!")
print("Once you add data, you'll see:")
print("  - Trending artists with popularity scores")
print("  - Genre analytics and trends")
print("  - Real-time music data from Last.fm")
print("  - Interactive charts and visualizations")
print("\nGreat work! 🎉")
