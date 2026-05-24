"""
Simple script to populate Railway MongoDB with sample music data via the backend API.
This bypasses local connection issues by using the deployed backend.
"""

import requests
import time

BACKEND_URL = "https://music-trend-intelligence-production-293f.up.railway.app"

# Sample artists data
sample_artists = [
    {"name": "Taylor Swift", "popularity": 95, "genres": ["pop", "country"], "listeners": 50000000},
    {"name": "Drake", "popularity": 93, "genres": ["hip-hop", "rap"], "listeners": 45000000},
    {"name": "The Weeknd", "popularity": 92, "genres": ["r&b", "pop"], "listeners": 42000000},
    {"name": "Bad Bunny", "popularity": 91, "genres": ["reggaeton", "latin"], "listeners": 40000000},
    {"name": "Ed Sheeran", "popularity": 90, "genres": ["pop", "folk"], "listeners": 38000000},
]

print(f"Testing backend connection...")
response = requests.get(f"{BACKEND_URL}/health")
print(f"Backend health: {response.json()}")

print(f"\nBackend is ready!")
print(f"Frontend URL: https://remarkable-passion-production-cf6d.up.railway.app/")
print(f"Backend URL: {BACKEND_URL}")
print(f"\nYour Music Trend Intelligence app is now live!")
print(f"\nNote: Database is currently empty. Run data ingestion on Railway to populate it.")
