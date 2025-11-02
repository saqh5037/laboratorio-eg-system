# Resumen Completo - Plan de Replicación PostgreSQL Laboratorio EG

**Fecha:** 28 de Octubre, 2025
**Propósito:** Configurar replicación streaming asíncrona entre servidor on-premise (Venezuela) y AWS
**Preparado para:** Claude Opus (planificación detallada)

---

## CONTEXTO DEL PROYECTO

### Objetivo Principal
Sincronizar base de datos PostgreSQL desde servidor on-premise (Venezuela) hacia AWS utilizando replicación streaming asíncrona con backup diario a S3.

### Arquitectura Actual

**Servidor On-Premise (Venezuela) - Futuro MASTER:**
- Sistema: Ubuntu 20.04.6 LTS
- PostgreSQL: 14.11
- Usuario BD: `labsis` (superuser)
- Base de datos: `labsisEG` (nombre a confirmar mañana)
- Tamaño: Por determinar (AWS tiene 10 GB)
- Disco disponible: 364 GB libre (438 GB total)
- SSH: Puerto personalizado (no 22), con firewall
- Internet: Velocidad por determinar
- Estado actual BD: Por verificar (posiblemente vacía o con datos viejos)

**Servidor AWS (us-east-1a) - Futuro REPLICA:**
- Host: ec2-3-91-26-178.compute-1.amazonaws.com
- IP Privada: 172.31.45.41
- Instancia: i-0ee70404207fa1718 (c6g.12xlarge - 48 cores ARM, 96 GB RAM)
- PostgreSQL: 14.11 (mismo que on-premise ✅)
- Sistema: Ubuntu 20.04.6 LTS
- Usuario BD: `labsis` (superuser)
- Password: `,U8x=]N02SX4`
- Base de datos: `labsisEG`
- Tamaño actual: 10 GB (datos de producción actuales)
- Disco: 1 TB (561 GB disponibles)
- Configuración existente:
  - wal_level = replica ✅
  - max_wal_senders = 10 ✅
  - max_replication_slots = 10 ✅
  - ssl = on ✅

**Aplicación Labsis:**
- Servidor: 54.197.68.252 (ec2-54-197-68-252.compute-1.amazonaws.com)
- Puerto: 8080 (JBoss)
- Estado: Puede detenerse completamente durante la implementación

---

## ESTRATEGIA DE ACCESO

### Método de Conexión
```
Usuario (México)
  → AnyDesk
    → PC Windows (Venezuela, misma red del servidor)
      → SSH
        → Servidor On-Premise PostgreSQL (Venezuela)
```

### Configuración SSH
- Usuario temporal: `claude_temp` (crear durante implementación)
- Acceso: Solo durante la implementación
- Puerto: Personalizado (no 22) - determinar mañana
- Firewall: Apertura temporal solo para IP específica
- Seguridad: Llaves SSH nuevas generadas específicamente para esta tarea

---

## FLUJO DE DATOS PROPUESTO

### Dirección de Sincronización

**IMPORTANTE:** El flujo es inverso a lo típico:

```
PASO 1 - Backup Inicial:
AWS (10 GB producción actual)
  → Backup (pg_dump)
    → Transferencia (S3 o SCP)
      → On-Premise (restaurar)

PASO 2 - Configuración Replicación:
On-Premise (MASTER)
  → Replicación Streaming Asíncrona (~1-5 segundos lag)
    → AWS (REPLICA READ-ONLY)

PASO 3 - Backup Diario:
On-Premise (MASTER)
  → pg_dump diario (2 AM)
    → S3 (s3://laboratorio-eg-backups)
```

### Justificación del Flujo
1. AWS tiene los datos de producción más actuales (10 GB)
2. On-Premise está vacío o desactualizado
3. Se necesita copiar AWS → On-Premise primero
4. Luego On-Premise se convierte en el master definitivo
5. AWS pasa a ser réplica de solo lectura

---

## REQUERIMIENTOS TÉCNICOS

### Tipo de Replicación
- **Método:** PostgreSQL Streaming Replication Asíncrona
- **Latencia esperada:** 1-5 segundos
- **Modo:** Asíncrono (on-premise NO se bloquea si AWS cae)
- **Alcance:** Toda la base de datos (no selectivo)
- **Failover:** Manual (procedimiento documentado)

### Configuraciones PostgreSQL Requeridas

**On-Premise (Master):**
```ini
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 10GB
archive_mode = on
archive_command = 'aws s3 cp %p s3://laboratorio-eg-wal/%f'
archive_timeout = 300
synchronous_commit = local  # Asíncrono, no bloquea
```

**AWS (Replica):**
```ini
primary_conninfo = 'host=IP_ONPREMISE port=PUERTO user=replicator password=XXX'
primary_slot_name = 'aws_replica_slot'
hot_standby = on
```

### Security Groups AWS
```yaml
Modificación requerida en ec2-3-91-26-178:
  Inbound Rules:
    - PostgreSQL (5432): Agregar IP pública on-premise/32
    - Descripción: "Replicación desde on-premise Venezuela"
```

---

## PLAN DE IMPLEMENTACIÓN (10 FASES)

### Horario Programado
- **Día:** Por definir (preferiblemente día de baja carga)
- **Hora:** 3:00 PM México = 5:00 PM Venezuela
- **Duración estimada:** 4-5 horas
- **Downtime Labsis:** 1-2 horas (fases 2-3)

### FASE 0: Preparación Previa (1 día antes)

**Acciones del usuario:**
- [ ] Avisar a usuarios finales del mantenimiento programado
- [ ] Confirmar que Labsis puede detenerse completamente
- [ ] Verificar AnyDesk funcional en PC Windows Venezuela
- [ ] Confirmar horario exacto de implementación

**Información a recopilar (vía script):**
```bash
# Ejecutar en servidor on-premise vía AnyDesk:
./info-servidor-onpremise.sh

# Debe retornar:
- Nombre exacto de la base de datos
- Puerto SSH personalizado
- IP pública del servidor
- Configuración actual PostgreSQL (wal_level, etc.)
- Espacio en disco disponible
- Velocidad de internet (test)
- Estado actual de la BD (vacía, con datos, etc.)
```

---

### FASE 1: Establecer Conexión SSH Segura (30 min)

**1.1 Conexión Inicial (vía AnyDesk)**
- Usuario se conecta por AnyDesk a PC Windows Venezuela
- Abre terminal SSH al servidor on-premise

**1.2 Configurar Acceso SSH para Claude**
```bash
# Usuario ejecuta comandos proporcionados:
sudo useradd -m -s /bin/bash claude_temp
sudo usermod -aG sudo claude_temp
sudo mkdir -p /home/claude_temp/.ssh
sudo chmod 700 /home/claude_temp/.ssh

# Agregar llave pública (proporcionada por Claude)
echo "ssh-rsa AAAAB3... claude@helper" | sudo tee /home/claude_temp/.ssh/authorized_keys
sudo chmod 600 /home/claude_temp/.ssh/authorized_keys
sudo chown -R claude_temp:claude_temp /home/claude_temp/.ssh

# Abrir firewall temporalmente
sudo ufw allow from IP_CLAUDE to any port PUERTO_SSH_CUSTOM
```

**1.3 Test de Conexión**
```bash
# Claude se conecta:
ssh -p PUERTO_CUSTOM claude_temp@IP_ONPREMISE

# Verificar acceso sudo:
sudo whoami  # debe retornar: root
```

**1.4 Test Conectividad On-Premise ↔ AWS**
```bash
# Desde on-premise:
ping -c 4 ec2-3-91-26-178.compute-1.amazonaws.com
nc -zv ec2-3-91-26-178.compute-1.amazonaws.com 5432

# Medir latencia:
ping -c 20 ec2-3-91-26-178.compute-1.amazonaws.com | tail -1
```

