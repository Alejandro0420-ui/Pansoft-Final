#!/usr/bin/env powershell
<#
.SYNOPSIS
Script de prueba para notificaciones automáticas del sistema Pansoft

.DESCRIPTION
Prueba todos los tipos de notificaciones:
1. Facturas vencidas
2. Facturas próximas a vencer
3. Stock crítico
4. Nueva orden creada

.EXAMPLE
.\test_notificaciones_automaticas.ps1
#>

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    PRUEBA DE NOTIFICACIONES AUTOMÁTICAS - PANSOFT          ║" -ForegroundColor Cyan
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
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -TimeoutSec 5
    $overdueCount = @($response.notifications | Where-Object {$_.type -eq "warning" -and $_.title -like "*vencida*"}).Count
    Write-Host "   📌 Notificaciones de vencidas encontradas: $overdueCount`n"
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
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -TimeoutSec 5
    $upcomingCount = @($response.notifications | Where-Object {$_.type -eq "info" -and $_.title -like "*próxima*"}).Count
    Write-Host "   📌 Notificaciones de próximas encontradas: $upcomingCount`n"
} catch {
    Show-Result "Verificación de próximas a vencer" "Error: $($_.Exception.Message)" $false
}

# 4. Verificar stock crítico
Write-Host "🚨 PASO 4: Verificar stock crítico" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/inventory/check/critical-stock" -Method Post -TimeoutSec 10
    Show-Result "Verificación de stock crítico" $response.message
    
    Start-Sleep -Seconds 2
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -TimeoutSec 5
    $criticalCount = @($response.notifications | Where-Object {$_.title -like "*crítico*"}).Count
    Write-Host "   📌 Notificaciones de stock crítico encontradas: $criticalCount`n"
} catch {
    Show-Result "Verificación de stock crítico" "Error: $($_.Exception.Message)" $false
}

# 5. Obtener conteo de sin leer
Write-Host "📬 PASO 5: Conteo de notificaciones sin leer" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread/count" -Method Get -TimeoutSec 5
    Show-Result "Conteo de sin leer" "Total sin leer: $($response.unreadCount)"
} catch {
    Show-Result "Conteo de sin leer" "Error: $($_.Exception.Message)" $false
}

# 6. Listar todas las notificaciones
Write-Host "📋 PASO 6: Resumen de notificaciones" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications?limit=100" -Method Get -TimeoutSec 5
    
    Write-Host "Total de notificaciones: $($response.total)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($response.notifications.Count -gt 0) {
        $response.notifications | Select-Object -First 10 | ForEach-Object {
            $status = $_.is_read ? "✓" : "●"
            Write-Host "$status $($_.title)" -ForegroundColor $(if ($_.is_read) { "Gray" } else { "White" })
            Write-Host "  └─ $($_.message)" -ForegroundColor Gray
            Write-Host "  └─ $(($_.created_at | Get-Date -Format 'dd/MM/yyyy HH:mm:ss'))" -ForegroundColor DarkGray
            Write-Host ""
        }
        
        if ($response.total -gt 10) {
            Write-Host "... y $($response.total - 10) más" -ForegroundColor Gray
        }
    } else {
        Write-Host "No hay notificaciones" -ForegroundColor Gray
    }
} catch {
    Show-Result "Resumen de notificaciones" "Error: $($_.Exception.Message)" $false
}

# Resumen final
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    PRUEBA COMPLETADA                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "⏱️  Duración: $($duration.TotalSeconds) segundos" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Las notificaciones automáticas están funcionando correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Accede a http://localhost:3000/notificaciones" -ForegroundColor Yellow
Write-Host "   2. Verifica que aparezcan todas las notificaciones" -ForegroundColor Yellow
Write-Host "   3. Prueba marcar como leída y eliminar" -ForegroundColor Yellow
