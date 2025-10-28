#!/bin/bash

# Script to create readonly database user for staging environment
# Usage: ./setup-staging-db-user-fixed.sh

echo "🗄️  Setup Staging Database User"
echo "========================================"
echo ""

# Database credentials
DB_HOST="ec2-3-91-26-178.compute-1.amazonaws.com"
DB_NAME="labsisEG"
DB_ADMIN_USER="labsis"
DB_ADMIN_PASSWORD=",U8x=]N02SX4"

# New readonly user credentials
READONLY_USER="labsis_readonly"
READONLY_PASSWORD="MApjkSt1xoD6g1dtt6mNClT4lfmp1DvoK97wYPWHrF8="

echo "📍 Database: $DB_HOST"
echo "📦 Database Name: $DB_NAME"
echo "👤 Creating user: $READONLY_USER"
echo ""

# Create SQL script
cat > /tmp/create_readonly_user_fixed.sql << 'EOF'
-- Drop user if exists
DROP USER IF EXISTS labsis_readonly;

-- Create readonly user
CREATE USER labsis_readonly WITH PASSWORD 'MApjkSt1xoD6g1dtt6mNClT4lfmp1DvoK97wYPWHrF8=';

-- Grant connection to database
GRANT CONNECT ON DATABASE "labsisEG" TO labsis_readonly;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO labsis_readonly;

-- Grant SELECT on all existing tables in public schema
GRANT SELECT ON ALL TABLES IN SCHEMA public TO labsis_readonly;

-- Grant SELECT on all existing sequences
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO labsis_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO labsis_readonly;

-- Grant SELECT on future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON SEQUENCES TO labsis_readonly;

-- Verify user was created
\du labsis_readonly

-- Show some sample privileges
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('prueba', 'grupo_prueba', 'orden', 'paciente')
LIMIT 5;
EOF

echo "📝 SQL script created"
echo ""
echo "🔐 Connecting to database..."
echo ""

# Execute SQL script
PGPASSWORD="$DB_ADMIN_PASSWORD" psql \
    -h "$DB_HOST" \
    -U "$DB_ADMIN_USER" \
    -d "$DB_NAME" \
    -f /tmp/create_readonly_user_fixed.sql

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
        -c "SELECT current_user, current_database(), version();"

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Readonly user can connect successfully!"
        echo ""
        echo "📊 Testing SELECT permission on key tables..."

        # Test SELECT on prueba table
        PGPASSWORD="$READONLY_PASSWORD" psql \
            -h "$DB_HOST" \
            -U "$READONLY_USER" \
            -d "$DB_NAME" \
            -c "SELECT COUNT(*) as total_pruebas FROM prueba;"

        # Test SELECT on paciente table
        PGPASSWORD="$READONLY_PASSWORD" psql \
            -h "$DB_HOST" \
            -U "$READONLY_USER" \
            -d "$DB_NAME" \
            -c "SELECT COUNT(*) as total_pacientes FROM paciente;"

        echo ""
        echo "🚫 Testing that user CANNOT write..."

        # Test that user cannot INSERT (should fail)
        PGPASSWORD="$READONLY_PASSWORD" psql \
            -h "$DB_HOST" \
            -U "$READONLY_USER" \
            -d "$DB_NAME" \
            -c "CREATE TABLE test_table (id INT);" 2>&1 | grep -i "permission denied" && echo "✅ Correctly denied CREATE permission" || echo "⚠️ Could not verify write protection"

        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "📋 User Details:"
        echo "   Username: $READONLY_USER"
        echo "   Password: $READONLY_PASSWORD"
        echo "   Database: $DB_NAME"
        echo "   Host: $DB_HOST"
        echo "   Schema: public"
        echo "   Access: READ ONLY"
        echo ""
        echo "✅ This user is configured in GitHub Secrets as:"
        echo "   - DB_USER_STAGING=$READONLY_USER"
        echo "   - DB_PASSWORD_STAGING=(configured)"
        echo "   - DB_HOST_STAGING=$DB_HOST"
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
rm -f /tmp/create_readonly_user_fixed.sql

echo ""
echo "========================================"
echo "✅ Database staging user setup complete!"
echo "========================================"