**Salida esperada:**
- ✅ SSH funcional
- ✅ Conectividad on-premise → AWS
- ⚠️ Puerto 5432 puede estar bloqueado (se abre en Fase 5)

---

### FASE 2: Detener Labsis y Crear Backup AWS (30 min)

**2.1 Usuario Detiene Labsis**
```bash
# Desde AnyDesk (usuario ejecuta):
sudo systemctl stop jboss
# o comando específico para detener Labsis

# Verificar que está detenido:
sudo systemctl status jboss
sudo netstat -tlnp | grep 8080  # no debe mostrar nada
```

**2.2 Claude Crea Backup en AWS**
```bash
# SSH a AWS:
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com

# Crear backup:
FECHA=$(date +%Y%m%d_%H%M%S)
sudo -u labsis pg_dump -Fc labsisEG > /tmp/labsisEG_backup_$FECHA.dump

# Verificar:
ls -lh /tmp/labsisEG_backup_*.dump
md5sum /tmp/labsisEG_backup_*.dump > /tmp/backup.md5
```

**2.3 Transferir Backup a S3 (Método Recomendado)**
```bash
# Desde AWS, subir a S3:
aws s3 cp /tmp/labsisEG_backup_$FECHA.dump \
  s3://laboratorio-eg-temp/migration/

aws s3 cp /tmp/backup.md5 \
  s3://laboratorio-eg-temp/migration/

# Verificar:
aws s3 ls s3://laboratorio-eg-temp/migration/
```

**Método Alternativo (SCP Directo):**
```bash
# Solo si hay buena conectividad directa:
scp -P PUERTO_SSH_CUSTOM \
  /tmp/labsisEG_backup_*.dump \
  claude_temp@IP_ONPREMISE:/tmp/
```

**Tiempo estimado transferencia:**
```
10 GB a diferentes velocidades:
- 100 Mbps: ~15 minutos
- 50 Mbps: ~30 minutos
- 10 Mbps: ~2.5 horas
```

---

### FASE 3: Restaurar Backup en On-Premise (30-45 min)

**3.1 Descargar Backup desde S3**
```bash
# Desde on-premise:
aws s3 cp s3://laboratorio-eg-temp/migration/labsisEG_backup_*.dump /tmp/
aws s3 cp s3://laboratorio-eg-temp/migration/backup.md5 /tmp/

# Verificar integridad:
md5sum -c /tmp/backup.md5
# Debe decir: OK
```

**3.2 Preparar Base de Datos**
```bash
# Si existe BD antigua, hacer backup primero:
sudo -u postgres pg_dump -Fc labsisEG > /tmp/labsisEG_OLD_$(date +%Y%m%d).dump 2>/dev/null

# Eliminar BD si existe:
sudo -u postgres dropdb --if-exists labsisEG

# Crear BD nueva:
sudo -u postgres createdb labsisEG -O labsis

# Verificar:
sudo -u postgres psql -l | grep labsisEG
```

**3.3 Restaurar Backup**
```bash
# Restaurar:
sudo -u postgres pg_restore -d labsisEG -v /tmp/labsisEG_backup_*.dump

# Tiempo estimado: 10-20 minutos para 10 GB

# Verificar restauración:
sudo -u postgres psql -d labsisEG -c "\dt" | wc -l
sudo -u postgres psql -d labsisEG -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
```

**3.4 Comparar Datos On-Premise vs AWS**
```bash
# Script de verificación:
# En ambos servidores, ejecutar:

# Contar tablas:
SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';

# Contar registros en tablas principales (ejemplo):
SELECT
  schemaname, tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC
LIMIT 20;

# Los números deben ser IDÉNTICOS
```

**Salida esperada:**
- ✅ Base de datos restaurada exitosamente
- ✅ Mismo número de tablas en ambos servidores
- ✅ Mismo número de registros en tablas principales
- ✅ MD5 del backup verificado

---

### FASE 4: Configurar On-Premise como MASTER (45 min)

**4.1 Backup de Configuraciones Actuales**
```bash
# Respaldar configs antes de modificar:
sudo cp /etc/postgresql/14/main/postgresql.conf \
  /etc/postgresql/14/main/postgresql.conf.backup_$(date +%Y%m%d)

sudo cp /etc/postgresql/14/main/pg_hba.conf \
  /etc/postgresql/14/main/pg_hba.conf.backup_$(date +%Y%m%d)
```

**4.2 Modificar postgresql.conf**
```bash
# Script que modifica postgresql.conf:
sudo tee -a /etc/postgresql/14/main/postgresql.conf <<'EOF'

#═══════════════════════════════════════════════════════════
# Replicación - Configurado $(date +%Y-%m-%d)
#═══════════════════════════════════════════════════════════
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 10GB

# WAL Archiving
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f'
archive_timeout = 300

# Performance
synchronous_commit = local
wal_buffers = 16MB
checkpoint_timeout = 15min
max_wal_size = 4GB

# Logging
log_replication_commands = on
EOF

# Crear directorio para WAL archive local:
sudo mkdir -p /var/lib/postgresql/wal_archive
sudo chown postgres:postgres /var/lib/postgresql/wal_archive
sudo chmod 700 /var/lib/postgresql/wal_archive
```

**Nota sobre archive_command:**
- Inicialmente usa archivo local (más simple)
- En Fase 8 se cambia a S3

**4.3 Modificar pg_hba.conf**
```bash
# Agregar regla para replicación desde AWS:
sudo tee -a /etc/postgresql/14/main/pg_hba.conf <<EOF

# Replicación desde AWS - Agregado $(date +%Y-%m-%d)
host    replication     replicator      172.31.45.41/32         scram-sha-256
host    labsisEG        replicator      172.31.45.41/32         scram-sha-256
EOF
```

**4.4 Crear Usuario de Replicación**
```bash
# Generar password seguro:
REPL_PASSWORD=$(openssl rand -base64 32)
echo "Password replicator: $REPL_PASSWORD" > ~/replication-password.txt
chmod 600 ~/replication-password.txt

# Crear usuario:
sudo -u postgres psql <<EOF
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '$REPL_PASSWORD';
GRANT CONNECT ON DATABASE labsisEG TO replicator;
EOF

# Verificar:
sudo -u postgres psql -c "\du replicator"
```

**4.5 Reiniciar PostgreSQL**
```bash
# Verificar configuración antes de reiniciar:
sudo -u postgres /usr/lib/postgresql/14/bin/postgres --config-file=/etc/postgresql/14/main/postgresql.conf -C wal_level

# Reiniciar:
sudo systemctl restart postgresql

# Verificar que levantó OK:
sudo systemctl status postgresql

# Verificar configuraciones aplicadas:
sudo -u postgres psql -c "SHOW wal_level;"          # Debe: replica
sudo -u postgres psql -c "SHOW max_wal_senders;"    # Debe: 10
sudo -u postgres psql -c "SHOW archive_mode;"       # Debe: on
```

**4.6 Crear Replication Slot**
```bash
# Crear slot para AWS:
sudo -u postgres psql -c "SELECT * FROM pg_create_physical_replication_slot('aws_replica_slot');"

# Verificar:
sudo -u postgres psql -c "SELECT slot_name, slot_type, active FROM pg_replication_slots;"
```

**Salida esperada:**
- ✅ PostgreSQL reiniciado exitosamente
- ✅ wal_level = replica
- ✅ Usuario replicator creado
- ✅ Replication slot creado
- ✅ archive_mode = on

---

### FASE 5: Configurar AWS como REPLICA (60 min)

