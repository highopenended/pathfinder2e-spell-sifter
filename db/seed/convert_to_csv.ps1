# Convert JSON files to CSV for Supabase import and clean duplicates
# Run this script in PowerShell from your project directory

Write-Host "Converting traitsData.JSON to CSV..." -ForegroundColor Green

# Convert traits to CSV
$traitsJson = Get-Content "db/seed/traitsData.JSON" | ConvertFrom-Json
$traitsJson | Select-Object @{Name='name';Expression={$_.Trait}}, @{Name='description';Expression={$_.Description}} | 
    Export-Csv "db/seed/traits.csv" -NoTypeInformation -Encoding UTF8

Write-Host "Converting spellsData.JSON to CSV..." -ForegroundColor Green

# Convert spells to CSV - map to actual database column names and convert rank to integer
$spellsJson = Get-Content "db/seed/spellsData.JSON" | ConvertFrom-Json
$spellsJson | ForEach-Object {
    # Convert rank text to integer
    $rankInt = switch -Regex ($_.rank) {
        'Cantrip' { 0 }
        '(\d+)st' { [int]$matches[1] }
        '(\d+)nd' { [int]$matches[1] }
        '(\d+)rd' { [int]$matches[1] }
        '(\d+)th' { [int]$matches[1] }
        default { 0 }
    }
    
    # Convert defense to save_type enum
    $saveType = switch ($_.defense) {
        'Fortitude' { 'Fortitude' }
        'Reflex' { 'Reflex' }
        'Will' { 'Will' }
        default { 'None' }
    }
    
    # Convert actions to action_category
    $actionCategory = switch -Regex ($_.actions) {
        '1 action' { 'Free' }
        '2 action' { 'Activity' }
        '3 action' { 'Activity' }
        'reaction' { 'Reaction' }
        default { 'Activity' }
    }
    
    # Create custom object with proper column names and converted data
    [PSCustomObject]@{
        name = $_.name
        rank = $rankInt
        spell_type = $_.spell_type
        rarity = $_.rarity
        save_type = $saveType
        action_category = $actionCategory
        actions_raw = $_.actions
        summary = $_.summary
        range = $_.range
        area = $_.area
        duration = $_.duration
        school = $_.trait
        heighten_text = $_.Heighten
        link = $_.link
    }
} | Export-Csv "db/seed/spells.csv" -NoTypeInformation -Encoding UTF8

Write-Host "Cleaning traits CSV to remove duplicates..." -ForegroundColor Green

# Read the CSV and remove duplicates based on name
$traits = Import-Csv "db/seed/traits.csv"
$uniqueTraits = $traits | Sort-Object name -Unique

# Export cleaned CSV
$uniqueTraits | Export-Csv "db/seed/traits_clean.csv" -NoTypeInformation -Encoding UTF8

Write-Host "CSV files created successfully!" -ForegroundColor Green
Write-Host "traits.csv: $((Get-Item 'db/seed/traits.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "spells.csv: $((Get-Item 'db/seed/spells.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "Original traits count: $($traits.Count)" -ForegroundColor Yellow
Write-Host "Unique traits count: $($uniqueTraits.Count)" -ForegroundColor Green
Write-Host "Duplicates removed: $($traits.Count - $uniqueTraits.Count)" -ForegroundColor Yellow
Write-Host "Cleaned CSV saved as: traits_clean.csv" -ForegroundColor Green
