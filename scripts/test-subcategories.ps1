# Test Subcategories Loading

Write-Host "Testing Subcategories for Selected Categories..." -ForegroundColor Cyan
Write-Host ""

$testCases = @(
    @{ name = "Pakaian Wanita"; main = "Pakaian Wanita" },
    @{ name = "Pakaian Pria"; main = "Pakaian Pria" },
    @{ name = "Sepatu Pria"; main = "Sepatu Pria" },
    @{ name = "Tas Wanita"; main = "Tas Wanita" }
)

foreach ($test in $testCases) {
    Write-Host "[$($test.name)]" -ForegroundColor Yellow
    
    try {
        $url = "http://localhost:3000/api/sync-categories?main=" + [System.Uri]::EscapeDataString($test.main)
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.success) {
            # Get unique sub1 values
            $uniqueSub1 = $result.data | Where-Object { $_.sub1 } | Select-Object -ExpandProperty sub1 -Unique
            
            Write-Host "  Total Records: $($result.data.Count)" -ForegroundColor Gray
            Write-Host "  Subcategories (sub1): $($uniqueSub1.Count)" -ForegroundColor Cyan
            
            if ($uniqueSub1.Count -gt 0) {
                Write-Host "  Sample subcategories:" -ForegroundColor Gray
                $uniqueSub1 | Select-Object -First 5 | ForEach-Object {
                    Write-Host "    - $_" -ForegroundColor White
                }
            }
        } else {
            Write-Host "  ERROR: API returned success=false" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Testing sub2 loading for specific sub1..." -ForegroundColor Cyan
Write-Host ""

# Test sub2 for "Pakaian Pria > Sweater & Kardigan"
try {
    $main = [System.Uri]::EscapeDataString("Pakaian Pria")
    $sub1 = [System.Uri]::EscapeDataString("Sweater & Kardigan")
    $url = "http://localhost:3000/api/sync-categories?main=$main&sub1=$sub1"
    
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "[Pakaian Pria > Sweater & Kardigan]" -ForegroundColor Yellow
    if ($result.success) {
        $uniqueSub2 = $result.data | Where-Object { $_.sub2 -and $_.sub2 -ne '-' } | Select-Object -ExpandProperty sub2 -Unique
        Write-Host "  Sub2 count: $($uniqueSub2.Count)" -ForegroundColor Cyan
        
        if ($uniqueSub2.Count -gt 0) {
            $uniqueSub2 | ForEach-Object {
                Write-Host "    - $_" -ForegroundColor White
            }
        } else {
            Write-Host "    (No sub2 items)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ERROR: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verification Complete!" -ForegroundColor Green