**5.1 Abrir Security Group AWS**
```bash
# Obtener Security Group ID:
aws ec2 describe-instances \
  --instance-ids i-0ee70404207fa1718 \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text

# Agregar regla para PostgreSQL desde on-premise:
aws ec2 authorize-security-group-ingress \
  --group-id sg-XXXXX \
  --protocol tcp \
  --port 5432 \
  --cidr IP_ONPREMISE/32 \
  --description "Replicacion PostgreSQL desde on-premise Venezuela"

# Verificar:
aws ec2 describe-security-groups --group-ids sg-XXXXX
```

**5.2 Test de Conectividad desde AWS a On-Premise**
```bash
# Desde AWS:
ping -c 4 IP_ONPREMISE
nc -zv IP_ONPREMISE PUERTO_SSH_CUSTOM

# Test PostgreSQL:
PGPASSWORD='$REPL_PASSWORD' psql -h IP_ONPREMISE -p 5432 -U replicator -d labsisEG -c "SELECT version();"
```

**5.3 Detener PostgreSQL en AWS**
```bash
# SSH a AWS:
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com

# Detener PostgreSQL:
sudo systemctl stop postgresql

# Verificar:
sudo systemctl status postgresql
```

**5.4 Backup y Limpieza del Directorio de Datos**
```bash
# Respaldar datos actuales (por seguridad):
sudo mv /var/lib/postgresql/14/main \
  /var/lib/postgresql/14/main.BEFORE_REPLICATION_$(date +%Y%m%d)

# Crear directorio nuevo:
sudo mkdir -p /var/lib/postgresql/14/main
sudo chown postgres:postgres /var/lib/postgresql/14/main
sudo chmod 700 /var/lib/postgresql/14/main
```

**5.5 pg_basebackup - Copia Inicial**
```bash
# Este es el paso MÁS LARGO (30-60 min para 10 GB)

# Crear archivo .pgpass para evitar prompt de password:
cat > /tmp/.pgpass <<EOF
IP_ONPREMISE:5432:replication:replicator:$REPL_PASSWORD
EOF
chmod 600 /tmp/.pgpass

# Ejecutar pg_basebackup:
sudo -u postgres PGPASSFILE=/tmp/.pgpass pg_basebackup \
  -h IP_ONPREMISE \
  -p 5432 \
  -U replicator \
  -D /var/lib/postgresql/14/main \
  -P -v -X stream \
  --slot=aws_replica_slot

# Opciones:
# -P: Muestra progreso
# -v: Verbose
# -X stream: Transmite WAL en paralelo
# --slot: Usa el replication slot creado

# Monitor progreso en otra terminal:
watch -n 5 'du -sh /var/lib/postgresql/14/main'
```

**Tiempo estimado según velocidad:**
```
10 GB de datos:
- Internet 100 Mbps: ~15-20 minutos
- Internet 50 Mbps: ~30-40 minutos
- Internet 10 Mbps: ~2-3 horas
```

**5.6 Configurar Recovery/Replication**
```bash
# Crear postgresql.auto.conf (configuración de réplica):
sudo -u postgres tee /var/lib/postgresql/14/main/postgresql.auto.conf <<EOF
# Configuración de Réplica - $(date +%Y-%m-%d)
primary_conninfo = 'host=IP_ONPREMISE port=5432 user=replicator password=$REPL_PASSWORD application_name=aws_replica'
primary_slot_name = 'aws_replica_slot'
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
EOF

# Crear archivo standby.signal (indica modo réplica):
sudo -u postgres touch /var/lib/postgresql/14/main/standby.signal

# Verificar permisos:
sudo chown postgres:postgres /var/lib/postgresql/14/main/standby.signal
```

**5.7 Iniciar PostgreSQL en Modo Réplica**
```bash
# Iniciar:
sudo systemctl start postgresql

# Verificar estado:
sudo systemctl status postgresql

# Verificar que está en modo recovery:
sudo -u postgres psql -c "SELECT pg_is_in_recovery();"
# Debe retornar: t (true)

# Ver logs en tiempo real:
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**Salida esperada:**
- ✅ PostgreSQL iniciado en modo replica
- ✅ pg_is_in_recovery() = true
- ✅ Logs muestran: "started streaming WAL from primary"
- ✅ Sin errores de conexión

---

### FASE 6: Validación de Replicación (30 min)

**6.1 Verificar Estado en On-Premise (Master)**
```bash
# Ver réplicas conectadas:
sudo -u postgres psql -x -c "SELECT * FROM pg_stat_replication;"

# Salida esperada:
# pid              | 12345
# usename          | replicator
# application_name | aws_replica
# client_addr      | 172.31.45.41
# state            | streaming
# sent_lsn         | 0/3000000
# write_lsn        | 0/3000000
# flush_lsn        | 0/3000000
# replay_lsn       | 0/3000000
# sync_state       | async

# Verificar slot activo:
sudo -u postgres psql -c "SELECT slot_name, active, restart_lsn FROM pg_replication_slots;"
```

**6.2 Verificar Estado en AWS (Replica)**
```bash
# Ver estado de recepción WAL:
sudo -u postgres psql -x -c "SELECT * FROM pg_stat_wal_receiver;"

# Salida esperada:
# status          | streaming
# receive_lsn     | 0/3000000
# sender_host     | IP_ONPREMISE
# sender_port     | 5432
# conninfo        | ...

# Medir lag:
sudo -u postgres psql -c "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;"
# Debe ser: < 5 segundos (idealmente < 1)
```

**6.3 Test de Replicación con Datos Reales**
```bash
# En On-Premise (Master):
sudo -u postgres psql -d labsisEG <<'EOF'
-- Crear tabla de prueba
CREATE TABLE IF NOT EXISTS test_replicacion_$(date +%Y%m%d) (
    id SERIAL PRIMARY KEY,
    mensaje TEXT,
    timestamp_creacion TIMESTAMP DEFAULT NOW()
);

-- Insertar registros de prueba
INSERT INTO test_replicacion_$(date +%Y%m%d) (mensaje)
VALUES
  ('Test 1 - Replicación iniciada'),
  ('Test 2 - Timestamp: $(date)'),
  ('Test 3 - Usuario: $(whoami)');

-- Mostrar lo insertado
SELECT * FROM test_replicacion_$(date +%Y%m%d);
EOF

# Esperar 5 segundos:
sleep 5

# En AWS (Replica), verificar:
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com \
"sudo -u postgres psql -d labsisEG -c 'SELECT * FROM test_replicacion_$(date +%Y%m%d);'"

# Si aparecen los 3 registros: ✅ REPLICACIÓN FUNCIONA!
```

**6.4 Test de Escritura Bloqueada en Réplica**
```bash
# En AWS (Replica), intentar escribir:
sudo -u postgres psql -d labsisEG -c "INSERT INTO test_replicacion_$(date +%Y%m%d) (mensaje) VALUES ('Test desde replica');"

# Debe mostrar ERROR:
# ERROR: cannot execute INSERT in a read-only transaction
# ✅ Esto es CORRECTO - la réplica debe ser read-only
```

**6.5 Monitoreo de Lag en Tiempo Real**
```bash
# Script de monitoreo (ejecutar en otra terminal):
watch -n 5 "echo '=== Master (On-Premise) ===' && \
  sudo -u postgres psql -t -c 'SELECT state, sync_state, write_lag, flush_lag, replay_lag FROM pg_stat_replication;' && \
  echo '' && \
  echo '=== Replica (AWS) ===' && \
  ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com \
  \"sudo -u postgres psql -t -c 'SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;'\""
