# Script de prueba para verificar que los movimientos de supplies se registren correctamente

$BASE_URL = "http://localhost:5000"

Write-Host "🧪 Iniciando prueba de movimiento de supplies...`n" -ForegroundColor Cyan

# 1. Obtener supplies
Write-Host "1️⃣  Obteniendo supplies..." -ForegroundColor Yellow
$suppliesRes = Invoke-RestMethod -Uri "$BASE_URL/api/supplies" -Method Get
$supply = $suppliesRes[0]

if ($null -eq $supply) {
    Write-Host "❌ No hay supplies en la BD" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Supply encontrado: $($supply.name) (ID: $($supply.id), Stock: $($supply.stock_quantity))" -ForegroundColor Green
Write-Host ""

# 2. Registrar movimiento
Write-Host "2️⃣  Registrando movimiento de entrada..." -ForegroundColor Yellow
$newStock = $supply.stock_quantity + 5

$body = @{
    name = $supply.name
    sku = $supply.sku
    category = $supply.category
    price = $supply.price
    quantity = $newStock
    min_stock_level = $supply.min_stock_level
    unit = $supply.unit
    movementType = "entrada"
    reason = "Prueba de movimiento desde script"
    userId = 1
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "$BASE_URL/api/supplies/$($supply.id)" `
    -Method Put `
    -ContentType "application/json" `
    -Body $body

Write-Host "   ✅ Movimiento registrado" -ForegroundColor Green
Write-Host "   📊 $($supply.stock_quantity) → $newStock (+5)" -ForegroundColor Cyan

# 3. Obtener historial
Write-Host "`n3️⃣  Obteniendo historial de supplies..." -ForegroundColor Yellow
$historyRes = Invoke-RestMethod -Uri "$BASE_URL/api/supplies/history/all/movements?limit=10" -Method Get

if ($historyRes.data -and $historyRes.data.Count -gt 0) {
    Write-Host "   ✅ Historial cargado ($($historyRes.data.Count) movimientos):" -ForegroundColor Green
    $historyRes.data | Select-Object -First 3 | ForEach-Object {
        $sign = if ($_.quantity_change -gt 0) { "+" } else { "" }
        Write-Host "      • $($_.supply_name): $sign$($_.quantity_change) ($($_.previous_quantity) → $($_.new_quantity)) - $($_.movement_type)" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ⚠️  No hay historial disponible" -ForegroundColor Yellow
}

Write-Host "`n✅ Prueba completada exitosamente" -ForegroundColor Green
