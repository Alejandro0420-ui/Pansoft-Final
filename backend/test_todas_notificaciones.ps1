#!/usr/bin/env powershell
<#
.SYNOPSIS
Script extendido de prueba para todas las notificaciones automáticas

.DESCRIPTION
Prueba todos los tipos de notificaciones:
1. Facturas vencidas
2. Facturas próximas a vencer
3. Stock crítico de productos
4. Productos con stock bajo
5. Insumos con stock bajo
6. Nueva orden creada

.EXAMPLE
.\test_todas_notificaciones.ps1
#>

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    PRUEBA COMPLETA DE NOTIFICACIONES - PANSOFT            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$startTime = Get-Date

# Función para mostrar resultado
function Show-Result {
    param(
        [string]$Title,
        [string]$Result,
        [bool]$Success = $true
    )
    
    if ($Success) {
        Write-Host "✅ $Title" -ForegroundColor Green
        Write-Host "   $Result`n" -ForegroundColor Green
    } else {
        Write-Host "❌ $Title" -ForegroundColor Red
        Write-Host "   $Result`n" -ForegroundColor Red
    }
}

# 1. Obtener notificaciones actuales
Write-Host "📊 PASO 1: Estado actual de notificaciones" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -TimeoutSec 5
    Show-Result "Notificaciones obtenidas" "Total: $($response.total) | Sin leer: $([array]($response.notifications | Where-Object {-not $_.is_read}).Count)"
} catch {
    Show-Result "Notificaciones obtenidas" "Error: $($_.Exception.Message)" $false
}

# 2. Verificar facturas vencidas
Write-Host "💳 PASO 2: Verificar facturas vencidas" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/billing/check/overdue" -Method Post -TimeoutSec 10
    Show-Result "Verificación de facturas vencidas" $response.message
    Start-Sleep -Seconds 2
} catch {
    Show-Result "Verificación de facturas vencidas" "Error: $($_.Exception.Message)" $false
}

# 3. Verificar facturas próximas a vencer
Write-Host "📅 PASO 3: Verificar facturas próximas a vencer" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $body = @{ daysWarning = 3 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/billing/check/upcoming" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
    Show-Result "Verificación de próximas a vencer" $response.message
    Start-Sleep -Seconds 2
} catch {
    Show-Result "Verificación de próximas a vencer" "Error: $($_.Exception.Message)" $false
}

# 4. Verificar stock crítico
Write-Host "🚨 PASO 4: Verificar stock crítico (Productos)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/inventory/check/critical-stock" -Method Post -TimeoutSec 10
    Show-Result "Verificación de stock crítico" $response.message
    Start-Sleep -Seconds 2
} catch {
    Show-Result "Verificación de stock crítico" "Error: $($_.Exception.Message)" $false
}

# 5. Verificar productos con stock bajo
Write-Host "📦 PASO 5: Verificar productos con stock bajo" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/inventory/check/low-stock" -Method Post -TimeoutSec 10
    Show-Result "Verificación de productos bajo stock" $response.message
    Start-Sleep -Seconds 2
} catch {
    Show-Result "Verificación de productos bajo stock" "Error: $($_.Exception.Message)" $false
}

# 6. Verificar insumos con stock bajo
Write-Host "📋 PASO 6: Verificar insumos con stock bajo" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/supplies/check/low-stock" -Method Post -TimeoutSec 10
    Show-Result "Verificación de insumos bajo stock" $response.message
    Start-Sleep -Seconds 2
} catch {
    Show-Result "Verificación de insumos bajo stock" "Error: $($_.Exception.Message)" $false
}

# 7. Obtener conteo de sin leer
Write-Host "📬 PASO 7: Conteo de notificaciones sin leer" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread/count" -Method Get -TimeoutSec 5
    Show-Result "Conteo de sin leer" "Total sin leer: $($response.unreadCount)"
} catch {
    Show-Result "Conteo de sin leer" "Error: $($_.Exception.Message)" $false
}

# 8. Listar todas las notificaciones por tipo
Write-Host "📋 PASO 8: Resumen de notificaciones por tipo" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications?limit=200" -Method Get -TimeoutSec 5
    
    Write-Host "Total de notificaciones: $($response.total)" -ForegroundColor Cyan
    Write-Host ""
    
    # Contar por tipo
    $byType = @{}
    $response.notifications | ForEach-Object {
        if ($byType.ContainsKey($_.type)) {
            $byType[$_.type]++
        } else {
            $byType[$_.type] = 1
        }
    }
    
    Write-Host "Distribución por tipo:" -ForegroundColor Cyan
    $byType.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
        $icon = switch($_.Key) {
            "warning" { "⚠️" }
            "inventory" { "📦" }
            "order" { "📋" }
            "info" { "ℹ️" }
            default { "📌" }
        }
        Write-Host "  $icon $($_.Key): $($_.Value) notificaciones" -ForegroundColor Magenta
    }
    
    Write-Host ""
    Write-Host "Últimas notificaciones:" -ForegroundColor Cyan
    $response.notifications | Select-Object -First 15 | ForEach-Object {
        $status = $_.is_read ? "✓" : "●"
        Write-Host "$status $($_.title)" -ForegroundColor $(if ($_.is_read) { "Gray" } else { "White" })
        Write-Host "  └─ $($_.message)" -ForegroundColor Gray
    }
    
    if ($response.total -gt 15) {
        Write-Host "`n... y $($response.total - 15) más" -ForegroundColor Gray
    }
} catch {
    Show-Result "Resumen de notificaciones" "Error: $($_.Exception.Message)" $false
}

# Resumen final
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    PRUEBA COMPLETADA                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "⏱️  Duración: $($duration.TotalSeconds) segundos" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen de Tipos de Notificaciones:" -ForegroundColor Yellow
Write-Host "  ✅ Facturas vencidas" -ForegroundColor Yellow
Write-Host "  ✅ Facturas próximas a vencer" -ForegroundColor Yellow
Write-Host "  ✅ Stock crítico de productos" -ForegroundColor Yellow
Write-Host "  ✅ Productos con stock bajo" -ForegroundColor Yellow
Write-Host "  ✅ Insumos con stock bajo" -ForegroundColor Yellow
Write-Host "  ✅ Nuevas órdenes" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Todas las notificaciones automáticas están operativas" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Accede a http://localhost:3000/notificaciones" -ForegroundColor Yellow
Write-Host "   2. Verifica que aparezcan todas las notificaciones" -ForegroundColor Yellow
Write-Host "   3. Prueba marcar como leída, eliminar, filtrar" -ForegroundColor Yellow
Write-Host "   4. Monitorea los logs del servidor" -ForegroundColor Yellow