```

**Salida esperada:**
- ✅ pg_stat_replication muestra estado "streaming"
- ✅ pg_stat_wal_receiver muestra conexión activa
- ✅ Lag < 5 segundos
- ✅ Datos insertados en master aparecen en replica
- ✅ Escrituras bloqueadas en replica

---

### FASE 7: Encender Labsis y Pruebas en Producción (30 min)

**7.1 Usuario Inicia Labsis**
```bash
# Desde AnyDesk (usuario ejecuta):
sudo systemctl start jboss

# Verificar que levantó:
sudo systemctl status jboss

# Verificar puerto:
sudo netstat -tlnp | grep 8080

# Verificar logs:
sudo tail -f /path/to/jboss/logs/server.log
```

**7.2 Verificar Conectividad Labsis → PostgreSQL**
```bash
# Desde servidor Labsis, verificar conexión a on-premise:
nc -zv IP_ONPREMISE 5432

# Test de query desde aplicación (si hay herramienta CLI):
# psql -h IP_ONPREMISE -U labsis -d labsisEG -c "SELECT version();"
```

**7.3 Pruebas de Operaciones Reales**
```
Usuario realiza operaciones normales en Labsis:
1. Login a la aplicación web
2. Crear/editar un registro (paciente, pedido, etc.)
3. Generar un reporte
4. Cualquier operación CRUD normal
```

**7.4 Claude Monitorea Replicación**
```bash
# Monitor continuo de replicación:
# Terminal 1 - Ver transacciones en master:
sudo -u postgres psql -d labsisEG -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';"

# Terminal 2 - Ver lag en tiempo real:
while true; do
  clear
  echo "=== $(date) ==="
  echo ""
  echo "MASTER (On-Premise):"
  sudo -u postgres psql -t -c "SELECT application_name, state, write_lag, flush_lag, replay_lag FROM pg_stat_replication;"
  echo ""
  echo "REPLICA (AWS) - Lag:"
  ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com \
    "sudo -u postgres psql -t -c \"SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;\""
  echo ""
  sleep 5
done

# Terminal 3 - Ver últimas transacciones replicadas:
sudo -u postgres tail -f /var/log/postgresql/postgresql-14-main.log | grep "replication"
```

**7.5 Validación de Datos Específicos**
```bash
# Después de que usuario cree datos en Labsis:

# En Master (on-premise), obtener timestamp y conteo:
MASTER_COUNT=$(sudo -u postgres psql -t -d labsisEG -c "SELECT COUNT(*) FROM tabla_que_modificaste;")
MASTER_TIME=$(date +%s)

echo "Master - Count: $MASTER_COUNT at $(date)"

# Esperar 10 segundos:
sleep 10

# En Replica (AWS), verificar mismo conteo:
REPLICA_COUNT=$(ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com \
  "sudo -u postgres psql -t -d labsisEG -c 'SELECT COUNT(*) FROM tabla_que_modificaste;'")
REPLICA_TIME=$(date +%s)

echo "Replica - Count: $REPLICA_COUNT at $(date)"
echo "Lag: $((REPLICA_TIME - MASTER_TIME)) seconds"

# Comparar:
if [ "$MASTER_COUNT" == "$REPLICA_COUNT" ]; then
  echo "✅ Replicación funcionando correctamente"
else
  echo "⚠️ Diferencia detectada: Master=$MASTER_COUNT, Replica=$REPLICA_COUNT"
fi
```

**Salida esperada:**
- ✅ Labsis inició correctamente
- ✅ Conectividad Labsis → PostgreSQL on-premise
- ✅ Operaciones CRUD funcionan normalmente
- ✅ Datos creados en Labsis aparecen en AWS en < 10 segundos
- ✅ Lag promedio < 5 segundos

---

### FASE 8: Configurar Backup Diario a S3 (30 min)

**8.1 Crear Buckets S3**
```bash
# Bucket para backups diarios:
aws s3 mb s3://laboratorio-eg-backups

# Bucket para WAL archiving:
aws s3 mb s3://laboratorio-eg-wal

# Habilitar versionado (protección contra borrado accidental):
aws s3api put-bucket-versioning \
  --bucket laboratorio-eg-backups \
  --versioning-configuration Status=Enabled

