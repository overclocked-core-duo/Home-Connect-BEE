#!/bin/bash

# Generate SSL Certificate Script for Home-Connect
# This script creates self-signed SSL certificates for local development

echo "======================================"
echo "  Home-Connect SSL Certificate Generator"
echo "======================================"
echo ""
echo "This script will generate self-signed SSL certificates for local HTTPS development."
echo "⚠️  Note: Self-signed certificates will show browser warnings. This is normal for development."
echo ""

# Check if certificates already exist
if [ -f "server.key" ] || [ -f "server.cert" ]; then
    echo "⚠️  Warning: SSL certificate files already exist!"
    echo ""
    read -p "Do you want to overwrite existing certificates? (y/n): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Certificate generation cancelled."
        exit 0
    fi
    echo ""
fi

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: OpenSSL is not installed."
    echo "Please install OpenSSL first:"
    echo "  macOS: brew install openssl"
    echo "  Ubuntu/Debian: sudo apt-get install openssl"
    echo "  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

echo "✓ OpenSSL found"
echo ""

# Default values
COUNTRY="US"
STATE="California"
CITY="San Francisco"
ORG="Home-Connect"
UNIT="Development"
COMMON_NAME="localhost"
EMAIL="dev@homeconnect.local"

echo "Certificate Information (press Enter to use defaults):"
echo ""
read -p "Country Code [$COUNTRY]: " input_country
COUNTRY=${input_country:-$COUNTRY}

read -p "State/Province [$STATE]: " input_state
STATE=${input_state:-$STATE}

read -p "City [$CITY]: " input_city
CITY=${input_city:-$CITY}

read -p "Organization [$ORG]: " input_org
ORG=${input_org:-$ORG}

read -p "Common Name (domain) [$COMMON_NAME]: " input_cn
COMMON_NAME=${input_cn:-$COMMON_NAME}

echo ""
echo "Generating SSL certificates..."
echo ""

# Generate private key and certificate
openssl req -nodes -new -x509 \
    -keyout server.key \
    -out server.cert \
    -days 365 \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL" \
    2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificates generated successfully!"
    echo ""
    echo "Files created:"
    echo "  📄 server.key  - Private key"
    echo "  📄 server.cert - Certificate"
    echo ""
    echo "Next steps:"
    echo "  1. Restart your server: npm start"
    echo "  2. Visit: https://localhost:8443"
    echo "  3. Accept the browser security warning (this is normal for self-signed certificates)"
    echo ""
    echo "ℹ️  For production, obtain certificates from a trusted CA like Let's Encrypt"
else
    echo ""
    echo "❌ Error: Failed to generate certificates"
    exit 1
fi
