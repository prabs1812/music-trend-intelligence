#!/bin/bash

# Redis Setup Script for Music Trend Intelligence System
# This script verifies Redis installation and configuration

echo "=========================================="
echo "Redis Setup"
echo "=========================================="

# Configuration
REDIS_HOST=${REDIS_HOST:-"localhost"}
REDIS_PORT=${REDIS_PORT:-6379}

echo "Checking Redis at $REDIS_HOST:$REDIS_PORT"
echo ""

# Check if Redis is running
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to Redis at $REDIS_HOST:$REDIS_PORT"
    echo "Please ensure Redis is running"
    echo ""
    echo "To start Redis:"
    echo "  - Linux: sudo systemctl start redis"
    echo "  - Mac: brew services start redis"
    echo "  - Docker: docker run -d -p 6379:6379 redis:latest"
    exit 1
fi

echo "✓ Redis is running"
echo ""

# Get Redis info
echo "Redis Information:"
echo "----------------------------------------"
redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO server | grep "redis_version"
redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO server | grep "os"
redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO memory | grep "used_memory_human"
echo ""

# Test Redis operations
echo "Testing Redis operations..."

# Set a test key
redis-cli -h $REDIS_HOST -p $REDIS_PORT SET test_key "Music Trend Intelligence" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ SET operation successful"
else
    echo "✗ SET operation failed"
fi

# Get the test key
VALUE=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT GET test_key)
if [ "$VALUE" == "Music Trend Intelligence" ]; then
    echo "✓ GET operation successful"
else
    echo "✗ GET operation failed"
fi

# Delete the test key
redis-cli -h $REDIS_HOST -p $REDIS_PORT DEL test_key > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ DEL operation successful"
else
    echo "✗ DEL operation failed"
fi

echo ""

# Check Redis configuration
echo "Redis Configuration:"
echo "----------------------------------------"
redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG GET maxmemory
redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG GET maxmemory-policy

echo ""
echo "=========================================="
echo "Redis setup completed!"
echo "=========================================="
echo "Redis is ready for use"
echo "Host: $REDIS_HOST"
echo "Port: $REDIS_PORT"
echo "=========================================="
