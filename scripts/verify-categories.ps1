# Verification Script: Test All Category IDs

Write-Host "Testing All Category IDs..." -ForegroundColor Cyan
Write-Host ""

$categories = @(
    @{ name = "Pakaian Wanita"; id = "100350" },
    @{ name = "Pakaian Pria"; id = "100047" },
    @{ name = "Ponsel & Aksesoris"; id = "100071" },
    @{ name = "Komputer & Aksesoris"; id = "101944" },
    @{ name = "Buku & Alat Tulis"; id = "101330" },
    @{ name = "Aksesoris Mode"; id = "100021" },
    @{ name = "Fashion Bayi & Anak"; id = "101016" },
    @{ name = "Mode Muslim"; id = "100492" },
    @{ name = "Kamera & Drone"; id = "101092" },
    @{ name = "Hobi & Koleksi"; id = "101385" },
    @{ name = "Ibu & Bayi"; id = "100945" },
    @{ name = "Jam Tangan"; id = "100573" },
    @{ name = "Kesehatan"; id = "100003" },
    @{ name = "Makanan & Minuman"; id = "100780" },
    @{ name = "Olahraga & Aktivitas Luar Ruangan"; id = "101816" },
    @{ name = "Sepeda Motor"; id = "100755" },
    @{ name = "Perawatan & Kecantikan"; id = "101607" },
    @{ name = "Perlengkapan Rumah"; id = "101127" },
    @{ name = "Sepatu Pria"; id = "100255" },
    @{ name = "Sepatu Wanita"; id = "100585" },
    @{ name = "Tas Pria"; id = "100564" },
    @{ name = "Tas Wanita"; id = "100089" },
    @{ name = "Koper & Tas Travel"; id = "100320" },
    @{ name = "Elektronik"; id = "100168" }
)

$successCount = 0
$failCount = 0

foreach ($cat in $categories) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/sync-categories?id=$($cat.id)" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.success -and $result.data.Count -gt 0) {
            $dbCategory = $result.data[0].main_category
            if ($dbCategory -eq $cat.name) {
                Write-Host "[OK] $($cat.name) (ID: $($cat.id)) - MATCHED" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "[WARN] $($cat.name) (ID: $($cat.id)) - Found: $dbCategory" -ForegroundColor Yellow
                $failCount++
            }
        } else {
            Write-Host "[ERROR] $($cat.name) (ID: $($cat.id)) - NOT FOUND IN DATABASE" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "[ERROR] $($cat.name) (ID: $($cat.id)) - API ERROR: $_" -ForegroundColor Red
        $failCount++
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Results: $successCount OK, $failCount Failed" -ForegroundColor $(if($failCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "==========================================" -ForegroundColor Cyan
