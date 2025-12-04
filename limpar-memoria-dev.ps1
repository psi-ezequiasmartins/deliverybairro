#!/usr/bin/env pwsh
# Script de Limpeza de Memória para Desenvolvimento
# Autor: PSI Software
# Data: 04/12/2025

Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    SCRIPT DE LIMPEZA - AMBIENTE DESENVOLVIMENTO   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. Verificar memória ANTES
Write-Host "📊 Estado ANTES da limpeza:" -ForegroundColor Yellow
$osBefore = Get-CimInstance Win32_OperatingSystem
$totalRAM = [math]::Round($osBefore.TotalVisibleMemorySize/1MB,2)
$freeRAMBefore = [math]::Round($osBefore.FreePhysicalMemory/1MB,2)
Write-Host "   RAM Livre: $freeRAMBefore GB / $totalRAM GB`n" -ForegroundColor White

# 2. Matar processos Node.js perdidos
Write-Host "🔍 Buscando processos Node.js, npm, yarn..." -ForegroundColor Yellow
$processes = Get-Process -Name node,nodejs,npm,yarn -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   Encontrados $($processes.Count) processo(s)" -ForegroundColor Red
    $processes | Select-Object Id, ProcessName, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet64/1MB,2)}} | Format-Table -AutoSize
    
    $confirm = Read-Host "   Encerrar TODOS? (S/N)"
    if ($confirm -eq 'S' -or $confirm -eq 's') {
        $processes | ForEach-Object { 
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue 
        }
        Write-Host "✅ Processos encerrados!`n" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Nenhum processo Node.js/npm/yarn ativo!`n" -ForegroundColor Green
}

# 3. Limpar cache Yarn
Write-Host "🧹 Limpando cache Yarn..." -ForegroundColor Yellow
yarn cache clean --all 2>$null
Write-Host "✅ Cache Yarn limpo!`n" -ForegroundColor Green

# 4. Limpar cache npm
Write-Host "🧹 Limpando cache npm..." -ForegroundColor Yellow
$npmCache = "$env:LOCALAPPDATA\npm-cache"
if (Test-Path $npmCache) {
    $size = (Get-ChildItem $npmCache -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   Cache npm: $([math]::Round($size,2)) MB" -ForegroundColor White
    npm cache clean --force 2>$null
    Write-Host "✅ Cache npm limpo!`n" -ForegroundColor Green
} else {
    Write-Host "✅ Cache npm já está limpo!`n" -ForegroundColor Green
}

# 5. Limpar arquivos temporários
Write-Host "🧹 Limpando arquivos temporários..." -ForegroundColor Yellow
$tempPaths = @("$env:TEMP\*", "$env:TMP\*")
$totalSize = 0
foreach ($path in $tempPaths) {
    try {
        $items = Get-ChildItem $path -ErrorAction SilentlyContinue | Where-Object { 
            !$_.PSIsContainer -or $_.Name -notlike "chocolatey*" 
        }
        $size = ($items | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1MB
        $totalSize += $size
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}
}
Write-Host "✅ Liberados ~$([math]::Round($totalSize,2)) MB!`n" -ForegroundColor Green

# 6. Liberar memória RAM
Write-Host "⚡ Liberando memória RAM..." -ForegroundColor Yellow
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Write-Host "✅ Coleta de lixo executada!`n" -ForegroundColor Green

# 7. Verificar memória DEPOIS
Write-Host "📊 Estado DEPOIS da limpeza:" -ForegroundColor Yellow
$osAfter = Get-CimInstance Win32_OperatingSystem
$freeRAMAfter = [math]::Round($osAfter.FreePhysicalMemory/1MB,2)
$freed = $freeRAMAfter - $freeRAMBefore
Write-Host "   RAM Livre: $freeRAMAfter GB / $totalRAM GB" -ForegroundColor Green
Write-Host "   Liberado: +$([math]::Round($freed,2)) GB`n" -ForegroundColor Green

# 8. Relatório final
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           LIMPEZA CONCLUÍDA COM SUCESSO!          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "💡 DICAS EXTRAS:" -ForegroundColor Cyan
Write-Host "   • Reiniciar VS Code se continuar lento" -ForegroundColor White
Write-Host "   • Fechar abas não utilizadas do Chrome/Edge" -ForegroundColor White
Write-Host "   • Considerar reiniciar o Windows para limpeza profunda`n" -ForegroundColor White

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
