#!/bin/bash

# Script to create readonly database user for staging environment
# Usage: ./setup-staging-db-user.sh

echo "🗄️  Setup Staging Database User"
echo "========================================"
echo ""

# Database credentials
DB_HOST="ec2-3-91-26-178.compute-1.amazonaws.com"
DB_NAME="labsisEG"
DB_ADMIN_USER="labsis"
DB_ADMIN_PASSWORD=",U8x=]N02SX4"

# New readonly user credentials (from SECRETS-VALUES.txt)
READONLY_USER="labsis_readonly"
READONLY_PASSWORD="MApjkSt1xoD6g1dtt6mNClT4lfmp1DvoK97wYPWHrF8="

echo "📍 Database: $DB_HOST"
echo "📦 Database Name: $DB_NAME"
echo "👤 Creating user: $READONLY_USER"
echo ""

# Create SQL script
cat > /tmp/create_readonly_user.sql << 'EOF'
-- Drop user if exists
DROP USER IF EXISTS labsis_readonly;

-- Create readonly user
CREATE USER labsis_readonly WITH PASSWORD 'MApjkSt1xoD6g1dtt6mNClT4lfmp1DvoK97wYPWHrF8=';

-- Grant connection to database
GRANT CONNECT ON DATABASE labsisEG TO labsis_readonly;

-- Grant usage on schema
GRANT USAGE ON SCHEMA laboratorio TO labsis_readonly;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA laboratorio TO labsis_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA laboratorio
GRANT SELECT ON TABLES TO labsis_readonly;

-- Verify user was created
\du labsis_readonly

-- Show granted privileges
SELECT
    grantee,
    table_schema,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'labsis_readonly'
LIMIT 10;
EOF

echo "📝 SQL script created at /tmp/create_readonly_user.sql"
echo ""
echo "🔐 Connecting to database..."
echo ""

# Execute SQL script
PGPASSWORD="$DB_ADMIN_PASSWORD" psql \
    -h "$DB_HOST" \
    -U "$DB_ADMIN_USER" \
    -d "$DB_NAME" \
    -f /tmp/create_readonly_user.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ User created successfully!"
    echo ""
    echo "🧪 Testing connection with readonly user..."
    echo ""

    # Test readonly connection
    PGPASSWORD="$READONLY_PASSWORD" psql \
        -h "$DB_HOST" \
        -U "$READONLY_USER" \
        -d "$DB_NAME" \
        -c "SELECT current_user, current_database();"

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Readonly user can connect successfully!"
        echo ""
        echo "📊 Testing SELECT permission..."

        # Test SELECT
        PGPASSWORD="$READONLY_PASSWORD" psql \
            -h "$DB_HOST" \
            -U "$READONLY_USER" \
            -d "$DB_NAME" \
            -c "SELECT COUNT(*) as total_pruebas FROM laboratorio.prueba LIMIT 1;"

        echo ""
        echo "🚫 Testing that user CANNOT write..."

        # Test that user cannot INSERT (should fail)
        PGPASSWORD="$READONLY_PASSWORD" psql \
            -h "$DB_HOST" \
            -U "$READONLY_USER" \
            -d "$DB_NAME" \
            -c "INSERT INTO laboratorio.prueba (nombre) VALUES ('test');" 2>&1 | grep -i "permission denied" && echo "✅ Correctly denied write access"

        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "📋 User Details:"
        echo "   Username: $READONLY_USER"
        echo "   Password: $READONLY_PASSWORD"
        echo "   Database: $DB_NAME"
        echo "   Host: $DB_HOST"
        echo "   Access: READ ONLY"
        echo ""
        echo "✅ This user is configured in GitHub Secrets as:"
        echo "   - DB_USER_STAGING"
        echo "   - DB_PASSWORD_STAGING"
    else
        echo "❌ Failed to connect with readonly user"
        exit 1
    fi
else
    echo ""
    echo "❌ Failed to create user"
    echo "Common issues:"
    echo "  - Wrong admin credentials"
    echo "  - Database server not accessible"
    echo "  - Firewall blocking connection"
    exit 1
fi

# Cleanup
rm -f /tmp/create_readonly_user.sql

echo ""
echo "========================================"
echo "✅ Database staging user setup complete!"