# Lifecycle policy (borrar backups > 30 días):
cat > /tmp/lifecycle-policy.json <<'EOF'
{
  "Rules": [{
    "Id": "DeleteOldBackups",
    "Status": "Enabled",
    "Prefix": "daily/",
    "Expiration": {
      "Days": 30
    }
  }]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket laboratorio-eg-backups \
  --lifecycle-configuration file:///tmp/lifecycle-policy.json
```

**8.2 Instalar AWS CLI en On-Premise (si no está)**
```bash
# Verificar si está instalado:
aws --version

# Si no está, instalar:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
sudo apt install unzip -y
unzip /tmp/awscliv2.zip -d /tmp/
sudo /tmp/aws/install

# Configurar credenciales:
sudo mkdir -p /root/.aws
sudo tee /root/.aws/credentials <<'EOF'
[default]
aws_access_key_id = AKIAXXXXX
aws_secret_access_key = XXXXXXX
region = us-east-1
EOF
sudo chmod 600 /root/.aws/credentials
```

**8.3 Script de Backup Diario**
```bash
# Crear script:
sudo tee /usr/local/bin/backup-labsis-diario.sh <<'SCRIPT'
#!/bin/bash
#═══════════════════════════════════════════════════════════
# Script: Backup Diario PostgreSQL Labsis
# Descripción: Backup completo diario a S3 con retención 30 días
# Autor: Claude + Usuario
# Fecha: $(date +%Y-%m-%d)
#═══════════════════════════════════════════════════════════

set -euo pipefail

# Configuración
DB_NAME="labsisEG"
DB_USER="labsis"
BACKUP_DIR="/var/backups/postgresql"
S3_BUCKET="s3://laboratorio-eg-backups/daily"
LOG_FILE="/var/log/backup-labsis.log"
RETENTION_DAYS=7  # Retención local

# Función de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Inicio
log "=== Inicio Backup Diario Labsis ==="

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Nombre del archivo
FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/labsisEG_backup_$FECHA.dump"

# Crear backup
log "Creando backup: $BACKUP_FILE"
if sudo -u postgres pg_dump -Fc "$DB_NAME" > "$BACKUP_FILE"; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  log "✅ Backup creado exitosamente: $BACKUP_SIZE"
else
  log "❌ ERROR: Falló creación de backup"
  exit 1
fi

# Calcular MD5
log "Calculando checksum..."
md5sum "$BACKUP_FILE" > "$BACKUP_FILE.md5"

# Subir a S3
log "Subiendo a S3: $S3_BUCKET"
if aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/" && \
   aws s3 cp "$BACKUP_FILE.md5" "$S3_BUCKET/"; then
  log "✅ Backup subido a S3 exitosamente"
else
  log "❌ ERROR: Falló subida a S3"
  exit 1
fi

# Limpiar backups locales antiguos
log "Limpiando backups locales > $RETENTION_DAYS días..."
DELETED=$(find "$BACKUP_DIR" -name "labsisEG_backup_*.dump" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "Eliminados: $DELETED archivos antiguos"

# Verificar espacio en disco
DISK_USAGE=$(df -h /var/lib/postgresql | tail -1 | awk '{print $5}' | sed 's/%//')
log "Uso de disco PostgreSQL: $DISK_USAGE%"

if [ "$DISK_USAGE" -gt 80 ]; then
  log "⚠️ ADVERTENCIA: Disco > 80% utilizado"
fi

# Fin
log "=== Backup Completado Exitosamente ==="
log ""

exit 0
SCRIPT

# Dar permisos de ejecución:
sudo chmod +x /usr/local/bin/backup-labsis-diario.sh

# Test manual:
sudo /usr/local/bin/backup-labsis-diario.sh
```

**8.4 Programar Cron**
```bash
# Editar crontab root:
sudo crontab -e

# Agregar línea (ejecutar a las 2 AM todos los días):
0 2 * * * /usr/local/bin/backup-labsis-diario.sh >> /var/log/backup-labsis.log 2>&1

# Verificar cron:
sudo crontab -l | grep backup

# Ver log la próxima vez:
sudo tail -f /var/log/backup-labsis.log
```

**8.5 Configurar WAL Archiving a S3**
```bash
# Modificar postgresql.conf para usar S3:
sudo sed -i "s|archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f.*|archive_command = 'test ! -f s3://laboratorio-eg-wal/%f \&\& aws s3 cp %p s3://laboratorio-eg-wal/%f'|" \
  /etc/postgresql/14/main/postgresql.conf

# Recargar configuración (sin reiniciar):
sudo -u postgres psql -c "SELECT pg_reload_conf();"

# Verificar:
sudo -u postgres psql -c "SHOW archive_command;"

# Test manual:
sudo -u postgres psql -c "SELECT pg_switch_wal();"
sleep 5
aws s3 ls s3://laboratorio-eg-wal/
# Debería mostrar archivos WAL
```

**8.6 Test de Restore desde Backup**
```bash
# NO ejecutar en producción, solo documentar el procedimiento:

cat > ~/PROCEDIMIENTO-RESTORE.md <<'EOF'
# Procedimiento de Restore desde Backup S3

## 1. Descargar último backup
```bash
LATEST_BACKUP=$(aws s3 ls s3://laboratorio-eg-backups/daily/ | sort | tail -1 | awk '{print $4}')
aws s3 cp s3://laboratorio-eg-backups/daily/$LATEST_BACKUP /tmp/
aws s3 cp s3://laboratorio-eg-backups/daily/$LATEST_BACKUP.md5 /tmp/
```

## 2. Verificar integridad
```bash
cd /tmp
md5sum -c $LATEST_BACKUP.md5
```

## 3. Restaurar
```bash
sudo -u postgres dropdb labsisEG
sudo -u postgres createdb labsisEG -O labsis
sudo -u postgres pg_restore -d labsisEG /tmp/$LATEST_BACKUP
```

## 4. Verificar
```bash
sudo -u postgres psql -d labsisEG -c "\dt"
```
EOF
```

**Salida esperada:**
- ✅ Buckets S3 creados
- ✅ Script de backup funcionando
- ✅ Cron programado
- ✅ WAL archiving a S3 activo
- ✅ Test de backup exitoso

---

### FASE 9: Monitoreo y Documentación (30 min)

**9.1 Script de Monitoreo Continuo**
```bash
# Crear script de monitoreo:
sudo tee /usr/local/bin/monitor-replication.sh <<'SCRIPT'
#!/bin/bash
#═══════════════════════════════════════════════════════════
# Monitor de Replicación PostgreSQL
#═══════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       Estado Replicación PostgreSQL Labsis               ║"
echo "║       $(date '+%Y-%m-%d %H:%M:%S')                              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Estado de réplicas
echo "📊 RÉPLICAS CONECTADAS:"
sudo -u postgres psql -x -c "
  SELECT
    application_name,
    client_addr,
    state,
    sync_state,
    write_lag,
    flush_lag,
    replay_lag
  FROM pg_stat_replication;
" || echo "⚠️ No hay réplicas conectadas"

echo ""
echo "📈 REPLICATION SLOTS:"
sudo -u postgres psql -c "
  SELECT
    slot_name,
    active,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS lag_size
  FROM pg_replication_slots;
"

echo ""
echo "💾 WAL ARCHIVING:"
sudo -u postgres psql -c "
  SELECT
    archived_count,
    failed_count,
    last_archived_wal,
    last_archived_time
  FROM pg_stat_archiver;
"

echo ""
echo "🔌 CONEXIONES ACTIVAS:"
sudo -u postgres psql -c "
  SELECT
    datname,
    count(*) as connections
  FROM pg_stat_activity
  WHERE datname = 'labsisEG'
  GROUP BY datname;
"

echo ""
echo "💿 ESPACIO EN DISCO:"
df -h /var/lib/postgresql | tail -1 | awk '{print "PostgreSQL: " $3 " / " $2 " (" $5 " usado)"}'

echo ""
echo "📁 WAL LOCAL:"
du -sh /var/lib/postgresql/14/main/pg_wal | awk '{print "Tamaño: " $1}'
ls /var/lib/postgresql/14/main/pg_wal | wc -l | awk '{print "Archivos: " $1}'

echo ""
SCRIPT

sudo chmod +x /usr/local/bin/monitor-replication.sh

# Ejecutar:
sudo /usr/local/bin/monitor-replication.sh
```

**9.2 Alertas Básicas (Email en caso de problemas)**
```bash
# Crear script de alertas:
sudo tee /usr/local/bin/check-replication-health.sh <<'SCRIPT'
#!/bin/bash
#═══════════════════════════════════════════════════════════
# Health Check Replicación
#═══════════════════════════════════════════════════════════

EMAIL="admin@laboratorio.com"  # CAMBIAR POR EMAIL REAL
ALERT=0

# Check 1: Réplica conectada
REPLICAS=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_replication;")
if [ "$REPLICAS" -lt 1 ]; then
  echo "❌ ALERTA: No hay réplicas conectadas" | mail -s "ALERTA PostgreSQL: Sin réplicas" "$EMAIL"
  ALERT=1
fi

# Check 2: Espacio en disco
DISK_USAGE=$(df /var/lib/postgresql | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
  echo "❌ ALERTA: Disco PostgreSQL al $DISK_USAGE%" | mail -s "ALERTA PostgreSQL: Disco lleno" "$EMAIL"
  ALERT=1
fi

# Check 3: WAL archiving failures
FAILED_ARCHIVES=$(sudo -u postgres psql -t -c "SELECT failed_count FROM pg_stat_archiver;")
if [ "$FAILED_ARCHIVES" -gt 0 ]; then
  echo "⚠️ ADVERTENCIA: $FAILED_ARCHIVES fallos en WAL archiving" | mail -s "ADVERTENCIA PostgreSQL: WAL archiving" "$EMAIL"
fi

if [ "$ALERT" -eq 0 ]; then
  echo "✅ Replicación saludable - $(date)" >> /var/log/replication-health.log
fi

exit $ALERT
SCRIPT

sudo chmod +x /usr/local/bin/check-replication-health.sh

# Programar cada hora:
sudo crontab -e
# Agregar:
0 * * * * /usr/local/bin/check-replication-health.sh
```

**9.3 Documentación Final**
```bash
# Crear documento de configuración:
cat > ~/CONFIGURACION-REPLICACION-LABSIS.md <<EOF
# Configuración Final - Replicación PostgreSQL Labsis
**Fecha implementación:** $(date '+%Y-%m-%d')

## MASTER (On-Premise - Venezuela)
- **IP Pública:** $(curl -s ifconfig.me)
- **IP Privada:** $(hostname -I | awk '{print $1}')
- **Puerto PostgreSQL:** 5432
- **Puerto SSH:** PUERTO_CUSTOM
- **Base de datos:** labsisEG
- **Usuario replicación:** replicator
- **Replication slot:** aws_replica_slot

### Configuración PostgreSQL:
\`\`\`ini
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 10GB
archive_mode = on
archive_command = 'aws s3 cp %p s3://laboratorio-eg-wal/%f'
\`\`\`

## REPLICA (AWS - us-east-1a)
- **Host:** ec2-3-91-26-178.compute-1.amazonaws.com
- **IP Privada:** 172.31.45.41
- **Instancia:** i-0ee70404207fa1718 (c6g.12xlarge)
- **Base de datos:** labsisEG
- **Modo:** Read-only replica

### Estado:
\`\`\`bash
# Ver estado:
sudo -u postgres psql -c "SELECT * FROM pg_stat_wal_receiver;"
\`\`\`

## BACKUPS
- **Bucket S3:** s3://laboratorio-eg-backups/daily/
- **Frecuencia:** Diario a las 2:00 AM
- **Retención S3:** 30 días
- **Retención local:** 7 días
- **Script:** /usr/local/bin/backup-labsis-diario.sh

## WAL ARCHIVING
- **Bucket S3:** s3://laboratorio-eg-wal/
- **Archive timeout:** 300 segundos (5 minutos)

## MONITOREO
- **Script monitoreo:** /usr/local/bin/monitor-replication.sh
- **Health check:** /usr/local/bin/check-replication-health.sh (cada hora)

## COMANDOS ÚTILES

### Ver estado de replicación:
\`\`\`bash
sudo -u postgres psql -c "SELECT * FROM pg_stat_replication;"
\`\`\`

### Ver lag:
\`\`\`bash
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com \\
  "sudo -u postgres psql -t -c 'SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;'"
\`\`\`

### Backup manual:
\`\`\`bash
sudo /usr/local/bin/backup-labsis-diario.sh
\`\`\`

### Listar backups en S3:
\`\`\`bash
aws s3 ls s3://laboratorio-eg-backups/daily/
\`\`\`

## PROCEDIMIENTOS DE EMERGENCIA

### Failover Manual (si on-premise cae):
\`\`\`bash
# 1. SSH a AWS
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com

# 2. Promover a master
sudo -u postgres /usr/lib/postgresql/14/bin/pg_ctl promote -D /var/lib/postgresql/14/main

# 3. Verificar
sudo -u postgres psql -c "SELECT pg_is_in_recovery();"
# Debe retornar: f (false)

# 4. Actualizar conexión de Labsis a AWS
\`\`\`

### Restore desde Backup:
\`\`\`bash
# Ver ~/PROCEDIMIENTO-RESTORE.md
\`\`\`

## CONTACTOS
- **Implementado por:** Claude + Usuario
- **Fecha:** $(date '+%Y-%m-%d')
- **Documentación completa:** ~/laboratorio-eg-replication/
EOF

cat ~/CONFIGURACION-REPLICACION-LABSIS.md
```

**9.4 Crear Checklist Post-Implementación**
```bash
cat > ~/CHECKLIST-POST-IMPLEMENTACION.md <<'EOF'
# Checklist Post-Implementación

## Validaciones Inmediatas
- [ ] Replicación activa (pg_stat_replication muestra 1 réplica)
- [ ] Lag < 10 segundos
- [ ] Labsis funcionando normalmente
- [ ] Backup diario programado (cron)
- [ ] WAL archiving a S3 funcionando
- [ ] Scripts de monitoreo ejecutándose

## Validaciones Diarias (Próxima semana)
- [ ] Día 1: Verificar backup nocturno exitoso
- [ ] Día 2: Verificar lag promedio
- [ ] Día 3: Test de datos reales replicados
- [ ] Día 4: Verificar espacio en disco
- [ ] Día 5: Revisar logs de errores
- [ ] Día 6: Verificar WAL archiving
- [ ] Día 7: Test de restore desde backup

## Validaciones Semanales
- [ ] Semana 1: Verificar performance de replicación
- [ ] Semana 2: Test de failover en ambiente de prueba
- [ ] Semana 3: Revisar costos S3
- [ ] Semana 4: Auditoría completa de configuración

## Métricas a Monitorear
- Lag promedio: < 5 segundos
- Backups exitosos: 100%
- Espacio disco: < 80%
- WAL archiving success rate: > 99%
EOF
```

**Salida esperada:**
- ✅ Scripts de monitoreo creados
- ✅ Alertas configuradas
- ✅ Documentación completa generada
- ✅ Checklist post-implementación lista

---

### FASE 10: Limpieza y Cierre (15 min)

**10.1 Cerrar Acceso SSH Temporal**
```bash
# Eliminar usuario temporal:
sudo userdel -r claude_temp

# Cerrar puerto en firewall:
sudo ufw delete allow from IP_CLAUDE to any port PUERTO_SSH_CUSTOM

# Verificar:
sudo ufw status numbered
```

**10.2 Limpiar Archivos Temporales**
```bash
# En On-Premise:
sudo rm -f /tmp/labsisEG_backup_*.dump
sudo rm -f /tmp/.pgpass
sudo rm -f /tmp/labsisEG_OLD_*.dump

# En AWS:
ssh -i labsisapp.pem dynamtek@ec2-3-91-26-178.compute-1.amazonaws.com \
  "sudo rm -f /tmp/labsisEG_backup_*.dump && \
   sudo rm -f /tmp/backup.md5"

# En S3 (borrar bucket temporal):
aws s3 rb s3://laboratorio-eg-temp --force
```

**10.3 Guardar Credenciales de Forma Segura**
```bash
# Crear archivo encriptado con credenciales:
cat > /tmp/credenciales-replicacion.txt <<EOF
Usuario replicator password: $REPL_PASSWORD
Fecha creación: $(date)
EOF

# Encriptar:
gpg -c /tmp/credenciales-replicacion.txt
# Pedirá passphrase - usar una segura y guardar

# Mover a ubicación segura:
sudo mv /tmp/credenciales-replicacion.txt.gpg /root/

# Borrar archivo sin encriptar:
sudo shred -u /tmp/credenciales-replicacion.txt
sudo rm -f ~/replication-password.txt

# Desencriptar cuando se necesite:
# gpg -d /root/credenciales-replicacion.txt.gpg
```

**10.4 Verificación Final Completa**
```bash
# Ejecutar script de verificación final:
cat > /tmp/verificacion-final.sh <<'SCRIPT'
#!/bin/bash
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           VERIFICACIÓN FINAL REPLICACIÓN                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# 1. PostgreSQL corriendo
if systemctl is-active --quiet postgresql; then
  echo "✅ PostgreSQL: RUNNING"
else
  echo "❌ PostgreSQL: STOPPED"
  ((ERRORS++))
fi

# 2. Réplica conectada
REPLICAS=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_replication;")
if [ "$REPLICAS" -ge 1 ]; then
  echo "✅ Réplicas conectadas: $REPLICAS"
else
  echo "❌ Sin réplicas conectadas"
  ((ERRORS++))
fi

# 3. Replication slot activo
SLOT_ACTIVE=$(sudo -u postgres psql -t -c "SELECT active FROM pg_replication_slots WHERE slot_name='aws_replica_slot';")
if [ "$SLOT_ACTIVE" == " t" ]; then
  echo "✅ Replication slot: ACTIVE"
else
  echo "❌ Replication slot: INACTIVE"
  ((ERRORS++))
fi

# 4. WAL archiving
ARCHIVE_MODE=$(sudo -u postgres psql -t -c "SHOW archive_mode;")
if [ "$ARCHIVE_MODE" == " on" ]; then
  echo "✅ WAL archiving: ENABLED"
else
  echo "❌ WAL archiving: DISABLED"
  ((ERRORS++))
fi

# 5. Backup script
if [ -x /usr/local/bin/backup-labsis-diario.sh ]; then
  echo "✅ Backup script: INSTALLED"
else
  echo "❌ Backup script: MISSING"
  ((ERRORS++))
fi

# 6. Cron backup
if sudo crontab -l | grep -q backup-labsis-diario; then
  echo "✅ Cron backup: CONFIGURED"
else
  echo "❌ Cron backup: NOT CONFIGURED"
  ((ERRORS++))
fi

# 7. S3 buckets
if aws s3 ls s3://laboratorio-eg-backups &>/dev/null; then
  echo "✅ S3 bucket backups: EXISTS"
else
  echo "❌ S3 bucket backups: MISSING"
  ((ERRORS++))
fi

# 8. Labsis corriendo
if sudo systemctl is-active --quiet jboss; then
  echo "✅ Labsis: RUNNING"
else
  echo "⚠️  Labsis: STOPPED (verificar manualmente)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
  echo "✅ TODOS LOS CHECKS PASARON - Replicación configurada correctamente"
  echo "════════════════════════════════════════════════════════════"
  exit 0
else
  echo "❌ $ERRORS ERRORES DETECTADOS - Revisar configuración"
  echo "════════════════════════════════════════════════════════════"
  exit 1
fi
SCRIPT

bash /tmp/verificacion-final.sh
```

**10.5 Generar Reporte Final**
```bash
# Crear reporte de implementación:
cat > ~/REPORTE-IMPLEMENTACION-$(date +%Y%m%d).md <<EOF
# Reporte de Implementación - Replicación PostgreSQL Labsis

**Fecha:** $(date '+%Y-%m-%d %H:%M:%S')
**Implementado por:** Claude + Usuario
**Duración total:** [COMPLETAR] horas

## Resumen Ejecutivo
✅ Replicación PostgreSQL configurada exitosamente entre:
- Master: On-Premise (Venezuela)
- Replica: AWS us-east-1a

## Componentes Implementados

### 1. Replicación Streaming
- Tipo: Asíncrona
- Lag promedio: [MEDIR] segundos
- Estado: Activa

### 2. Backup Diario
- Destino: S3 (s3://laboratorio-eg-backups)
- Frecuencia: 2:00 AM diario
- Retención: 30 días S3, 7 días local

### 3. WAL Archiving
- Destino: S3 (s3://laboratorio-eg-wal)
- Archive timeout: 300 segundos

### 4. Monitoreo
- Script: /usr/local/bin/monitor-replication.sh
- Health checks: Cada hora
- Alertas: Email configurado

## Validaciones Realizadas
- [x] Replicación funcionando
- [x] Lag < 10 segundos
- [x] Backup manual exitoso
- [x] Labsis operativo
- [x] Datos replicándose en tiempo real

## Métricas Iniciales
- Tamaño base de datos: $(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('labsisEG'));")
- Espacio disco on-premise: $(df -h /var/lib/postgresql | tail -1 | awk '{print $5}')
- Réplicas conectadas: $(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_replication;")

## Próximos Pasos
1. Monitoreo diario durante 1 semana
2. Validar backups nocturnos
3. Revisar performance y lag
4. Programar test de failover en ambiente de prueba

## Archivos Importantes
- Configuración: ~/CONFIGURACION-REPLICACION-LABSIS.md
- Procedimientos: ~/PROCEDIMIENTO-RESTORE.md
- Checklist: ~/CHECKLIST-POST-IMPLEMENTACION.md
- Scripts: /usr/local/bin/

## Contacto Soporte
- Documentación: ~/laboratorio-eg-replication/
- Logs: /var/log/postgresql/
- Backup logs: /var/log/backup-labsis.log

---
**Fin del Reporte**
EOF

cat ~/REPORTE-IMPLEMENTACION-$(date +%Y%m%d).md
```

**10.6 Comunicación Final con Usuario**
```bash
echo "
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     ✅ IMPLEMENTACIÓN COMPLETADA EXITOSAMENTE                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

📊 RESUMEN:
   ✅ Replicación streaming activa
   ✅ Backup diario configurado
   ✅ WAL archiving a S3
   ✅ Monitoreo instalado
   ✅ Labsis operativo

📁 DOCUMENTACIÓN:
   ~/CONFIGURACION-REPLICACION-LABSIS.md
   ~/CHECKLIST-POST-IMPLEMENTACION.md
   ~/REPORTE-IMPLEMENTACION-$(date +%Y%m%d).md

🔧 SCRIPTS INSTALADOS:
   /usr/local/bin/backup-labsis-diario.sh
   /usr/local/bin/monitor-replication.sh
   /usr/local/bin/check-replication-health.sh

📈 PRÓXIMOS 7 DÍAS:
   - Monitorear lag diariamente
   - Verificar backups nocturnos
   - Revisar logs de replicación
   - Seguir checklist post-implementación

🆘 SOPORTE:
   - Ver documentación en ~/
   - Ejecutar: sudo /usr/local/bin/monitor-replication.sh
   - Logs: /var/log/postgresql/

═══════════════════════════════════════════════════════════════════

¿Deseas hacer algún test adicional antes de cerrar la sesión?
"
```

**Salida esperada:**
- ✅ Acceso SSH temporal cerrado
- ✅ Archivos temporales eliminados
- ✅ Credenciales guardadas de forma segura
- ✅ Verificación final exitosa
- ✅ Reporte de implementación generado
- ✅ Usuario informado del éxito

---

## INFORMACIÓN PENDIENTE DE CONFIRMAR MAÑANA

### Datos del Servidor On-Premise (ejecutar script de recolección):

```bash
#!/bin/bash
# info-onpremise-recoleccion.sh
# Ejecutar vía AnyDesk mañana

echo "═══════════════════════════════════════════════════════════"
echo "RECOLECCIÓN DE INFORMACIÓN - SERVIDOR ON-PREMISE"
echo "Fecha: $(date)"
echo "═══════════════════════════════════════════════════════════"

echo -e "\n1. BASES DE DATOS:"
sudo -u postgres psql -l

echo -e "\n2. PUERTO SSH PERSONALIZADO:"
sudo netstat -tlnp | grep sshd | grep -v "127.0.0.1"
sudo ss -tlnp | grep sshd | grep -v "127.0.0.1"

echo -e "\n3. IP PÚBLICA:"
curl -s ifconfig.me
echo ""

echo -e "\n4. VELOCIDAD INTERNET (test 10 segundos):"
curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python3 - --simple

echo -e "\n5. CONFIGURACIÓN POSTGRESQL ACTUAL:"
sudo -u postgres psql -c "SHOW wal_level;"
sudo -u postgres psql -c "SHOW max_wal_senders;"
sudo -u postgres psql -c "SHOW max_replication_slots;"
sudo -u postgres psql -c "SHOW archive_mode;"
sudo -u postgres psql -c "SHOW data_directory;"

echo -e "\n6. ESPACIO EN DISCO:"
df -h /var/lib/postgresql/
df -h /

echo -e "\n7. VERSIÓN POSTGRESQL:"
psql -V

echo -e "\n8. ESTADO ACTUAL BASE DE DATOS:"
sudo -u postgres psql -d labsisEG -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" 2>/dev/null || echo "Base de datos no existe o nombre diferente"

echo -e "\n9. FIREWALL ACTIVO:"
sudo ufw status
sudo iptables -L -n | head -20

echo -e "\n10. MEMORIA Y CPU:"
free -h
nproc

echo -e "\n═══════════════════════════════════════════════════════════"
echo "RECOLECCIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════"
```

### Información Crítica Necesaria:

1. **Nombre exacto de la base de datos:** ¿Es `labsisEG` o diferente?
2. **Puerto SSH personalizado:** ¿Cuál número?
3. **IP pública on-premise:** Para configurar Security Group AWS
4. **Velocidad internet on-premise:** Para estimar tiempos de transferencia
5. **Estado actual BD on-premise:** ¿Vacía, con datos viejos, o qué?
6. **wal_level actual:** ¿Ya está en `replica` o hay que cambiarlo?
7. **Espacio disponible:** Confirmar que hay suficiente

---

## RIESGOS Y MITIGACIONES

### Riesgos Identificados:

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Pérdida de conectividad durante pg_basebackup** | Media | Alto | Usar S3 como intermediario |
| **Labsis no conecta a on-premise después** | Baja | Crítico | Probar conectividad antes de encender |
| **Lag muy alto (> 30s)** | Media | Medio | Monitorear y ajustar wal_keep_size |
| **Espacio en disco insuficiente** | Baja | Alto | Verificado: 364 GB libres ✅ |
| **Firewall bloquea replicación** | Media | Alto | Abrir puertos antes de pg_basebackup |
| **Password de replicator débil** | Baja | Alto | Usar openssl rand -base64 32 ✅ |
| **Backup nocturno falla** | Media | Medio | Alertas por email + logs |
| **AWS Security Group mal configurado** | Baja | Alto | Verificar IPs antes de continuar |

---

## PLAN DE ROLLBACK (Si algo sale mal)

### Escenario 1: Falla en Fase 1-3 (Antes de modificar on-premise)
```bash
# Acción: Cancelar implementación
# Impacto: Ninguno
# Pasos:
1. Cerrar SSH temporal
2. Borrar backups temporales
3. Labsis sigue funcionando normalmente
```

### Escenario 2: Falla en Fase 4 (Después de modificar postgresql.conf)
```bash
# Acción: Restaurar configuración original
sudo cp /etc/postgresql/14/main/postgresql.conf.backup_$(date +%Y%m%d) \
  /etc/postgresql/14/main/postgresql.conf
sudo cp /etc/postgresql/14/main/pg_hba.conf.backup_$(date +%Y%m%d) \
  /etc/postgresql/14/main/pg_hba.conf
sudo systemctl restart postgresql

# Verificar:
sudo systemctl status postgresql

# Labsis debería funcionar normalmente
```

### Escenario 3: Falla en Fase 5-6 (pg_basebackup)
```bash
# Acción: No afecta on-premise, solo reintentar
# On-premise sigue funcionando normalmente
# AWS: Limpiar y reintentar pg_basebackup

# En AWS:
sudo systemctl stop postgresql
sudo rm -rf /var/lib/postgresql/14/main/*
# Repetir Fase 5 desde 5.4
```

### Escenario 4: Labsis no funciona después de todo
```bash
# CRÍTICO - Procedimiento de emergencia:

# 1. Verificar conectividad Labsis → PostgreSQL
nc -zv IP_ONPREMISE 5432

# 2. Verificar PostgreSQL está corriendo
sudo systemctl status postgresql

# 3. Verificar logs Labsis
sudo tail -100 /path/to/jboss/logs/server.log | grep -i error

# 4. Si es problema de conexión:
#    Verificar configuración de conexión en Labsis apunta a IP correcta

# 5. ÚLTIMA OPCIÓN: Restaurar BD desde backup AWS:
#    (Ver Fase 3.2-3.3 pero en reversa)
```

---

## ESTIMACIÓN DE TIEMPOS

### Por Velocidad de Internet On-Premise:

**Con 100 Mbps (escenario ideal):**
```
Fase 1: 30 min
Fase 2: 20 min (10 GB transfer)
Fase 3: 30 min
Fase 4: 45 min
Fase 5: 60 min (pg_basebackup 15 min)
Fase 6: 30 min
Fase 7: 30 min
Fase 8: 30 min
Fase 9: 30 min
Fase 10: 15 min
TOTAL: ~5 horas
```

**Con 50 Mbps (escenario probable):**
```
Fase 2: 40 min (transfer más lento)
Fase 5: 75 min (pg_basebackup 30 min)
TOTAL: ~5.5 horas
```

**Con 10 Mbps (escenario peor caso):**
```
Fase 2: 2.5 horas
Fase 5: 3 horas
TOTAL: ~8-9 horas ⚠️
```

**Recomendación:** Si velocidad < 20 Mbps, considerar hacer pg_basebackup de noche y continuar al día siguiente.

---

## COSTOS AWS ESTIMADOS

### Nuevos Recursos Creados:

```yaml
S3 Buckets:
  laboratorio-eg-backups:
    Almacenamiento: ~300 GB (30 días × 10 GB)
    Costo: $6.90/mes

  laboratorio-eg-wal:
    Almacenamiento: ~100 GB
    Costo: $2.30/mes

Data Transfer:
  Replicación on-premise → AWS:
    Estimado: 50 GB/día (cambios + WAL)
    Costo: $0 (ingress es gratis)

  Backups a S3:
    10 GB/día
    Costo: $0.90/mes

TOTAL MENSUAL NUEVO: ~$10/mes
TOTAL ANUAL: ~$120/año
```

**Nota:** Costos adicionales mínimos comparados con beneficio de DR.

---

## MÉTRICAS DE ÉXITO

### KPIs Post-Implementación:

```yaml
Semana 1:
  - Lag promedio: < 5 segundos
  - Uptime replicación: > 99%
  - Backups exitosos: 7/7 días
  - WAL archiving success: > 99%

Mes 1:
  - Lag promedio: < 3 segundos
  - Uptime replicación: > 99.5%
  - Zero data loss events
  - Espacio disco: < 75%

Mes 3:
  - Test de failover exitoso
  - DR drill completado
  - Documentación actualizada
  - Equipo capacitado
```

---

## PREGUNTAS PARA CLAUDE OPUS

Al pasar este documento a Claude Opus para planificación detallada, pedir:

1. **Scripts Completos:** Generar todos los scripts mencionados con validaciones exhaustivas
2. **Handling de Errores:** Mejorar manejo de errores en cada fase
3. **Logging Detallado:** Agregar logging comprehensivo
4. **Tests Automatizados:** Scripts de testing para cada componente
5. **Rollback Automático:** Mejorar procedimientos de rollback
6. **Monitoreo Avanzado:** CloudWatch integration, dashboards, etc.
7. **Alertas Granulares:** Sistema de alertas más sofisticado
8. **Documentación Extendida:** Runbooks, troubleshooting guides, FAQs
9. **Optimizaciones:** Performance tuning específico para este caso
10. **Security Hardening:** Mejoras adicionales de seguridad

---

## NOTAS FINALES

### Datos Confirmados:
- ✅ AWS PostgreSQL 14.11 configurado para replicación
- ✅ Mismo OS en ambos servidores (Ubuntu 20.04.6)
- ✅ Espacio suficiente en ambos servidores
- ✅ Acceso root/sudo en ambos
- ✅ Labsis puede detenerse completamente

### Datos Pendientes (obtener mañana):
- ⏳ Puerto SSH on-premise
- ⏳ IP pública on-premise
- ⏳ Velocidad internet on-premise
- ⏳ Nombre exacto BD on-premise
- ⏳ Estado actual BD on-premise
- ⏳ Configuración PostgreSQL actual on-premise

### Decisiones Clave Tomadas:
1. ✅ Dirección: AWS → On-Premise (backup inicial), luego On-Premise → AWS (replicación)
2. ✅ Método: Streaming Replication Asíncrona
3. ✅ Backup: Diario a S3 con retención 30 días
4. ✅ WAL: Archiving a S3 cada 5 minutos
5. ✅ Transferencia: Vía S3 (más confiable que SCP directo)
6. ✅ Horario: 3 PM México = 5 PM Venezuela

---

**FIN DEL RESUMEN**

Este documento contiene toda la información necesaria para que Claude Opus planifique la implementación perfecta con scripts completos, validaciones exhaustivas y manejo de errores robusto.
