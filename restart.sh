#!/bin/bash

# Script para limpiar procesos y reiniciar FastAskGPT

echo "🧹 Limpiando procesos de Electron..."

# Matar procesos de Electron
pkill -f "electron ."

# Esperar un momento
sleep 1

# Verificar si quedan procesos
REMAINING=$(ps aux | grep "electron ." | grep -v grep | wc -l)

if [ $REMAINING -eq 0 ]; then
    echo "✅ Procesos limpiados exitosamente"
else
    echo "⚠️  Aún quedan $REMAINING procesos. Intentando forzar..."
    pkill -9 -f "electron ."
    sleep 1
fi

echo ""
echo "🚀 Iniciando FastAskGPT..."
npm start
